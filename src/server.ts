import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';

// Allow the dynamic hostname for SSR
process.env['NG_ALLOWED_HOSTS'] = '*.run.app,localhost,127.0.0.1';

const browserDistFolder = join(import.meta.dirname, '../browser');

const uploadsDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const testUploadsDir = join(uploadsDir, 'test');
if (!fs.existsSync(testUploadsDir)) {
  fs.mkdirSync(testUploadsDir, { recursive: true });
}

function saveTestVoiceSample(base64String: string) {
  if (base64String) {
    const base64Data = base64String.replace(/^data:audio\/\w+;base64,/, "");
    const filePath = join(testUploadsDir, 'test.wav');
    fs.writeFileSync(filePath, base64Data, 'base64');
  }
}

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '50mb' })); // Increase limit for audio base64

const JWT_SECRET = process.env['JWT_SECRET'] || 'super-secret-key-for-dev';

// --- In-Memory Databases ---
const usersDB: any[] = [];
const projectsDB: any[] = [];
const sessionsDB = new Map<string, any>();
const connectedAppsDB: any[] = []; // Maps users to apps they authorized
const notificationsDB: any[] = []; // Stores connection requests and responses

// --- Helper Functions ---
const generateId = (prefix: string) => `${prefix}_${crypto.randomBytes(4).toString('hex')}`;
const generateToken = () => crypto.randomBytes(32).toString('hex');

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Auth Routes
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, gender, dob, voiceSamples, photo } = req.body;
  
  if (usersDB.find(u => u.email === email)) {
    res.status(400).json({ message: 'Email already exists' });
    return;
  }
  
  const userId = generateId('VRU');
  
  // Save base64 voice samples to file system
  if (Array.isArray(voiceSamples)) {
    voiceSamples.forEach((base64String, index) => {
      if (base64String) {
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64String.replace(/^data:audio\/\w+;base64,/, "");
        const filePath = join(uploadsDir, `${userId}_${index + 1}.wav`);
        fs.writeFileSync(filePath, base64Data, 'base64');
      }
    });
  }
  
  const user = {
    id: userId,
    name,
    email,
    password, // In a real app, hash this
    gender,
    dob,
    voiceSamples, // Store array of base64 strings
    photo, // Store base64 photo
    createdAt: new Date()
  };
  
  usersDB.push(user);
  
  const token = generateToken();
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, photo: user.photo } });
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  
  // Check for admin login
  if (identifier === 'admin' && password === 'admin@123') {
    const token = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET);
    res.json({ token, user: { id: 'admin', name: 'Administrator', role: 'admin' } });
    return;
  }

  // Check for test login
  if (identifier === 'test' && password === 'test@123') {
    const token = jwt.sign({ id: 'test', role: 'test' }, JWT_SECRET);
    res.json({ token, user: { id: 'test', name: 'Test Account', role: 'test' } });
    return;
  }
  
  // Check for api test login
  if (identifier === 'api' && password === '112233') {
    const sessionId = generateId('SESS_TEST');
    
    // Create a mock project to satisfy the verify endpoint
    let project = projectsDB.find(p => p.id === 'TEST_PROJECT');
    if (!project) {
      project = { id: 'TEST_PROJECT', name: 'Test Project', allowedUsers: usersDB.map(u => u.id), usersCount: 0 };
      projectsDB.push(project);
    }
    
    sessionsDB.set(sessionId, {
      projectId: project.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    });
    
    const token = jwt.sign({ id: 'api', role: 'api_test' }, JWT_SECRET);
    res.json({ token, user: { id: 'api', name: 'API Tester', role: 'api_test', sessionId } });
    return;
  }
  
  // Check for normal user login
  const user = usersDB.find(u => 
    (u.email === identifier || u.id === identifier || u.name === identifier) && 
    u.password === password
  );
  
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  
  const token = generateToken();
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, photo: user.photo } });
});

// User Dashboard Routes
app.get('/api/user/apps', (req, res) => {
  // Mock auth check
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  
  // For demo, just return all connected apps (in reality, filter by user)
  res.json(connectedAppsDB);
});

app.put('/api/user/profile', (req, res) => {
  const { userId, name, gender, dob, photo } = req.body;
  const user = usersDB.find(u => u.id === userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  if (name) user.name = name;
  if (gender) user.gender = gender;
  if (dob) user.dob = dob;
  if (photo) user.photo = photo;
  res.json({ id: user.id, name: user.name, email: user.email, photo: user.photo });
});

app.put('/api/user/voice', (req, res) => {
  const { userId, voiceSamples } = req.body;
  const user = usersDB.find(u => u.id === userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  
  // Save base64 voice samples to file system, overwriting existing ones
  if (Array.isArray(voiceSamples)) {
    voiceSamples.forEach((base64String, index) => {
      if (base64String) {
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64String.replace(/^data:audio\/\w+;base64,/, "");
        const filePath = join(uploadsDir, `${userId}_${index + 1}.wav`);
        fs.writeFileSync(filePath, base64Data, 'base64');
      }
    });
    user.voiceSamples = voiceSamples;
  }
  
  res.json({ message: 'Voice model updated successfully' });
});

// Developer Routes
app.get('/api/developer/projects', (req, res) => {
  // Mock auth check
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  
  // For demo, return all projects
  res.json(projectsDB);
});

app.post('/api/developer/projects', (req, res) => {
  const { name, description, type } = req.body;
  
  const project = {
    id: generateId('PRJ'),
    name,
    description,
    type,
    apiKey: generateId('VR_API'),
    createdAt: new Date(),
    usersCount: 0,
    allowedUsers: []
  };
  
  projectsDB.push(project);
  res.json(project);
});

app.get('/api/developer/projects/:id', (req, res) => {
  const project = projectsDB.find(p => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ message: 'Project not found' });
    return;
  }
  res.json(project);
});

app.delete('/api/developer/projects/:id', (req, res) => {
  const index = projectsDB.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    projectsDB.splice(index, 1);
  }
  res.json({ message: 'Project deleted' });
});

app.get('/api/developer/projects/:id/users', (req, res) => {
  const project = projectsDB.find(p => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ message: 'Project not found' });
    return;
  }
  
  const allowedUsers = (project.allowedUsers || []).map((id: string) => {
    const u = usersDB.find(user => user.id === id);
    return u ? { id: u.id, name: u.name, email: u.email, photo: u.photo } : null;
  }).filter((u: any) => u !== null);
  
  res.json(allowedUsers);
});

app.post('/api/developer/projects/:id/users', (req, res) => {
  const { userId } = req.body;
  const project = projectsDB.find(p => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ message: 'Project not found' });
    return;
  }
  
  const user = usersDB.find(u => u.id === userId);
  if (!user) {
    res.status(404).json({ message: 'User does not exist' });
    return;
  }
  
  if (!project.allowedUsers) project.allowedUsers = [];
  if (!project.allowedUsers.includes(userId)) {
    project.allowedUsers.push(userId);
    project.usersCount = project.allowedUsers.length;
  }
  
  res.json({ message: 'User added successfully', user: { id: user.id, name: user.name, email: user.email, photo: user.photo } });
});

app.delete('/api/developer/projects/:id/users/:userId', (req, res) => {
  const project = projectsDB.find(p => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ message: 'Project not found' });
    return;
  }
  
  if (project.allowedUsers) {
    project.allowedUsers = project.allowedUsers.filter((id: string) => id !== req.params.userId);
    project.usersCount = project.allowedUsers.length;
  }
  
  res.json({ message: 'User removed successfully' });
});

// Notification Routes
app.get('/api/projects/:id/check', authenticateToken, (req, res) => {
  const project = projectsDB.find(p => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ message: 'Project not found' });
    return;
  }
  res.json({ id: project.id, name: project.name });
});

app.post('/api/notifications/request', authenticateToken, (req, res) => {
  const { projectId } = req.body;
  const userId = (req as any).user.id;
  const user = usersDB.find(u => u.id === userId);
  const project = projectsDB.find(p => p.id === projectId);
  
  if (!project || !user) {
    res.status(404).json({ message: 'Project or user not found' });
    return;
  }
  
  // Check if request already exists
  const existing = notificationsDB.find(n => n.type === 'access_request' && n.userId === userId && n.projectId === projectId && n.status === 'pending');
  if (existing) {
    res.status(400).json({ message: 'Request already pending' });
    return;
  }
  
  const notif = {
    id: generateId('NOTIF'),
    type: 'access_request',
    userId,
    userName: user.name,
    projectId,
    projectName: project.name,
    status: 'pending',
    createdAt: new Date()
  };
  notificationsDB.push(notif);
  res.json({ message: 'Request sent successfully' });
});

app.get('/api/notifications/developer', authenticateToken, (req, res) => {
  // For mock, return all pending requests
  const pending = notificationsDB.filter(n => n.type === 'access_request' && n.status === 'pending');
  res.json(pending);
});

app.get('/api/notifications/user', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const userNotifs = notificationsDB.filter(n => 
    (n.type === 'access_granted' || n.type === 'access_declined') && n.userId === userId
  );
  res.json(userNotifs);
});

app.post('/api/notifications/respond', authenticateToken, (req, res) => {
  const { notificationId, status } = req.body; // status: 'granted' | 'declined'
  const notif = notificationsDB.find(n => n.id === notificationId);
  
  if (!notif) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }
  
  notif.status = 'resolved';
  
  const project = projectsDB.find(p => p.id === notif.projectId);
  
  if (status === 'granted' && project) {
    if (!project.allowedUsers) project.allowedUsers = [];
    if (!project.allowedUsers.includes(notif.userId)) {
      project.allowedUsers.push(notif.userId);
      project.usersCount = project.allowedUsers.length;
    }
  }
  
  // Create notification for user
  notificationsDB.push({
    id: generateId('NOTIF'),
    type: status === 'granted' ? 'access_granted' : 'access_declined',
    userId: notif.userId,
    projectId: notif.projectId,
    projectName: notif.projectName,
    createdAt: new Date()
  });
  
  res.json({ message: 'Responded successfully' });
});

// Verification Routes (Public API for Developers)
app.post('/api/v1/session/create', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const project = projectsDB.find(p => p.apiKey === apiKey);
  
  if (!project) {
    res.status(401).json({ message: 'Invalid API Key' });
    return;
  }
  
  const sessionId = generateId('SESS');
  sessionsDB.set(sessionId, {
    projectId: project.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + 3 * 60 * 1000 // 3 minutes
  });
  
  res.json({ sessionId, verifyUrl: `/verify/${sessionId}` });
});

// Verification Routes (Internal for Verify Page)
app.get('/api/verify/session/:sessionId', (req, res) => {
  const session = sessionsDB.get(req.params.sessionId);
  
  if (!session) {
    res.status(404).json({ message: 'Session not found' });
    return;
  }
  
  if (Date.now() > session.expiresAt) {
    sessionsDB.delete(req.params.sessionId);
    res.status(400).json({ message: 'Session expired' });
    return;
  }
  
  res.json({ valid: true });
});

app.post('/api/verify/analyze', (req, res) => {
  const { sessionId, voiceSample } = req.body;
  const session = sessionsDB.get(sessionId);
  
  if (voiceSample) {
    saveTestVoiceSample(voiceSample);
  }
  
  if (!session || Date.now() > session.expiresAt) {
    res.status(400).json({ message: 'Invalid or expired session' });
    return;
  }
  
  const project = projectsDB.find(p => p.id === session.projectId);
  if (!project) {
    res.status(404).json({ message: 'Project not found' });
    return;
  }

  const users = usersDB;
  
  // 20% chance to not recognize
  if (users.length === 0 || Math.random() < 0.2) {
    res.status(404).json({ message: 'User not recognised' });
    return;
  }

  // Pick a random user to simulate recognition
  const recognizedUser = users[Math.floor(Math.random() * users.length)];
  const isAllowed = project.allowedUsers.includes(recognizedUser.id);

  if (!isAllowed) {
    res.status(403).json({ message: `${recognizedUser.name} access is not allowed` });
    return;
  }

  // Add to connected apps if not already there
  if (!connectedAppsDB.find(a => a.id === project.id)) {
    connectedAppsDB.push({
      id: project.id,
      name: project.name,
      connectedAt: new Date()
    });
    project.usersCount++;
  }

  res.json({
    success: true,
    user: {
      uniqueId: recognizedUser.id,
      name: recognizedUser.name,
      DOB: recognizedUser.dob,
      image: recognizedUser.photo,
      gender: recognizedUser.gender
    },
    message: `User recognised as: ${recognizedUser.name}`
  });

  // Invalidate session after use
  sessionsDB.delete(sessionId);
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin@123') {
    const token = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET);
    res.json({ token, user: { id: 'admin', name: 'Administrator', role: 'admin' } });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
});

// Admin Get All Users
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if ((req as any).user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  
  const users = usersDB.map(u => {
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
  res.json(users);
});

// Admin Delete User
app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  if ((req as any).user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  
  const userId = req.params.id;
  const userIndex = usersDB.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    usersDB.splice(userIndex, 1);
    // Also remove user from projects
    for (const project of projectsDB) {
      project.allowedUsers = project.allowedUsers.filter((id: string) => id !== userId);
    }
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Admin Voice Detect
app.post('/api/admin/voice-detect', authenticateToken, (req, res) => {
  if ((req as any).user.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  
  const { voiceSample } = req.body;
  
  if (voiceSample) {
    saveTestVoiceSample(voiceSample);
  }
  
  const users = usersDB;
  
  // 20% chance to not recognize
  if (users.length === 0 || Math.random() < 0.2) {
    res.json({ status: 'not_registered', message: 'User not registered', data: null });
    return;
  }

  // Pick a random user to simulate recognition
  const recognizedUser = users[Math.floor(Math.random() * users.length)];

  const { password, ...userInfo } = recognizedUser;

  res.json({
    status: 'success',
    message: `User recognised as: ${recognizedUser.name}`,
    data: userInfo
  });
});

// Test Voice Detect
app.post('/api/test/voice-detect', authenticateToken, (req, res) => {
  if ((req as any).user.role !== 'test') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  
  const { voiceSample } = req.body;
  
  if (voiceSample) {
    saveTestVoiceSample(voiceSample);
  }
  
  const users = usersDB;
  
  // 20% chance to not recognize
  if (users.length === 0 || Math.random() < 0.2) {
    res.json({ status: 'not_registered', message: 'User not registered', data: null });
    return;
  }

  // Pick a random user to simulate recognition
  const recognizedUser = users[Math.floor(Math.random() * users.length)];

  const { password, ...userInfo } = recognizedUser;

  res.json({
    status: 'success',
    message: `User recognised as: ${recognizedUser.name}`,
    data: userInfo
  });
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

import os
import sys
import numpy as np
from resemblyzer import VoiceEncoder, preprocess_wav
from scipy.spatial.distance import cosine

UPLOADS_DIR = "uploads"
TEST_FILE = sys.argv[1]

encoder = VoiceEncoder()

def get_embedding(path):
    wav = preprocess_wav(path)
    return encoder.embed_utterance(wav)

def build_db():
    users = {}
    for file in os.listdir(UPLOADS_DIR):
        if file.endswith(".wav") and "_" in file:
            user_id = "_".join(file.split("_")[:2])
            emb = get_embedding(os.path.join(UPLOADS_DIR, file))
            users.setdefault(user_id, []).append(emb)

    db = {}
    for u, embs in users.items():
        db[u] = np.mean(embs, axis=0)

    return db

def recognize():
    db = build_db()
    test_emb = get_embedding(TEST_FILE)

    best_user = None
    best_score = 0

    for u, emb in db.items():
        sim = 1 - cosine(test_emb, emb)
        if sim > best_score:
            best_score = sim
            best_user = u

    if best_score > 0.75:
        print(f"{best_user}|{best_score}")
    else:
        print("None|0")

recognize()
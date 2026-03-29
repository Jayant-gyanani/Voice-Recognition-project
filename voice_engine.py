import os
import sys
import numpy as np
import librosa
import noisereduce as nr
from resemblyzer import VoiceEncoder
from scipy.spatial.distance import cosine

# ----------------------------
# INPUTS FROM SERVER
# ----------------------------
TEST_FILE = sys.argv[1]
UPLOADS_DIR = sys.argv[2]

encoder = VoiceEncoder()

# ----------------------------
# AUDIO PREPROCESSING (STRONG)
# ----------------------------
def preprocess_audio(path):
    wav, sr = librosa.load(path, sr=16000)

    # Trim silence (important first)
    wav, _ = librosa.effects.trim(wav, top_db=20)

    # Noise reduction
    wav = nr.reduce_noise(y=wav, sr=sr)

    # Normalize
    wav = librosa.util.normalize(wav)

    # Ensure fixed length (pad or cut to 3 sec)
    target_len = 16000 * 3  # 3 seconds

    if len(wav) > target_len:
        wav = wav[:target_len]
    else:
        wav = np.pad(wav, (0, target_len - len(wav)))

    return wav

# ----------------------------
# EMBEDDING
# ----------------------------
def get_embedding(path):
    wav = preprocess_audio(path)
    return encoder.embed_utterance(wav)

# ----------------------------
# BUILD DATABASE (AVERAGED)
# ----------------------------
def build_db():
    users = {}

    for file in os.listdir(UPLOADS_DIR):
        if file.endswith(".wav") and "_" in file:
            user_id = "_".join(file.split("_")[:2])  # VRU_xxxx

            emb = get_embedding(os.path.join(UPLOADS_DIR, file))

            users.setdefault(user_id, []).append(emb)

    # Average embeddings per user (VERY IMPORTANT)
    for user in users:
        users[user] = np.mean(users[user], axis=0)

    return users

# ----------------------------
# MATCHING LOGIC (IMPROVED)
# ----------------------------
def recognize():
    db = build_db()

    if len(db) == 0:
        print("None|0")
        return

    test_emb = get_embedding(TEST_FILE)

    scores = {}

    for user, emb in db.items():
        sim = 1 - cosine(test_emb, emb)
        scores[user] = sim

    # Sort users
    sorted_users = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    best_user, best_score = sorted_users[0]

    # Confidence check
    if best_score < 0.72:
        print("None|0")
        return

    # Margin check (avoid confusion)
    if len(sorted_users) > 1:
        second_score = sorted_users[1][1]
        if (best_score - second_score) < 0.05:
            print("None|0")
            return

    print(f"{best_user}|{round(best_score, 3)}")


# ----------------------------
# RUN
# ----------------------------
if __name__ == "__main__":
    recognize()
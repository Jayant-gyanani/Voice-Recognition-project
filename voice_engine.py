import os
import sys
import numpy as np
import librosa
import noisereduce as nr
from resemblyzer import VoiceEncoder
from scipy.spatial.distance import cosine

UPLOADS_DIR = "uploads"
TEST_FILE = sys.argv[1]

encoder = VoiceEncoder()

# ----------------------------
# AUDIO PREPROCESSING
# ----------------------------
def preprocess_audio(path):
    wav, sr = librosa.load(path, sr=16000)

    # Remove noise
    wav = nr.reduce_noise(y=wav, sr=sr)

    # Normalize volume
    wav = librosa.util.normalize(wav)

    # Trim silence
    wav, _ = librosa.effects.trim(wav)

    return wav

# ----------------------------
# EMBEDDING
# ----------------------------
def get_embedding(path):
    wav = preprocess_audio(path)
    return encoder.embed_utterance(wav)

# ----------------------------
# BUILD DATABASE (NO AVERAGING)
# ----------------------------
def build_db():
    users = {}

    for file in os.listdir(UPLOADS_DIR):
        if file.endswith(".wav") and "_" in file:
            user_id = file.split("_")[0]  # FIXED
            emb = get_embedding(os.path.join(UPLOADS_DIR, file))

            users.setdefault(user_id, []).append(emb)

    return users

# ----------------------------
# MATCHING LOGIC
# ----------------------------
def recognize():
    db = build_db()
    test_emb = get_embedding(TEST_FILE)

    scores = {}

    for user, embeddings in db.items():
        sims = []

        for emb in embeddings:
            sim = 1 - cosine(test_emb, emb)
            sims.append(sim)

        # Take BEST match instead of average
        scores[user] = max(sims)

    # Sort users by similarity
    sorted_users = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    best_user, best_score = sorted_users[0]

    # Margin check
    if len(sorted_users) > 1:
        second_score = sorted_users[1][1]
    else:
        second_score = 0

    margin = best_score - second_score

    # STRONG DECISION LOGIC
    if best_score > 0.80 and margin > 0.05:
        print(f"{best_user}|{best_score}")
    else:
        print("None|0")

recognize()
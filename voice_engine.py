import os
import sys
import numpy as np
import librosa
import noisereduce as nr
from resemblyzer import VoiceEncoder
from scipy.spatial.distance import cosine

# ----------------------------
# INPUTS
# ----------------------------
TEST_FILE   = sys.argv[1]   # path to test.webm
UPLOADS_DIR = sys.argv[2]   # path to uploads/ folder

# ✅ FIX: Redirect stdout to stderr temporarily so resemblyzer's
# "Loaded the voice encoder model on cpu in X seconds." message
# does NOT pollute stdout (which Node.js reads for the result).
import io
_stdout_backup = sys.stdout
sys.stdout = sys.stderr
encoder = VoiceEncoder()
sys.stdout = _stdout_backup  # restore stdout — only our result lines go here now

# ----------------------------
# AUDIO PREPROCESSING
# Librosa reads webm/opus natively via its ffmpeg/soundfile backend
# ----------------------------
def preprocess_audio(path):
    # librosa.load handles .webm, .wav, .mp3, .ogg etc.
    wav, sr = librosa.load(path, sr=16000, mono=True)

    if len(wav) == 0:
        raise ValueError(f"Zero-length audio after loading: {path}")

    max_amp = np.max(np.abs(wav))
    if max_amp < 1e-6:
        raise ValueError(f"Audio is completely silent: {path}")

    # Noise reduction
    try:
        wav = nr.reduce_noise(y=wav, sr=sr)
    except Exception as e:
        print(f"[WARN] Noise reduction skipped: {e}", file=sys.stderr)

    # Normalize
    max_amp = np.max(np.abs(wav))
    if max_amp > 1e-6:
        wav = wav / max_amp

    # Trim silence
    wav, _ = librosa.effects.trim(wav, top_db=25)

    if len(wav) < 1600:
        raise ValueError(f"Audio too short after trimming: {len(wav)} samples")

    # Pad to minimum 1.6s for resemblyzer
    min_len = int(16000 * 1.6)
    if len(wav) < min_len:
        wav = np.pad(wav, (0, min_len - len(wav)))

    return wav.astype(np.float32)

# ----------------------------
# EMBEDDING
# ----------------------------
def get_embedding(path):
    wav = preprocess_audio(path)
    return encoder.embed_utterance(wav)

# ----------------------------
# BUILD DATABASE
# Scans uploads/ for VRU_xxxx_N.webm files
# ----------------------------
def build_db():
    users = {}

    for fname in sorted(os.listdir(UPLOADS_DIR)):
        full_path = os.path.join(UPLOADS_DIR, fname)

        if not os.path.isfile(full_path):
            continue

        # Accept both .webm (new) and .wav (legacy) user files
        if not (fname.startswith("VRU_") and (fname.endswith(".webm") or fname.endswith(".wav"))):
            continue

        parts = fname.replace(".webm", "").replace(".wav", "").split("_")
        if len(parts) < 3:
            continue
        user_id = f"{parts[0]}_{parts[1]}"   # VRU_xxxx

        try:
            emb = get_embedding(full_path)
            users.setdefault(user_id, []).append(emb)
            print(f"[DB] Loaded {fname} -> {user_id}", file=sys.stderr)
        except Exception as e:
            print(f"[DB] SKIP {fname}: {e}", file=sys.stderr)

    for uid in users:
        users[uid] = np.mean(users[uid], axis=0)

    print(f"[DB] Ready: {len(users)} user(s) — {list(users.keys())}", file=sys.stderr)
    return users

# ----------------------------
# MATCHING
# ----------------------------
def recognize():
    db = build_db()

    if len(db) == 0:
        print("[RESULT] Database is empty — no registered voices found.", file=sys.stderr)
        print("None|0")
        return

    try:
        test_emb = get_embedding(TEST_FILE)
        print(f"[TEST] Embedding OK: {TEST_FILE}", file=sys.stderr)
    except Exception as e:
        print(f"[TEST] ERROR loading test file: {e}", file=sys.stderr)
        print("None|0")
        return

    scores = {uid: 1 - cosine(test_emb, emb) for uid, emb in db.items()}
    sorted_users = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    print("[SCORES]", file=sys.stderr)
    for uid, score in sorted_users:
        print(f"  {uid}: {round(score, 4)}", file=sys.stderr)

    best_user, best_score = sorted_users[0]

    THRESHOLD = 0.65
    if best_score < THRESHOLD:
        print(f"[RESULT] Best score {round(best_score,4)} < threshold {THRESHOLD}. Not recognised.", file=sys.stderr)
        print("None|0")
        return

    if len(sorted_users) > 1:
        margin = best_score - sorted_users[1][1]
        if margin < 0.03:
            print(f"[RESULT] Margin {round(margin,4)} too small. Ambiguous.", file=sys.stderr)
            print("None|0")
            return

    print(f"[RESULT] MATCH: {best_user} score={round(best_score,4)}", file=sys.stderr)
    print(f"{best_user}|{round(best_score, 3)}")


if __name__ == "__main__":
    recognize()

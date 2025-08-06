import os
import json

def save_history(session_id: str, user_msg: str, assistant_msg: str):
    file_path = f"chat_histories/{session_id}.json"
    os.makedirs("chat_histories", exist_ok=True)
    history = []
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            history = json.load(f)
    history.append({"user": user_msg, "assistant": assistant_msg})
    with open(file_path, "w") as f:
        json.dump(history, f)

def load_history(session_id: str):
    file_path = f"chat_histories/{session_id}.json"
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return []

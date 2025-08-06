from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os

from document_loader import load_document
from vectorstore import embed_and_store
from llm_chain import build_qa_chain
from storage.history_store import save_history, load_history

# Initialize FastAPI
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JSON body schema for /chat/
class ChatRequest(BaseModel):
    query: str
    session_id: str | None = None

# File upload endpoint
@app.post("/upload/")
async def upload(file: UploadFile = File(...)):
    # Save file
    os.makedirs("uploads", exist_ok=True)
    path = f"uploads/{file.filename}"
    with open(path, "wb") as f:
        f.write(await file.read())

    # Load and embed the document
    docs = load_document(path)
    embed_and_store(docs)

    # Create new session_id
    session_id = str(uuid.uuid4())

    # Optionally store something like file info in session context
    save_history(session_id, "[SYSTEM]", f"Document '{file.filename}' uploaded and indexed.")

    return {
        "message": "File uploaded and stored.",
        "session_id": session_id
    }

# Chat endpoint
@app.post("/chat/")
async def chat(request: ChatRequest):
    # Generate session ID if not provided
    session_id = request.session_id or str(uuid.uuid4())
    query = request.query

    # Load session history
    history = load_history(session_id)
    qa_chain = build_qa_chain()

    # Run chain with or without history
    if hasattr(qa_chain, 'run_with_history'):
        response = qa_chain.run_with_history(query, history)
    else:
        context = "\n".join([f"Q: {h['user']}\nA: {h['assistant']}" for h in history if h["user"] != "[SYSTEM]"]) if history else ""
        full_query = f"{context}\nQ: {query}" if context else query
        response = qa_chain.run(full_query)

    # Save current chat turn
    save_history(session_id, query, response)

    return JSONResponse(content={
        "response": response,
        "session_id": session_id
    })

# DocuAssist

DocuAssist is an AI-powered document chat assistant that allows users to upload documents (PDF, DOCX, TXT) and interact with them using natural language queries. The system leverages modern LLMs and embeddings to provide context-aware answers based on the uploaded content.

## Features
- **Document Upload:** Upload PDF, DOCX, and TXT files for analysis.
- **Chat Interface:** Ask questions about your documents and receive intelligent, context-aware responses.
- **Session Management:** Each chat session is tracked, allowing for conversational context and history.
- **Vector Search:** Uses embeddings and FAISS for efficient document retrieval.
- **Modern Frontend:** Built with Next.js and React for a responsive, user-friendly experience.
- **Backend API:** FastAPI backend for file handling, chat, and vector operations.

## Project Structure
```
docuassist/
├── backend/
│   ├── api.py              # FastAPI endpoints
│   ├── main.py             # FastAPI app entrypoint
│   ├── document_loader.py  # Document parsing utilities
│   ├── embeddings.py       # HostedEmbeddings class for vectorization
│   ├── vectorstore.py      # FAISS vector store integration
│   ├── llm_chain.py        # LLM chain and QA logic
│   ├── chat_memory.py      # Chat memory/session management
│   ├── storage/            # Session and history storage
│   ├── uploads/            # Uploaded files (gitignored)
│   ├── faiss_index/        # FAISS index files (gitignored)
│   └── chat_histories/     # Chat history files (gitignored)
├── frontend/
│   ├── app/                # Next.js app directory
│   ├── components/         # UI components
│   ├── hooks/              # React hooks
│   ├── lib/                # Utilities
│   ├── public/             # Static assets
│   ├── styles/             # CSS
│   ├── package.json        # Frontend dependencies
│   └── ...
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- [pnpm](https://pnpm.io/) or npm/yarn

### Backend Setup
1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Configure environment:**
   - Create a `.env` file in `backend/` with:
     ```env
     END_POINT=your_embedding_or_llm_endpoint
     API_KEY=your_api_key
     HOSTED_LLM_TOKEN=your_llm_token
     ```
3. **Run the backend:**
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. **Install dependencies:**
   ```bash
   cd frontend
   pnpm install
   # or npm install / yarn install
   ```
2. **Run the frontend:**
   ```bash
   pnpm dev
   # or npm run dev / yarn dev
   ```
3. **Access the app:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
- Upload documents using the "Upload Documents" button.
- Ask questions in the chat box; the assistant will answer using the uploaded content.
- Each session is tracked, so you can have multi-turn conversations.

## Environment Variables
- `END_POINT`: URL for the embedding/LLM API endpoint.
- `API_KEY`: API key for embedding service.
- `HOSTED_LLM_TOKEN`: API key/token for hosted LLM (if different).

## Development Notes
- Uploaded files, chat histories, and FAISS index files are gitignored for privacy and storage reasons.
- The backend uses FastAPI and LangChain; the frontend uses Next.js and React.
- CORS is enabled for local development.

## License
MIT

---

**DocuAssist**: AI-powered document chat for your files.


from langchain_community.vectorstores import FAISS
from embeddings import HostedEmbeddings

def embed_and_store(docs, persist_path="faiss_index"):
    embeddings = HostedEmbeddings()
    vectorstore = FAISS.from_documents(docs, embeddings)
    vectorstore.save_local(persist_path)
    return vectorstore

def load_vectorstore(persist_path="faiss_index"):
    embeddings = HostedEmbeddings()
    return FAISS.load_local(persist_path, embeddings, allow_dangerous_deserialization=True)

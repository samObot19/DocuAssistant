from langchain_community.document_loaders import PyPDFLoader, TextLoader
def load_document(file_path: str):
    if file_path.endswith(".pdf"):
        return PyPDFLoader(file_path).load()
    elif file_path.endswith(".txt"):
        return TextLoader(file_path).load()
    else:
        raise ValueError("Unsupported file format")

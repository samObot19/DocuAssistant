from langchain.chains import RetrievalQA
from vectorstore import load_vectorstore
from llm.hosted_llm import HostedLLM

def build_qa_chain():
    vectorstore = load_vectorstore()
    retriever = vectorstore.as_retriever()
    llm = HostedLLM()
    return RetrievalQA.from_chain_type(llm=llm, retriever=retriever)

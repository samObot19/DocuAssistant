import os
from langchain.embeddings.base import Embeddings
from typing import List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class HostedEmbeddings(Embeddings):
    def __init__(self, model_name="openai/text-embedding-3-large", token=None):
        self.model_name = model_name
        self.endpoint = os.getenv("END_POINT")
        if not self.endpoint:
            raise ValueError("END_POINT environment variable is not set.")
        self.token = token or os.getenv("API_KEY")
        if not self.token:
            raise ValueError("Missing API_KEY")
        self.client = OpenAI(base_url=self.endpoint, api_key=self.token)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        response = self.client.embeddings.create(input=texts, model=self.model_name)
        return [item.embedding for item in response.data]

    def embed_query(self, text: str) -> List[float]:
        return self.embed_documents([text])[0]

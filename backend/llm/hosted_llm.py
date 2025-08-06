import os
from typing import Optional, List, Any
from langchain.llms.base import LLM
from openai import OpenAI
from pydantic import PrivateAttr
from dotenv import load_dotenv

load_dotenv()


class HostedLLM(LLM):
    token: Optional[str] = None
    model: str = "openai/gpt-4.1"
    temperature: float = 1.0
    endpoint: str = None
    _client: Any = PrivateAttr()

    def __init__(self, token: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.token = token or os.environ.get("HOSTED_LLM_TOKEN")
        if not self.token:
            raise ValueError("Missing HOSTED_LLM_TOKEN environment variable or .env entry.")
        self.endpoint = os.environ.get("END_POINT")
        if not self.endpoint:
            raise ValueError("END_POINT environment variable is not set.")
        self._client = OpenAI(
            base_url=self.endpoint,
            api_key=self.token,
        )

    @property
    def _llm_type(self) -> str:
        return "hosted_llm"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        messages = [
            {"role": "system", "content": ""},
            {"role": "user", "content": prompt},
        ]
        response = self._client.chat.completions.create(
            messages=messages,
            temperature=self.temperature,
            top_p=1,
            model=self.model,
            stop=stop,
        )
        return response.choices[0].message.content

from pydantic import BaseModel
from typing import Optional


class ChatQnA(BaseModel):
  question: str
  answer: str

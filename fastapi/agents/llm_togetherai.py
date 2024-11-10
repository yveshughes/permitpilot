from dotenv import load_dotenv
import os
from custom_types import ChatQnA
import asyncio
import logging

logging.basicConfig(level=logging.INFO)

load_dotenv()

# client = anthropic.Anthropic(
#     api_key=os.getenv("ANTHROPIC_API_KEY"),
# )

# claude3_sonnet_model = "claude-3-5-sonnet-20240620"

async def analyze_info(question: str, answer: str):
  import time
  logging.info("Starting analyze_info")
  print("Analyzing info...")
  
  try:
      start_time = time.time()
      logging.info("Attempting chat completion...")

      # generated_note_response = await asyncio.create_task(get_chat_completion(note_generation_context))
      extracted_info_response = {
         "question": question,
          "answer": answer,
          "extracted_info": "Extracted info from the answer"
      }

      logging.info("Chat completion:", extracted_info_response)
      logging.info(f"analyze_info completed in {time.time() - start_time:.2f} seconds")
      return extracted_info_response
  except Exception as e:
      logging.info(f"Error in analyze_info: {e}")
      return None
  
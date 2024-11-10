from dotenv import load_dotenv
import os
from custom_types import ChatQnA
import asyncio
import logging
from together import Together
# import together
from custom_types import BusinessDetails, ChatQnA
import json

logging.basicConfig(level=logging.INFO)

load_dotenv()

client = Together(
    api_key=os.getenv("TOGETHER_API_KEY")
)

# print("Together AI API key:", os.getenv("TOGETHER_API_KEY"))

meta_llama_3_1_8B_model = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"

JSON_FILE_PATH = "business_data.json"

initial_business_details = BusinessDetails()

# sample_data_all_null = {
#         '(Name of Business DBA)': 'null',
#         '(Business Phone)': 'null',
#         '(Business Address include street directions and suite number if applicable)': 'null',
#         '(City)': 'null',
#         '(Zip)': 'null',
#         '(Business EMail)': 'null',
#         '(Seating  Bed Capacity Licensed Healthcare)': 'null',
#         '(Square Footage)': 'null',
#         '(hours)': 'null',
#         '(LP)': 'null',
#         '(LLP)': 'null',
#         '(Corporation)': 'null',
#         '(LLC)': 'null',
#         '(Business Owner)': 'null',
#         '(Owner Phone)': 'null'
#     }

sample_data_updated = initial_business_details

# def load_data():
#     if os.path.exists(JSON_FILE_PATH):
#         with open(JSON_FILE_PATH, 'r') as file:
#             return json.load(file)
#     return initial_business_details

# def save_data(data):
#     with open(JSON_FILE_PATH, 'w') as file:
#         json.dump(data, file, indent=4)

def load_data():
    logging.info(f"Attempting to load data from {JSON_FILE_PATH}")
    
    # Initialize with default business details
    initial_data = initial_business_details.model_dump()
    
    if os.path.exists(JSON_FILE_PATH):
        print("File exists, attempting to load data...")
        try:
            with open(JSON_FILE_PATH, 'r') as file:
                loaded_data = json.load(file)
                logging.info(f"Successfully loaded data: {loaded_data}")
                return loaded_data
        except json.JSONDecodeError as e:
            logging.error(f"Error decoding JSON from file: {e}")
            return initial_data
        except Exception as e:
            logging.error(f"Unexpected error loading data: {e}")
            return initial_data
    else:
        logging.info(f"File {JSON_FILE_PATH} not found, returning initial business details")
        # Create the file with initial data
        save_data(initial_data)
        return initial_data

def save_data(data):
    logging.info(f"Saving data to {JSON_FILE_PATH}: {data}")
    try:
        with open(JSON_FILE_PATH, 'w') as file:
            json.dump(data, file, indent=4)
        logging.info("Data saved successfully")
    except Exception as e:
        logging.error(f"Error saving data: {e}")

async def analyze_info(question: str, answer: str):
  import time
  logging.info("Starting analyze_info")
  print("Analyzing info...")
  
  try:
      start_time = time.time()
      logging.info("Attempting chat completion...")
      print("Attempting chat completion...")

      current_business_details = load_data()

      info_extraction_context = {
          "question": question,
          "answer": answer,
      }

      print("Before calling get_chat_completion")
      extracted_info_response_1 = await asyncio.create_task(get_chat_completion(info_extraction_context))
      print("After calling get_chat_completion")

      extracted_info_response = {
         "question": question,
          "answer": answer,
          "extracted_info": "Extracted info from the answer"
      }

      # Update the data with new information
      print("Extracted JSON info from the answer:", extracted_info_response_1)
      # Add logic here to update specific fields based on extracted_info_response

      save_data(current_business_details)

      logging.info("Chat completion:", extracted_info_response)
      logging.info(f"analyze_info completed in {time.time() - start_time:.2f} seconds")
      return extracted_info_response
  except Exception as e:
      logging.info(f"Error in analyze_info: {e}")
      return None
  

async def get_chat_completion(info_extraction_context: ChatQnA):
  logging.info("Before try Getting chat completion...")
  print("Before try Getting chat completion...")
  try:
      logging.info("Getting chat completion...")

      system_prompt = f"""
        You are an assistant helping someone set up a buisness.
        You are to use the missing content to ask the client for more information.
        Check the information given by the client in the answer to the question and extract information relevant to the defined json schema.
      """
        # Only answer in JSON.

      # system_prompt = f"""
      #   You are an assistant helping extract business information.
      #   Extract any business-related information from the user's response and format it according to the provided JSON schema.
      #   If a field is not mentioned, leave it as null.
      # """

      user_prompt = f"""
        {info_extraction_context['answer']}
      """
      # user_prompt = f"""
      #   Question: {info_extraction_context['question']}\n
      #   Answer: {info_extraction_context['answer']}
      # """

      print("About to generate chat completion...")

      extract_response = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        # response_format={
        #     "type": "json_object",
        #     "schema": BusinessDetails.model_json_schema(),
        # },
    )
      
      print("Chat completion:", extract_response)

      output = json.loads(extract_response.choices[0].message.content)
      print(json.dumps(output, indent=2))

      # if extract_response and extract_response.choices:
      #   output = json.loads(extract_response.choices[0].message.content)
      #   return output
      # return BusinessDetails().model_dump()

      return output

  except Exception as e:
      logging.error(f"Error in get_chat_completion: {str(e)}")
      return BusinessDetails().model_dump()

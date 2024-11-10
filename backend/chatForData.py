import requests
import json

class SimpleChatBot:
    def __init__(self, together_api_key, model_name="meta-llama/Llama-3.2-3B-Instruct-Turbo"):
        self.api_key = together_api_key
        self.model_name = model_name
        self.api_url = "https://api.together.xyz/inference"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.conversation = []
        self.max_history = 20
        self.debug = False

    def print_debug(self, label, content):
        if self.debug:
            print("\n" + "="*50)
            print(f"DEBUG - {label}:")
            if isinstance(content, str):
                print(content)
            else:
                print(json.dumps(content, indent=2))
            print("="*50 + "\n")

    def analyze_personal_info(self):
        """
        Analyze conversation history to extract personal information.
        """
        # Convert conversation history to a numbered format
        history = "\n".join([
            f"{i}. {msg['role']}: {msg['content']}"
            for i, msg in enumerate(self.conversation, 1)
        ])

        # Construct prompt for personal info extraction
        analysis_prompt = (
            "Based on the following conversation history, create a Python dictionary "
            "containing all personal information mentioned about the user. Include only "
            "factual information that was explicitly stated. Format the response as a "
            "valid Python dictionary.\n\n"
            f"Conversation history:\n{history}\n\n"
            "Return ONLY the Python dictionary, nothing else. Example format:\n"
            "{\n    'name': 'John',\n    'location': 'New York'\n}\n\n"
            "Dictionary of user's personal info:"
        )

        payload = {
            "model": self.model_name,
            "prompt": analysis_prompt,
            "max_tokens": 100,
            "temperature": 0.1,
            "top_p": 0.7,
            "top_k": 50,
            "stop": ["User:", "Assistant:", "Conversation history:"]
        }

        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if 'output' in result and 'choices' in result['output']:
                personal_info = result['output']['choices'][0]['text'].strip()
                self.print_debug("Personal Info Analysis", personal_info)
                return personal_info
            else:
                return "Error: Unexpected API response format"
                
        except requests.exceptions.RequestException as e:
            return f"API Error: {str(e)}"

    def get_response(self, user_input):
        self.conversation.append({"role": "user", "content": user_input})
        self.print_debug("Current Conversation History", self.conversation)
        
        messages = self.conversation[-self.max_history:]
        history = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in messages
        ])
        
        prompt = (
            "You are a chatbot with memory of the conversation. "
            "Use the conversation history below to provide accurate responses.\n\n"
            "Keep asking the user questions to get their personal info (name, date, location, etc).\n\n"
            f"Conversation history:\n{history}\n\n"
            "Based on the above history, provide a direct response to the user's last message.\n"
            "Assistant:"
        )

        self.print_debug("Prompt Sent to Model", prompt)

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "max_tokens": 100,
            "temperature": 0.1,
            "top_p": 0.7,
            "top_k": 50,
            "repetition_penalty": 1.1,
            "stop": ["User:", "Assistant:", "Conversation history:", "(Note:"]
        }

        try:
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            self.print_debug("Raw API Response", result)
            
            if 'output' in result and 'choices' in result['output']:
                bot_response = result['output']['choices'][0]['text'].strip()
                self.conversation.append({"role": "assistant", "content": bot_response})
                if len(self.conversation) > self.max_history:
                    self.conversation = self.conversation[-self.max_history:]
                return bot_response
            else:
                return "Error: Unexpected API response format"
                
        except requests.exceptions.RequestException as e:
            return f"API Error: {str(e)}"

    def show_memory(self):
        print("\n--- Current Conversation Memory ---")
        for i, msg in enumerate(self.conversation, 1):
            print(f"{i}. {msg['role']}: {msg['content']}")
        print("--------------------------------\n")

def main():
    API_KEY = "b0222468fe741dec70c263c2db264b97a79e1b8169cc23625c314d316bf09b27"
    chatbot = SimpleChatBot(API_KEY)
    
    print("ChatBot initialized. Type 'quit' to exit.")
    print("Special commands:")
    print("  'quit' - Exit the program")
    print("  'memory' - Show current conversation memory")
    print("  'debug on/off' - Toggle debug mode")
    print(f"Using model: {chatbot.model_name}")
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() == 'quit':
            print("Goodbye!")
            break
        elif user_input.lower() == 'memory':
            chatbot.show_memory()
            continue
        elif user_input.lower() == 'debug on':
            chatbot.debug = True
            print("Debug mode enabled")
            continue
        elif user_input.lower() == 'debug off':
            chatbot.debug = False
            print("Debug mode disabled")
            continue
        elif user_input == "":
            print("Please enter a message.")
            continue
            
        response = chatbot.get_response(user_input)
        print(f"Bot: {response}")
        
        # After each response, analyze and display personal information
        print("\n--- Current Personal Information Analysis ---")
        personal_info = chatbot.analyze_personal_info()

        # Find the position of the closing brace and trim everything after it (extra unecessary dialogue)
        closing_brace_pos = personal_info.find('}')
        if closing_brace_pos != -1:
            personal_info = personal_info[:closing_brace_pos + 1]

        print(personal_info)
        print("----------------------------------------\n")

if __name__ == "__main__":
    main()
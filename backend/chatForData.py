import requests
import json

# USAGE:
# keep giving the bot personal information in its questions. Then at one point ask:
# You: "Based on our chat history and my responses, can you create python dictionary of my personal info"

# RESULT: 
# Bot: Based on our conversation so far, here's a Python dictionary containing some of the personal info we've discussed:

#```
#{
#    "Name": "Ruben",
#    "Hobby": "Soccer",
#    "Favorite Team": "Manchester United",
#    "Location": "Manchester"
#}
#```

# TODO: CREATE ANOTHER AI that runs everytime a new item is added to the chat history. And does this calculation. 
# Returns the string, and debug displays it. 

# TODO: get it to ask relevant info to the PDF contents

class SimpleChatBot:
    def __init__(self, together_api_key, model_name="meta-llama/Llama-3.2-3B-Instruct-Turbo"):
        """
        Initialize the chatbot with API credentials and conversation memory setup.

        Parameters:
            together_api_key (str): API key for accessing the Together AI API.
            model_name (str): Model to use for generating responses (default: Llama-3.2-3B-Instruct-Turbo).
        """
        self.api_key = together_api_key
        self.model_name = model_name
        self.api_url = "https://api.together.xyz/inference"  # API endpoint URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.conversation = []  # Initialize conversation memory as an empty list
        self.max_history = 20  # Limit conversation history to last 20 messages
        self.debug = False  # Debug mode flag for printing detailed information

    def print_debug(self, label, content):
        """
        Print debug information to track data and flow, if debug mode is enabled.

        Parameters:
            label (str): A label describing the debug information.
            content (str/dict): Content to be printed. If a dictionary, it's formatted for readability.
        """
        if self.debug:  # Check if debug mode is enabled
            print("\n" + "="*50)
            print(f"DEBUG - {label}:")
            if isinstance(content, str):
                print(content)
            else:
                print(json.dumps(content, indent=2))  # Pretty print JSON content
            print("="*50 + "\n")

    def get_response(self, user_input):
        """
        Generate a response based on user input and conversation history.

        Parameters:
            user_input (str): User's latest message to add to the conversation.

        Returns:
            str: Bot's response or an error message if the API call fails.
        """
        # Add user message to the conversation history
        self.conversation.append({"role": "user", "content": user_input})
        
        # Print current conversation history if debug mode is on
        self.print_debug("Current Conversation History", self.conversation)
        
        # Limit the prompt to the last 'max_history' messages
        messages = self.conversation[-self.max_history:]
        history = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in messages
        ])
        
        # Construct a prompt with memory instructions for the model
        prompt = (
            "You are a chatbot with memory of the conversation. "
            "Use the conversation history below to provide accurate responses.\n\n "
            "Keep asking the user questions to get their personal info (name, date, location, etc).\n\n"
            f"Conversation history:\n{history}\n\n"
            "Based on the above history, provide a direct response to the user's last message.\n"
            "Assistant:"
        )

        # Print the prompt sent to the model if debug mode is on
        self.print_debug("Prompt Sent to Model", prompt)

        # Create payload with model settings and prompt
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "max_tokens": 100,  # Limit the response length
            "temperature": 0.1,  # Control creativity (lower is more deterministic)
            "top_p": 0.7,  # Token sampling parameter for diversity
            "top_k": 50,  # Limit the token selection scope
            "repetition_penalty": 1.1,  # Penalize repetitive responses
            "stop": ["User:", "Assistant:", "Conversation history:"]  # Stop tokens
        }

        try:
            # Send POST request to Together API
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()  # Raise error for unsuccessful status codes
            
            # Parse response JSON
            result = response.json()
            self.print_debug("Raw API Response", result)  # Print raw API response if debugging
            
            # Check if response contains the model's output
            if 'output' in result and 'choices' in result['output']:
                bot_response = result['output']['choices'][0]['text'].strip()
                # Add bot's response to the conversation history
                self.conversation.append({"role": "assistant", "content": bot_response})
                # Trim conversation history if it exceeds max_history
                if len(self.conversation) > self.max_history:
                    self.conversation = self.conversation[-self.max_history:]
                return bot_response  # Return bot's response
            else:
                return "Error: Unexpected API response format"
                
        except requests.exceptions.RequestException as e:
            return f"API Error: {str(e)}"  # Handle connection and other request-related errors

    def show_memory(self):
        """
        Display the conversation history.
        """
        print("\n--- Current Conversation Memory ---")
        for i, msg in enumerate(self.conversation, 1):
            print(f"{i}. {msg['role']}: {msg['content']}")
        print("--------------------------------\n")

def main():
    # Replace with your Together API key
    API_KEY = "b0222468fe741dec70c263c2db264b97a79e1b8169cc23625c314d316bf09b27"
    
    # Create an instance of the chatbot
    chatbot = SimpleChatBot(API_KEY)
    
    print("ChatBot initialized. Type 'quit' to exit.")
    print("Special commands:")
    print("  'quit' - Exit the program")
    print("  'memory' - Show current conversation memory")
    print("  'debug on/off' - Toggle debug mode")
    print(f"Using model: {chatbot.model_name}")
    
    # Main loop to interact with the chatbot
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() == 'quit':
            print("Goodbye!")
            break  # Exit the program if user types 'quit'
        elif user_input.lower() == 'memory':
            chatbot.show_memory()  # Display conversation history
            continue
        elif user_input.lower() == 'debug on':
            chatbot.debug = True  # Enable debug mode
            print("Debug mode enabled")
            continue
        elif user_input.lower() == 'debug off':
            chatbot.debug = False  # Disable debug mode
            print("Debug mode disabled")
            continue
        elif user_input == "":
            print("Please enter a message.")  # Prompt for input if message is empty
            continue
            
        # Get and print chatbot's response to user input
        response = chatbot.get_response(user_input)
        print(f"Bot: {response}")

if __name__ == "__main__":
    main()

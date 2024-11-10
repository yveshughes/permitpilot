'use client'

import React, { useState, useEffect } from 'react';

interface ChatQuestion {
  question: string;
  type: 'text' | 'choice';
  choices?: string[];
}

// Update the role type to be more strict
type MessageRole = 'user' | 'assistant';

interface ConversationMessage {
  role: MessageRole;
  content: string;
}

interface FormData {
  '(Name of Business DBA)': string | null;
  '(Business Phone)': string | null;
  '(Business Address include street directions and suite number if applicable)': string | null;
  '(City)': string | null;
  '(Zip)': string | null;
  '(Business Email)': string | null;
  '(Square Footage)': string | null;
}

const IntegratedChatInterface: React.FC = () => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [formData] = useState<FormData>({
    '(Name of Business DBA)': null,
    '(Business Phone)': null,
    '(Business Address include street directions and suite number if applicable)': null,
    '(City)': null,
    '(Zip)': null,
    '(Business Email)': null,
    '(Square Footage)': null,
  });
  const [messageExchanges, setMessageExchanges] = useState<number>(0);

  const API_KEY = "b0222468fe741dec70c263c2db264b97a79e1b8169cc23625c314d316bf09b27";
  const MODEL_NAME = "meta-llama/Llama-3.2-3B-Instruct-Turbo";
  const API_URL = "https://api.together.xyz/inference";

  // Calculate progress based on filled form fields
  const progress = (Object.values(formData).filter(value => value !== null).length / Object.keys(formData).length) * 100;

  const getResponse = async (userInput: string) => {
    // Create new message with strict typing
    const userMessage: ConversationMessage = { role: 'user', content: userInput };
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);

    const remainingData = Object.entries(formData)
      .filter(([_, value]) => value === null)
      .reduce((obj, [key]) => ({ ...obj, [key]: null }), {});

    const prompt = `You are a chatbot designed to guide users through completing a permit form, 
      similar to an interactive assistant like TurboTax. 
      Use the conversation history below and the data requirements in 'formData' 
      to ask only necessary questions and gather the required information for each field.

      Only ask questions about fields that haven't been provided by the user yet. 
      Do not repeat questions the user has already answered, and focus on one field at a time.
      If all required information has been collected, acknowledge this and let the user know.

      Here are the remaining data requirements:
      ${JSON.stringify(remainingData, null, 2)}

      Conversation history:
      ${newConversation.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

      Based on the above history and the remaining fields in 'formData', 
      ask the user a relevant question to complete their permit form.
      Assistant:`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          prompt: prompt,
          max_tokens: 100,
          temperature: 0.1,
          top_p: 0.7,
          top_k: 50,
          repetition_penalty: 1.1,
          stop: ["\n", "User:", "Assistant:", "Conversation history:", "(Note:"]
        })
      });

      if (!response.ok) throw new Error('API request failed');
      
      const result = await response.json();
      if (result.output?.choices?.[0]?.text) {
        const botResponse: ConversationMessage = {
          role: 'assistant',
          content: result.output.choices[0].text.trim()
        };
        setConversation([...newConversation, botResponse]);
        setMessageExchanges(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: ConversationMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setConversation([...newConversation, errorMessage]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    getResponse(input);
    setInput('');
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log('Form submitted!', formData);
    // You can add your submission logic here
  };

  // Initialize conversation with a delay
  useEffect(() => {
    if (conversation.length === 0) {
      const delay = setTimeout(() => {
        getResponse("Hello");
      }, 500);

      return () => clearTimeout(delay);
    }
  }, [conversation.length]); // Add conversation.length as dependency

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="w-full h-1 bg-gray-100 rounded-full">
          <div 
            className="h-1 bg-blue-500 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Conversation display */}
      <div className="mb-8 space-y-4">
        {conversation.map((msg, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg ${
              msg.role === 'assistant' 
                ? 'bg-blue-100 ml-4' 
                : 'bg-gray-100 mr-4'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11l-7-7m0 0l-7 7m7-7v18" />
          </svg>
        </button>
      </div>

      {/* Submit button - appears after 5 message exchanges */}
      {messageExchanges >= 5 && (
        <button
          onClick={handleSubmit}
          className="w-full mt-8 px-6 py-4 text-xl font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-lg"
        >
          SUBMIT
        </button>
      )}
    </div>
  );
};

export default IntegratedChatInterface;
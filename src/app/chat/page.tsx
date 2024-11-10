'use client'

import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Select } from '@/components/select'
import { Stat } from '@/components/stat'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getRecentOrders } from '@/data'
import { useState } from 'react'
import { ChatQnAData, ChatMessage } from '@/lib/types/chat_qna';


let questions = [
  "What is your name?",
  "What is your business about?",
  "Where are you located?",
]

// export default async function Home() {
export default function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: 'ai',
      message: questions[0]
    }
  ]);
  const [userInput, setUserInput] = useState('');

  // let orders = await getRecentOrders()



  const handleSend = async () => {
    if (!userInput.trim()) return

    // Add user message to chat history
    // const newChatHistory = [...chatHistory, {
    //   type: 'user' as const,
    //   message: userInput
    // }]


    const newChatHistory: ChatMessage[] = [...chatHistory,
    { type: 'user' as const, message: userInput },
    // Add next AI question if available
    ...(currentQuestionIndex + 1 < questions.length
      ? [{ type: 'ai' as const, message: questions[currentQuestionIndex + 1] }]
      : []
    )
    ];

    // Send to backend
    try {
      const response = await fetch('/api/send-chat-qna', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questions[currentQuestionIndex],
          answer: userInput
        })
      })

      console.log("Response:", response.json().then(data => console.log(data)));

      // Move to next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }

    // Clear input
    // setUserInput('')
    // setChatHistory(newChatHistory)

    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setUserInput('');
    setChatHistory(newChatHistory);
  }

  return (
    <div className="flex flex-col h-screen">
      <Heading>AI Chat</Heading>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg my-4 text-black">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${chat.type === 'user' ? 'bg-blue-500 text-black' : 'bg-white'
              }`}>
              {chat.message}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t flex gap-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg text-black bg-white"
          placeholder="Type your answer..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  )
  // return (
  //   <>
  //     <Heading>AI Chat</Heading>
  //   </>
  // )
}
"use client"

import React, { useState, useEffect } from 'react';

interface ChatQuestion {
  question: string;
  type: 'text' | 'choice';
  choices?: string[];
}

const SimpleChatInterface = () => {
  const [currentQuestion, setCurrentQuestion] = useState<ChatQuestion | null>(null);
  const [input, setInput] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [awaitingChoice, setAwaitingChoice] = useState<boolean>(false);

  // Chat flow configuration
  const chatFlow: ChatQuestion[] = [
    {
      question: "Hi! What kind of AI project did you work on at the hackathon? Can you describe it briefly?",
      type: "text"
    },
    {
      question: "That's interesting! Which programming languages or AI frameworks did you use?",
      type: "choice",
      choices: ["Python/TensorFlow", "JavaScript/TensorFlow.js", "Python/PyTorch", "Java/DL4J", "Other"]
    },
    {
      question: "What was the biggest technical challenge you faced?",
      type: "text"
    },
    {
      question: "How many team members worked with you on this project?",
      type: "choice",
      choices: ["Solo project", "2-3 members", "4-5 members", "6+ members"]
    },
    {
      question: "What's next for your project? Are you planning to develop it further?",
      type: "text"
    }
  ];

  // Calculate progress (0-100)
  const progress = Math.min((currentStep / chatFlow.length) * 100, 100);

  const handleNextQuestion = () => {
    if (currentStep < chatFlow.length) {
      const nextQuestion = chatFlow[currentStep];
      setCurrentQuestion(nextQuestion);
      setAwaitingChoice(nextQuestion.type === 'choice');
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentQuestion({
        question: "Thank you for sharing your hackathon experience! Would you like to tell me more about your other projects?",
        type: "text"
      });
    }
  };

  useEffect(() => {
    if (!currentQuestion) {
      handleNextQuestion();
    }
  }, [currentQuestion]);

  const handleChoiceSelect = (choice: string) => {
    if (awaitingChoice) {
      setAwaitingChoice(false);
      setTimeout(handleNextQuestion, 500);
    }
  };

  const handleSend = () => {
    if (!input.trim() || awaitingChoice) return;
    setInput('');
    setTimeout(handleNextQuestion, 500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="w-full h-1 bg-gray-100 rounded-full">
          <div 
            className="h-1 bg-blue-500 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question display */}
      {currentQuestion && (
        <div className="mb-8">
          <h2 className="text-2xl font-normal text-gray-900 mb-8">
            {currentQuestion.question}
          </h2>

          {/* Multiple choice buttons */}
          {currentQuestion.choices ? (
            <div className="space-y-3">
              {currentQuestion.choices.map((choice: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleChoiceSelect(choice)}
                  className="w-full px-4 py-3 text-left text-lg text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSend()}
                placeholder="Answer here..."
                className="w-full px-4 py-3 text-lg border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none"
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
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleChatInterface;
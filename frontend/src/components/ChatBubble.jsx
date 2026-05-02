import { useState } from 'react';

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-md'
          : 'bg-white border text-gray-800 rounded-bl-md shadow-sm'
      }`}>
        {/* Avatar + Role */}
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg">{isUser ? '👤' : '⚖️'}</span>
          <span className={`text-xs font-semibold ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
            {isUser ? 'You' : 'Legal Saathi AI'}
          </span>
        </div>

        {/* Message Content */}
        <div className={`whitespace-pre-wrap text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-700'}`}>
          {message.content}
        </div>

        {/* Copy Button (AI messages only) */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        )}
      </div>
    </div>
  );
}
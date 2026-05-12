import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ChatBubble({ message, isLast }) {
  const isUser = message?.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (message?.content) {
      navigator.clipboard.writeText(
        typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-end gap-2 max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          isUser
            ? 'bg-gradient-to-br from-brand-500 to-violet-500 text-white'
            : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
        }`}>
          {isUser ? 'You' : 'AI'}
        </div>

        {/* Message Content */}
        <div className={`relative rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-br-md'
            : 'bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-bl-md shadow-sm'
        }`}>
          {/* Sender label */}
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
            isUser ? 'text-gray-400 dark:text-gray-500' : 'text-brand-500 dark:text-brand-400'
          }`}>
            {isUser ? 'You' : 'Legal Saathi AI'}
          </p>

          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap font-normal">
              {typeof message?.content === 'string'
                ? message.content
                : JSON.stringify(message?.content, null, 2)}
            </div>
          </div>

          {/* Action bar */}
          {!isUser && (
            <div className="mt-3 flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-2">
              <button
                onClick={handleCopy}
                className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
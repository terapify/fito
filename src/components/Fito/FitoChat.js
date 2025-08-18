import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FitoAvatar from './FitoAvatar';
import { getTimeBasedGreeting, getRandomDialog } from '../../lib/fitoDialogs';
import useGameStore from '../../lib/gameStore';

const FitoChat = ({ initialMessage = null, onMessageComplete = null }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  
  const { fito, user, updateFitoMood } = useGameStore();

  useEffect(() => {
    if (!initialMessage || initialMessage === 'undefined') {
      const greeting = user?.name && user.name !== 'undefined'
        ? `${getTimeBasedGreeting()}, ${user.name}!`
        : getTimeBasedGreeting();
      setCurrentMessage(greeting);
    } else {
      setCurrentMessage(initialMessage);
    }
  }, [initialMessage, user?.name]);

  useEffect(() => {
    if (currentMessage && currentMessage !== 'undefined') {
      setIsTyping(true);
      setDisplayedText('');
      
      let index = 0;
      const interval = setInterval(() => {
        if (index <= currentMessage.length) {
          setDisplayedText(currentMessage.substring(0, index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
          if (onMessageComplete) {
            onMessageComplete();
          }
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [currentMessage, onMessageComplete]);

  const handleNewMessage = (message) => {
    setCurrentMessage(message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-4"
    >
      <FitoAvatar mood={fito.mood} size="small" isTyping={isTyping} />
      
      <AnimatePresence mode="wait">
        {displayedText && displayedText !== 'undefined' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-sm"
          >
            <div className="bg-white rounded-2xl px-4 py-3 shadow-lg relative">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-2 h-5 bg-purple-500 ml-1 animate-pulse" />
                )}
              </p>
              
              {/* Speech bubble tail */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isTyping && (
        <motion.div
          className="flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default FitoChat;
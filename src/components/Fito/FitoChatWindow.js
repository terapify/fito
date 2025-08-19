import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, RefreshCw } from 'lucide-react';
import FitoAvatar from './FitoAvatar';
import useGameStore from '../../lib/gameStore';
import { getTimeBasedGreeting } from '../../lib/fitoDialogs';

const FitoChatWindow = memo(() => {
  const {
    chat,
    fito,
    user,
    garden,
    stats,
    missions,
    toggleChat,
    addChatMessage,
    setChatLoading,
    clearChatHistory,
    updateFitoMood,
  } = useGameStore();

  const [inputMessage, setInputMessage] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [displayedStreamingMessage, setDisplayedStreamingMessage] = useState('');
  const [position, setPosition] = useState(() => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    return { 
      x: Math.max(0, windowWidth - 440), 
      y: Math.max(0, windowHeight - 670) 
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamingIntervalRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Auto-scroll for messages and streaming
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [chat.messages, displayedStreamingMessage]);

  // Typing effect for streaming messages
  useEffect(() => {
    if (streamingMessage) {
      // Clear any existing interval
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }

      let index = 0;
      const typingSpeed = 50; // Milliseconds per character (slower for better readability)

      streamingIntervalRef.current = setInterval(() => {
        if (index <= streamingMessage.length) {
          setDisplayedStreamingMessage(streamingMessage.substring(0, index));
          index++;
          scrollToBottom();
        } else {
          clearInterval(streamingIntervalRef.current);
        }
      }, typingSpeed);

      return () => {
        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current);
        }
      };
    } else {
      setDisplayedStreamingMessage('');
    }
  }, [streamingMessage]);

  useEffect(() => {
    if (chat.isOpen && inputRef.current) {
      // Focus input after initial message is sent
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [chat.isOpen]);

  const getUserContext = () => ({
    name: user?.name,
    plantsCount: garden?.plants?.length || 0,
    missionsCompleted: stats?.missionsCompleted || 0,
    streak: stats?.streak?.current || 0,
    fitoMood: fito?.mood || 'neutral',
    pendingMissions: missions?.map(mission => ({
      id: mission.id,
      type: mission.type,
      title: mission.title,
      description: mission.description,
      status: mission.status,
      assignedBy: mission.assignedBy || 'Terapeuta',
      createdAt: mission.createdAt,
    })) || [],
    totalPendingMissions: missions?.length || 0,
  });

  const sendMessage = async () => {
    if (!inputMessage.trim() || chat.isLoading || chat.turnCount >= 20) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message
    addChatMessage(userMessage);
    setInputMessage('');
    setChatLoading(true);
    
    // Keep focus on input after sending message
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chat.messages, userMessage],
          userContext: getUserContext(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantContent += chunk;
        setStreamingMessage(assistantContent);
      }

      // Add complete assistant message
      const assistantMessage = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString(),
      };

      addChatMessage(assistantMessage);
      setStreamingMessage('');
      
      // Refocus input after assistant response
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      addChatMessage(errorMessage);
      setStreamingMessage('');
      
      // Refocus input after error
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = () => {
    clearChatHistory();
    setStreamingMessage('');
  };

  // Drag & Drop handlers
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Viewport constraints
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const chatWidth = 420;
    const chatHeight = 650;

    const constrainedX = Math.max(0, Math.min(newX, windowWidth - chatWidth));
    const constrainedY = Math.max(0, Math.min(newY, windowHeight - chatHeight));

    setPosition({ x: constrainedX, y: constrainedY });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update Fito mood when chat opens
  useEffect(() => {
    if (chat.isOpen) {
      updateFitoMood(); // This will set the mood based on current game state
    }
  }, [chat.isOpen, updateFitoMood]);

  // Send initial message when chat opens and is empty
  useEffect(() => {
    if (chat.isOpen && chat.messages.length === 0 && !streamingMessage) {
      const timer = setTimeout(() => {
        let greeting = getTimeBasedGreeting();
        
        // Customize greeting based on Fito's mood
        if (fito.mood === 'excited') {
          greeting += ' ¡Estoy muy emocionado de verte!';
        } else if (fito.mood === 'worried') {
          greeting += ' He notado que tienes algunas misiones pendientes.';
        } else if (fito.mood === 'sad') {
          greeting += ' Veo que quizás necesitas un poco de apoyo hoy.';
        } else {
          greeting += ' ¿Cómo te sientes hoy?';
        }
        
        if (user?.name && user.name !== 'undefined') {
          greeting = greeting.replace('¿Cómo te sientes hoy?', `¿Cómo te sientes hoy, ${user.name}?`);
        }
        
        const initialMessage = {
          role: 'assistant',
          content: greeting,
          timestamp: new Date().toISOString(),
          isInitial: true,
        };
        
        addChatMessage(initialMessage);
      }, 800); // Small delay for better UX

      return () => clearTimeout(timer);
    }
  }, [chat.isOpen, chat.messages.length, streamingMessage, user?.name, fito.mood, addChatMessage]);

  if (!chat.isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: position.x,
        y: position.y
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        x: { type: "tween", duration: isDragging ? 0 : 0.3 },
        y: { type: "tween", duration: isDragging ? 0 : 0.3 }
      }}
      className={`fixed top-0 left-0 w-[420px] h-[650px] z-50 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 overflow-hidden flex flex-col transition-shadow duration-200 ${
        isDragging ? 'shadow-2xl' : 'shadow-xl'
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        cursor: isDragging ? 'grabbing' : 'auto',
        boxShadow: isDragging 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Header */}
      <div 
        className="relative p-4 text-white select-none"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm rounded-t-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.8) 0%, rgba(236,72,153,0.8) 100%)',
          }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-white/20 rounded-full">
              <FitoAvatar mood={fito.mood} size="small" isAnimating={false} />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                Conversa con Fito
                <motion.div
                  className="text-white/60"
                  animate={{ 
                    opacity: isDragging ? 1 : [0.4, 0.8, 0.4],
                    scale: isDragging ? 1.1 : 1
                  }}
                  transition={{ 
                    duration: isDragging ? 0.2 : 2,
                    repeat: isDragging ? 0 : Infinity
                  }}
                >
                  ⋮⋮
                </motion.div>
              </h3>
              <p className="text-white/90 text-sm">
                Tu compañero de bienestar mental 🌱 {isDragging && '• Arrastrando...'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {chat.messages.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearChat}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                title="Limpiar conversación"
                style={{ cursor: 'pointer' }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleChat}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
              style={{ cursor: 'pointer' }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
        {chat.turnCount >= 20 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 backdrop-blur-sm"
          >
            <p className="text-sm text-yellow-100">
              ⚠️ Has alcanzado el límite de 20 turnos. Limpia la conversación para continuar.
            </p>
          </motion.div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {chat.messages.length === 0 && !streamingMessage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center text-white/60">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-40" />
              </motion.div>
              <p className="text-sm">Preparando conversación...</p>
            </div>
          </motion.div>
        )}

        {chat.messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`mb-4 flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 backdrop-blur-md border shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white border-white/30'
                  : message.isError
                  ? 'bg-red-500/30 text-red-50 border-red-300/40'
                  : 'bg-white/30 text-gray-800 border-white/40'
              }`}
            >
              {message.role === 'assistant' && !message.isError && (
                <div className="flex items-center space-x-2 mb-2">
                  <FitoAvatar mood={fito.mood} size="tiny" isAnimating={false} />
                  <span className="text-xs text-gray-600 font-medium">Fito</span>
                </div>
              )}
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed font-medium">
                {message.content}
              </p>
              <p className={`text-xs mt-2 text-right ${
                message.role === 'user' ? 'text-white/70' : 'text-gray-600'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Streaming message */}
        {streamingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex justify-start"
          >
            <div className="max-w-[80%] bg-white/30 backdrop-blur-md text-gray-800 rounded-2xl px-4 py-3 border border-white/40 shadow-lg">
              <div className="flex items-start space-x-2 mb-2">
                <FitoAvatar mood={fito.mood} size="tiny" isAnimating={false} />
                <span className="text-xs text-gray-600 font-medium">Fito</span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed font-medium">
                {displayedStreamingMessage}
                {displayedStreamingMessage.length < streamingMessage.length && (
                  <span className="inline-block w-2 h-5 bg-green-500 ml-1 animate-pulse rounded-sm" />
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* Loading indicator */}
        {chat.isLoading && !streamingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-white/30 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/40 shadow-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FitoAvatar mood={fito.mood} size="tiny" isAnimating={false} />
                <span className="text-xs text-gray-600 font-medium">Fito está escribiendo...</span>
              </div>
              <div className="flex space-x-1">
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative border-t border-white/20 p-4">
        <div 
          className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-b-3xl"
        />
        <div className="relative flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                chat.turnCount >= 20
                  ? 'Límite de turnos alcanzado. Limpia la conversación para continuar.'
                  : 'Escribe tu mensaje aquí...'
              }
              disabled={chat.isLoading || chat.turnCount >= 20}
              className="w-full resize-none rounded-2xl border border-white/40 px-4 py-3 pr-16 bg-white/15 backdrop-blur-md text-white placeholder-white/70 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:bg-white/5 disabled:cursor-not-allowed transition-all shadow-sm"
              rows="2"
            />
            <div className="absolute bottom-3 right-3 text-xs text-white/70 font-medium">
              {chat.turnCount}/20
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!inputMessage.trim() || chat.isLoading || chat.turnCount >= 20}
            className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg backdrop-blur-md flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

FitoChatWindow.displayName = 'FitoChatWindow';

export default FitoChatWindow;
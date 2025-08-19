import { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mic, MicOff, Video, VideoOff, Settings, MessageSquare, Monitor } from 'lucide-react';
import FitoAvatar from '../Fito/FitoAvatar';
import useGameStore from '../../lib/gameStore';

const VideoCallInterface = memo(() => {
  const {
    videoCall,
    appointment,
    endVideoCall,
    updateCallDuration,
    toggleMute,
    toggleCamera,
    updateConnectionStatus,
  } = useGameStore();

  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Timer for call duration
  useEffect(() => {
    if (!videoCall.isActive || !videoCall.startTime) return;

    const interval = setInterval(() => {
      const startTime = new Date(videoCall.startTime);
      const now = new Date();
      const duration = Math.floor((now - startTime) / 1000);
      updateCallDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [videoCall.isActive, videoCall.startTime, updateCallDuration]);

  // Simulate connection process
  useEffect(() => {
    if (!videoCall.isActive) return;

    const connectingTimer = setTimeout(() => {
      updateConnectionStatus('connected');
      setIsConnected(true);
    }, 2000);

    return () => clearTimeout(connectingTimer);
  }, [videoCall.isActive, updateConnectionStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = useCallback(() => {
    endVideoCall();
  }, [endVideoCall]);

  const getConnectionIndicator = () => {
    switch (videoCall.connectionStatus) {
      case 'connecting':
        return { color: 'bg-yellow-500', text: 'Conectando...', pulse: true };
      case 'connected':
        return { color: 'bg-green-500', text: 'Conectado', pulse: false };
      case 'poor':
        return { color: 'bg-red-500', text: 'Conexión débil', pulse: true };
      default:
        return { color: 'bg-gray-500', text: 'Desconectado', pulse: false };
    }
  };

  const connectionIndicator = getConnectionIndicator();

  if (!videoCall.isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Connection Status Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-2">
          <div 
            className={`w-2 h-2 rounded-full ${connectionIndicator.color} ${
              connectionIndicator.pulse ? 'animate-pulse' : ''
            }`} 
          />
          <span className="text-white text-sm font-medium">
            {connectionIndicator.text}
          </span>
          <span className="text-white/70 text-sm">
            • {formatDuration(videoCall.duration)}
          </span>
        </div>
      </motion.div>

      {/* Main Video Grid */}
      <div className="flex-1 relative">
        {/* Therapist Video - Main */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"
        >
          {/* Therapist Video Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isConnected ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                {/* Simulated therapist video with Homero */}
                <div className="relative w-80 h-96 bg-gradient-to-b from-blue-100 to-blue-200 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  
                  {/* Doctor Homero Simpson representation */}
                  <div className="h-full w-full flex flex-col items-center justify-center p-8">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-yellow-100">
                        <img
                          src="/homero.webp"
                          alt="Dr. Homero Simpson"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to alternative image
                            e.target.src = "/1555803206800_homero_edited.webp";
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white animate-pulse" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {appointment.therapist}
                    </h3>
                    <p className="text-gray-600 text-center text-sm">
                      Psicólogo Clínico • En sesión
                    </p>
                    
                    {/* Simulated talking animation */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="mt-4 w-16 h-1 bg-green-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
              />
            )}
          </div>

          {/* Connecting overlay */}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full mx-auto mb-4"
                />
                <p className="text-lg font-medium">Conectando con tu terapeuta...</p>
                <p className="text-sm text-white/70 mt-2">
                  {appointment.therapist} se unirá en un momento
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* User Video - Picture in Picture */}
        <motion.div
          initial={{ scale: 0, x: 100, y: 100 }}
          animate={{ scale: 1, x: 0, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bottom-24 right-6 w-48 h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30"
        >
          {videoCall.isCameraOn ? (
            <div className="relative h-full bg-gradient-to-br from-green-400 to-blue-500">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="text-sm font-medium">Tú</p>
                </div>
              </div>
              
              {/* Mic status indicator */}
              <div className="absolute top-2 left-2">
                <div className={`p-1.5 rounded-full ${
                  videoCall.isMuted ? 'bg-red-500' : 'bg-green-500'
                }`}>
                  {videoCall.isMuted ? (
                    <MicOff className="w-3 h-3 text-white" />
                  ) : (
                    <Mic className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white/70" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
      >
        <div className="bg-black/60 backdrop-blur-xl rounded-3xl px-6 py-4 flex items-center space-x-4">
          {/* Mute Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className={`p-4 rounded-2xl transition-all ${
              videoCall.isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {videoCall.isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </motion.button>

          {/* Camera Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleCamera}
            className={`p-4 rounded-2xl transition-all ${
              !videoCall.isCameraOn 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {videoCall.isCameraOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </motion.button>

          {/* Chat Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChat(!showChat)}
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <Settings className="w-6 h-6 text-white" />
          </motion.button>

          {/* End Call */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndCall}
            className="p-4 rounded-2xl bg-red-500 hover:bg-red-600 transition-all ml-4"
          >
            <Phone className="w-6 h-6 text-white transform rotate-[135deg]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-32 right-6 bg-black/80 backdrop-blur-xl rounded-2xl p-6 text-white min-w-[200px]"
          >
            <h3 className="font-semibold mb-4">Configuración</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cámara</span>
                <div className="text-green-400 text-sm">✓ Conectada</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Micrófono</span>
                <div className="text-green-400 text-sm">✓ Conectado</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Conexión</span>
                <div className="text-green-400 text-sm">Estable</div>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-6 top-20 bottom-32 w-80 bg-black/80 backdrop-blur-xl rounded-2xl p-4 text-white"
          >
            <h3 className="font-semibold mb-4">Chat de sesión</h3>
            <div className="flex-1 text-center text-white/60 text-sm">
              El chat estará disponible durante la sesión
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

VideoCallInterface.displayName = 'VideoCallInterface';

export default VideoCallInterface;
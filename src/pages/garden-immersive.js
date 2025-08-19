import { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import FitoChat from '../components/Fito/FitoChat';
import FitoChatWindow from '../components/Fito/FitoChatWindow';
import MissionsPanel from '../components/Missions/MissionsPanel';
import AppointmentReminder from '../components/Appointments/AppointmentReminder';
import useGameStore from '../lib/gameStore';
import useHydration from '../hooks/useHydration';
import { getRandomDialog, shouldShowCheckIn } from '../lib/fitoDialogs';
import { Calendar, Target, Home, User, TreePine, Flower2, Sun, Move, Sprout, MessageCircle } from 'lucide-react';

// Dynamically import Canvas component to avoid SSR issues
const IsometricGardenCanvas = dynamic(
  () => import('../components/Garden/IsometricGardenCanvasOptimized'),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-400 to-green-300">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <TreePine className="w-16 h-16 text-green-600" />
        </motion.div>
      </div>
    )
  }
);

const GardenPageImmersive = () => {
  const router = useRouter();
  const { user, fito, garden, missions, stats, appointment, chat, addPlant, updateStreak, toggleMovementMode, toggleChat } = useGameStore();
  const [showFitoMessage, setShowFitoMessage] = useState(true);
  const isHydrated = useHydration();
  
  // Generate greeting only once when component mounts
  const [fitoGreeting] = useState(() => {
    if (!isHydrated) return '';
    if (shouldShowCheckIn(fito?.lastInteraction)) {
      return getRandomDialog('checkIn', 'mood');
    }
    if (missions?.length > 0) {
      return getRandomDialog('missions', 'reminder');
    }
    if (stats?.streak?.current > 3) {
      return getRandomDialog('encouragement', 'streak', { days: stats.streak.current });
    }
    return getRandomDialog('encouragement', 'general');
  });

  useEffect(() => {
    if (isHydrated && !user?.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user?.onboardingCompleted, router, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    
    updateStreak();
    if (garden.plants.length === 0) {
      addPlant({ type: 'flower', growth: 30 });
    }
  }, [isHydrated]); // Only run once when hydrated

  // Memoized FitoChat component to prevent re-renders
  const MemoizedFitoChat = useMemo(() => {
    return memo(({ message }) => (
      <FitoChat 
        initialMessage={message}
        onMessageComplete={() => {}}
      />
    ));
  }, []);

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Isometric Garden Canvas */}
      <IsometricGardenCanvas />
      
      {/* Missions Panel */}
      <MissionsPanel />
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* Top Header Overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 p-4 z-20"
      >
        <div className="flex justify-between items-start">
          {/* Title and greeting */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <h1 className="text-2xl font-bold text-white">
              Tu Jardín de Bienestar
            </h1>
            <p className="text-white/90 text-sm">
              Hola, {user?.name || 'Amigo'} 👋
            </p>
          </motion.div>

          {/* Profile button only */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate('/profile')}
            className="bg-white/20 backdrop-blur-md text-white p-3 rounded-xl hover:bg-white/30 transition-all shadow-lg"
          >
            <User className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>

      {/* Garden Stats - Top Left Corner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-24 left-4 z-20"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TreePine className="w-5 h-5 text-green-400" />
            <span className="text-sm font-bold text-white">
              Nivel {garden.level}
            </span>
          </div>
          <div className="space-y-1 text-xs text-white/90">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>{garden.plants.length} plantas cultivadas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full" />
              <span>{stats?.missionsCompleted || 0} misiones</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span>{stats?.streak?.current || 0} días de racha</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mode Toggle & Fito Status - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-24 right-4 z-20 space-y-3"
      >
        {/* Fito Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              fito.mood === 'excited' ? 'bg-yellow-400' :
              fito.mood === 'happy' ? 'bg-green-400' :
              fito.mood === 'neutral' ? 'bg-blue-400' :
              fito.mood === 'worried' ? 'bg-orange-400' :
              'bg-gray-400'
            }`} />
            <span className="text-sm font-medium text-white">
              Fito: {
                fito.mood === 'excited' ? 'Emocionado' :
                fito.mood === 'happy' ? 'Feliz' :
                fito.mood === 'neutral' ? 'Neutral' :
                fito.mood === 'worried' ? 'Preocupado' :
                fito.mood === 'sad' ? 'Triste' : 'Feliz'
              }
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMovementMode}
          className={`flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-lg transition-all ${
            garden.isMovementMode 
              ? 'bg-blue-500/80 backdrop-blur-md text-white' 
              : 'bg-green-500/80 backdrop-blur-md text-white'
          }`}
        >
          {garden.isMovementMode ? (
            <>
              <Move className="w-5 h-5" />
              <span className="text-sm font-medium">Mover Fito</span>
            </>
          ) : (
            <>
              <Sprout className="w-5 h-5" />
              <span className="text-sm font-medium">Plantar</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Fito Floating Message - Bottom Right */}
      <AnimatePresence>
        {showFitoMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            className="absolute bottom-24 right-4 z-20 max-w-sm"
          >
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-3 relative">
              <button
                onClick={() => setShowFitoMessage(false)}
                className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <MemoizedFitoChat message={fitoGreeting} />
              
              {/* Chat Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleChat}
                className="mt-3 w-full bg-purple-500/80 backdrop-blur-md text-white px-4 py-2 rounded-xl hover:bg-purple-600/80 transition-all flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Hablar con Fito</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Instructions - Center Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="bg-black/20 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg">
          <p className="text-white/90 text-sm text-center">
            {garden.isMovementMode ? (
              <>
                <Move className="w-4 h-4 inline mr-1" />
                Haz click en un tile o usa ⬅️➡️⬆️⬇️ / WASD para mover a Fito
              </>
            ) : (
              <>
                <Sprout className="w-4 h-4 inline mr-1" />
                Haz click en un tile vacío para plantar
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* Floating Action Cards - Center Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="flex items-center gap-4">
          {/* Appointment Reminder Card */}
          {appointment && appointment.scheduled && (
            <AppointmentReminder />
          )}
          
          {/* Schedule New Appointment Button */}
          {(!appointment || !appointment.scheduled) && (
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/schedule')}
              className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg hover:bg-white/25 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-400/30 p-2 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Agendar</p>
                  <p className="text-white/80 text-xs">Próxima sesión</p>
                </div>
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/10 z-30"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <button 
              onClick={() => handleNavigate('/garden-immersive')}
              className="flex flex-col items-center space-y-1 text-white"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Jardín</span>
            </button>
            <button 
              onClick={() => handleNavigate('/missions')}
              className="flex flex-col items-center space-y-1 text-white/70 hover:text-white transition-colors"
            >
              <Target className="w-5 h-5" />
              <span className="text-xs font-medium">Misiones</span>
            </button>
            <button 
              onClick={() => handleNavigate('/schedule')}
              className="flex flex-col items-center space-y-1 text-white/70 hover:text-white transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Agendar</span>
            </button>
            <button 
              onClick={() => handleNavigate('/profile')}
              className="flex flex-col items-center space-y-1 text-white/70 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-medium">Perfil</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {chat.isOpen && <FitoChatWindow />}
      </AnimatePresence>
    </div>
  );
};

export default GardenPageImmersive;
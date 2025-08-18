import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import FitoChat from '../components/Fito/FitoChat';
import useGameStore from '../lib/gameStore';
import useHydration from '../hooks/useHydration';
import { getRandomDialog, shouldShowCheckIn } from '../lib/fitoDialogs';
import { Calendar, Target, Home, User, TreePine, Flower2, Sun } from 'lucide-react';

// Dynamically import Canvas component to avoid SSR issues
const IsometricGardenCanvas = dynamic(
  () => import('../components/Garden/IsometricGardenCanvas'),
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
  const { user, fito, garden, missions, stats, addPlant, updateStreak } = useGameStore();
  const [showFitoMessage, setShowFitoMessage] = useState(true);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated && !user?.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user?.onboardingCompleted, router, isHydrated]);

  useEffect(() => {
    updateStreak();
    if (garden.plants.length === 0) {
      addPlant({ type: 'flower', growth: 30 });
    }
  }, []);

  const getFitoGreeting = () => {
    if (shouldShowCheckIn(fito.lastInteraction)) {
      return getRandomDialog('checkIn', 'mood');
    }
    if (missions.length > 0) {
      return getRandomDialog('missions', 'reminder');
    }
    if (stats?.streak?.current > 3) {
      return getRandomDialog('encouragement', 'streak', { days: stats.streak.current });
    }
    return getRandomDialog('encouragement', 'general');
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Isometric Garden Canvas */}
      <IsometricGardenCanvas />
      
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

          {/* Action buttons */}
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/missions')}
              className="bg-white/20 backdrop-blur-md text-white p-3 rounded-xl hover:bg-white/30 transition-all relative shadow-lg"
            >
              <Target className="w-6 h-6" />
              {missions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {missions.length}
                </span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/profile')}
              className="bg-white/20 backdrop-blur-md text-white p-3 rounded-xl hover:bg-white/30 transition-all shadow-lg"
            >
              <User className="w-6 h-6" />
            </motion.button>
          </div>
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
              <FitoChat 
                initialMessage={getFitoGreeting()}
                onMessageComplete={() => {}}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Cards - Center Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate('/missions')}
            className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg hover:bg-white/25 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-400/30 p-2 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Misiones</p>
                <p className="text-white/80 text-xs">
                  {missions.length > 0 ? `${missions.length} pendientes` : 'Ver todas'}
                </p>
              </div>
            </div>
          </motion.button>

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
    </div>
  );
};

export default GardenPageImmersive;
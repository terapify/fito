import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import GardenView from '../components/Garden/GardenView';
import FitoChat from '../components/Fito/FitoChat';
import useGameStore from '../lib/gameStore';
import useHydration from '../hooks/useHydration';
import { getRandomDialog, shouldShowCheckIn } from '../lib/fitoDialogs';
import { Calendar, Target, Home, User } from 'lucide-react';

const GardenPage = () => {
  const router = useRouter();
  const { user, fito, garden, missions, stats, addPlant, growPlant, updateStreak } = useGameStore();
  const [showFitoMessage, setShowFitoMessage] = useState(true);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated && !user?.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user?.onboardingCompleted, router, isHydrated]);

  useEffect(() => {
    // Update streak when user visits
    updateStreak();
    
    // Add a plant if it's the first visit
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
    <div className="min-h-screen gradient-bg pb-24">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">
              Tu Jardín de Bienestar
            </h1>
            <p className="text-white/80 mt-1">
              Hola, {user?.name || 'Amigo'} 👋
            </p>
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/missions')}
              className="bg-white/20 backdrop-blur text-white p-3 rounded-xl hover:bg-white/30 transition-colors relative"
            >
              <Target className="w-6 h-6" />
              {missions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {missions.length}
                </span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigate('/profile')}
              className="bg-white/20 backdrop-blur text-white p-3 rounded-xl hover:bg-white/30 transition-colors"
            >
              <User className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Fito Message */}
        {showFitoMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex justify-center"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-4 max-w-md w-full relative">
              <button
                onClick={() => setShowFitoMessage(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <FitoChat 
                initialMessage={getFitoGreeting()}
                onMessageComplete={() => {
                  // No ocultar el mensaje automáticamente
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Garden */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GardenView />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-2 gap-4 max-w-5xl mx-auto"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigate('/missions')}
            className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Misiones</h3>
                <p className="text-sm text-gray-600">
                  {missions.length > 0 ? `${missions.length} pendientes` : 'Sin misiones'}
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigate('/schedule')}
            className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Agendar sesión</h3>
                <p className="text-sm text-gray-600">Programa tu próxima cita</p>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-white/20"
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-around py-4">
              <button 
                onClick={() => handleNavigate('/garden')}
                className="flex flex-col items-center space-y-1 text-purple-600"
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Jardín</span>
              </button>
              <button 
                onClick={() => handleNavigate('/missions')}
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Target className="w-6 h-6" />
                <span className="text-xs font-medium">Misiones</span>
              </button>
              <button 
                onClick={() => handleNavigate('/schedule')}
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Calendar className="w-6 h-6" />
                <span className="text-xs font-medium">Agendar</span>
              </button>
              <button 
                onClick={() => handleNavigate('/profile')}
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <User className="w-6 h-6" />
                <span className="text-xs font-medium">Perfil</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GardenPage;
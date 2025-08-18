import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import MissionCard from '../components/Missions/MissionCard';
import FitoAvatar from '../components/Fito/FitoAvatar';
import useGameStore from '../lib/gameStore';
import useHydration from '../hooks/useHydration';
import { getRandomDialog } from '../lib/fitoDialogs';
import { ArrowLeft, Plus, Trophy, Target, Calendar, Home, User } from 'lucide-react';

const MissionsPage = () => {
  const router = useRouter();
  const { user, missions, completedMissions, stats, addMission } = useGameStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated && !user?.onboardingCompleted) {
      router.push('/onboarding');
      return;
    }

    // Add sample missions if none exist
    if (missions.length === 0) {
      const sampleMissions = [
        {
          title: 'Diario de gratitud',
          description: 'Escribe 3 cosas por las que estés agradecido hoy',
          type: 'daily',
          points: 10,
          difficulty: 'easy'
        },
        {
          title: 'Ejercicio de respiración',
          description: 'Practica respiración profunda por 5 minutos',
          type: 'daily',
          points: 15,
          difficulty: 'easy'
        },
        {
          title: 'Reflexión semanal',
          description: 'Reflexiona sobre los aprendizajes de tu última sesión de terapia',
          type: 'therapy',
          points: 25,
          difficulty: 'medium'
        }
      ];
      
      sampleMissions.forEach(mission => addMission(mission));
    }
  }, [user?.onboardingCompleted, missions.length, isHydrated]);

  const handleNavigate = (path) => {
    router.push(path);
  };

  const getFitoMood = () => {
    if (missions.length === 0) return 'happy';
    if (missions.length > 5) return 'worried';
    if (completedMissions.length > missions.length) return 'excited';
    return 'neutral';
  };

  const getEmptyStateMessage = () => {
    return '¡Felicidades! Has completado todas tus misiones. Tu jardín está floreciendo gracias a tu dedicación.';
  };

  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleNavigate('/garden')}
              className="bg-white/20 backdrop-blur text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Misiones</h1>
              <p className="text-white/80 mt-1">Tu camino al bienestar</p>
            </div>
          </div>
          <FitoAvatar mood={getFitoMood()} size="small" />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white/90 backdrop-blur rounded-xl p-4 text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{missions.length}</p>
            <p className="text-xs text-gray-600">Pendientes</p>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{completedMissions.length}</p>
            <p className="text-xs text-gray-600">Completadas</p>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-xl p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats?.streak?.current || 0}</p>
            <p className="text-xs text-gray-600">Días de racha</p>
          </div>
        </motion.div>

        {/* Missions List */}
        <AnimatePresence mode="wait">
          {missions.length > 0 ? (
            <motion.div
              key="missions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {missions.map((mission, index) => (
                <MissionCard key={mission.id} mission={mission} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/90 backdrop-blur rounded-3xl p-8 text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                ¡Todo completado!
              </h3>
              <p className="text-gray-600">
                {getEmptyStateMessage()}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigate('/garden')}
                className="mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold"
              >
                Ver mi jardín
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Mission Button (for demo) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            addMission({
              title: 'Nueva misión',
              description: 'Una nueva tarea para tu bienestar',
              type: 'daily',
              points: 10,
              difficulty: 'easy'
            });
          }}
          className="fixed bottom-24 right-4 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

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
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Jardín</span>
            </button>
            <button 
              onClick={() => handleNavigate('/missions')}
              className="flex flex-col items-center space-y-1 text-purple-600"
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
  );
};

export default MissionsPage;
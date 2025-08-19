import { useState, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronLeft, ChevronRight, Clock, Star, CheckCircle, Trophy } from 'lucide-react';
import useGameStore from '../../lib/gameStore';
import confetti from 'canvas-confetti';

const MissionsPanel = memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localMissions, setLocalMissions] = useState([]);
  const { missions, completeMission, addPlant, growPlant, addFitoExperience, stats, updateFitoMood } = useGameStore();
  
  // Sync local missions with store missions
  useEffect(() => {
    // console.log('📋 Missions updated in panel:', missions.length);
    setLocalMissions([...missions]);
  }, [missions]);

  const handleCompleteMission = (missionId, points) => {
    // console.log('✅ Completing mission:', missionId);
    
    // Immediately update local state for instant feedback
    setLocalMissions(prev => prev.filter(m => m.id !== missionId));
    
    // Complete mission in store
    completeMission(missionId);
    
    // Add rewards
    addFitoExperience(points || 10);
    
    // Grow existing plants or add new one
    const store = useGameStore.getState();
    if (store.garden.plants.length > 0) {
      const randomPlant = store.garden.plants[Math.floor(Math.random() * store.garden.plants.length)];
      growPlant(randomPlant.id, 20);
    } else {
      addPlant({ type: 'flower', growth: 50 });
    }
    
    // Update Fito's mood after completing mission
    setTimeout(() => {
      updateFitoMood();
    }, 100);
    
    // Celebration effect
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { x: 0.1, y: 0.6 }
    });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'daily':
        return <Clock className="w-4 h-4" />;
      case 'therapy':
        return <Target className="w-4 h-4" />;
      case 'challenge':
        return <Star className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'daily':
        return 'from-blue-400 to-blue-500';
      case 'therapy':
        return 'from-purple-400 to-purple-500';
      case 'challenge':
        return 'from-yellow-400 to-yellow-500';
      default:
        return 'from-green-400 to-green-500';
    }
  };

  return (
    <>
      {/* Collapsed Panel Button */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            whileHover={{ x: 5 }}
            onClick={() => setIsExpanded(true)}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 backdrop-blur-lg rounded-r-2xl p-4 shadow-lg hover:bg-white/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Target className="w-6 h-6 text-white" />
                {localMissions.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {localMissions.length}
                  </span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-80 z-30 bg-white/10 backdrop-blur-xl shadow-2xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 border-b border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Target className="w-6 h-6" />
                    <span>Misiones</span>
                  </h2>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-white/90">
                    <Trophy className="w-4 h-4" />
                    <span>{stats?.missionsCompleted || 0} completadas</span>
                  </div>
                  <div className="flex items-center space-x-1 text-white/90">
                    <Star className="w-4 h-4" />
                    <span>{stats?.totalPoints || 0} pts</span>
                  </div>
                </div>
              </div>

              {/* Missions List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {localMissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                    <p className="text-white/80 text-sm">
                      ¡Todas las misiones completadas!
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      Tu jardín está floreciendo
                    </p>
                  </div>
                ) : (
                  localMissions.map((mission, index) => (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/15 transition-colors"
                    >
                      {/* Mission Type Badge */}
                      <div className="flex items-start justify-between mb-2">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${getTypeColor(mission.type)} text-white text-xs`}>
                          {getTypeIcon(mission.type)}
                          <span className="capitalize">{mission.type || 'Misión'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-white/70 text-xs">
                          <Star className="w-3 h-3" />
                          <span>{mission.points || 10}</span>
                        </div>
                      </div>

                      {/* Mission Content */}
                      <h3 className="text-white font-medium text-sm mb-1">
                        {mission.title}
                      </h3>
                      <p className="text-white/70 text-xs mb-3 line-clamp-2">
                        {mission.description}
                      </p>

                      {/* Complete Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCompleteMission(mission.id, mission.points)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs py-2 px-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
                      >
                        Completar
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {localMissions.length > 0 && (
                <div className="p-4 border-t border-white/20">
                  <div className="text-center text-white/70 text-xs">
                    {localMissions.length} {localMissions.length === 1 ? 'misión pendiente' : 'misiones pendientes'}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/20 z-25 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
});

MissionsPanel.displayName = 'MissionsPanel';

export default MissionsPanel;
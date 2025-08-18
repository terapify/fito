import { motion } from 'framer-motion';
import { CheckCircle, Clock, Star, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import useGameStore from '../../lib/gameStore';

const MissionCard = ({ mission, index }) => {
  const { completeMission, addPlant, growPlant, addFitoExperience } = useGameStore();

  const handleComplete = () => {
    // Complete mission
    completeMission(mission.id);
    
    // Add rewards
    addFitoExperience(mission.points || 10);
    
    // Grow existing plants or add new one
    const store = useGameStore.getState();
    if (store.garden.plants.length > 0) {
      const randomPlant = store.garden.plants[Math.floor(Math.random() * store.garden.plants.length)];
      growPlant(randomPlant.id, 20);
    } else {
      addPlant({ type: 'flower', growth: 50 });
    }
    
    // Celebration effect
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'daily':
        return <Clock className="w-5 h-5" />;
      case 'therapy':
        return <Target className="w-5 h-5" />;
      case 'challenge':
        return <Star className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'daily':
        return 'bg-blue-100 text-blue-600';
      case 'therapy':
        return 'bg-purple-100 text-purple-600';
      case 'challenge':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-green-100 text-green-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-12 -mt-12 opacity-50" />
      
      <div className="relative">
        {/* Mission type badge */}
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getTypeColor(mission.type)} mb-3`}>
          {getTypeIcon(mission.type)}
          <span className="text-sm font-medium capitalize">{mission.type || 'Misión'}</span>
        </div>

        {/* Mission content */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {mission.title}
        </h3>
        <p className="text-gray-600 mb-4">
          {mission.description}
        </p>

        {/* Mission rewards */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">{mission.points || 10} pts</span>
            </div>
            {mission.difficulty && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                mission.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                mission.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {mission.difficulty === 'easy' ? 'Fácil' :
                 mission.difficulty === 'medium' ? 'Medio' : 'Difícil'}
              </span>
            )}
          </div>
        </div>

        {/* Action button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-shadow"
        >
          Completar misión
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MissionCard;
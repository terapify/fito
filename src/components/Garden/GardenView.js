import { motion } from 'framer-motion';
import { Flower2, TreePine, Leaf, Cloud, Sun } from 'lucide-react';
import useGameStore from '../../lib/gameStore';

const GardenView = () => {
  const { garden, stats } = useGameStore();

  const getPlantIcon = (plantType, growth) => {
    const size = Math.min(24 + (growth / 10), 64);
    const opacity = Math.max(0.5, growth / 100);

    switch(plantType) {
      case 'flower':
        return <Flower2 size={size} style={{ opacity }} className="text-pink-500" />;
      case 'tree':
        return <TreePine size={size} style={{ opacity }} className="text-green-600" />;
      default:
        return <Leaf size={size} style={{ opacity }} className="text-green-500" />;
    }
  };

  const getGardenBackground = () => {
    const level = garden.level;
    if (level >= 5) return 'from-green-300 via-blue-300 to-purple-300';
    if (level >= 3) return 'from-green-200 via-blue-200 to-indigo-200';
    return 'from-green-100 via-blue-100 to-indigo-100';
  };

  const generatePlantPositions = (plants) => {
    return plants.map((plant, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      return {
        ...plant,
        x: 20 + col * 25,
        y: 60 - row * 20,
      };
    });
  };

  const plantsWithPositions = generatePlantPositions(garden.plants);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-b from-sky-200 to-green-100 rounded-3xl overflow-hidden shadow-2xl aspect-[16/10] min-h-[400px] max-h-[500px]"
      >
        {/* Sky */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-blue-400 to-blue-200">
          {/* Sun */}
          <motion.div
            className="absolute top-8 right-8"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Sun className="w-16 h-16 text-yellow-400" fill="currentColor" />
          </motion.div>

          {/* Clouds */}
          <motion.div
            className="absolute top-12 left-12"
            animate={{
              x: [0, 30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Cloud className="w-12 h-12 text-white opacity-80" fill="currentColor" />
          </motion.div>
          <motion.div
            className="absolute top-20 left-1/2"
            animate={{
              x: [0, -20, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Cloud className="w-10 h-10 text-white opacity-60" fill="currentColor" />
          </motion.div>
        </div>

        {/* Ground */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-green-400 to-green-300">
          {/* Grass texture */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-green-600"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 50}%`,
                  width: '2px',
                  height: `${10 + Math.random() * 10}px`,
                  transform: `rotate(${-10 + Math.random() * 20}deg)`,
                }}
              />
            ))}
          </div>

          {/* Plants */}
          {plantsWithPositions.map((plant, index) => (
            <motion.div
              key={plant.id}
              initial={{ scale: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                y: 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: index * 0.1,
              }}
              className="absolute"
              style={{
                left: `${plant.x}%`,
                bottom: `${plant.y}px`,
              }}
            >
              <motion.div
                animate={{
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 3 + index,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {getPlantIcon(plant.type || 'leaf', plant.growth || 50)}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Garden Stats Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-xl px-5 py-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <Leaf className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-gray-700">
              Nivel {garden.level}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {garden.totalPlants} plantas cultivadas
          </div>
        </div>

        {/* Achievement notification area */}
        {stats?.missionsCompleted > 0 && stats?.missionsCompleted % 5 === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 bg-yellow-100 border-2 border-yellow-400 rounded-xl px-4 py-2 shadow-lg"
          >
            <p className="text-sm font-semibold text-yellow-800">
              ¡Jardín Floreciente!
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Garden Info */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/90 backdrop-blur rounded-xl p-5 text-center shadow-lg"
        >
          <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{garden.plants.length}</p>
          <p className="text-sm text-gray-600">Plantas activas</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/90 backdrop-blur rounded-xl p-5 text-center shadow-lg"
        >
          <Flower2 className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats?.missionsCompleted || 0}</p>
          <p className="text-sm text-gray-600">Misiones completadas</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/90 backdrop-blur rounded-xl p-5 text-center shadow-lg"
        >
          <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats?.streak?.current || 0}</p>
          <p className="text-sm text-gray-600">Días de racha</p>
        </motion.div>
      </div>
    </div>
  );
};

export default GardenView;
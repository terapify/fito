import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const ProgressBar = ({ currentStep, totalSteps, stepLabels = [] }) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const defaultLabels = ['Bienvenida', 'Objetivos', 'Completado'];
  const labels = stepLabels.length > 0 ? stepLabels : defaultLabels;

  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative mb-6">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </motion.div>
        </div>
        
        {/* Step dots */}
        <div className="absolute -top-1 left-0 w-full flex justify-between">
          {Array.from({ length: totalSteps }, (_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                index <= currentStep
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-white shadow-lg'
                  : 'bg-white/20 border-white/40 backdrop-blur-sm'
              }`}
            >
              {index < currentStep && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Check className="w-2 h-2 text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between px-2">
        {labels.slice(0, totalSteps).map((label, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className={`text-sm font-medium transition-colors ${
              index <= currentStep
                ? 'text-white'
                : 'text-white/60'
            }`}
          >
            {label}
          </motion.div>
        ))}
      </div>

      {/* Current step indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-4"
      >
        <span className="text-white/80 text-sm">
          Paso {currentStep + 1} de {totalSteps}
        </span>
      </motion.div>
    </div>
  );
};

export default ProgressBar;
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import FitoChat from '../components/Fito/FitoChat';
import ProgressBar from '../components/Onboarding/ProgressBar';
import useGameStore from '../lib/gameStore';
import useHydration from '../hooks/useHydration';
import { getRandomDialog } from '../lib/fitoDialogs';
import confetti from 'canvas-confetti';
import { Heart, Brain, Users, Sparkles, ArrowRight, User, Target, CheckCircle } from 'lucide-react';

const OnboardingPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isHydrated = useHydration();
  
  const { setUserName: storeSetUserName, setUserGoals, completeOnboarding, user } = useGameStore();

  useEffect(() => {
    if (isHydrated && user?.onboardingCompleted) {
      router.push('/garden-immersive');
    }
  }, [user?.onboardingCompleted, router, isHydrated]);

  const goals = [
    { 
      id: 'anxiety', 
      label: 'Manejar mi ansiedad', 
      description: 'Técnicas para reducir la ansiedad y el estrés diario',
      icon: Brain, 
      gradient: 'from-blue-500 to-cyan-500' 
    },
    { 
      id: 'relationships', 
      label: 'Mejorar mis relaciones', 
      description: 'Desarrollar habilidades sociales y comunicación',
      icon: Users, 
      gradient: 'from-pink-500 to-rose-500' 
    },
    { 
      id: 'selfEsteem', 
      label: 'Fortalecer mi autoestima', 
      description: 'Construir confianza y amor propio',
      icon: Heart, 
      gradient: 'from-red-500 to-pink-500' 
    },
    { 
      id: 'wellness', 
      label: 'Bienestar general', 
      description: 'Equilibrio mental, físico y emocional',
      icon: Sparkles, 
      gradient: 'from-purple-500 to-indigo-500' 
    },
  ];

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      storeSetUserName(userName);
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(1);
        setIsTransitioning(false);
      }, 500);
    }
  };

  const handleGoalToggle = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleGoalsSubmit = () => {
    if (selectedGoals.length > 0) {
      setUserGoals(selectedGoals);
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(2);
        setIsTransitioning(false);
      }, 500);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      router.push('/garden-immersive');
    }, 2000);
  };

  // Memoize step message to avoid re-rendering FitoChat on every state change
  const stepMessage = useMemo(() => {
    switch(step) {
      case 0:
        return getRandomDialog('onboarding', 'welcome'); // No name needed yet
      case 1:
        const goalQuestion = getRandomDialog('onboarding', 'askGoals');
        // Use user.name from store (stable, only changes when step changes)
        return user?.name && user.name !== 'undefined' 
          ? `¡Mucho gusto, ${user.name}! ${goalQuestion}` 
          : goalQuestion;
      case 2:
        return getRandomDialog('onboarding', 'complete'); // Uses stored user.name if needed
      default:
        return '';
    }
  }, [step, user?.name]); // Only depends on step and stored user.name

  // Memoize callback to prevent FitoChat typing effect from restarting
  const handleMessageComplete = useCallback(() => {}, []);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl relative z-10"
      >
        {/* Main container with glassmorphism */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with progress */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-8 border-b border-white/10">
            <ProgressBar currentStep={step} totalSteps={3} />
            
            {/* Fito Chat */}
            <div className="flex justify-center">
              <FitoChat 
                initialMessage={stepMessage}
                stepId={`onboarding-step-${step}`}
                onMessageComplete={handleMessageComplete}
              />
            </div>
          </div>

          {/* Content area */}
          <div className="p-10">
            <AnimatePresence mode="wait">
              {!isTransitioning && (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Step 0: Name Input */}
                  {step === 0 && (
                    <div className="space-y-8">
                      <form onSubmit={handleNameSubmit} className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <label className="block text-white text-lg mb-3 font-medium">
                            ¿Cómo te llamas?
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-purple-400 focus:outline-none text-lg text-white placeholder-white/50 transition-all backdrop-blur-sm"
                              placeholder="Escribe tu nombre aquí..."
                              autoFocus
                            />
                          </div>
                        </motion.div>
                        
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          type="submit"
                          disabled={!userName.trim()}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          Continuar
                          <ArrowRight className="inline-block ml-2 w-5 h-5" />
                        </motion.button>
                      </form>
                    </div>
                  )}

                  {/* Step 1: Goals Selection */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goals.map((goal, index) => {
                          const Icon = goal.icon;
                          const isSelected = selectedGoals.includes(goal.id);
                          return (
                            <motion.button
                              key={goal.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + index * 0.05 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleGoalToggle(goal.id)}
                              className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-purple-400 bg-white/20 shadow-xl'
                                  : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                              }`}
                            >
                              <div className={`bg-gradient-to-r ${goal.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-white font-semibold text-base mb-1">
                                {goal.label}
                              </h3>
                              <p className="text-white/70 text-xs leading-relaxed">
                                {goal.description}
                              </p>
                              
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="absolute top-2 right-2"
                                >
                                  <CheckCircle className="w-5 h-5 text-purple-400" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={handleGoalsSubmit}
                        disabled={selectedGoals.length === 0}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Continuar ({selectedGoals.length} objetivo{selectedGoals.length !== 1 ? 's' : ''} seleccionado{selectedGoals.length !== 1 ? 's' : ''})
                        <ArrowRight className="inline-block ml-2 w-5 h-5" />
                      </motion.button>
                    </div>
                  )}

                  {/* Step 2: Completion */}
                  {step === 2 && (
                    <div className="space-y-8 text-center">
                      {/* Success Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                        className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl"
                      >
                        <CheckCircle className="w-12 h-12 text-white" />
                      </motion.div>

                      {/* Summary of selected goals */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                      >
                        <p className="text-white/80 text-sm font-medium">
                          Trabajaremos en estos objetivos:
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                          {selectedGoals.map((goalId) => {
                            const goal = goals.find(g => g.id === goalId);
                            const Icon = goal.icon;
                            return (
                              <motion.div
                                key={goalId}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4 + selectedGoals.indexOf(goalId) * 0.1 }}
                                className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center space-x-2 border border-white/20"
                              >
                                <div className={`bg-gradient-to-r ${goal.gradient} w-6 h-6 rounded-lg flex items-center justify-center`}>
                                  <Icon className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-white text-xs font-medium">
                                  {goal.label}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>

                      {/* Call to action */}
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleComplete}
                        className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-10 rounded-2xl text-lg font-semibold hover:shadow-xl transition-all"
                      >
                        Comenzar mi viaje 🌱
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
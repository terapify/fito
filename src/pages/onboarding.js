import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import FitoChat from '../components/Fito/FitoChat';
import useGameStore from '../lib/gameStore';
import useHydration from '../hooks/useHydration';
import { getRandomDialog } from '../lib/fitoDialogs';
import confetti from 'canvas-confetti';
import { Heart, Brain, Users, Sparkles, ArrowRight } from 'lucide-react';

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
      router.push('/garden');
    }
  }, [user?.onboardingCompleted, router, isHydrated]);

  const goals = [
    { id: 'anxiety', label: 'Manejar mi ansiedad', icon: Brain, color: 'bg-blue-500' },
    { id: 'relationships', label: 'Mejorar mis relaciones', icon: Users, color: 'bg-pink-500' },
    { id: 'selfEsteem', label: 'Fortalecer mi autoestima', icon: Heart, color: 'bg-red-500' },
    { id: 'wellness', label: 'Bienestar general', icon: Sparkles, color: 'bg-purple-500' },
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
      router.push('/garden');
    }, 2000);
  };

  const getStepMessage = () => {
    switch(step) {
      case 0:
        return getRandomDialog('onboarding', 'welcome');
      case 1:
        const goalQuestion = getRandomDialog('onboarding', 'askGoals');
        return userName && userName !== 'undefined' 
          ? `¡Mucho gusto, ${userName}! ${goalQuestion}` 
          : goalQuestion;
      case 2:
        return getRandomDialog('onboarding', 'complete');
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10">
          <div className="mb-8">
            <FitoChat 
              initialMessage={getStepMessage()}
              onMessageComplete={() => {}}
            />
          </div>

          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <form onSubmit={handleNameSubmit} className="space-y-8">
                    <div>
                      <label className="block text-gray-700 text-lg mb-3 font-medium">
                        ¿Cómo te llamas?
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-lg transition-colors"
                        placeholder="Tu nombre..."
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!userName.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                      <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </button>
                  </form>
                )}

                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <p className="text-gray-700 text-lg mb-6 font-medium">
                        Selecciona uno o más objetivos:
                      </p>
                      <div className="grid grid-cols-2 gap-6">
                        {goals.map((goal) => {
                          const Icon = goal.icon;
                          const isSelected = selectedGoals.includes(goal.id);
                          return (
                            <motion.button
                              key={goal.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleGoalToggle(goal.id)}
                              className={`p-6 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className={`${goal.color} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3`}>
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                              <p className="text-sm font-medium text-gray-700">
                                {goal.label}
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={handleGoalsSubmit}
                      disabled={selectedGoals.length === 0}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                      <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Sparkles className="w-12 h-12 text-white" />
                    </motion.div>
                    <p className="text-gray-700 text-lg">
                      ¡Todo listo, {userName}! Tu jardín de bienestar te está esperando.
                    </p>
                    <button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-8 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      Comenzar mi viaje
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
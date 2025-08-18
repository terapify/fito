import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import FitoAvatar from '../components/Fito/FitoAvatar';
import useGameStore from '../lib/gameStore';
import useHydration from '../hooks/useHydration';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user } = useGameStore();
  const isHydrated = useHydration();

  useEffect(() => {
    // Redirect if user has already completed onboarding
    if (isHydrated && user?.onboardingCompleted) {
      router.push('/garden');
    }
  }, [user?.onboardingCompleted, router, isHydrated]);

  const handleStart = () => {
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--linear-gradient)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Logo and Fito */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
          className="mb-8 flex justify-center"
        >
          <FitoAvatar mood="happy" size="medium" />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 shadow-2xl"
        >
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Bienvenido a Fito
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Tu compañero de bienestar emocional
          </p>
          <p className="text-gray-600 mb-8">
            Juntos cultivaremos tu jardín de bienestar, paso a paso, misión tras misión.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-xl p-6 card-shadow"
              style={{ backgroundColor: 'var(--light-blue-background)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--primary-light)' }}>
                <Sparkles className="w-6 h-6" style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Jardín Personal</h3>
              <p className="text-sm text-gray-600">
                Cultiva plantas que crecen con tu progreso
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-xl p-6 card-shadow"
              style={{ backgroundColor: 'var(--pink)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bubble-pink-20)' }}>
                <Sparkles className="w-6 h-6" style={{ color: 'var(--bubble-pink)' }} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Misiones Diarias</h3>
              <p className="text-sm text-gray-600">
                Actividades diseñadas para tu bienestar
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-xl p-6 card-shadow"
              style={{ backgroundColor: 'var(--sky-blue)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--primary-10)' }}>
                <Sparkles className="w-6 h-6" style={{ color: 'var(--turquoise-dark)' }} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Acompañamiento</h3>
              <p className="text-sm text-gray-600">
                Fito estará contigo entre cada sesión
              </p>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="text-white py-4 px-8 rounded-2xl text-lg font-semibold transform transition-all inline-flex items-center space-x-2 button-shadow-hover"
            style={{ background: 'var(--button-gradient)' }}
          >
            <span>Comenzar mi viaje</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="text-xs text-gray-500 mt-6">
            Tu información es privada y segura
          </p>
        </motion.div>

        {/* Floating decorations */}
        <motion.div
          className="absolute top-10 left-10 text-purple-300 opacity-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles size={40} />
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-10 text-pink-300 opacity-20"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles size={40} />
        </motion.div>

        <motion.div
          className="absolute top-1/2 right-20 text-blue-300 opacity-20"
          animate={{
            x: [0, 20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles size={30} />
        </motion.div>
      </motion.div>
    </div>
  );
}

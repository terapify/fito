import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import FitoAvatar from '../components/Fito/FitoAvatar';
import useGameStore from '../lib/gameStore';
import useHydration from '../hooks/useHydration';
import { Sparkles, ArrowRight, Heart, Target, Users } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user } = useGameStore();
  const isHydrated = useHydration();

  useEffect(() => {
    // Redirect if user has already completed onboarding
    if (isHydrated && user?.onboardingCompleted) {
      router.push('/garden-immersive');
    }
  }, [user?.onboardingCompleted, router, isHydrated]);

  const handleStart = () => {
    router.push('/onboarding');
  };

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
        className="w-full max-w-3xl relative z-10"
      >
        {/* Main glassmorphism container */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Fito */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 border-b border-white/10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.2 
              }}
              className="mb-4 flex justify-center"
            >
              <FitoAvatar mood="excited" size="medium" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2"
            >
              ¡Hola! Soy Fito 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-white/90 mb-2"
            >
              Tu compañero de bienestar emocional
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white/80 leading-relaxed text-sm"
            >
              Juntos cultivaremos tu jardín de bienestar personal, donde cada paso que tomes hará crecer algo hermoso. 🌱
            </motion.p>
          </div>

          {/* Content area */}
          <div className="p-10">
            {/* Features grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-center hover:bg-white/20 transition-all"
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Jardín Personal</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Cultiva plantas que crecen con tu progreso y reflejan tu bienestar
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-center hover:bg-white/20 transition-all"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Misiones Personalizadas</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Actividades diseñadas por tu terapeuta para tu crecimiento personal
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-center hover:bg-white/20 transition-all"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Acompañamiento 24/7</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Estoy aquí para apoyarte entre sesiones y celebrar tus logros
                </p>
              </motion.div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-10 rounded-2xl text-lg font-semibold hover:shadow-xl transition-all inline-flex items-center space-x-2"
              >
                <span>Comenzar mi viaje de bienestar</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-white/60 text-sm mt-6"
              >
                🔒 Tu información es completamente privada y segura
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-10 left-10 text-purple-300/30"
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
          className="absolute bottom-10 right-10 text-pink-300/30"
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
          <Heart size={35} />
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-20 text-blue-300/30"
          animate={{
            x: [0, 15, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Target size={30} />
        </motion.div>
      </motion.div>
    </div>
  );
}

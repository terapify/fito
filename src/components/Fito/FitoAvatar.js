import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const FitoAvatar = ({ mood = 'happy', size = 'medium', isAnimating = true, isTyping = false }) => {
  const [currentExpression, setCurrentExpression] = useState(mood);

  // Tamaños del avatar
  const sizes = {
    small: { width: 60, height: 51, scale: 1 },
    medium: { width: 120, height: 102, scale: 2 },
    large: { width: 180, height: 153, scale: 3 },
  };

  const currentSize = sizes[size];

  // Colores según el estado de ánimo
  const moodColors = {
    happy: '#0085FF',
    excited: '#5AD3FB',
    neutral: '#3385FA',
    sad: '#6B7280',
    worried: '#FD8987',
  };

  // Expresiones de ojos según el mood
  const eyeExpressions = {
    happy: {
      leftEye: { cx: 21.35, cy: 19.96, rx: 3, ry: 4.2 },
      rightEye: { cx: 40.81, cy: 19.96, rx: 3, ry: 4.2 },
    },
    excited: {
      leftEye: { cx: 21.35, cy: 19.96, rx: 3.5, ry: 5 },
      rightEye: { cx: 40.81, cy: 19.96, rx: 3.5, ry: 5 },
    },
    neutral: {
      leftEye: { cx: 21.35, cy: 19.96, rx: 2.5, ry: 3 },
      rightEye: { cx: 40.81, cy: 19.96, rx: 2.5, ry: 3 },
    },
    sad: {
      leftEye: { cx: 21.35, cy: 21, rx: 2.5, ry: 3.5 },
      rightEye: { cx: 40.81, cy: 21, rx: 2.5, ry: 3.5 },
    },
    worried: {
      leftEye: { cx: 21.35, cy: 19, rx: 2.8, ry: 3.8 },
      rightEye: { cx: 40.81, cy: 19, rx: 2.8, ry: 3.8 },
    },
  };

  // Expresiones de boca según el mood
  const mouthPaths = {
    happy: "M39.4932 34.5435C39.48 34.6601 39.4593 34.7763 39.4312 34.8902C39.114 36.0281 38.5216 37.0698 37.7061 37.9244C36.8905 38.779 35.8767 39.4196 34.7549 39.7896C33.0007 40.3642 31.1091 40.3642 29.355 39.7896C28.233 39.4197 27.2195 38.779 26.4038 37.9244C25.5881 37.0698 24.9955 36.0282 24.6782 34.8902C24.6433 34.7779 24.6228 34.661 24.6172 34.5435C24.6012 34.2745 24.954 34.1063 25.354 34.3433C27.4074 35.4593 29.7177 36.0176 32.0542 35.9624H32.062C34.3947 36.018 36.701 35.4595 38.75 34.3433C39.155 34.1053 39.5082 34.2745 39.4932 34.5435Z",
    excited: "M38.5 33C38.5 33 37.5 39 32 39C26.5 39 25.5 33 25.5 33C25.5 33 28 36.5 32 36.5C36 36.5 38.5 33 38.5 33Z",
    neutral: "M26 35 L38 35",
    sad: "M26 37C26 37 28 34 32 34C36 34 38 37 38 37",
    worried: "M28 35.5C28 35.5 30 34.5 32 34.5C34 34.5 36 35.5 36 35.5",
  };

  useEffect(() => {
    setCurrentExpression(mood);
  }, [mood]);

  // Animación de flotación
  const bounceAnimation = {
    y: isAnimating ? [0, -8, 0] : 0,
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  // Animación de parpadeo
  const blinkAnimation = {
    scaleY: [1, 0.1, 1],
    transition: {
      duration: 0.15,
      repeat: Infinity,
      repeatDelay: 3,
      times: [0, 0.5, 1],
    },
  };

  // Animación de respiración
  const breathAnimation = {
    scale: isAnimating ? [1, 1.03, 1] : 1,
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  // Animación para cuando está escribiendo
  const typingAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  // Animación de emoción (excited)
  const excitedAnimation = {
    rotate: currentExpression === 'excited' ? [-2, 2, -2] : 0,
    transition: {
      duration: 0.3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <div 
      className="relative inline-block"
      style={{ width: currentSize.width, height: currentSize.height }}
    >
      <motion.div
        animate={[bounceAnimation, breathAnimation]}
        className="w-full h-full"
      >
        <motion.div
          animate={currentExpression === 'excited' ? excitedAnimation : {}}
          className="w-full h-full"
        >
          <motion.div
            animate={isTyping ? typingAnimation : {}}
            className="w-full h-full"
          >
            <svg
              width={currentSize.width}
              height={currentSize.height}
              viewBox="0 0 60 51"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
            >
              {/* Cuerpo principal de la burbuja */}
              <motion.path
                d="M0 50.3238C3.486 50.6078 9.16923 49.5623 12.5322 48.8023C16.0112 48.0193 14.5589 47.5883 18.1069 48.6333C20.1055 49.1969 22.1475 49.5932 24.2119 49.8169C31.7679 50.7389 43.4119 50.4387 49.8359 47.6587C57.3769 44.3947 59.2362 37.1314 59.6362 29.2144C60.1662 18.6784 58.9981 7.46738 50.0601 3.09038C42.2351 -0.725623 27.3 -0.571483 19.083 1.20952C17.277 1.6185 15.5173 2.21081 13.8311 2.97612C4.86205 7.03812 3.95601 19.056 4.70801 29.231C5.30801 37.347 6.87384 34.7203 4.71484 40.8023C4.07784 42.6023 3.44807 44.1338 2.72607 45.8238C1.25907 49.2948 0.3 49.4098 0 50.3238Z"
                fill={moodColors[currentExpression]}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              />

              {/* Ojos con parpadeo */}
              <motion.g animate={blinkAnimation}>
                {/* Ojo izquierdo */}
                <ellipse
                  cx={eyeExpressions[currentExpression].leftEye.cx}
                  cy={eyeExpressions[currentExpression].leftEye.cy}
                  rx={eyeExpressions[currentExpression].leftEye.rx}
                  ry={eyeExpressions[currentExpression].leftEye.ry}
                  fill="white"
                />
                <ellipse
                  cx={eyeExpressions[currentExpression].leftEye.cx}
                  cy={eyeExpressions[currentExpression].leftEye.cy + 1}
                  rx={eyeExpressions[currentExpression].leftEye.rx * 0.6}
                  ry={eyeExpressions[currentExpression].leftEye.ry * 0.6}
                  fill="#1F2937"
                />
                
                {/* Ojo derecho */}
                <ellipse
                  cx={eyeExpressions[currentExpression].rightEye.cx}
                  cy={eyeExpressions[currentExpression].rightEye.cy}
                  rx={eyeExpressions[currentExpression].rightEye.rx}
                  ry={eyeExpressions[currentExpression].rightEye.ry}
                  fill="white"
                />
                <ellipse
                  cx={eyeExpressions[currentExpression].rightEye.cx}
                  cy={eyeExpressions[currentExpression].rightEye.cy + 1}
                  rx={eyeExpressions[currentExpression].rightEye.rx * 0.6}
                  ry={eyeExpressions[currentExpression].rightEye.ry * 0.6}
                  fill="#1F2937"
                />
              </motion.g>

              {/* Cejas cuando está preocupado */}
              {currentExpression === 'worried' && (
                <>
                  <path d="M18 15 L24 17" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M44 17 L38 15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}

              {/* Boca animada */}
              <motion.path
                d={mouthPaths[currentExpression]}
                fill="white"
                stroke={currentExpression === 'neutral' || currentExpression === 'sad' || currentExpression === 'worried' ? '#1F2937' : 'none'}
                strokeWidth={currentExpression === 'neutral' || currentExpression === 'sad' || currentExpression === 'worried' ? '2' : '0'}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />

              {/* Mejillas cuando está feliz o emocionado */}
              {(currentExpression === 'happy' || currentExpression === 'excited') && (
                <>
                  <circle cx="14" cy="28" r="3" fill="#FF8C8A" opacity="0.3" />
                  <circle cx="46" cy="28" r="3" fill="#FF8C8A" opacity="0.3" />
                </>
              )}

              {/* Estrellas cuando está emocionado */}
              {currentExpression === 'excited' && (
                <motion.g
                  animate={{
                    rotate: [0, 360],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <path
                    d="M10,10 L11,8 L12,10 L14,11 L12,12 L11,14 L10,12 L8,11 Z"
                    fill="#FFD700"
                  />
                  <path
                    d="M48,8 L49,6 L50,8 L52,9 L50,10 L49,12 L48,10 L46,9 Z"
                    fill="#FFD700"
                  />
                </motion.g>
              )}

              {/* Indicador de escritura en la cola de la burbuja */}
              {isTyping && (
                <g>
                  <motion.circle
                    cx="6"
                    cy="46"
                    r="1.5"
                    fill="white"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.circle
                    cx="10"
                    cy="46"
                    r="1.5"
                    fill="white"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.circle
                    cx="14"
                    cy="46"
                    r="1.5"
                    fill="white"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </g>
              )}
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Sombra dinámica */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black opacity-20 rounded-full blur-md"
        style={{
          width: currentSize.width * 0.6,
          height: currentSize.height * 0.1,
        }}
        animate={{
          scale: isAnimating ? [1, 0.9, 1] : 1,
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default FitoAvatar;
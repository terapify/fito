export const fitoDialogs = {
  greetings: {
    morning: [
      "¡Buenos días! ¿Cómo amaneciste hoy?",
      "¡Hola! Un nuevo día, nuevas oportunidades para crecer",
      "¡Qué alegría verte! ¿Listo para un día increíble?",
    ],
    afternoon: [
      "¡Buenas tardes! ¿Cómo va tu día?",
      "¡Hola! Espero que estés teniendo un buen día",
      "¡Qué gusto verte! ¿Cómo te has sentido?",
    ],
    evening: [
      "¡Buenas noches! ¿Cómo estuvo tu día?",
      "¡Hola! Es hora de reflexionar sobre el día",
      "¡Qué bien que estés aquí! ¿Cómo te fue hoy?",
    ],
  },

  onboarding: {
    welcome: [
      "¡Bienvenido! Me llamo Fito y estaré aquí para acompañarte",
      "¡Hola! Soy Fito, tu compañero en este viaje de bienestar",
      "¡Qué alegría conocerte! Soy Fito, tu amigo virtual",
    ],
    askName: [
      "¿Cómo te llamas?",
      "¿Cuál es tu nombre?",
      "Me encantaría saber cómo te llamas",
    ],
    askGoals: [
      "¿Qué te gustaría mejorar en tu vida?",
      "¿Cuáles son tus objetivos de bienestar?",
      "¿En qué áreas te gustaría crecer?",
    ],
    complete: [
      "¡Genial! Ya estamos listos para comenzar esta aventura juntos",
      "¡Perfecto! Tu jardín de bienestar te espera",
      "¡Excelente! Vamos a hacer crecer algo hermoso juntos",
    ],
  },

  missions: {
    new: [
      "¡Tienes una nueva misión! Tu terapeuta la preparó especialmente para ti",
      "¡Nueva tarea disponible! Cada paso cuenta en tu progreso",
      "¡Hay algo nuevo para ti! Tu psicólogo dejó una actividad",
    ],
    reminder: [
      "Hey, tienes una misión pendiente. ¿Quieres intentarla?",
      "No olvides tu tarea de hoy, ¡puedes hacerlo!",
      "Tu misión te está esperando. Cuando estés listo, aquí estaré",
    ],
    completed: [
      "¡Increíble! Completaste la misión. Tu jardín está creciendo",
      "¡Muy bien! Cada tarea completada es un paso adelante",
      "¡Excelente trabajo! Me siento orgulloso de ti",
    ],
  },

  encouragement: {
    general: [
      "Recuerda que cada pequeño paso cuenta",
      "Estoy aquí para ti, no estás solo en esto",
      "Tu bienestar es importante, gracias por cuidarte",
    ],
    streak: [
      "¡Llevas {days} días seguidos! Sigue así",
      "¡Tu constancia es admirable! {days} días de progreso",
      "¡{days} días cuidando de ti! Eso es increíble",
    ],
    lowMood: [
      "Está bien no estar bien. Estoy aquí contigo",
      "Los días difíciles también son parte del proceso",
      "Respira profundo. Mañana será un nuevo día",
    ],
  },

  garden: {
    firstPlant: [
      "¡Tu primera planta! Cada sesión y tarea la hará crecer",
      "¡Mira! Has plantado tu primera semilla de bienestar",
      "¡Qué emoción! Tu jardín ha comenzado a crecer",
    ],
    plantGrowth: [
      "¡Tu planta está creciendo! Sigues progresando",
      "¡Mira cómo florece tu jardín con tu esfuerzo!",
      "Tu constancia está dando frutos, literalmente",
    ],
    gardenLevel: [
      "¡Tu jardín subió de nivel! Eres increíble",
      "¡Nuevo nivel desbloqueado en tu jardín!",
      "Tu jardín está más hermoso que nunca",
    ],
  },

  checkIn: {
    mood: [
      "¿Cómo te sientes hoy del 1 al 10?",
      "¿Cómo está tu ánimo en este momento?",
      "Me gustaría saber cómo te sientes",
    ],
    gratitude: [
      "¿Por qué estás agradecido hoy?",
      "Cuéntame algo bueno que te pasó",
      "¿Qué fue lo mejor de tu día?",
    ],
    reflection: [
      "¿Qué aprendiste sobre ti hoy?",
      "¿Hubo algo que te sorprendiera de ti mismo?",
      "¿Qué descubriste en tu última sesión?",
    ],
  },

  therapy: {
    preSession: [
      "Tu sesión es pronto. ¿Ya pensaste qué quieres hablar?",
      "Se acerca tu cita. Recuerda que es tu espacio seguro",
      "Tu terapia está cerca. ¡Es un gran paso cuidar de ti!",
    ],
    postSession: [
      "¿Cómo te fue en tu sesión?",
      "Espero que tu sesión haya sido provechosa",
      "¿Hay algo de la sesión que quieras recordar?",
    ],
    missed: [
      "Noté que no fuiste a tu sesión. ¿Todo bien?",
      "Tu bienestar es importante. ¿Quieres reagendar?",
      "Está bien si necesitabas un descanso. Cuando estés listo, aquí estaré",
    ],
  },

  achievements: {
    unlock: [
      "¡Logro desbloqueado: {achievement}!",
      "¡Felicidades! Conseguiste: {achievement}",
      "¡Nuevo logro! {achievement} - Estoy orgulloso de ti",
    ],
    milestone: [
      "¡Has alcanzado un hito importante!",
      "¡Qué progreso tan increíble!",
      "¡Esto merece una celebración!",
    ],
  },

  random: {
    tips: [
      "¿Sabías que respirar profundo puede calmar tu mente en segundos?",
      "Un pequeño paseo puede hacer una gran diferencia en tu día",
      "Escribir tus pensamientos puede ayudarte a procesarlos mejor",
      "La gratitud diaria puede mejorar tu bienestar general",
      "Está bien pedir ayuda cuando la necesitas",
    ],
    motivational: [
      "Eres más fuerte de lo que crees",
      "Cada día es una nueva oportunidad",
      "Tu salud mental es tan importante como la física",
      "Mereces cuidarte y ser feliz",
      "El progreso no siempre es lineal, y está bien",
    ],
  },
};

export const getFitoMood = (stats) => {
  const { streak, missionsCompleted, sessionsAttended } = stats;
  
  if (streak.current > 7) return 'excited';
  if (streak.current > 3) return 'happy';
  if (missionsCompleted === 0 && sessionsAttended === 0) return 'worried';
  if (streak.current === 0) return 'sad';
  
  return 'neutral';
};

export const getRandomDialog = (category, subcategory, replacements = {}) => {
  const dialogs = fitoDialogs[category]?.[subcategory];
  if (!dialogs || dialogs.length === 0) {
    // Fallback message if category doesn't exist
    return '¡Hola! Estoy aquí para acompañarte.';
  }
  
  let dialog = dialogs[Math.floor(Math.random() * dialogs.length)];
  
  // Replace placeholders
  Object.keys(replacements).forEach(key => {
    const value = replacements[key];
    if (value && value !== 'undefined') {
      dialog = dialog.replace(`{${key}}`, value);
    }
  });
  
  return dialog || '¡Hola! Estoy aquí para acompañarte.';
};

export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  let greeting;
  if (hour < 12) {
    greeting = getRandomDialog('greetings', 'morning');
  } else if (hour < 18) {
    greeting = getRandomDialog('greetings', 'afternoon');
  } else {
    greeting = getRandomDialog('greetings', 'evening');
  }
  
  // Asegurar que nunca retorne undefined
  return greeting || '¡Hola! ¿Cómo estás?';
};

export const shouldShowCheckIn = (lastInteraction) => {
  if (!lastInteraction) return true;
  
  const lastDate = new Date(lastInteraction);
  const now = new Date();
  const hoursDiff = (now - lastDate) / (1000 * 60 * 60);
  
  return hoursDiff > 12;
};
import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, X, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import useGameStore from '../../lib/gameStore';

const AppointmentReminder = memo(() => {
  const { appointment, updateAppointment, cancelAppointment } = useGameStore();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  if (!appointment || !appointment.scheduled) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleStartSession = () => {
    // Simulate starting a therapy session
    updateAppointment({ ...appointment, status: 'in-progress' });
    // In a real app, this would open video call or redirect to session
    alert('¡Iniciando sesión con tu terapeuta!');
  };

  const handleReschedule = () => {
    setShowRescheduleModal(true);
  };

  const confirmReschedule = () => {
    // In a real app, this would open a calendar to pick new date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);
    
    updateAppointment({
      ...appointment,
      dateTime: tomorrow.toISOString(),
      rescheduled: true
    });
    
    setShowRescheduleModal(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.3 }}
        className="bg-white/15 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white/20 transition-all overflow-hidden"
        style={{ width: '320px' }}
      >
        {/* Header with therapist info - Always visible */}
        <motion.div 
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 bg-white/10">
                  {!imageError ? (
                    <img
                      src="/1555803206800_homero_edited.webp"
                      alt={appointment.therapist || "Terapeuta"}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-yellow-400 to-yellow-600">
                      HS
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-xs">Cita individual con</p>
                <h3 className="text-white font-semibold text-sm">
                  {appointment.therapist || "Dr. Homero Simpson"}
                </h3>
                {/* Show time when collapsed */}
                {!isExpanded && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-white/60 text-xs mt-1"
                  >
                    Hoy a las {formatTime(appointment.dateTime)}
                  </motion.p>
                )}
              </div>
            </div>
            {/* Expand/Collapse Icon */}
            <div className="flex items-center space-x-2">
              {!isExpanded && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs text-white/60 hidden sm:block"
                >
                  Ver más
                </motion.span>
              )}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-white/70 hover:text-white"
              >
                <ChevronUp className="w-5 h-5" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Appointment details - Collapsible */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3 border-t border-white/10">
                {/* Date */}
                <div className="flex items-center space-x-2 text-white/80">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">
                    {formatDate(appointment.dateTime)}
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center space-x-2 text-white/80">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">
                    Hora de inicio: {formatTime(appointment.dateTime)}
                  </span>
                </div>

                {/* Session type */}
                <div className="flex items-center space-x-2 text-white/80">
                  <Video className="w-4 h-4 text-green-400" />
                  <span className="text-sm">
                    {appointment.type || "Sesión virtual"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartSession}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm py-2.5 px-4 rounded-xl font-medium hover:shadow-lg transition-shadow"
                  >
                    Iniciar cita
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReschedule}
                    className="px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                    title="Reagendar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Add to calendar option */}
                <button className="w-full text-center text-white/60 hover:text-white/80 text-xs py-1 transition-colors">
                  📅 Agregar a calendario
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRescheduleModal(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-2xl max-w-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Reagendar cita
                  </h3>
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres reagendar tu cita con {appointment.therapist || "tu terapeuta"}?
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRescheduleModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmReschedule}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-shadow"
                  >
                    Reagendar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

AppointmentReminder.displayName = 'AppointmentReminder';

export default AppointmentReminder;
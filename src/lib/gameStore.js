import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialState = {
  user: {
    name: '',
    goals: [],
    onboardingCompleted: false,
    joinedAt: null,
  },
  fito: {
    mood: 'happy',
    level: 1,
    experience: 0,
    lastInteraction: null,
    gridPosition: { row: 0, col: 0 },
  },
  garden: {
    plants: [],
    level: 1,
    totalPlants: 0,
    isMovementMode: false, // false = plant mode, true = movement mode
  },
  missions: [],
  completedMissions: [],
  streak: {
    current: 0,
    longest: 0,
    lastActivity: null,
  },
  stats: {
    sessionsAttended: 0,
    missionsCompleted: 0,
    weeklyGoalMet: 0,
    totalPoints: 0,
  },
  notifications: [],
  appointment: {
    scheduled: true,
    dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow by default
    therapist: 'Dr. Homero Simpson',
    type: 'Sesión virtual',
    status: 'scheduled', // scheduled, in-progress, completed, cancelled
    duration: 60, // minutes
    rescheduled: false,
  },
  chat: {
    isOpen: false,
    messages: [],
    turnCount: 0,
    isLoading: false,
  },
  videoCall: {
    isActive: false,
    startTime: null,
    duration: 0,
    isMuted: false,
    isCameraOn: true,
    connectionStatus: 'connecting', // connecting, connected, poor, disconnected
  },
};

const useGameStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // User actions
      setUserName: (name) =>
        set((state) => ({
          user: { ...state.user, name },
        })),

      setUserGoals: (goals) =>
        set((state) => ({
          user: { ...state.user, goals },
        })),

      completeOnboarding: () =>
        set((state) => ({
          user: {
            ...state.user,
            onboardingCompleted: true,
            joinedAt: new Date().toISOString(),
          },
        })),

      // Fito actions
      updateFitoMood: (mood) =>
        set((state) => ({
          fito: { ...state.fito, mood },
        })),

      addFitoExperience: (exp) =>
        set((state) => {
          const newExp = state.fito.experience + exp;
          const newLevel = Math.floor(newExp / 100) + 1;
          return {
            fito: {
              ...state.fito,
              experience: newExp,
              level: newLevel,
              lastInteraction: new Date().toISOString(),
            },
          };
        }),

      // Garden actions
      addPlant: (plant) =>
        set((state) => {
          // Check if position is already occupied
          const isOccupied = state.garden.plants.some(p => p.gridPosition === plant.gridPosition);
          if (isOccupied && plant.gridPosition) {
            return state; // Don't add if position is occupied
          }
          
          return {
            garden: {
              ...state.garden,
              plants: [...state.garden.plants, { ...plant, id: Date.now() }],
              totalPlants: state.garden.totalPlants + 1,
            },
          };
        }),

      growPlant: (plantId, growthAmount = 1) =>
        set((state) => ({
          garden: {
            ...state.garden,
            plants: state.garden.plants.map((plant) =>
              plant.id === plantId
                ? { ...plant, growth: Math.min((plant.growth || 0) + growthAmount, 100) }
                : plant
            ),
          },
        })),
      
      updatePlant: (plantId, updates) =>
        set((state) => ({
          garden: {
            ...state.garden,
            plants: state.garden.plants.map((plant) =>
              plant.id === plantId
                ? { ...plant, ...updates }
                : plant
            ),
          },
        })),

      // Mission actions
      addMission: (mission) =>
        set((state) => ({
          missions: [...state.missions, { 
            ...mission, 
            id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
            status: 'pending' 
          }],
        })),

      completeMission: (missionId) =>
        set((state) => {
          const mission = state.missions.find((m) => m.id === missionId);
          if (!mission) {
            console.log('❌ Mission not found:', missionId);
            return state;
          }

          // console.log('✅ Completing mission in store:', mission.type, mission.title);
          const newMissions = state.missions.filter((m) => m.id !== missionId);
          // console.log('📋 Remaining missions:', newMissions.length);

          return {
            missions: newMissions,
            completedMissions: [...state.completedMissions, { ...mission, completedAt: new Date().toISOString() }],
            stats: {
              ...state.stats,
              missionsCompleted: state.stats.missionsCompleted + 1,
              totalPoints: state.stats.totalPoints + (mission.points || 10),
            },
          };
        }),

      // Streak actions
      updateStreak: () =>
        set((state) => {
          const today = new Date().toDateString();
          const lastActivity = state.streak.lastActivity
            ? new Date(state.streak.lastActivity).toDateString()
            : null;

          if (lastActivity === today) return state;

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isConsecutive = lastActivity === yesterday.toDateString();

          const newStreak = isConsecutive ? state.streak.current + 1 : 1;
          const longestStreak = Math.max(newStreak, state.streak.longest);

          return {
            streak: {
              current: newStreak,
              longest: longestStreak,
              lastActivity: new Date().toISOString(),
            },
          };
        }),

      // Session actions
      recordSession: () =>
        set((state) => ({
          stats: {
            ...state.stats,
            sessionsAttended: state.stats.sessionsAttended + 1,
          },
        })),

      // Notification actions
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Date.now(), read: false, createdAt: new Date().toISOString() },
          ],
        })),

      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        })),

      // Appointment actions
      updateAppointment: (appointmentData) =>
        set((state) => ({
          appointment: {
            ...state.appointment,
            ...appointmentData,
          },
        })),

      cancelAppointment: () =>
        set((state) => ({
          appointment: {
            ...state.appointment,
            scheduled: false,
            status: 'cancelled',
          },
        })),

      scheduleAppointment: (dateTime, therapist = 'Dr. Homero Simpson') =>
        set((state) => ({
          appointment: {
            scheduled: true,
            dateTime,
            therapist,
            type: 'Sesión virtual',
            status: 'scheduled',
            duration: 60,
            rescheduled: false,
          },
        })),

      // Chat actions
      toggleChat: () =>
        set((state) => ({
          chat: {
            ...state.chat,
            isOpen: !state.chat.isOpen,
          },
        })),

      addChatMessage: (message) =>
        set((state) => ({
          chat: {
            ...state.chat,
            messages: [...state.chat.messages, message],
            turnCount: message.role === 'user' ? state.chat.turnCount + 1 : state.chat.turnCount,
          },
        })),

      setChatLoading: (loading) =>
        set((state) => ({
          chat: {
            ...state.chat,
            isLoading: loading,
          },
        })),

      clearChatHistory: () =>
        set((state) => ({
          chat: {
            ...state.chat,
            messages: [],
            turnCount: 0,
          },
        })),

      // Video Call actions
      startVideoCall: () =>
        set((state) => ({
          videoCall: {
            ...state.videoCall,
            isActive: true,
            startTime: new Date().toISOString(),
            duration: 0,
            connectionStatus: 'connecting',
          },
          appointment: {
            ...state.appointment,
            status: 'in-progress',
          },
        })),

      endVideoCall: () =>
        set((state) => ({
          videoCall: {
            ...state.videoCall,
            isActive: false,
            startTime: null,
            duration: 0,
            connectionStatus: 'disconnected',
          },
          appointment: {
            ...state.appointment,
            status: 'completed',
          },
          stats: {
            ...state.stats,
            sessionsAttended: state.stats.sessionsAttended + 1,
          },
        })),

      updateCallDuration: (duration) =>
        set((state) => ({
          videoCall: {
            ...state.videoCall,
            duration,
          },
        })),

      toggleMute: () =>
        set((state) => ({
          videoCall: {
            ...state.videoCall,
            isMuted: !state.videoCall.isMuted,
          },
        })),

      toggleCamera: () =>
        set((state) => ({
          videoCall: {
            ...state.videoCall,
            isCameraOn: !state.videoCall.isCameraOn,
          },
        })),

      updateConnectionStatus: (status) =>
        set((state) => ({
          videoCall: {
            ...state.videoCall,
            connectionStatus: status,
          },
        })),

      // Reset game
      resetGame: () => set(initialState),

      updateFitoPosition: (row, col) =>
        set((state) => ({
          fito: {
            ...state.fito,
            gridPosition: { row, col },
          },
        })),

      // Update Fito position with interaction timestamp (for meaningful interactions)
      updateFitoPositionWithInteraction: (row, col) =>
        set((state) => ({
          fito: {
            ...state.fito,
            gridPosition: { row, col },
            lastInteraction: new Date().toISOString(),
          },
        })),

      // Garden mode actions
      toggleMovementMode: () =>
        set((state) => ({
          garden: {
            ...state.garden,
            isMovementMode: !state.garden.isMovementMode,
          },
        })),

      // Dynamic mood calculation with gradual transitions
      getCurrentFitoMood: () => {
        const state = get();
        const { missions, completedMissions, stats, streak } = state;
        const missionCount = missions.length;
        const streakDays = streak.current || 0;
        
        // Priority 1: Check for sad state (lost streak)
        if (streakDays === 0 && stats.missionsCompleted > 5) {
          return 'sad';
        }
        
        // Priority 2: Check mission count for gradual transitions
        if (missionCount === 0) {
          // No missions - mood depends on streak
          if (streakDays > 7) return 'excited';
          if (streakDays > 3) return 'happy';
          return 'happy'; // Default when no missions
        }
        
        // Priority 3: Recently completed many missions
        const recentCompletions = completedMissions.length;
        if (recentCompletions > missionCount * 2 && missionCount <= 2) {
          return 'excited';
        }
        
        // Priority 4: Gradual mood based on mission count
        if (missionCount === 1 || missionCount === 2) {
          return streakDays > 3 ? 'happy' : 'neutral';
        }
        
        if (missionCount === 3 || missionCount === 4) {
          return 'neutral';
        }
        
        if (missionCount >= 5) {
          return 'worried';
        }
        
        // Default fallback
        return 'neutral';
      },

      // Update Fito mood based on current state
      updateFitoMood: (customMood = null) =>
        set((state) => {
          const mood = customMood || get().getCurrentFitoMood();
          return {
            fito: {
              ...state.fito,
              mood,
              lastInteraction: new Date().toISOString(),
            },
          };
        }),
    }),
    {
      name: 'fito-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => state,
    }
  )
);

export default useGameStore;
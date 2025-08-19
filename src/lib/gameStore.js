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
          missions: [...state.missions, { ...mission, id: Date.now(), status: 'pending' }],
        })),

      completeMission: (missionId) =>
        set((state) => {
          const mission = state.missions.find((m) => m.id === missionId);
          if (!mission) return state;

          return {
            missions: state.missions.filter((m) => m.id !== missionId),
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

      // Dynamic mood calculation
      getCurrentFitoMood: () => {
        const state = get();
        const { missions, completedMissions, stats, streak } = state;
        
        // No missions and good streak = happy
        if (missions.length === 0 && streak.current > 3) return 'excited';
        if (missions.length === 0) return 'happy';
        
        // Many pending missions = worried
        if (missions.length > 5) return 'worried';
        
        // Recently completed many missions = excited
        if (completedMissions.length > missions.length * 2) return 'excited';
        
        // Lost streak or no recent activity = sad
        if (streak.current === 0 && stats.missionsCompleted > 0) return 'sad';
        
        // Default states
        if (stats.streak?.current > 7) return 'excited';
        if (stats.streak?.current > 3) return 'happy';
        if (missions.length > 3) return 'neutral';
        
        return 'happy';
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
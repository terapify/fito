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
  },
  garden: {
    plants: [],
    level: 1,
    totalPlants: 0,
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
    }),
    {
      name: 'fito-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => state,
    }
  )
);

export default useGameStore;
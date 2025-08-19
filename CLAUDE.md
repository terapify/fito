# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fito is a Next.js-based mental wellness companion app with gamification elements. The app uses a virtual character named "Fito" to guide users through therapy missions and help them cultivate a virtual garden that grows with their progress. The project combines React Three Fiber for 3D graphics, Zustand for state management, and Framer Motion for animations.

## Development Commands

### Core Development
- `yarn dev` - Start development server with Turbopack (preferred for development)
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint to check code quality

### Package Management
The project uses Yarn 1.22.22 as the package manager (specified in packageManager field).

## Architecture Overview

### State Management
The application uses **Zustand** with persistence for state management. The main store (`src/lib/gameStore.js`) contains:
- User profile data (name, goals, onboarding status)
- Fito character state (mood, level, experience, position)
- Garden state (plants array, level, total plants)
- Missions and completed missions
- User stats and streak tracking
- Notifications system

### Key Application Flow
1. **Onboarding**: Users start at `/` which redirects to `/onboarding` for first-time users
2. **Main Garden**: After onboarding, users are redirected to `/garden-immersive`
3. **State Persistence**: All game state is persisted to localStorage via Zustand middleware

### Component Architecture

#### Garden System
- **IsometricGarden.js**: Main 3D garden view using React Three Fiber
- **IsometricGardenCanvas.js** & **IsometricGardenCanvasOptimized.js**: 2D Canvas-based garden implementations
- **PlantSprites.js**: Plant texture and growth stage management
- Grid-based system with 6x9 tile layout for plant placement

#### Character System
- **FitoAvatar.js**: Visual representation of the Fito character
- **FitoChat.js**: Chat interface for Fito interactions
- **IsometricFito.js**: 3D isometric representation

#### Dialog System
The `src/lib/fitoDialogs.js` contains comprehensive dialog trees for:
- Contextual greetings (time-based)
- Onboarding conversations
- Mission notifications and encouragement
- Mood check-ins and therapy session support
- Achievement celebrations

### 3D Graphics Implementation
The project uses **React Three Fiber** with **Drei** helpers:
- Orthographic camera for isometric perspective
- Sprite-based 2D plants in 3D space
- Post-processing effects (Bloom, Vignette)
- Particle systems for atmospheric effects
- Custom textures and materials

### Styling System
- **Tailwind CSS 4** for utility-first styling
- CSS custom properties defined in `globals.css` for theming
- Responsive design with mobile-first approach
- Framer Motion for complex animations and transitions

## Key Features to Understand

### Garden Grid System
- 6 rows × 9 columns isometric grid
- Plants are positioned using `gridPosition: { row, col }`
- Each tile can contain one plant
- Plant growth affects visual appearance and scale

### Mission System
- Missions are assigned by therapists
- Completion rewards experience points
- Progress tracking with streaks
- Integration with therapy sessions

### Persistence Strategy
All game state persists automatically to localStorage. The store partializes the entire state, ensuring full app state recovery between sessions.

## Development Patterns

### Component Structure
- Pages in `src/pages/` follow Next.js file-based routing
- Reusable components organized by feature in `src/components/`
- Shared utilities in `src/utils/`
- Custom hooks in `src/hooks/`

### State Updates
- Use Zustand actions (e.g., `addPlant`, `updateFitoMood`, `completeMission`)
- All state mutations go through store actions
- No direct state manipulation

### 3D Scene Management
- Components wrap Three.js objects using React Three Fiber
- Use `useFrame` hook for animations
- Manage refs for direct Three.js object access
- Suspense boundaries for loading states

## Testing and Quality

### Linting
The project uses ESLint with Next.js core web vitals configuration. Run `yarn lint` before committing changes.

### Build Verification
Always run `yarn build` to verify production builds work correctly, especially after modifying dependencies or configuration.
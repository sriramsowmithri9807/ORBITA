# ORBITA Implementation Details

This document outlines the implementation details of the ORBITA project.

## 1. Project Structure & Architecture

The project follows the Next.js 14 App Router architecture:

- **`app/`**: Contains the page routes and layouts.
  - `page.tsx`: Landing page with animated entry.
  - `mission-setup/`: Multi-step wizard for mission configuration.
  - `dashboard/`: Main mission control interface.
  - `report/`: Post-mission analytics.
  - `globals.css`: Global styles including Tailwind directives and custom animation classes.

- **`components/`**: Reusable UI components.
  - `Starfield.tsx`: Canvas-based animated background.
  - `OrbitVisualization.tsx`: React Three Fiber component for 3D Earth and satellite rendering.
  - `TelemetryCard.tsx`, `AIDecisionLog.tsx`, `MissionTimeline.tsx`: Dashboard widgets.

- **`hooks/`**: Custom React hooks for data simulation.
  - `useTelemetry.ts`: Generates varying battery, thermal, and signal data.
  - `useAIDecisions.ts`: Simulates AI anomaly detection and resolution.
  - `useMissionEvents.ts`: Manages the timeline of mission phases.

- **`types/`**: shared TypeScript interfaces for type safety.

## 2. Key Features Implementation

### 3D Orbit Visualization
Implemented using `@react-three/fiber` and `@react-three/drei`.
- Files: `components/OrbitVisualization.tsx`
- Features: 
  - Dynamic Earth rendering
  - Adjustable orbit path based on selected satellite type (LEO, MEO, GEO)
  - Animated satellite movement
  - Interactive camera controls

### AI Decision Engine (Simulated)
Implemented as a stateful hook that generates realistic mission scenarios.
- Files: `hooks/useAIDecisions.ts`
- Logic: Periodically triggers anomalies (e.g., "Thermal anomaly") and corresponding AI actions with confidence scores.

### Visual Effects
- **Glassmorphism**: Achieved via Tailwind utility classes (bg-opacity, backdrop-blur) in `globals.css`.
- **Animations**: `framer-motion` handles page transitions and element entry animations.
- **Starfield**: A custom Canvas implementation for a performant, depth-aware background.

## 3. Data Flow

1. **Mission Setup**: User inputs data in `/mission-setup`. Data is stored in `localStorage`.
2. **Dashboard Initialization**: `/dashboard` reads `localStorage` to configure the view (e.g. satellite type).
3. **Real-time Updates**: Hooks in `/dashboard` utilize `setInterval` to mock a WebSocket connection, updating state every few seconds.

## 4. Customization Guide

- **Theme Colors**: Defined in `tailwind.config.ts`.
  - `neon-cyan`: Primary accent
  - `orbital-orange`: Warning color
  - `status-nominal`, `status-warning`, `status-critical`: Status indicators

- **Adding New Anomalies**: Edit the `anomalyTypes` array in `hooks/useAIDecisions.ts`.

## 5. Next Steps for Backend Integration

To connect to a real backend:
1. Replace `setInterval` in hooks with `useEffect` + WebSocket/SSE connection.
2. Replace `localStorage` usage with API calls (`fetch` or `axios`).
3. Update `types/mission.ts` to match the actual API response shape.

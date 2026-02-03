# ORBITA – Autonomous Space Mission Planner

![ORBITA Logo](https://img.shields.io/badge/ORBITA-Mission%20Control-00f0ff?style=for-the-badge)

A production-grade, animated web frontend for autonomous satellite mission planning and real-time mission control. Built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and React Three Fiber.

## 🚀 Features

### Mission Control Dashboard
- **Real-time Telemetry Monitoring**: Live tracking of battery levels, thermal status, satellite orientation, and signal latency
- **3D Orbit Visualization**: Interactive Three.js visualization of satellite orbits (LEO, MEO, GEO)
- **AI Decision Engine**: Autonomous anomaly detection with intelligent corrective actions
- **Mission Timeline**: Comprehensive event logging with color-coded phases
- **Post-Mission Analytics**: Detailed performance reports with exportable data

### Technical Highlights
- **Next.js 14 App Router**: Modern React framework with server components
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Custom space-themed design system
- **Framer Motion**: Smooth page transitions and micro-interactions
- **React Three Fiber**: WebGL-powered 3D orbit visualization
- **Real-time Data Simulation**: Live telemetry updates and AI decision-making

## 🎨 Design

### Color Palette
- **Space Black**: `#0a0e27` - Primary background
- **Midnight Blue**: `#1a1f3a` - Secondary background
- **Neon Cyan**: `#00f0ff` - Primary accent
- **Orbital Orange**: `#ff6b35` - Warning/action color
- **Status Colors**: Green (nominal), Yellow (warning), Red (critical)

### Animations
- Animated starfield background with 3D perspective
- Smooth page transitions using Framer Motion
- Pulsing telemetry cards on data updates
- Orbit animation synced with satellite type
- Alert animations for critical events

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion 12
- **3D Graphics**: Three.js + React Three Fiber + Drei
- **Package Manager**: npm

## 📁 Project Structure

```
ORBITA/
├── app/
│   ├── page.tsx              # Landing page
│   ├── mission-setup/        # Mission configuration wizard
│   ├── dashboard/            # Live mission control
│   ├── report/               # Post-mission analytics
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Starfield.tsx         # Animated background
│   ├── TelemetryCard.tsx     # Telemetry display
│   ├── OrbitVisualization.tsx # 3D orbit viewer
│   ├── AIDecisionLog.tsx     # AI decision timeline
│   └── MissionTimeline.tsx   # Event history
├── hooks/
│   ├── useTelemetry.ts       # Real-time telemetry data
│   ├── useAIDecisions.ts     # AI decision simulation
│   └── useMissionEvents.ts   # Mission event tracking
├── types/
│   └── mission.ts            # TypeScript definitions
└── tailwind.config.ts        # Tailwind configuration
```

## 🎯 Pages

### 1. Landing Page (`/`)
- Animated ORBITA logo reveal
- Starfield background
- Feature highlights
- "Launch Mission" CTA

### 2. Mission Setup (`/mission-setup`)
- Satellite type selector (LEO/MEO/GEO)
- Mission objectives input
- Orbit parameters configuration
- Multi-step wizard with validation

### 3. Live Dashboard (`/dashboard`)
- 3D orbit visualization
- Real-time telemetry cards
- AI decision log panel
- Mission timeline
- Status indicators

### 4. Post-Mission Report (`/report`)
- Summary metrics
- Event distribution graphs
- Telemetry history visualization
- AI performance analytics
- Export functionality

## 🔧 Configuration

### Satellite Types
- **LEO** (Low Earth Orbit): 160-2,000 km altitude
- **MEO** (Medium Earth Orbit): 2,000-35,786 km altitude
- **GEO** (Geostationary Orbit): ~35,786 km altitude

### Telemetry Parameters
- Battery level (%)
- Thermal temperature (°C)
- Orientation (roll, pitch, yaw)
- Signal latency (ms)

### Status Thresholds
- **Nominal**: All systems within normal parameters
- **Warning**: One or more parameters approaching limits
- **Critical**: Immediate action required

## 🚀 Usage

1. **Launch the application**: Navigate to the landing page
2. **Configure mission**: Select satellite type, set objectives, and configure orbit parameters
3. **Monitor mission**: View real-time telemetry and AI decisions on the dashboard
4. **Review performance**: Access post-mission reports and analytics

## 🎨 Customization

### Adding New Telemetry Parameters
Edit `types/mission.ts` and `hooks/useTelemetry.ts` to add new data fields.

### Modifying AI Decision Logic
Update `hooks/useAIDecisions.ts` to customize anomaly detection and actions.

### Styling Changes
Modify `tailwind.config.ts` for color schemes and `app/globals.css` for custom components.

## 📝 Notes

- All data is simulated for demonstration purposes
- Backend integration hooks are ready for real API connections
- Three.js components are client-side only (SSR disabled)
- Uses localStorage for mission data persistence

## 🔮 Future Enhancements

- Real backend API integration
- Multi-mission support
- Historical mission archive
- Advanced AI training interface
- WebSocket for real-time updates
- PDF report generation
- Mission replay functionality

## 📄 License

This project is built for demonstration purposes.

---

**Built with ❤️ for space exploration**

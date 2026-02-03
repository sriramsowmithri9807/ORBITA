// Mission Types
export type SatelliteType = 'LEO' | 'MEO' | 'GEO';

export type MissionStatus = 'nominal' | 'warning' | 'critical';

export type MissionPhase = 'normal' | 'anomaly' | 'recovery';

export interface MissionObjective {
    id: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

export interface OrbitParameters {
    altitude: number; // km
    inclination: number; // degrees
    period: number; // minutes
    eccentricity: number;
}

export interface TelemetryData {
    battery: number; // percentage
    thermal: number; // celsius
    orientation: {
        roll: number;
        pitch: number;
        yaw: number;
    };
    signalLatency: number; // ms
    timestamp: Date;
}

export interface PredictedEvent {
    event: string;
    probability: number;
    time_horizon: string;
}

export interface AIDecision {
    id: string;
    timestamp: Date;
    anomaly: string;
    action: string;
    reasoning: string;
    confidence: number; // 0-1
    status: MissionStatus;

    // ORBITA-Ω Native Fields
    global_space_state?: string;
    detected_patterns?: string[];
    predicted_events?: PredictedEvent[];
    risk_assessment?: string;
    coordination_recommendations?: string[];
    counterfactual_insights?: string;

    // Cognitive Mission Fields (Legacy)
    autonomyMode?: 'autonomous' | 'supervisory' | 'human_required';
    digitalTwinPrediction?: string;
    verificationResult?: string;
    rootCause?: string;
}

export interface MissionEvent {
    id: string;
    timestamp: Date;
    phase: MissionPhase;
    description: string;
    severity: MissionStatus;
}

export interface Mission {
    id: string;
    name: string;
    satelliteType: SatelliteType;
    objectives: MissionObjective[];
    orbitParameters: OrbitParameters;
    startTime: Date;
    status: MissionStatus;
    currentTelemetry: TelemetryData;
    aiDecisions: AIDecision[];
    events: MissionEvent[];
}

export interface MissionReport {
    missionId: string;
    duration: number; // hours
    totalAnomalies: number;
    anomaliesResolved: number;
    averageAIConfidence: number;
    telemetryHistory: TelemetryData[];
    criticalEvents: MissionEvent[];
    successRate: number; // percentage
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// --- COMMAND DICTIONARY (50+ COMMANDS) ---
const CMD_LIBRARY: Record<string, string> = {
    // === POWER (EPS) === 
    'PWR_STATUS_CHK': 'EPS_TLM: VBus=28.4V, IBus=12.1A, Batt=88%',
    'PWR_RESET_BUS_A': 'ACK: INITIATING BUS A POWER CYCLE... SUCCESS',
    'PWR_RESET_BUS_B': 'ACK: INITIATING BUS B POWER CYCLE... SUCCESS',
    'PWR_SHED_LOAD_1': 'ACK: LOAD SHED LEVEL 1 EXECUTED. PAYLOADS OFF.',
    'PWR_SHED_LOAD_2': 'ACK: LOAD SHED LEVEL 2 EXECUTED. ADCS LOW MODE.',
    'PWR_SHED_LOAD_3': 'ACK: LOAD SHED LEVEL 3 EXECUTED. CRITICAL ONLY.',
    'BATT_HEAT_ON': 'ACK: BATTERY HEATERS ACTIVE. TARGET=15C',
    'BATT_HEAT_OFF': 'ACK: BATTERY HEATERS DISABLED.',
    'SOLAR_ARR_DEPLOY': 'ACK: SOLAR ARRAY DEPLOY SEQUENCE STARTED... LOCKED',
    'SOLAR_ARR_STOW': 'ACK: SOLAR ARRAY STOW SEQUENCE STARTED... STOWED',
    'EPS_CONFIG_SAFE': 'ACK: EPS CONFIGURED FOR SAFE MODE.',
    'EPS_CONFIG_NOM': 'ACK: EPS CONFIGURED FOR NOMINAL OPS.',

    // === THERMAL (TCS) ===
    'THERM_STATUS': 'TCS_TLM: AvgTemp=22C, Radiator=45%, LoopA=Active',
    'THERM_LOOP_A_ON': 'ACK: THERMAL LOOP A PUMP STARTED.',
    'THERM_LOOP_A_OFF': 'ACK: THERMAL LOOP A PUMP STOPPED.',
    'THERM_LOOP_B_ON': 'ACK: THERMAL LOOP B PUMP STARTED.',
    'RAD_DEPLOY_N': 'ACK: RADIATOR NORTH DEPLOYED.',
    'RAD_DEPLOY_S': 'ACK: RADIATOR SOUTH DEPLOYED.',
    'RAD_STOW_ALL': 'ACK: ALL RADIATORS STOWED.',
    'HTR_PAYLOAD_ON': 'ACK: PAYLOAD HEATERS ENABLED.',
    'HTR_PAYLOAD_OFF': 'ACK: PAYLOAD HEATERS DISABLED.',

    // === ATTITUDE (ADCS) ===
    'ADCS_STATUS': 'ADCS_TLM: Mode=3-Axis, Err=<0.01deg, RW_Speed=1200rpm',
    'RW_DESAT_AUTO': 'ACK: REACTION WHEEL DESATURATION (MAGNETORQUER) STARTED.',
    'RW_DESAT_MANUAL': 'ACK: RCS THRUSTER DESAT PURGE EXECUTED.',
    'ATT_MODE_SUN': 'ACK: ATTITUDE MODE SET TO: SUN POINTING.',
    'ATT_MODE_NADIR': 'ACK: ATTITUDE MODE SET TO: NADIR POINTING.',
    'ATT_MODE_SAFE': 'ACK: ATTITUDE MODE SET TO: TUMBLE RECOVERY (SAFE).',
    'IMU_CALIB': 'ACK: IMU CALIBRATION SEQUENCE STARTED (T+60s).',
    'STAR_TRK_RESET': 'ACK: START TRACKER REBOOTING...',
    'THRUSTER_TEST_Z': 'ACK: Z+ THRUSTER FIRE (100ms) COMPLETE.',
    'ORBIT_INC_MAN': 'ACK: ORBIT INCLINATION MANEUVER SCRIPT UPLOADED.',
    'ORBIT_ALT_RAISE': 'ACK: ORBIT RAISING BURN SCHEDULED.',

    // === COMMS (TT&C) ===
    'COMM_STATUS': 'COMM_TLM: Link=HighGain, RSSI=-85dBm, Rate=100Mbps',
    'TX_HIGH_GAIN': 'ACK: TRANSMITTER SWITCHED TO HIGH GAIN ANTENNA.',
    'TX_LOW_GAIN': 'ACK: TRANSMITTER SWITCHED TO OMNI LOW GAIN.',
    'TX_MUTE': 'ACK: RF SILENCE ENABLED.',
    'TX_UNMUTE': 'ACK: RF SILENCE DISABLED.',
    'DL_TELEMETRY': 'ACK: DOWNLINKING TELEMETRY BUFFER (256MB)...',
    'DL_PAYLOAD': 'ACK: DOWNLINKING PAYLOAD DATA (50GB)...',
    'BEACON_ON': 'ACK: EMERGENCY BEACON ACTIVE.',
    'ENC_KEY_ROTATE': 'ACK: ENCRYPTION KEY ROTATION COMPLETE.',

    // === PAYLOAD ===
    'PL_STATUS': 'PL_TLM: IDLE. Temp=18C, Storage=45% Free',
    'CAM_POWER_ON': 'ACK: OPTICAL IMAGER POWERED ON.',
    'CAM_POWER_OFF': 'ACK: OPTICAL IMAGER POWERED OFF.',
    'CAM_CAPTURE': 'ACK: IMAGE CAPTURE SEQUENCE EXECUTED. ID: IMG_9921',
    'SAR_SCAN_START': 'ACK: SAR RADAR MAPPING STARTED.',
    'SAR_SCAN_STOP': 'ACK: SAR RADAR MAPPING HALTED.',

    // === SYSTEM (CDH) ===
    'SYS_STATUS': 'CDH_TLM: CPU=12%, RAM=34%, Uptime=402h',
    'SYS_REBOOT': 'WARN: INITIATING FLIGHT COMPUTER REBOOT... [CONNECTION LOST]',
    'MEM_DUMP_CORE': 'ACK: CORE MEMORY DUMP SAVED TO LOG.',
    'FILE_DEL_LOGS': 'ACK: OLD LOG FILES CLEARED.',
    'SCRIPT_EXEC_A': 'ACK: EXECUTING PRE-LOADED SCRIPT ALPHA.',
    'HELP': 'AVAILABLE CATEGORIES: PWR_, THERM_, ADCS_, COMM_, PL_, SYS_ (Use HELP_PWR, etc.)'
};

interface LogEntry {
    type: 'text' | 'image';
    content: string;
    timestamp: string;
}

export default function OperationsCenter() {
    const router = useRouter();
    const [commandInput, setCommandInput] = useState('');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [mounted, setMounted] = useState(false);
    const [forecast, setForecast] = useState<any>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Simulated Satellite Imagery Library
    const SAT_IMAGES = [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541185933-710f50031142?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1614730341194-75c60740a070?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=600&auto=format&fit=crop",
    ];

    // Handle Hydration & Initial Logs
    useEffect(() => {
        setMounted(true);
        setLogs([
            { type: 'text', content: '[SYSTEM] Uplink connection established.', timestamp: new Date().toLocaleTimeString() },
            { type: 'text', content: '[SYSTEM] Ready for command sequence.', timestamp: new Date().toLocaleTimeString() }
        ]);

        // Fetch Forecast
        fetch('http://localhost:8001/mission/1/forecast')
            .then(res => res.json())
            .then(data => setForecast(data))
            .catch(err => console.error("Forecast unavailable", err));

    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = commandInput.trim().toUpperCase();
        if (!cmd) return;

        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-30), { type: 'text', content: `> ${cmd}`, timestamp }]);
        setCommandInput('');

        setTimeout(() => {
            const ts = new Date().toLocaleTimeString();

            if (cmd === 'CAM_CAPTURE' || cmd === 'SAR_SCAN_START' || cmd === 'CAM_POWER_ON') {
                setLogs(prev => [...prev.slice(-30), { type: 'text', content: `[SAT] ACK: EXECUTING IMAGING SEQUENCE...`, timestamp: ts }]);

                setTimeout(() => {
                    const randomImage = SAT_IMAGES[Math.floor(Math.random() * SAT_IMAGES.length)];
                    setLogs(prev => [...prev.slice(-30), {
                        type: 'image',
                        content: randomImage,
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    setLogs(prev => [...prev.slice(-30), { type: 'text', content: `[SAT] SUCCESS: IMAGE DOWNLINKED. ID: IMG_${Math.floor(Math.random() * 9999)}`, timestamp: new Date().toLocaleTimeString() }]);
                }, 1500);
                return;
            }

            if (CMD_LIBRARY[cmd]) {
                const response = CMD_LIBRARY[cmd];
                setLogs(prev => [...prev.slice(-30), { type: 'text', content: `[SAT] ${response}`, timestamp: ts }]);
            } else if (cmd.startsWith('HELP_')) {
                const cat = cmd.replace('HELP_', '');
                const matches = Object.keys(CMD_LIBRARY).filter(k => k.startsWith(cat));
                setLogs(prev => [...prev.slice(-30), { type: 'text', content: `[SYS] COMMANDS FOR ${cat}: ${matches.join(', ')}`, timestamp: ts }]);
            } else {
                setLogs(prev => [...prev.slice(-30), { type: 'text', content: `[SAT] ERR: UNKNOWN COMMAND OR SYNTAX ERROR.`, timestamp: ts }]);
            }
        }, 600);
    };

    // Orbital Simulation Animation
    useEffect(() => {
        if (!mounted) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current) return;

        let animationFrameId: number;

        const render = () => {
            const w = canvasRef.current!.width;
            const h = canvasRef.current!.height;

            ctx.fillStyle = '#050a14';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = '#1e3a8a';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
            for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

            ctx.beginPath();
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            for (let x = 0; x < w; x++) {
                const y = h / 2 + Math.sin(x / 50) * (h / 3);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            const satX = (Date.now() / 50) % w;
            const satY = h / 2 + Math.sin(satX / 50) * (h / 3);
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(satX, satY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mounted]);

    if (!mounted) return <div className="min-h-screen bg-black" />;

    return (
        <main className="min-h-screen relative overflow-hidden text-white">
            <div className="container mx-auto px-4 py-6 relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-neon-cyan tracking-tight">MISSION OPERATIONS CENTER</h1>
                        <p className="text-xs text-gray-500 tracking-[0.3em]">ORBITAL COMMAND INTERFACE - CLEARANCE LEVEL 5</p>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="px-4 py-2 border border-white/20 hover:bg-white/10 rounded text-sm transition-colors">
                        RETURN TO DASHBOARD
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
                    <div className="lg:col-span-2 space-y-6 flex flex-col">
                        <div className="glass-panel p-1 flex-1 min-h-[300px] relative">
                            <div className="absolute top-4 left-4 z-10 bg-black/50 px-2 py-1 rounded border border-neon-cyan/50">
                                <span className="text-xs text-neon-cyan font-mono">LIVE GROUND TRACK</span>
                            </div>
                            <canvas ref={canvasRef} width={800} height={400} className="w-full h-full object-cover rounded bg-black/50" />
                        </div>

                        <div className="glass-panel p-6 flex-1 min-h-[300px]">
                            <h3 className="text-sm font-bold text-gray-400 mb-4 tracking-widest uppercase">Power Resource Forecast (24H)</h3>
                            {forecast ? (
                                <div className="h-full w-full flex items-end gap-1 pb-8">
                                    {forecast.battery_levels.filter((_: any, i: number) => i % 4 === 0).map((level: number, i: number) => (
                                        <div key={i} className="flex-1 bg-white/5 relative group hover:bg-white/10 transition-colors" style={{ height: `${level}%` }}>
                                            <div className={`absolute bottom-0 w-full ${level < 20 ? 'bg-red-500' : 'bg-neon-cyan'}`} style={{ height: '2px' }}></div>
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border border-white/20 p-2 text-[10px] whitespace-nowrap z-20">
                                                {level}% Power<br />{forecast.timestamps[i * 4].split('T')[1].slice(0, 5)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-neon-cyan animate-pulse space-y-2">
                                    <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs">CALCULATING ORBITAL ECLIPSES...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel flex flex-col h-full font-mono text-sm border-t-4 border-t-orbital-orange">
                        <div className="p-4 border-b border-white/10 bg-orbital-orange/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-orbital-orange">COMMAND UPLINK TERMINAL</h3>
                                <div className="text-[10px] text-gray-400 uppercase">Secure Link: AES-256-GCM</div>
                            </div>
                            <div className="text-[10px] text-green-400 animate-pulse flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                LIVE
                            </div>
                        </div>

                        <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs bg-black/40 scrollbar-thin scrollbar-thumb-white/10">
                            {logs.map((log, i) => (
                                <div key={i} className={`break-words ${log.type === 'text' && log.content.startsWith('>') ? 'text-neon-cyan' : log.content?.includes('ACK') ? 'text-green-400' : log.content?.includes('ERR') ? 'text-red-500' : 'text-gray-400'}`}>
                                    <span className="opacity-30 mr-2 text-[9px]">{log.timestamp}</span>
                                    {log.type === 'image' ? (
                                        <div className="mt-2 mb-2 border border-white/20 rounded overflow-hidden relative group">
                                            <img src={log.content} alt="Satellite Downlink" className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-0 left-0 bg-black/70 px-2 py-1 text-[9px] text-neon-cyan w-full font-mono">
                                                RAW_CAPTURE_DATA // CH: 0xAF
                                            </div>
                                        </div>
                                    ) : (
                                        <span>{log.content}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-black/80 px-4 py-2 text-[9px] text-gray-500 border-t border-white/5 uppercase tracking-tighter">
                            Hint: Try 'CAM_CAPTURE' or 'ADCS_STATUS'
                        </div>

                        <form onSubmit={handleCommand} className="p-4 border-t border-white/10 bg-black/20">
                            <div className="flex gap-2">
                                <span className="text-neon-cyan">{'>'}</span>
                                <input
                                    type="text"
                                    value={commandInput}
                                    onChange={e => setCommandInput(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-white uppercase placeholder-white/10 font-bold"
                                    placeholder="ENTER COMMAND..."
                                    autoFocus
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

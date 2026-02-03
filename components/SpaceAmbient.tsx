'use client';

import { useState } from 'react';

export default function SpaceAmbient() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all hover:scale-105 group"
            >
                {isPlaying ? (
                    <div className="flex gap-1 h-3 items-end">
                        <div className="w-0.5 bg-neon-cyan animate-[bounce_1s_infinite] h-full"></div>
                        <div className="w-0.5 bg-neon-cyan animate-[bounce_1.2s_infinite] h-2"></div>
                        <div className="w-0.5 bg-neon-cyan animate-[bounce_0.8s_infinite] h-3"></div>
                        <div className="w-0.5 bg-neon-cyan animate-[bounce_1.1s_infinite] h-1"></div>
                        <div className="w-0.5 bg-neon-cyan animate-[bounce_0.9s_infinite] h-2"></div>
                        <span className="ml-2 text-xs text-neon-cyan font-mono tracking-widest">AUDIO_ACTIVE [VOL:LOW]</span>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 font-mono tracking-widest flex items-center gap-2">
                        <span>🔇</span> ACTIVATE_AUDIO
                    </span>
                )}
            </button>

            {isPlaying && (
                <div className="hidden">
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/WHqbqzqeskw?autoplay=1&loop=1&playlist=WHqbqzqeskw&controls=0&start=0"
                        title="Background Music"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                </div>
            )}
        </>
    );
}

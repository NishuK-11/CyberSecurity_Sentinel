import React, { useEffect, useState } from 'react';
import { Shield, Radio, Terminal } from 'lucide-react';

interface ScanningOverlayProps {
  isScanning: boolean;
  targetUrl?: string;
}

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ isScanning, targetUrl }) => {
  const [stageIndex, setStageIndex] = useState(0);

  const stages = [
    `Connecting to target backend at ${targetUrl || 'target'}...`,
    'Querying route inventory from GET /__security/routes...',
    'Extracting booking resources & sample identifiers...',
    'Generating identity permutation matrix (user-a, user-b, unauthenticated)...',
    'Executing cross-tenant GET requests against target endpoints...',
    'Evaluating response bodies for unauthorized object leakage...',
    'Synthesizing BOLA vulnerability findings & remediation...',
  ];

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 700);

    return () => {
      clearInterval(interval);
      setStageIndex(0);
    };
  }, [isScanning, stages.length]);

  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#060a14]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0a1020] border border-cyan-500/40 rounded-3xl p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] relative overflow-hidden">
        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

        {/* Radar Graphic */}
        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
          {/* Concentric radar circles */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
          <div className="absolute inset-4 rounded-full border border-cyan-500/30" />
          <div className="absolute inset-8 rounded-full border border-cyan-500/40" />
          <div className="absolute inset-12 rounded-full border border-cyan-500/50" />

          {/* Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-cyan-500/20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-[1px] bg-cyan-500/20" />
          </div>

          {/* Radar Sweep Needle */}
          <div className="absolute inset-0 animate-radar-sweep origin-center flex items-center justify-center">
            <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-cyan-200 self-center origin-left translate-x-1/2 shadow-[0_0_10px_#22d3ee]" />
          </div>

          {/* Center pulsating shield */}
          <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] z-10 animate-cyber-pulse">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Text Details */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Radio className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            Active BOLA Scanner Engine
          </div>

          <h3 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
            Scanning Target API Endpoints
          </h3>

          <p className="text-xs text-slate-400 font-mono">
            Calling <span className="text-cyan-400">POST http://localhost:3001/security-tests/bola</span> with target <span className="text-cyan-300">{targetUrl}</span>
          </p>
        </div>

        {/* Active Stage Telemetry Stream */}
        <div className="mt-6 bg-[#060a14] border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> SCANNER TELEMETRY
            </span>
            <span className="text-cyan-400 font-bold">STAGE {stageIndex + 1}/{stages.length}</span>
          </div>

          <div className="text-cyan-300 font-semibold truncate flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="truncate">{stages[stageIndex]}</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
              style={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4 font-mono">
          Evaluating authorization boundaries across synthetic user identities...
        </p>
      </div>
    </div>
  );
};

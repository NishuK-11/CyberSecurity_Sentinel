import React from 'react';
import {
  ShieldAlert,
  Play,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { TargetStatus } from '../types/security';

interface EmptyStateProps {
  onRunScan: () => void;
  isScanning: boolean;
  targetStatus: TargetStatus;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onRunScan,
  isScanning,
  targetStatus,
}) => {
  const isConnected = targetStatus.online && !targetStatus.checking;
  const canScan = isConnected && !isScanning;

  return (
    <div className="bg-[#0c1324] border border-slate-800/90 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
      {/* Background ambient cyber glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber radar badge */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-900/40 border border-cyan-500/40 animate-cyber-pulse" />
        <div className="relative w-full h-full rounded-2xl flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <ShieldAlert className="w-10 h-10 text-cyan-400" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          Autonomous Authorization Testing Engine
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
          Ready for BOLA Security Assessment
        </h2>

        <p className="text-sm text-slate-300 font-sans leading-relaxed">
          The Sentinel scanner will query your configured target backend (<code className="text-cyan-300 font-mono">{targetStatus.targetUrl}</code>), discover registered API endpoints, generate cross-identity test permutations, and evaluate whether object-level authorization is strictly enforced.
        </p>
      </div>

      {/* Architecture Flow Card */}
      <div className="max-w-3xl mx-auto my-8 p-5 bg-[#080d1a] border border-slate-800 rounded-2xl">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-4 font-semibold text-left">
          Scanner Architecture & Execution Flow
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <div className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-mono text-xs font-bold mb-2">
              1
            </div>
            <div className="font-mono text-xs font-bold text-slate-200">
              API Discovery
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Fetches route catalog via <code className="text-cyan-300">GET /__security/routes</code> on target.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <div className="w-6 h-6 rounded-lg bg-blue-950 text-blue-400 border border-blue-500/40 flex items-center justify-center font-mono text-xs font-bold mb-2">
              2
            </div>
            <div className="font-mono text-xs font-bold text-slate-200">
              Resource Mapping
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Extracts booking objects (<code className="text-blue-300">booking-101</code>, <code className="text-blue-300">booking-202</code>) and owners.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <div className="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-mono text-xs font-bold mb-2">
              3
            </div>
            <div className="font-mono text-xs font-bold text-slate-200">
              Identity Matrix
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Permutes test tokens (<code className="text-indigo-300">user-a</code>, <code className="text-indigo-300">user-b</code>, anonymous).
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
            <div className="w-6 h-6 rounded-lg bg-rose-950 text-rose-400 border border-rose-500/40 flex items-center justify-center font-mono text-xs font-bold mb-2">
              4
            </div>
            <div className="font-mono text-xs font-bold text-slate-200">
              Leak Detection
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Detects if unauthorized users receive private tenant objects (HTTP 200 vs 403).
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Action Button (Disabled until connection succeeds) */}
      <div className="flex flex-col items-center justify-center gap-3">
        <button
          onClick={onRunScan}
          disabled={!canScan}
          title={
            !isConnected
              ? 'Target must be connected and reachable before running BOLA scan'
              : 'Execute BOLA scan against connected target'
          }
          className={`px-8 py-3.5 rounded-2xl font-mono text-sm font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${
            !canScan
              ? 'bg-slate-800/60 text-slate-400 border border-slate-800 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] hover:scale-105 active:scale-95'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch First BOLA Scan</span>
        </button>

        {!isConnected && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Target is currently offline. Connect and verify target above before scanning.</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 font-mono mt-4">
        Dispatches <code className="text-cyan-400">POST /security-tests/bola</code> with <code className="text-cyan-400">&#123; "targetUrl": "{targetStatus.targetUrl}" &#125;</code>
      </p>
    </div>
  );
};

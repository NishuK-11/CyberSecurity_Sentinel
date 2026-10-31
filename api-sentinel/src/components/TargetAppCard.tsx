import React from 'react';
import {
  Server,
  Radio,
  RefreshCw,
  Users,
  Database,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { TargetStatus, DiscoveredRouteItem } from '../types/security';

interface TargetAppCardProps {
  targetStatus: TargetStatus;
  onRefresh: () => void;
  discoveredRoutes?: DiscoveredRouteItem[];
  onOpenDiscoveryTab?: () => void;
}

export const TargetAppCard: React.FC<TargetAppCardProps> = ({
  targetStatus,
  onRefresh,
  discoveredRoutes = [],
  onOpenDiscoveryTab,
}) => {
  return (
    <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)] relative overflow-hidden group">
      {/* Top subtle glow bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          targetStatus.online
            ? 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 shadow-[0_0_10px_#10b981]'
            : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 shadow-[0_0_10px_#f43f5e]'
        }`}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-100 font-sans tracking-wide">
                Target Express Application
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                demo-target
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                  targetStatus.online
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : targetStatus.checking
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    targetStatus.online
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : targetStatus.checking
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                  }`}
                />
                {targetStatus.checking
                  ? 'CHECKING...'
                  : targetStatus.online
                  ? 'CONNECTED'
                  : 'DISCONNECTED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
              <span>Base URL:</span>
              <code className="text-cyan-300 bg-slate-900/90 px-1.5 py-0.5 rounded text-[11px] border border-slate-800">
                {targetStatus.targetUrl}
              </code>
              {targetStatus.latencyMs !== undefined && targetStatus.online && (
                <span className="text-slate-400 text-[11px]">
                  ({targetStatus.latencyMs} ms latency)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onRefresh}
            disabled={targetStatus.checking}
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                targetStatus.checking ? 'animate-spin text-cyan-400' : ''
              }`}
            />
            <span>Refresh Target</span>
          </button>
        </div>
      </div>

      {/* Target specs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {/* Route discovery card */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Route Discovery
            </span>
            <span className="text-cyan-400 font-semibold">GET</span>
          </div>
          <div className="font-mono text-xs text-slate-200 truncate bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
            /__security/routes
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Inventory endpoint inspected by BOLA scanner
          </p>
        </div>

        {/* Resource Model */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Resource Scope
            </span>
            <span className="text-blue-400 font-semibold">Booking</span>
          </div>
          <div className="font-mono text-xs text-slate-200 truncate bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
            Ownership field: <span className="text-cyan-300">userId</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Samples: booking-101, booking-202
          </p>
        </div>

        {/* Synthetic Identities */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Test Identities
            </span>
            <span className="text-indigo-400 font-semibold">2 Users</span>
          </div>
          <div className="font-mono text-xs text-slate-200 truncate bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
            <span className="text-cyan-300">user-a</span> (Aarav),{' '}
            <span className="text-cyan-300">user-b</span> (Riya)
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Cross-tenant token permutations
          </p>
        </div>

        {/* Scanner Engine Link */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Auth Schema
            </span>
            <span className="text-amber-400 font-semibold">Bearer</span>
          </div>
          <div className="font-mono text-xs text-slate-200 truncate bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
            Synthetic Token Auth
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Tested: Valid, invalid & cross-tenant
          </p>
        </div>
      </div>

      {/* Discovered routes summary pill bar */}
      {discoveredRoutes.length > 0 && onOpenDiscoveryTab && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-cyan-400 font-semibold">
              {discoveredRoutes.length} Endpoints Discovered:
            </span>
            {discoveredRoutes.map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 truncate max-w-[200px]"
              >
                {r.path}
              </span>
            ))}
          </div>
          <button
            onClick={onOpenDiscoveryTab}
            className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View Route Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

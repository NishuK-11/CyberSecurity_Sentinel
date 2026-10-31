import React from 'react';
import {
  Loader2,
  RefreshCw,
  Shield,
  Server,
  CheckCircle2,
  AlertCircle,
  Menu,
} from 'lucide-react';
import { TargetStatus } from '../types/security';

interface HeaderProps {
  onRunScan: () => void;
  isScanning: boolean;
  targetStatus: TargetStatus;
  onRefreshTarget: () => void;
  lastScanTime?: string;
  isPassed?: boolean;
  hasScanRun: boolean;
  totalFindings: number;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRunScan,
  isScanning,
  targetStatus,
  onRefreshTarget,
  lastScanTime,
  isPassed,
  hasScanRun,
  totalFindings,
  onToggleMobileMenu,
}) => {
  const isConnected = targetStatus.online && !targetStatus.checking;
  const canScan = isConnected && !isScanning;

  return (
    <header className="h-18 border-b border-slate-800/80 bg-[#090e1a]/95 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile trigger & breadcrumb / title */}
      <div className="flex items-center gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
              BOLA SCANNER
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-sm font-semibold text-slate-100 tracking-wide">
              API Security Analytics & Vulnerability Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-mono">
            <span>Scanner: NestJS (Port 3001)</span>
            <span>•</span>
            <span className="truncate max-w-[250px]">
              Target: <strong className="text-cyan-300 font-semibold">{targetStatus.targetUrl}</strong>
            </span>
            {lastScanTime && (
              <>
                <span>•</span>
                <span className="text-slate-400">
                  Last Scan: {new Date(lastScanTime).toLocaleTimeString()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Status indicators & Prominent Run Scan Button */}
      <div className="flex items-center gap-4">
        {/* Target Health quick status */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Target:</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              isConnected
                ? 'text-emerald-400'
                : targetStatus.checking
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : targetStatus.checking
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              }`}
            />
            {targetStatus.checking
              ? 'CONNECTING...'
              : isConnected
              ? 'CONNECTED'
              : 'OFFLINE'}
          </span>
          <button
            onClick={onRefreshTarget}
            disabled={targetStatus.checking}
            title="Refresh target connection status"
            className="p-1 hover:text-cyan-400 text-slate-400 transition-colors ml-1 cursor-pointer"
          >
            <RefreshCw
              className={`w-3 h-3 ${
                targetStatus.checking ? 'animate-spin text-cyan-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Security Posture Status (when scan has run) */}
        {hasScanRun && (
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
              isPassed
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
            }`}
          >
            {isPassed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ALL TESTS PASSED</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>{totalFindings} VULNERABILITY DETECTED</span>
              </>
            )}
          </div>
        )}

        {/* PROMINENT "RUN BOLA SCAN" BUTTON (Disabled until connection succeeds) */}
        <button
          onClick={onRunScan}
          disabled={!canScan}
          title={
            !isConnected
              ? 'Target must be connected before running BOLA scan'
              : 'Execute BOLA scan against connected target'
          }
          className={`relative group px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all duration-300 cursor-pointer overflow-hidden ${
            !canScan
              ? 'bg-slate-800/60 text-slate-400 border border-slate-800 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {canScan && (
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
          )}

          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Scanning API...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 fill-slate-950" />
              <span>Run BOLA Scan</span>
              {isConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950/80 animate-ping" />
              )}
            </>
          )}
        </button>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  Server,
  Link2,
  RefreshCw,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Radio,
  Copy,
  Check,
} from 'lucide-react';
import { TargetStatus, DiscoveredRouteItem } from '../types/security';
import { DEFAULT_TARGET_URL, validateClientTargetUrl } from '../services/api';

interface TargetConfigSectionProps {
  targetStatus: TargetStatus;
  onConnectTarget: (newUrl: string) => void;
  onTestConnection: () => void;
  onRunScan: () => void;
  isScanning: boolean;
  discoveredRoutes: DiscoveredRouteItem[];
}

export const TargetConfigSection: React.FC<TargetConfigSectionProps> = ({
  targetStatus,
  onConnectTarget,
  onTestConnection,
  onRunScan,
  isScanning,
  discoveredRoutes,
}) => {
  const [inputUrl, setInputUrl] = useState<string>(targetStatus.targetUrl || DEFAULT_TARGET_URL);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateClientTargetUrl(inputUrl);
    if (!result.valid || !result.normalizedUrl) {
      setValidationError(result.error || 'Invalid target URL.');
      return;
    }

    setValidationError(null);
    onConnectTarget(result.normalizedUrl);
  };

  const handleQuickPreset = (presetUrl: string) => {
    setInputUrl(presetUrl);
    setValidationError(null);
    onConnectTarget(presetUrl);
  };

  const handleCopyTarget = () => {
    navigator.clipboard.writeText(targetStatus.targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConnected = targetStatus.online && !targetStatus.checking;
  const isChecking = targetStatus.checking;

  return (
    <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)] relative overflow-hidden space-y-5">
      {/* Top subtle status glow indicator */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 ${
          isConnected
            ? 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 shadow-[0_0_12px_#10b981]'
            : isChecking
            ? 'bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500'
            : 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 shadow-[0_0_12px_#f43f5e]'
        }`}
      />

      {/* Header bar of the section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-100 font-sans tracking-wide">
                Target Application Configuration
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                User-Configurable Target
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Specify your authorized target backend for autonomous BOLA security assessment
            </p>
          </div>
        </div>

        {/* Display Currently Selected Target URL & Status Indicator */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 text-[11px]">Selected Target:</span>
            <span className="font-semibold text-cyan-300 truncate max-w-[200px] sm:max-w-[260px]">
              {targetStatus.targetUrl}
            </span>
            <button
              onClick={handleCopyTarget}
              title="Copy active target URL"
              className="text-slate-400 hover:text-cyan-300 p-0.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Status Indicator: Connected / Offline / Checking */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs border ${
              isConnected
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : isChecking
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : isChecking
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
              }`}
            />
            {isChecking ? (
              <span>Connecting...</span>
            ) : isConnected ? (
              <span>Connected</span>
            ) : (
              <span>Offline</span>
            )}
            {isConnected && targetStatus.latencyMs !== undefined && (
              <span className="text-[10px] text-emerald-400/80 font-normal">
                ({targetStatus.latencyMs}ms)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Target Base URL Input Form */}
      <form onSubmit={handleConnectSubmit} className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Link2 className="w-4 h-4 text-cyan-400" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="http://127.0.0.1:4000"
              className="w-full bg-[#080d1a] border border-slate-700/80 hover:border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-400 font-mono focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-colors shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Connect Target Button */}
            <button
              type="submit"
              disabled={isChecking}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connect Target</span>
            </button>

            {/* Test Connection Button */}
            <button
              type="button"
              onClick={onTestConnection}
              disabled={isChecking}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-cyan-400 ${
                  isChecking ? 'animate-spin' : ''
                }`}
              />
              <span>Test Connection</span>
            </button>

            {/* Run BOLA Scan Button (Disabled until connection succeeds!) */}
            <button
              type="button"
              onClick={onRunScan}
              disabled={!isConnected || isScanning}
              title={
                !isConnected
                  ? 'Target must be connected and reachable before running BOLA scan'
                  : 'Execute BOLA scan against connected target'
              }
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                !isConnected || isScanning
                  ? 'bg-slate-800/60 text-slate-400 border border-slate-800 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] active:scale-[0.98]'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 fill-current" />
                  <span>Run BOLA Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono bg-rose-950/40 border border-rose-900/60 px-3 py-1.5 rounded-lg">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Quick presets and helper links */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono text-slate-400 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Quick Presets:</span>
            <button
              type="button"
              onClick={() => handleQuickPreset(DEFAULT_TARGET_URL)}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer transition-colors"
            >
              Demo Express Target ({DEFAULT_TARGET_URL})
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('http://localhost:4000')}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer transition-colors"
            >
              http://localhost:4000
            </button>
          </div>

          {!isConnected && !isChecking && (
            <span className="text-amber-400 font-medium">
              * Connect and verify your target before running BOLA scan
            </span>
          )}
        </div>
      </form>

      {/* Target Discovery Summary & Limitations Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-mono text-xs">
        {/* Status details & route discovery info */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Radio className="w-3.5 h-3.5 text-cyan-400" /> Target Inventory
            </span>
            <span className="text-[10px] text-slate-400">GET /__security/routes</span>
          </div>

          <div className="space-y-1">
            {isConnected ? (
              <div className="text-slate-200 text-xs">
                {discoveredRoutes.length > 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {discoveredRoutes.length} Booking Endpoints Discovered
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Target reachable, but no booking routes mapped yet
                  </span>
                )}
                <div className="text-[11px] text-slate-400 mt-1">
                  Service: <span className="text-cyan-300">{targetStatus.serviceName || 'active'}</span> • Scope: Bookings
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  {targetStatus.error || 'Target not reachable on specified URL. Start backend server.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scanner Requirements & Scope Notice */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Target Compatibility Notice</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            This scanner tests BOLA on booking endpoints (<code className="text-cyan-300">GET /.../bookings/:id</code>) using synthetic fixtures. Ensure your target exports <code className="text-cyan-300">GET /__security/routes</code> declaring resource IDs.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  AlertOctagon,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  Server,
} from 'lucide-react';

interface ErrorAlertProps {
  error: string;
  statusCode?: number;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  statusCode,
  onRetry,
  isRetrying = false,
}) => {
  const [copiedTarget, setCopiedTarget] = React.useState(false);
  const [copiedNest, setCopiedNest] = React.useState(false);

  const copyCommand = (cmd: string, type: 'target' | 'nest') => {
    navigator.clipboard.writeText(cmd);
    if (type === 'target') {
      setCopiedTarget(true);
      setTimeout(() => setCopiedTarget(false), 2000);
    } else {
      setCopiedNest(true);
      setTimeout(() => setCopiedNest(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-950/50 via-[#1e0d19] to-[#0c1324] border border-rose-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(244,63,94,0.15)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-950 border border-rose-500/60 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40">
                {statusCode ? `HTTP ${statusCode}` : 'SCAN FAILED'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Scanner Communication Error
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 font-sans tracking-wide mt-1">
              Unable to Complete Security Scan
            </h3>
            <p className="text-xs text-rose-200/90 font-mono mt-1 leading-relaxed bg-[#060a14] p-3 rounded-lg border border-rose-900/50">
              {error}
            </p>
          </div>
        </div>

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="px-4 py-2 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-500/60 font-mono text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-md self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>Retry Scan</span>
        </button>
      </div>

      {/* Troubleshooting guide */}
      <div className="pt-3 border-t border-rose-900/40 space-y-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold block">
          Quick Diagnostic & Resolution Steps:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {/* Target Express resolution */}
          <div className="bg-[#070b16] border border-slate-800 p-3 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Server className="w-3.5 h-3.5" /> 1. Start Target App (Port 4000)
              </span>
              <button
                onClick={() =>
                  copyCommand('cd normal_backend && node server.js', 'target')
                }
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
              >
                {copiedTarget ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <code className="block bg-slate-950 text-slate-200 p-2 rounded border border-slate-800/80 text-[11px] select-all">
              cd normal_backend && node server.js
            </code>
          </div>

          {/* NestJS backend resolution */}
          <div className="bg-[#070b16] border border-slate-800 p-3 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Terminal className="w-3.5 h-3.5" /> 2. Start NestJS Scanner (Port 3001)
              </span>
              <button
                onClick={() =>
                  copyCommand(
                    '$env:PORT="3001"; npm --prefix api_backend run start',
                    'nest'
                  )
                }
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
              >
                {copiedNest ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <code className="block bg-slate-950 text-slate-200 p-2 rounded border border-slate-800/80 text-[11px] select-all">
              $env:PORT="3001"; npm --prefix api_backend run start
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

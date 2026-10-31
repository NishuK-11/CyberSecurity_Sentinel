import React from 'react';
import {
  History,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ScanHistoryRecord, BolaScanResponse } from '../types/security';

interface ScanHistoryViewProps {
  history: ScanHistoryRecord[];
  onLoadScan: (scanData: BolaScanResponse) => void;
  onClearHistory: () => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  history,
  onLoadScan,
  onClearHistory,
}) => {
  return (
    <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg space-y-4 p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans tracking-wide">
              Scan Audit History
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Historical BOLA scan execution logs stored locally
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/60 font-mono text-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-mono space-y-2">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No Scan History Recorded</p>
          <p className="text-xs text-slate-400">
            Past BOLA scan results will appear here automatically when you execute scans.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/70 font-mono text-xs">
          {history.map((record, index) => {
            const scan = record.data;
            const isPassed = scan.passed;
            const dateStr = new Date(record.timestamp).toLocaleString();

            return (
              <div
                key={record.id || index}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isPassed
                        ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                        : 'bg-rose-950 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                          isPassed
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-950 text-rose-300 border-rose-500/50'
                        }`}
                      >
                        {isPassed ? 'POSTURE PASS' : 'VULNERABILITY DETECTED'}
                      </span>
                      <span className="text-slate-300 font-semibold text-xs">
                        BOLA Scan ({scan.totalTests} Tests)
                      </span>
                      {(record.targetUrl || scan.targetUrl) && (
                        <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80">
                          {record.targetUrl || scan.targetUrl}
                        </span>
                      )}
                      {record.durationMs && (
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {record.durationMs}ms
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{scan.passedTests} Passed</span>
                      <span>•</span>
                      <span
                        className={
                          scan.failedTests > 0
                            ? 'text-rose-400 font-semibold'
                            : 'text-slate-400'
                        }
                      >
                        {scan.failedTests} Failed
                      </span>
                      <span>•</span>
                      <span
                        className={
                          scan.totalFindings > 0
                            ? 'text-rose-400 font-bold'
                            : 'text-emerald-400'
                        }
                      >
                        {scan.totalFindings} Findings
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onLoadScan(scan)}
                  className="self-end sm:self-auto px-3.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Load Results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  Route,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { BolaScanResponse } from '../types/security';

interface StatsOverviewProps {
  scanData: BolaScanResponse;
  durationMs?: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  scanData,
  durationMs,
}) => {
  const passRate =
    scanData.totalTests > 0
      ? Math.round((scanData.passedTests / scanData.totalTests) * 100)
      : 0;

  const statCards = [
    {
      title: 'Discovered Routes',
      value: scanData.discoveredRoutes,
      subtitle: 'API endpoints cataloged',
      icon: Route,
      iconColor: 'text-cyan-400',
      badge: 'Active API Scope',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
      borderColor: 'border-slate-800 hover:border-cyan-500/40',
      bgGradient: 'from-cyan-950/20 to-transparent',
    },
    {
      title: 'Identified Resources',
      value: scanData.identifiedResources,
      subtitle: 'Synthetic booking entities',
      icon: Database,
      iconColor: 'text-blue-400',
      badge: 'Test Fixtures',
      badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-500/30',
      borderColor: 'border-slate-800 hover:border-blue-500/40',
      bgGradient: 'from-blue-950/20 to-transparent',
    },
    {
      title: 'Total Tests',
      value: scanData.totalTests,
      subtitle: 'Identity permutation matrix',
      icon: Activity,
      iconColor: 'text-indigo-400',
      badge: `${durationMs ? durationMs + 'ms' : 'Executed'}`,
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30',
      borderColor: 'border-slate-800 hover:border-indigo-500/40',
      bgGradient: 'from-indigo-950/20 to-transparent',
    },
    {
      title: 'Passed Tests',
      value: scanData.passedTests,
      subtitle: `${passRate}% authorization verified`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      badge: 'Protected',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
      borderColor: 'border-slate-800 hover:border-emerald-500/40',
      bgGradient: 'from-emerald-950/20 to-transparent',
    },
    {
      title: 'Failed Tests',
      value: scanData.failedTests,
      subtitle:
        scanData.failedTests > 0
          ? 'Access control violations'
          : 'Zero failures detected',
      icon: XCircle,
      iconColor: scanData.failedTests > 0 ? 'text-rose-400' : 'text-slate-500',
      badge: scanData.failedTests > 0 ? 'Critical Breach' : 'Clean',
      badgeColor:
        scanData.failedTests > 0
          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 animate-pulse'
          : 'bg-slate-900 text-slate-400 border-slate-700',
      borderColor:
        scanData.failedTests > 0
          ? 'border-rose-900/60 hover:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
          : 'border-slate-800',
      bgGradient:
        scanData.failedTests > 0
          ? 'from-rose-950/30 to-transparent'
          : 'from-slate-900/40 to-transparent',
    },
    {
      title: 'Total Findings',
      value: scanData.totalFindings,
      subtitle: 'Confirmed BOLA vulnerabilities',
      icon: AlertTriangle,
      iconColor: scanData.totalFindings > 0 ? 'text-rose-400' : 'text-emerald-400',
      badge: scanData.totalFindings > 0 ? 'Action Required' : 'Secure',
      badgeColor:
        scanData.totalFindings > 0
          ? 'bg-rose-950 text-rose-300 border-rose-500/50'
          : 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      borderColor:
        scanData.totalFindings > 0
          ? 'border-rose-800/80 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
          : 'border-slate-800',
      bgGradient:
        scanData.totalFindings > 0
          ? 'from-rose-950/40 via-red-950/20 to-transparent'
          : 'from-emerald-950/20 to-transparent',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Dynamic Security Posture Banner */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg ${
          scanData.passed
            ? 'bg-gradient-to-r from-emerald-950/60 via-[#0d1c24] to-[#0a1322] border-emerald-500/40 text-emerald-200'
            : 'bg-gradient-to-r from-rose-950/70 via-[#1e0f19] to-[#0d1424] border-rose-500/50 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              scanData.passed
                ? 'bg-emerald-900/40 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-rose-900/40 border-rose-500/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
            }`}
          >
            {scanData.passed ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  scanData.passed
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-rose-950 border-rose-500 text-rose-300'
                }`}
              >
                {scanData.passed ? 'POSTURE: PASS' : 'POSTURE: FAIL (VULNERABLE)'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Scan Protocol: OWASP BOLA / IDOR
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1 font-sans">
              {scanData.passed
                ? 'All Object-Level Authorization Controls Verified'
                : `${scanData.totalFindings} Critical Broken Object Level Authorization Breach(es) Found`}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {scanData.passed
                ? 'The tested endpoints rigorously validated resource ownership. Non-owners were rejected with 403 Forbidden.'
                : 'Unauthorized users successfully accessed private booking data belonging to other tenants without proper ownership validation.'}
            </p>
          </div>
        </div>

        {/* Quick summary stats pill */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 shrink-0 font-mono">
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Pass Rate: </span>
            <span
              className={`font-bold text-sm ${
                passRate === 100
                  ? 'text-emerald-400'
                  : passRate > 75
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {passRate}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {scanData.passedTests}/{scanData.totalTests} tests succeeded
          </div>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-gradient-to-b ${card.bgGradient} bg-[#0c1324] border ${card.borderColor} rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-xs text-slate-400 font-medium truncate">
                  {card.title}
                </span>
                <Icon className={`w-4 h-4 shrink-0 ${card.iconColor}`} />
              </div>

              <div className="flex items-baseline gap-2 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">
                  {card.value}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 truncate text-[11px]">
                  {card.subtitle}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Network,
  Activity,
  AlertTriangle,
  History,
  Radio,
  Server,
  Lock,
} from 'lucide-react';
import { NavTab, TargetStatus } from '../types/security';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  targetStatus: TargetStatus;
  totalFindings: number;
  totalRoutes: number;
  totalTests: number;
  historyCount: number;
  isScanning: boolean;
  onRunScan: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  targetStatus,
  totalFindings,
  totalRoutes,
  totalTests,
  historyCount,
  isScanning,
  onRunScan,
}) => {
  const isConnected = targetStatus.online && !targetStatus.checking;
  const canScan = isConnected && !isScanning;

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'discovery',
      label: 'API Discovery',
      icon: Network,
      badge: totalRoutes > 0 ? totalRoutes : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'scans',
      label: 'Security Scans',
      icon: Activity,
      badge: totalTests > 0 ? totalTests : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'findings',
      label: 'Vulnerability Findings',
      icon: AlertTriangle,
      badge: totalFindings > 0 ? totalFindings : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
    },
    {
      id: 'history',
      label: 'Scan History',
      icon: History,
      badge: historyCount > 0 ? historyCount : undefined,
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-indigo-900/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0f1d]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-sm text-slate-100 uppercase">
                SENTINEL
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">
              BOLA Security Engine
            </p>
          </div>
        </div>
      </div>

      {/* Target status indicator pill */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-[#0d1424]/50">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5 font-medium text-[11px] uppercase tracking-wider text-slate-400">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            Target Node
          </span>
          <span
            className={`flex items-center gap-1 text-[11px] font-mono font-medium ${
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
                  : 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
              }`}
            />
            {targetStatus.checking
              ? 'CONNECTING'
              : isConnected
              ? 'CONNECTED'
              : 'OFFLINE'}
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-300 truncate bg-slate-900/60 px-2 py-1 rounded border border-slate-800/80 flex items-center justify-between" title={targetStatus.targetUrl}>
          <span className="text-cyan-300 truncate">{targetStatus.targetUrl}</span>
          {targetStatus.latencyMs !== undefined && isConnected && (
            <span className="text-[10px] text-slate-500 shrink-0 ml-1">
              {targetStatus.latencyMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Security Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Scan Action in Sidebar */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0c1222]/40">
        <button
          onClick={onRunScan}
          disabled={!canScan}
          title={
            !isConnected
              ? 'Connect target before scanning'
              : 'Run BOLA scan against target'
          }
          className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-bold tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer ${
            !canScan
              ? 'bg-slate-800/60 text-slate-400 border border-slate-800 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98]'
          }`}
        >
          {isScanning ? (
            <>
              <Radio className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Scanning API...</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4" />
              <span>Run BOLA Scan</span>
            </>
          )}
        </button>

        <div className="mt-3 p-2.5 rounded bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-400 font-mono text-text-xs mb-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" /> OWASP TOP 10
            </span>
            <span className="text-rose-400 font-bold">API1:2023</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Validating Broken Object Level Authorization across booking objects.
          </p>
        </div>
      </div>
    </aside>
  );
};

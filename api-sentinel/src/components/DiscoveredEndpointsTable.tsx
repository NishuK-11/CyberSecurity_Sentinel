import React from 'react';
import {
  Route,
  ShieldCheck,
  ShieldAlert,
  Database,
  ChevronRight,
  Lock,
  Unlock,
} from 'lucide-react';
import { DiscoveredRouteItem, ScanResultItem } from '../types/security';

interface DiscoveredEndpointsTableProps {
  routes: DiscoveredRouteItem[];
  scanResults?: ScanResultItem[];
  onFilterByEndpoint?: (endpoint: string) => void;
}

export const DiscoveredEndpointsTable: React.FC<DiscoveredEndpointsTableProps> = ({
  routes,
  scanResults = [],
  onFilterByEndpoint,
}) => {
  // Correlate route with scan results to determine posture
  const getRoutePosture = (routePath: string) => {
    if (!scanResults || scanResults.length === 0) {
      return { status: 'UNSCANNED', vulnerableCount: 0, testCount: 0 };
    }

    const prefix = routePath.split('/:id')[0];
    const matchingTests = scanResults.filter(
      (r) => r.endpoint.startsWith(prefix) || routePath.includes(r.endpoint)
    );

    const vulnerableCount = matchingTests.filter(
      (t) => t.vulnerabilityDetected || !t.passed
    ).length;

    if (matchingTests.length === 0) {
      return { status: 'UNSCANNED', vulnerableCount: 0, testCount: 0 };
    }

    if (vulnerableCount > 0) {
      return { status: 'VULNERABLE', vulnerableCount, testCount: matchingTests.length };
    }

    return { status: 'SECURE', vulnerableCount: 0, testCount: matchingTests.length };
  };

  const displayRoutes: DiscoveredRouteItem[] =
    routes.length > 0
      ? routes
      : Array.from(
          new Set(
            scanResults.map((r) => {
              if (r.endpoint.includes('/vulnerable/bookings/')) {
                return '/vulnerable/bookings/:id';
              }
              if (r.endpoint.includes('/secure/bookings/')) {
                return '/secure/bookings/:id';
              }
              return r.endpoint;
            })
          )
        ).map((path) => ({
          method: 'GET',
          path,
          resourceType: 'booking',
          ownershipField: 'userId',
          sampleIds: ['booking-101', 'booking-202'],
        }));

  return (
    <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
      <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans tracking-wide">
              Discovered API Endpoints Inventory
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Endpoints retrieved from target catalog (GET /__security/routes)
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300">
            {displayRoutes.length} Discovered Endpoints
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#090e1a] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 font-semibold">Method</th>
              <th className="py-3 px-4 font-semibold">Endpoint Path</th>
              <th className="py-3 px-4 font-semibold">Resource Type</th>
              <th className="py-3 px-4 font-semibold">Ownership Field</th>
              <th className="py-3 px-4 font-semibold">Sample Entities</th>
              <th className="py-3 px-4 font-semibold">Security Posture</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {displayRoutes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 font-mono">
                  No discovered routes found. Run the BOLA scan to discover target endpoints.
                </td>
              </tr>
            ) : (
              displayRoutes.map((route, index) => {
                const posture = getRoutePosture(route.path);
                const isVulnerable = posture.status === 'VULNERABLE';
                const isSecure = posture.status === 'SECURE';

                return (
                  <tr
                    key={index}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      isVulnerable
                        ? 'bg-rose-950/10'
                        : isSecure
                        ? 'bg-emerald-950/10'
                        : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        {route.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {isVulnerable ? (
                          <Unlock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : isSecure ? (
                          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Route className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span
                          className={
                            isVulnerable
                              ? 'text-rose-300'
                              : isSecure
                              ? 'text-emerald-300'
                              : 'text-slate-200'
                          }
                        >
                          {route.path}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3 text-slate-400" />
                        {route.resourceType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-[11px]">
                        {route.ownershipField}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {route.sampleIds?.map((id, idIdx) => (
                          <span
                            key={idIdx}
                            className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]"
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isVulnerable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse">
                          <ShieldAlert className="w-3 h-3" />
                          VULNERABLE (BOLA)
                        </span>
                      ) : isSecure ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                          <ShieldCheck className="w-3 h-3" />
                          SECURE (PASS)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                          PENDING SCAN
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {onFilterByEndpoint && (
                        <button
                          onClick={() => {
                            const prefix = route.path.split('/:id')[0];
                            onFilterByEndpoint(prefix);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 ml-auto hover:underline cursor-pointer"
                        >
                          <span>Filter Tests</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

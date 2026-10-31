import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Search,
  ShieldAlert,
  Eye,
  User,
} from 'lucide-react';
import { ScanResultItem, Finding } from '../types/security';

interface TestResultsTableProps {
  results: ScanResultItem[];
  onSelectFinding?: (finding: Finding, result?: ScanResultItem) => void;
  initialFilterEndpoint?: string;
}

export const TestResultsTable: React.FC<TestResultsTableProps> = ({
  results,
  onSelectFinding,
  initialFilterEndpoint = '',
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>(initialFilterEndpoint);

  const filteredResults = results.filter((item) => {
    if (statusFilter === 'PASSED' && !item.passed) return false;
    if (statusFilter === 'FAILED' && item.passed) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesName = item.testName.toLowerCase().includes(q);
      const matchesEndpoint = item.endpoint.toLowerCase().includes(q);
      const matchesIdentity = item.testedIdentity.toLowerCase().includes(q);
      const matchesResource = item.resource.toLowerCase().includes(q);
      return matchesName || matchesEndpoint || matchesIdentity || matchesResource;
    }

    return true;
  });

  const totalCount = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return (
    <div className="bg-[#0c1324] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 font-sans tracking-wide">
              Security Test Execution Matrix
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              {totalCount} Total Tests
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Every identity permutation tested against discovered booking objects
          </p>
        </div>

        {/* Filter and search bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('PASSED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'PASSED'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Passed ({passedCount})
            </button>
            <button
              onClick={() => setStatusFilter('FAILED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'FAILED'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <XCircle className="w-3 h-3 text-rose-400" />
              Failed ({failedCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search test, endpoint, identity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 font-mono transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#090e1a] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Test Name</th>
              <th className="py-3 px-4 font-semibold">Endpoint</th>
              <th className="py-3 px-4 font-semibold">Tested Identity</th>
              <th className="py-3 px-4 font-semibold">Resource</th>
              <th className="py-3 px-4 font-semibold">Expected Status</th>
              <th className="py-3 px-4 font-semibold">Actual Status</th>
              <th className="py-3 px-4 font-semibold text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400 font-mono">
                  {results.length === 0
                    ? 'No scan test results loaded. Run a scan to see execution data.'
                    : 'No tests match current filter criteria.'}
                </td>
              </tr>
            ) : (
              filteredResults.map((item, index) => {
                const isPass = item.passed;
                const isFail = !item.passed;
                const hasFinding = !!item.finding;

                return (
                  <tr
                    key={index}
                    onClick={() => {
                      if (item.finding && onSelectFinding) {
                        onSelectFinding(item.finding, item);
                      }
                    }}
                    className={`transition-colors cursor-pointer group ${
                      isFail
                        ? 'bg-rose-950/15 hover:bg-rose-950/30'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isPass ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-950/90 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse">
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          FAIL
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[280px] font-sans font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {item.testName}
                        </span>
                        {item.vulnerabilityDetected && (
                          <span className="text-[10px] text-rose-400 font-mono mt-0.5 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Unauthorized Object Leak
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded border text-[11px] ${
                          isFail
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        {item.endpoint}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        <User className="w-3 h-3 text-cyan-400" />
                        <span className="font-semibold text-cyan-300">
                          {item.testedIdentity}
                        </span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                        {item.resource}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {Array.isArray(item.expectedStatuses)
                          ? item.expectedStatuses.join(', ')
                          : item.expectedStatuses}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded font-bold text-[11px] border ${
                          item.actualStatus === 200
                            ? isPass
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border-rose-500/50'
                            : item.actualStatus === 403
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : item.actualStatus === 401
                            ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                            : 'bg-slate-900 text-slate-300 border-slate-800'
                        }`}
                      >
                        HTTP {item.actualStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      {hasFinding ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.finding && onSelectFinding) {
                              onSelectFinding(item.finding, item);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/50 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Finding</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Passed</span>
                        </span>
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

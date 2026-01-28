import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Download,
  ShieldAlert
} from 'lucide-react';
import { AdminConfig } from './AdminConfig';
import { Nomination, Member, Position, CandidacyResponse, CandidacyStatus, ElectionSettings } from '../types';

interface CommitteePortalProps {
  nominations: Nomination[];
  members: Member[];
  positions: Position[];
  onReview: (nominationId: string, status: 'APPROVED' | 'REJECTED') => void;
  candidacyResponses: CandidacyResponse[];
  settings: ElectionSettings | null;
  onUpdateSettings: (settings: ElectionSettings) => void;
}

export const CommitteePortal: React.FC<CommitteePortalProps> = ({
  nominations,
  members,
  positions,
  onReview,
  candidacyResponses,
  settings,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'NOMINATIONS' | 'CANDIDATES' | 'REPORT' | 'BALLOT_STATUS'>('NOMINATIONS');

  // -- Nominations State --
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // -- Candidate Vetting State (Local MVP) --
  const [disqualifiedCandidates, setDisqualifiedCandidates] = useState<Set<string>>(new Set());

  // -- Report Drilldown State --
  const [expandedPositionId, setExpandedPositionId] = useState<string | null>(null);

  // -- Ballot Preview State --
  const [showPreview, setShowPreview] = useState(false);

  // --------------------------------------------------------------------------
  // Tab 1: Nominations Logic
  // --------------------------------------------------------------------------
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredNominations = nominations.filter(n => {
    const nominee = members.find(m => m.id === n.nomineeId);
    const nominator = members.find(m => m.id === n.nominatorId);
    const matchesSearch =
      nominee?.name.toLowerCase().includes(search.toLowerCase()) ||
      nominator?.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || n.reviewStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const sortedNominations = React.useMemo(() => {
    if (!sortConfig) return filteredNominations;

    // Filter out candidate-specific keys when in Nominations tab to be safe, 
    // although activeTab check in UI prevents invoking wrong sort usually.
    // However, sortConfig is shared. 
    // If activeTab is NOMINATIONS, we only sort if key matches a nomination column.
    const nomKeys = ['nominee', 'position', 'nominator', 'status', 'date'];
    if (!nomKeys.includes(sortConfig.key)) return filteredNominations;

    return [...filteredNominations].sort((a, b) => {
      const nomineeA = members.find(m => m.id === a.nomineeId)?.name || '';
      const nomineeB = members.find(m => m.id === b.nomineeId)?.name || '';
      const nominatorA = members.find(m => m.id === a.nominatorId)?.name || '';
      const nominatorB = members.find(m => m.id === b.nominatorId)?.name || '';
      const positionA = positions.find(p => p.id === a.positionId)?.title || '';
      const positionB = positions.find(p => p.id === b.positionId)?.title || '';

      let valA: any = '';
      let valB: any = '';

      switch (sortConfig.key) {
        case 'nominee': valA = nomineeA; valB = nomineeB; break;
        case 'position': valA = positionA; valB = positionB; break;
        case 'nominator': valA = nominatorA; valB = nominatorB; break;
        case 'status': valA = a.reviewStatus; valB = b.reviewStatus; break;
        case 'date': valA = a.timestamp; valB = b.timestamp; break;
        default: return 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredNominations, sortConfig, members, positions]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <span className="opacity-0 group-hover:opacity-50 ml-1">↕</span>;
    return <span className="ml-1 text-blue-400">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  // --------------------------------------------------------------------------
  // Tab 2: Candidates Logic
  // --------------------------------------------------------------------------
  const candidateStats = React.useMemo(() => {
    const map = new Map<string, { member: Member, positions: Map<string, number> }>();

    nominations.filter(n => n.reviewStatus === 'APPROVED').forEach(n => {
      const member = members.find(m => m.id === n.nomineeId);
      if (!member) return;

      if (!map.has(n.nomineeId)) {
        map.set(n.nomineeId, { member, positions: new Map() });
      }

      const entry = map.get(n.nomineeId)!;
      const currentCount = entry.positions.get(n.positionId) || 0;
      entry.positions.set(n.positionId, currentCount + 1);
    });

    return Array.from(map.values()).flatMap(entry => {
      return Array.from(entry.positions.entries()).map(([posId, count]) => {
        const pos = positions.find(p => p.id === posId);
        const isOriginallyQualified = count >= 2;
        const isDisqualified = disqualifiedCandidates.has(`${entry.member.id}-${posId}`);
        return {
          id: `${entry.member.id}-${posId}`,
          member: entry.member,
          position: pos,
          count,
          isOriginallyQualified,
          status: isDisqualified ? 'DISQUALIFIED' : (isOriginallyQualified ? 'QUALIFIED' : 'INSUFFICIENT_NOMS')
        };
      });
    });
  }, [nominations, members, positions, disqualifiedCandidates]);

  const sortedCandidates = React.useMemo(() => {
    const candKeys = ['candidate', 'position', 'count', 'status'];
    if (!sortConfig || !candKeys.includes(sortConfig.key)) return candidateStats;

    return [...candidateStats].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortConfig.key) {
        case 'candidate': valA = a.member.name; valB = b.member.name; break;
        case 'position': valA = a.position?.title || ''; valB = b.position?.title || ''; break;
        case 'count': valA = a.count; valB = b.count; break;
        case 'status': valA = a.status; valB = b.status; break;
        default: return 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [candidateStats, sortConfig]);

  const toggleCandidateStatus = (candidateKey: string) => {
    const newSet = new Set(disqualifiedCandidates);
    if (newSet.has(candidateKey)) {
      newSet.delete(candidateKey);
    } else {
      newSet.add(candidateKey);
    }
    setDisqualifiedCandidates(newSet);
  };

  // --------------------------------------------------------------------------
  // Tab 3: Report & Engagement Logic
  // --------------------------------------------------------------------------
  const reportStats = React.useMemo(() => {
    // Basic Stats
    const total = nominations.length;
    const spoiled = nominations.filter(n => n.reviewStatus === 'REJECTED').length;
    const approved = nominations.filter(n => n.reviewStatus === 'APPROVED').length;
    const pending = nominations.filter(n => n.reviewStatus === 'PENDING').length;

    // Position Breakdown
    const positionBreakdown = positions.map(p => {
      const noms = nominations.filter(n => n.positionId === p.id);
      const approvedCount = noms.filter(n => n.reviewStatus === 'APPROVED').length;

      const candidateMap = new Map<string, number>();
      noms.filter(n => n.reviewStatus === 'APPROVED').forEach(n => {
        candidateMap.set(n.nomineeId, (candidateMap.get(n.nomineeId) || 0) + 1);
      });

      const qualifiedCandidatesData = Array.from(candidateMap.entries())
        .filter(([_, count]) => count >= 2)
        .map(([memberId, count]) => {
          const member = members.find(m => m.id === memberId);
          const isDisqualified = disqualifiedCandidates.has(`${memberId}-${p.id}`);
          return {
            id: memberId,
            name: member?.name || 'Unknown',
            count,
            isDisqualified
          };
        })
        .filter(c => !c.isDisqualified); // Only show qualified actively

      return {
        id: p.id,
        title: p.title,
        total: noms.length,
        approved: approvedCount,
        qualifiedCandidates: qualifiedCandidatesData
      };
    });

    // Engagement Analysis
    const nominatorMap = new Map<string, { total: number, positions: Set<string>, duplicates: boolean }>();

    nominations.forEach(n => {
      if (!nominatorMap.has(n.nominatorId)) {
        nominatorMap.set(n.nominatorId, { total: 0, positions: new Set(), duplicates: false });
      }
      const entry = nominatorMap.get(n.nominatorId)!;
      entry.total += 1;
      if (entry.positions.has(n.positionId)) {
        entry.duplicates = true;
      }
      entry.positions.add(n.positionId);
    });

    let fullNominators = 0;
    let partialNominators = 0;
    let mistakenNominators = 0;
    const totalNominators = nominatorMap.size;
    const totalMembers = members.length; // Assuming 'members' list is the full club list
    const participationRate = totalMembers > 0 ? Math.round((totalNominators / totalMembers) * 100) : 0;

    nominatorMap.forEach((data) => {
      if (data.duplicates) {
        mistakenNominators++;
      } else if (data.positions.size === positions.length) {
        fullNominators++;
      } else {
        partialNominators++;
      }
    });

    return {
      total, spoiled, approved, pending, positionBreakdown,
      participation: {
        rate: participationRate,
        totalNominators,
        totalMembers,
        fullNominators,
        partialNominators,
        mistakenNominators
      }
    };
  }, [nominations, positions, members, disqualifiedCandidates]);

  const downloadReport = () => {
    // Generate CSV content
    const headers = ['Metric', 'Value'];
    const rows: (string | number)[][] = [
      ['Total Nominations', reportStats.total],
      ['Approved Nominations', reportStats.approved],
      ['Spoilt / Rejected', reportStats.spoiled],
      ['Pending Review', reportStats.pending],
      ['', ''],
      ['Engagement Analysis', ''],
      ['Total Members', reportStats.participation.totalMembers],
      ['Participating Members', reportStats.participation.totalNominators],
      ['Participation Rate', `${reportStats.participation.rate}%`],
      ['Full Nominations (All Positions)', reportStats.participation.fullNominators],
      ['Partial Nominations', reportStats.participation.partialNominators],
      ['Mistaken (Duplicate) Nominations', reportStats.participation.mistakenNominators],
      ['', ''],
      ['Position Breakdown', ''],
      ['Position', 'Total Noms', 'Approved Noms', 'Qualified Candidates List (Separated by |)'],
      ...reportStats.positionBreakdown.map(p => [
        p.title,
        p.total,
        p.approved,
        p.qualifiedCandidates.map(c => `${c.name} (${c.count})`).join(" | ")
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nomination_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center">
            <ShieldAlert size={24} className="mr-2 text-blue-500" />
            Committee Portal
          </h2>
          <p className="text-sm text-slate-400 font-medium">Review nominations, approve candidates, and generate reports.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {(['NOMINATIONS', 'CANDIDATES', 'REPORT', 'BALLOT_STATUS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSortConfig(null); }}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'NOMINATIONS' && (
        <>
          {/* Filters & Search */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search nominee or nominator..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-slate-200 placeholder:text-slate-600 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 px-3 border border-slate-800 rounded-lg bg-slate-950">
              <Filter size={16} className="text-slate-500" />
              <select
                className="text-sm border-none focus:ring-0 bg-transparent font-medium text-slate-400 cursor-pointer py-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="ALL">All Entries</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Nominations Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                    <th className="px-6 py-4">
                      <span className="cursor-pointer hover:text-slate-300 transition-colors group inline-flex items-center" onClick={() => handleSort('nominee')}>
                        Nominee <SortIcon columnKey="nominee" />
                      </span>
                      <span className="mx-2 text-slate-600">/</span>
                      <span className="cursor-pointer hover:text-slate-300 transition-colors group inline-flex items-center" onClick={() => handleSort('position')}>
                        Position <SortIcon columnKey="position" />
                      </span>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-slate-300 group transition-colors" onClick={() => handleSort('nominator')}>
                      Nominator <SortIcon columnKey="nominator" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-slate-300 group transition-colors" onClick={() => handleSort('status')}>
                      Status <SortIcon columnKey="status" />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-slate-300 group transition-colors" onClick={() => handleSort('date')}>
                      Date <SortIcon columnKey="date" />
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sortedNominations.map(n => {
                    const nominee = members.find(m => m.id === n.nomineeId);
                    const nominator = members.find(m => m.id === n.nominatorId);
                    const pos = positions.find(p => p.id === n.positionId);

                    return (
                      <tr key={n.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-200">{nominee?.name}</div>
                          <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{pos?.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-400 font-medium">{nominator?.name}</div>
                          <div className="text-[10px] text-slate-600 font-semibold">{n.isSelfNomination ? 'SELF' : 'MEMBER'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${n.reviewStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                            n.reviewStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                            {n.reviewStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                          {new Date(n.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {n.reviewStatus === 'PENDING' ? (
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => onReview(n.id, 'APPROVED')}
                                className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => onReview(n.id, 'REJECTED')}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </div>
                          ) : (
                            <button className="p-2 text-slate-600 hover:bg-slate-800 rounded-lg transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {sortedNominations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm italic">
                        No records found for the current selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'CANDIDATES' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-bold text-slate-100">Candidate Approval</h3>
            <p className="text-xs text-slate-400 mt-1">Vet candidates based on nomination threshold (min. 2) and good standing status.</p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="px-6 py-4 cursor-pointer hover:text-slate-300 group transition-colors" onClick={() => handleSort('candidate')}>
                  Candidate <SortIcon columnKey="candidate" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-300 group transition-colors" onClick={() => handleSort('position')}>
                  Position <SortIcon columnKey="position" />
                </th>
                <th className="px-6 py-4 text-center cursor-pointer hover:text-slate-300 group transition-colors" onClick={() => handleSort('count')}>
                  Approved Noms <SortIcon columnKey="count" />
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-300 group transition-colors" onClick={() => handleSort('status')}>
                  Eligibility Status <SortIcon columnKey="status" />
                </th>
                <th className="px-6 py-4 text-right">Committee Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedCandidates.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-200">{c.member.name}</div>
                    <div className="text-[10px] text-slate-500">{c.member.rotaryId}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">{c.position?.title}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-300">{c.count}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.status === 'QUALIFIED' ? 'bg-emerald-500/10 text-emerald-400' :
                      c.status === 'DISQUALIFIED' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleCandidateStatus(c.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${c.status === 'DISQUALIFIED'
                        ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-900/20 hover:text-emerald-400 hover:border-emerald-800'
                        : 'bg-red-900/10 text-red-400 border-red-900/20 hover:bg-red-900/20'
                        }`}
                    >
                      {c.status === 'DISQUALIFIED' ? 'Restore Qualification' : 'Disqualify'}
                    </button>
                  </td>
                </tr>
              ))}
              {sortedCandidates.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 text-sm">No approved candidates found to vet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'REPORT' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-100">Election Statistics</h3>
            <button onClick={downloadReport} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors">
              <Download size={16} />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Engagement Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Participation</h4>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-white">{reportStats.participation.rate}%</span>
                <span className="text-slate-500">of membership</span>
              </div>
              <div className="mt-2 text-sm text-slate-500">
                {reportStats.participation.totalNominators} active nominators out of {reportStats.participation.totalMembers} members.
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Quality of Nominations</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400 font-medium">Full Lists (All Positions)</span>
                  <span className="text-slate-200 font-bold">{reportStats.participation.fullNominators}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Partial Lists</span>
                  <span className="text-slate-200 font-bold">{reportStats.participation.partialNominators}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400 font-medium">Mistaken / Duplicates</span>
                  <span className="text-slate-200 font-bold">{reportStats.participation.mistakenNominators}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex mt-2">
                  <div className="bg-emerald-500" style={{ width: `${(reportStats.participation.fullNominators / reportStats.participation.totalNominators) * 100}%` }}></div>
                  <div className="bg-slate-600" style={{ width: `${(reportStats.participation.partialNominators / reportStats.participation.totalNominators) * 100}%` }}></div>
                  <div className="bg-red-500" style={{ width: `${(reportStats.participation.mistakenNominators / reportStats.participation.totalNominators) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* General Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Nominations</div>
              <div className="text-2xl font-bold text-slate-100">{reportStats.total}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Approved</div>
              <div className="text-2xl font-bold text-slate-100">{reportStats.approved}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Spoilt / Rejected</div>
              <div className="text-2xl font-bold text-slate-100">{reportStats.spoiled}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">Pending</div>
              <div className="text-2xl font-bold text-slate-100">{reportStats.pending}</div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">Position Analysis</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4 text-center">Total Noms</th>
                  <th className="px-6 py-4 text-center">Approved Noms</th>
                  <th className="px-6 py-4 text-center text-emerald-400">Qualified Candidates (≥2)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reportStats.positionBreakdown.map((stat) => (
                  <React.Fragment key={stat.id}>
                    <tr
                      className="hover:bg-slate-800/20 cursor-pointer transition-colors group"
                      onClick={() => setExpandedPositionId(expandedPositionId === stat.id ? null : stat.id)}
                    >
                      <td className="px-6 py-4 text-sm font-bold text-slate-300 flex items-center space-x-2">
                        <span className="text-slate-500 text-xs px-1.5 py-0.5 rounded bg-slate-800 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                          {expandedPositionId === stat.id ? '▼' : '▶'}
                        </span>
                        <span>{stat.title}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-slate-400">{stat.total}</td>
                      <td className="px-6 py-4 text-center font-mono text-slate-400">{stat.approved}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-emerald-400 bg-emerald-500/5">{stat.qualifiedCandidates.length}</td>
                    </tr>
                    {expandedPositionId === stat.id && (
                      <tr className="bg-slate-900/50">
                        <td colSpan={4} className="px-6 py-4 border-b border-slate-800 shadow-inner">
                          <div className="pl-6 border-l-2 border-slate-700">
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Qualified Candidates</div>
                            {stat.qualifiedCandidates.length > 0 ? (
                              <ul className="space-y-2">
                                {stat.qualifiedCandidates.map((cand, i) => (
                                  <li key={i} className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-800/50 bg-slate-950/30 border border-slate-800/50">
                                    <span className="text-slate-200 font-medium">{cand.name}</span>
                                    <span className="text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">{cand.count} nominations</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-slate-600 text-sm italic py-2">No qualified candidates (≥2 noms) found yet.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BALLOT_STATUS' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center">
                Ballot Tracker
                {showPreview && <span className="ml-3 px-2 py-0.5 bg-blue-600 text-[10px] rounded uppercase">Preview Mode</span>}
              </h3>
              <p className="text-sm text-slate-400">Track candidate acceptances and preview the final voting ballot.</p>
            </div>
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setShowPreview(false)}
                className={`px-4 py-2 text-xs font-bold rounded ${!showPreview ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Tracking View
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`pb-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'candidates' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Candidate Status
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-2 px-4 font-bold border-b-2 transition-colors ${activeTab === 'settings' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Settings
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`px-4 py-2 text-xs font-bold rounded ${showPreview ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Preview Ballot
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            {reportStats.positionBreakdown.map(pos => {
              // Merge qualified data with response data
              const finalCandidates = pos.qualifiedCandidates.map(cand => {
                const response = candidacyResponses.find(r => r.memberId === cand.id && r.positionId === pos.id);
                const status = response ? response.status : 'PENDING';
                return { ...cand, status };
              });

              const visibleCandidates = showPreview
                ? finalCandidates.filter(c => c.status === 'ACCEPTED')
                : finalCandidates;

              if (showPreview && visibleCandidates.length === 0) return null;

              return (
                <div key={pos.id} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="font-bold text-slate-200">{pos.title}</h4>
                    <span className="text-xs font-mono text-slate-500">
                      {showPreview
                        ? `${visibleCandidates.length} Candidates Running`
                        : `${visibleCandidates.filter(c => c.status === 'ACCEPTED').length}/${visibleCandidates.length} Accepted`}
                    </span>
                  </div>

                  {visibleCandidates.length > 0 ? (
                    <div className="divide-y divide-slate-800">
                      {visibleCandidates.map(cand => (
                        <div key={cand.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                              ${showPreview ? 'bg-blue-900/40 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-400'}
                                           `}>
                              {cand.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-200">{cand.name}</div>
                              {!showPreview && <div className="text-[10px] text-slate-500">{cand.count} nominations</div>}
                            </div>
                          </div>

                          {!showPreview && (
                            <div>
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border
                                                  ${cand.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  cand.status === 'DECLINED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'}
                                               `}>
                                {cand.status}
                              </span>
                            </div>
                          )}

                          {showPreview && (
                            <div className="text-emerald-400">
                              <CheckCircle size={18} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs italic">
                      {showPreview ? 'No confirmed candidates for this position yet.' : 'No qualified candidates found.'}
                    </div>
                  )}
                </div>
              );
            })}

            {showPreview && reportStats.positionBreakdown.every(p => {
              const hasAccepted = p.qualifiedCandidates.some(c =>
                candidacyResponses.find(r => r.memberId === c.id && r.positionId === p.id)?.status === 'ACCEPTED'
              );
              return !hasAccepted;
            }) && (
                <div className="p-12 text-center border border-dashed border-slate-700 rounded-xl">
                  <p className="text-slate-400 font-bold">Ballot Empty</p>
                  <p className="text-slate-600 text-sm mt-2">No candidates have accepted their nominations yet.</p>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

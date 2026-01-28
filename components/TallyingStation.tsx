
import React, { useMemo } from 'react';
import { Member, Position, Vote, PositionCategory, CandidacyResponse, Nomination } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, AlertCircle, BarChart3, CheckCircle2 } from 'lucide-react';

interface TallyingStationProps {
    positions: Position[];
    members: Member[];
    votes: Vote[];
    candidacyResponses: CandidacyResponse[];
    nominations: Nomination[];
}

export const TallyingStation: React.FC<TallyingStationProps> = ({ positions, members, votes, candidacyResponses, nominations }) => {

    const results = useMemo(() => {
        return positions.map(pos => {
            const positionVotes = votes.filter(v => v.positionId === pos.id);
            const totalVotes = positionVotes.length;

            const candidateCounts: Record<string, number> = {};
            positionVotes.forEach(v => {
                candidateCounts[v.candidateId] = (candidateCounts[v.candidateId] || 0) + 1;
            });

            const data = Object.entries(candidateCounts).map(([candId, count]) => {
                const candidate = members.find(m => m.id === candId);
                return {
                    name: candidate ? candidate.name : 'Unknown',
                    id: candId,
                    count: count,
                    percentage: totalVotes > 0 ? (count / totalVotes) * 100 : 0
                };
            }).sort((a, b) => b.count - a.count);


            // 1. Identify Accepted Candidates
            const acceptedCandidates = candidacyResponses.filter(r => r.positionId === pos.id && r.status === 'ACCEPTED');

            // 2. Identify Potential Candidates (Approved Nominations)
            const approvedNominations = nominations.filter(n => n.positionId === pos.id && n.reviewStatus === 'APPROVED');
            const potentialCandidateIds = new Set(approvedNominations.map(n => n.nomineeId));

            // 3. Determine if anyone is "Still in the running" but hasn't responded or accepted
            // A candidate is "Active" if they are APPROVED and have NOT Declined.
            // We want to find if there are any Active candidates besides the Accepted one.
            const activeCandidatesCount = Array.from(potentialCandidateIds).filter(candId => {
                const response = candidacyResponses.find(r => r.memberId === candId && r.positionId === pos.id);
                return !response || response.status !== 'DECLINED';
            }).length;

            // Strict Unopposed Check:
            // - Exactly 1 Accepted Candidate
            // - Total Active Candidates is also 1 (meaning no one else is pending or accepted)
            const isUnopposed = acceptedCandidates.length === 1 && activeCandidatesCount === 1;

            let winner = data.length > 0 ? data[0] : null;

            if (isUnopposed) {
                const candidateId = acceptedCandidates[0].memberId;
                const candidate = members.find(m => m.id === candidateId);
                winner = {
                    name: candidate ? candidate.name : 'Unknown',
                    id: candidateId,
                    count: 0, // No votes cast
                    percentage: 0
                };
            }

            return {
                position: pos,
                totalVotes,
                data,
                winner,
                isUnopposed
            };
        });
    }, [positions, members, votes, candidacyResponses, nominations]);

    const totalVotesCast = votes.length;
    const uniqueVoters = new Set(votes.map(v => v.voterId)).size;
    const totalMembers = members.length;
    const turnout = totalMembers > 0 ? Math.round((uniqueVoters / totalMembers) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 flex items-center">
                        <BarChart3 className="mr-3 text-cranberry-600" size={32} />
                        Tallying Station
                    </h2>
                    <p className="text-slate-500 mt-1">Real-time election results and vote counting.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-xl border border-slate-800">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Votes</div>
                        <div className="text-2xl font-mono font-bold">{totalVotesCast}</div>
                    </div>
                    <div className="bg-emerald-900 text-emerald-100 px-6 py-3 rounded-xl border border-emerald-800">
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Turnout</div>
                        <div className="text-2xl font-mono font-bold">{turnout}%</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8">
                {results.map(({ position, totalVotes, data, winner, isUnopposed }) => (
                    <div key={position.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{position.title}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mt-1">
                                    {totalVotes} Votes Cast
                                </p>
                            </div>
                            {winner && (
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${isUnopposed
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                    <Trophy size={14} />
                                    <span className="text-xs font-bold">
                                        {isUnopposed ? 'Elected Unopposed' : `Leading: ${winner.name}`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Truthful Data Representation for Unopposed Candidates */}
                        {isUnopposed && winner && (
                            <div className="px-6 pb-8 pt-6">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex items-start space-x-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">{winner.name}</h4>
                                        <p className="text-emerald-700 font-medium mt-1">Declared Winner</p>
                                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                            This candidate was the sole nominee to accept the nomination for this position.
                                            In accordance with election by-laws, they are declared elected unopposed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isUnopposed && (
                            <div className="p-6">
                                {data.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.map((cand, idx) => (
                                            <div key={cand.id} className="relative">
                                                <div className="flex justify-between items-end mb-1 text-sm">
                                                    <span className={`font-bold ${idx === 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                                                        {cand.name}
                                                    </span>
                                                    <span className="font-mono text-slate-500">
                                                        {cand.count} ({Math.round(cand.percentage)}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-cranberry-600' : 'bg-slate-400'
                                                            }`}
                                                        style={{ width: `${cand.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-slate-400 italic flex flex-col items-center">
                                        <AlertCircle size={24} className="mb-2 opacity-50" />
                                        No votes recorded for this position yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

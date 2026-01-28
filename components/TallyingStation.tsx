import React, { useMemo } from 'react';
import { Member, Position, Vote, PositionCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, AlertCircle, BarChart3, PieChart } from 'lucide-react';

interface TallyingStationProps {
    positions: Position[];
    members: Member[];
    votes: Vote[];
    candidacyResponses: any[]; // Using any to avoid complex type import for now, only need status check if we filter
}

export const TallyingStation: React.FC<TallyingStationProps> = ({ positions, members, votes }) => {

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

            const winner = data.length > 0 ? data[0] : null;

            return {
                position: pos,
                totalVotes,
                data,
                winner
            };
        });
    }, [positions, members, votes]);

    const totalVotesCast = votes.length;
    const uniqueVoters = new Set(votes.map(v => v.voterId)).size;
    const totalMembers = members.length;
    const turnout = Math.round((uniqueVoters / totalMembers) * 100) || 0;

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
                {results.map(({ position, totalVotes, data, winner }) => (
                    <div key={position.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{position.title}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mt-1">
                                    {totalVotes} Votes Cast
                                </p>
                            </div>
                            {winner && (
                                <div className="flex items-center space-x-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                                    <Trophy size={14} />
                                    <span className="text-xs font-bold">Leading: {winner.name}</span>
                                </div>
                            )}
                        </div>

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
                    </div>
                ))}
            </div>
        </div>
    );
};

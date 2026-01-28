import React, { useState, useEffect } from 'react';
import { Member, Nomination, Position, CandidacyResponse } from '../types';
import { CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface MyCandidacyProps {
    currentUser: Member;
    nominations: Nomination[];
    positions: Position[];
    members: Member[];
}

export const MyCandidacy: React.FC<MyCandidacyProps> = ({ currentUser, nominations, positions, members }) => {
    const [qualifiedPositions, setQualifiedPositions] = useState<{ position: Position, count: number, status: 'ACCEPTED' | 'DECLINED' | 'PENDING' }[]>([]);
    const [responses, setResponses] = useState<CandidacyResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch existing responses
    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const { data, error } = await supabase
                    .from('candidacy_responses')
                    .select('*')
                    .eq('member_id', currentUser.id);

                if (error) {
                    console.error('Error fetching responses:', error);
                    // In case table doesn't exist yet, we just ignore effectively
                    setResponses([]);
                } else if (data) {
                    setResponses(data.map(r => ({
                        id: r.id,
                        memberId: r.member_id,
                        positionId: r.position_id,
                        status: r.status,
                        timestamp: new Date(r.created_at).getTime()
                    })));
                }
            } catch (err) {
                console.error("Failed to load responses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResponses();
    }, [currentUser.id]);

    // Calculate qualified positions
    useEffect(() => {
        // 1. Get all approved nominations for me
        const myApprovedNoms = nominations.filter(n => n.nomineeId === currentUser.id && n.reviewStatus === 'APPROVED');

        // 2. Group by position
        const counts: Record<string, number> = {};
        myApprovedNoms.forEach(n => {
            counts[n.positionId] = (counts[n.positionId] || 0) + 1;
        });

        // 3. Filter >= 2
        const qualified = Object.entries(counts)
            .filter(([_, count]) => count >= 2)
            .map(([posId, count]) => {
                const pos = positions.find(p => p.id === posId);
                // Check if I already responded
                const existingResponse = responses.find(r => r.positionId === posId);
                return {
                    position: pos!,
                    count,
                    status: existingResponse ? existingResponse.status : 'PENDING' as const
                };
            })
            .filter(item => item.position); // Safety check

        setQualifiedPositions(qualified);
    }, [nominations, currentUser.id, positions, responses]);

    const handleResponse = async (positionId: string, status: 'ACCEPTED' | 'DECLINED') => {
        try {
            // Optimistic update
            setQualifiedPositions(prev => prev.map(p =>
                p.position.id === positionId ? { ...p, status } : p
            ));

            // DB Update
            const { error } = await supabase
                .from('candidacy_responses')
                .upsert({
                    member_id: currentUser.id,
                    position_id: positionId,
                    status: status,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'member_id, position_id' });

            if (error) throw error;

        } catch (err) {
            console.error("Error saving response:", err);
            alert("Failed to save your response. Please try again.");
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading your candidacy details...</div>;

    if (qualifiedPositions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                <div className="bg-slate-800 p-4 rounded-full mb-4 opacity-50">
                    <Sparkles size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-300">No Actively Qualified Nominations</h3>
                <p className="text-slate-500 mt-2 text-center max-w-md">
                    You haven't met the threshold (2 approved nominations) for any position yet.
                    Keep engaging with the club!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Personalized Header */}
            <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                    <Sparkles className="mr-2 text-yellow-400" size={24} />
                    Congratulations, {currentUser.name.split(' ')[0]}!
                </h2>
                <p className="text-slate-300 leading-relaxed">
                    You have been nominated and verified for the following leadership positions in the incoming Board (2026-2027).
                    This is a testament to your service and the trust the club members have in you.
                </p>
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-blue-200">
                        <strong>Action Required:</strong> Please review each position below. You must explicitly
                        <span className="text-emerald-400 font-bold mx-1">ACCEPT</span> or
                        <span className="text-red-400 font-bold mx-1">DECLINE</span>
                        your candidacy. You may accept multiple positions if you wish to run for more than one.
                    </div>
                </div>
            </div>

            {/* Positions List */}
            <div className="grid gap-6">
                {qualifiedPositions.map(({ position, count, status }) => (
                    <div key={position.id} className={`
                relative overflow-hidden rounded-xl border-2 transition-all duration-300
                ${status === 'PENDING' ? 'bg-slate-900 border-slate-700 shadow-md' :
                            status === 'ACCEPTED' ? 'bg-emerald-950/20 border-emerald-500/50 shadow-emerald-500/10' :
                                'bg-slate-900/50 border-slate-800 opacity-75'}
           `}>
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            {status === 'ACCEPTED' ? <CheckCircle size={120} /> : <Sparkles size={120} />}
                        </div>

                        <div className="p-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-700">
                                        {position.category}
                                    </span>
                                    {status === 'ACCEPTED' && (
                                        <span className="flex items-center text-emerald-400 text-xs font-bold uppercase tracking-wide">
                                            <CheckCircle size={14} className="mr-1" /> Accepted
                                        </span>
                                    )}
                                    {status === 'DECLINED' && (
                                        <span className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wide">
                                            <XCircle size={14} className="mr-1" /> Declined
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-100">{position.title}</h3>
                                <p className="text-slate-400 mt-2 text-sm max-w-2xl">{position.description}</p>
                                <div className="mt-4 flex items-center space-x-2 text-sm text-slate-500 font-mono">
                                    <span>Received {count} verified nominations</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-3 shrink-0">
                                {status === 'PENDING' ? (
                                    <>
                                        <button
                                            onClick={() => handleResponse(position.id, 'ACCEPTED')}
                                            className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5"
                                        >
                                            <CheckCircle size={18} className="mr-2" />
                                            Accept Nomination
                                        </button>
                                        <button
                                            onClick={() => handleResponse(position.id, 'DECLINED')}
                                            className="flex items-center px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-bold border border-slate-700 transition-all"
                                        >
                                            Decline
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-slate-500 italic">Want to change your mind?</span>
                                        <button
                                            onClick={() => handleResponse(position.id, status === 'ACCEPTED' ? 'DECLINED' : 'ACCEPTED')}
                                            className="text-sm font-bold text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-400"
                                        >
                                            Switch to {status === 'ACCEPTED' ? 'Decline' : 'Accept'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

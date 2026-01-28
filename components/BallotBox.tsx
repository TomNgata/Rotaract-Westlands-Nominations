
import React, { useState, useMemo } from 'react';
import { Member, Position, PositionCategory, CandidacyResponse, Nomination } from '../types';
import { CheckCircle, ShieldCheck, Trophy, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface BallotBoxProps {
    currentUser: Member;
    positions: Position[];
    members: Member[];
    candidacyResponses: CandidacyResponse[];
    nominations: Nomination[];
    onVoteComplete: () => void;
}

export const BallotBox: React.FC<BallotBoxProps> = ({ currentUser, positions, members, candidacyResponses, nominations, onVoteComplete }) => {
    const [votes, setVotes] = useState<Record<string, string>>({});
    const [step, setStep] = useState<'VOTE' | 'REVIEW' | 'SUCCESS'>('VOTE');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const candidatesByPosition = useMemo(() => {
        const map: Record<string, Member[]> = {};
        positions.forEach(pos => {
            const acceptedResponses = candidacyResponses.filter(r => r.positionId === pos.id && r.status === 'ACCEPTED');
            const candidateIds = acceptedResponses.map(r => r.memberId);
            map[pos.id] = members.filter(m => candidateIds.includes(m.id));
        });
        return map;
    }, [positions, members, candidacyResponses]);

    const handleSelect = (positionId: string, candidateId: string) => {
        setVotes(prev => ({ ...prev, [positionId]: candidateId }));
    };

    const handleVoteSubmission = async () => {
        setIsSubmitting(true);
        try {
            const voteRecords = Object.entries(votes).map(([posId, candId]) => ({
                voter_id: currentUser.id,
                position_id: posId,
                candidate_id: candId
            }));

            const { error } = await supabase
                .from('votes')
                .insert(voteRecords);

            if (error) throw error;

            setStep('SUCCESS');
            onVoteComplete();
        } catch (error) {
            console.error("Error submitting votes:", error);
            alert("Failed to submit votes. Please try again.");
            setIsSubmitting(false);
        }
    };

    const isComplete = useMemo(() => {
        // Only require votes for positions that are NOT Unopposed and have candidates
        const relevantPositions = positions.filter(pos => {
            const candidates = candidatesByPosition[pos.id] || [];
            const acceptedCandidates = candidates;
            const activeCandidatesCount = nominations.filter(n =>
                n.positionId === pos.id &&
                n.reviewStatus === 'APPROVED' &&
                (!candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === pos.id) ||
                    candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === pos.id)?.status !== 'DECLINED')
            ).length;
            // Relaxed Logic: If there is exactly 1 accepted candidate, they are unopposed.
            // We ignore other "active" candidates who haven't responded or are pending,
            // based on the user's confirmation that all responses are in.
            const isUnopposed = acceptedCandidates.length === 1;

            // Only require votes for positions that are NOT Unopposed and have available candidates
            return !isUnopposed && candidates.length > 0;
        });

        return relevantPositions.every(p => votes[p.id]);
    }, [positions, votes, candidatesByPosition, nominations, candidacyResponses]);

    const renderPositionGroup = (categoryFilter: (cat: PositionCategory) => boolean) => {
        const groupPositions = positions.filter(p => categoryFilter(p.category));

        return (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
                {groupPositions.map(pos => {
                    const candidates = candidatesByPosition[pos.id] || [];

                    // Determine if Unopposed
                    const acceptedCandidates = candidates;
                    const activeCandidatesCount = nominations.filter(n =>
                        n.positionId === pos.id &&
                        n.reviewStatus === 'APPROVED' &&
                        (!candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === pos.id) ||
                            candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === pos.id)?.status !== 'DECLINED')
                    ).length;
                    // Relaxed Logic: If exactly 1 accepted candidate, declare Unopposed.
                    const isUnopposed = acceptedCandidates.length === 1;

                    return (

                        <div key={pos.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{pos.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{pos.description}</p>

                            {isUnopposed && acceptedCandidates.length > 0 ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-white text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                        <Trophy size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">{acceptedCandidates[0].name}</h4>
                                    <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest mt-1 mb-2">Elected Unopposed</p>
                                    <p className="text-slate-500 text-sm max-w-md">
                                        As the sole candidate accepting nomination for this position,
                                        <span className="font-bold text-slate-900"> {acceptedCandidates[0].name}</span> is declared elected unopposed.
                                        No voting is required for this docket.
                                    </p>
                                </div>
                            ) : (
                                candidates.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {candidates.map(cand => {
                                            const isSelected = votes[pos.id] === cand.id;
                                            return (
                                                <div
                                                    key={cand.id}
                                                    onClick={() => handleSelect(pos.id, cand.id)}
                                                    className={`cursor-pointer relative flex items-center p-4 rounded-xl border-2 transition-all
                                                        ${isSelected
                                                            ? 'bg-cranberry-50 border-cranberry-500 shadow-md'
                                                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'}
                                                    `}
                                                >
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 shrink-0
                                                        ${isSelected ? 'bg-cranberry-600 text-white' : 'bg-white text-slate-500 border border-slate-200 shadow-sm'}
                                                    `}>
                                                        {cand.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold ${isSelected ? 'text-cranberry-900' : 'text-slate-900'}`}>{cand.name}</h4>
                                                        <p className="text-xs text-slate-500">Rotary ID: {cand.rotaryId}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-4 right-4 text-cranberry-400">
                                                            <CheckCircle size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed text-slate-500 text-sm italic">
                                        No qualified candidates on the ballot for this position.
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderReview = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirm Your Votes</h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                    Please review your selections carefully. Once submitted, your vote is final and cannot be changed.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                    {positions.map(p => {
                        // Calculate Unopposed status again for display
                        const acceptedCandidates = candidatesByPosition[p.id] || [];
                        const isUnopposed = acceptedCandidates.length === 1;

                        return (
                            <div key={p.id} className="p-4 flex items-center justify-between">
                                <span className="text-slate-400 font-medium w-1/3">{p.title}</span>
                                {isUnopposed ? (
                                    <span className="text-emerald-400 font-bold text-xs uppercase bg-emerald-900/20 px-2 py-1 rounded border border-emerald-900/50">
                                        Elected Unopposed
                                    </span>
                                ) : (
                                    (() => {
                                        const selectedId = votes[p.id];
                                        const selectedCand = members.find(m => m.id === selectedId);
                                        return (
                                            <span className={`font-mono text-sm ${selectedCand ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}`}>
                                                {selectedCand ? selectedCand.name : 'No Selection'}
                                            </span>
                                        );
                                    })()
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={() => setStep('VOTE')}
                    className="px-6 py-2 rounded-lg font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
                >
                    Back to Ballot
                </button>

                <button
                    onClick={handleVoteSubmission}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                    {isSubmitting ? 'Submitting...' : 'Submit Official Vote'}
                </button>
            </div>
        </div>
    );

    if (step === 'SUCCESS') {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                    <CheckCircle size={48} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Vote Cast Successfully!</h2>
                <p className="text-slate-400 text-center max-w-md">
                    Thank you, {currentUser.name}. Your participation in the Rotaract Westlands Elections 2026 has been recorded.
                </p>
            </div>
        );
    }

    if (step === 'REVIEW') {
        return renderReview();
    }

    return (
        <div className="space-y-12 pb-20">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-heading font-black text-slate-900 tracking-tight">
                    Official Ballot Paper
                </h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Please select your preferred candidate for each position below.
                    You must verify your selection before final submission.
                </p>
            </div>

            <div className="space-y-16">
                <div>
                    <h2 className="text-2xl font-bold text-cranberry-600 mb-6 border-b border-slate-200 pb-2">Executive Board</h2>
                    {renderPositionGroup(cat => cat === PositionCategory.EXECUTIVE)}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-cranberry-600 mb-6 border-b border-slate-200 pb-2">Directors</h2>
                    {renderPositionGroup(cat => cat === PositionCategory.DIRECTOR)}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-cranberry-600 mb-6 border-b border-slate-200 pb-2">Succession</h2>
                    {renderPositionGroup(cat => cat === PositionCategory.SUCCESSION)}
                </div>
            </div>

            <div className="sticky bottom-4 flex justify-center pt-8 pointer-events-none">
                <button
                    onClick={() => setStep('REVIEW')}
                    disabled={!isComplete}
                    className={`pointer-events-auto px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1
                        ${isComplete
                            ? 'bg-cranberry-600 text-white shadow-cranberry-600/30 hover:bg-cranberry-500'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                    `}
                >
                    {isComplete ? 'Review Selections' : 'Complete All Selections'}
                </button>
            </div>
        </div>
    );
};

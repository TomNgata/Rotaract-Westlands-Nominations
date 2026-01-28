import React, { useState, useMemo } from 'react';
import { Member, Position, CandidacyResponse, PositionCategory } from '../types';
import { supabase } from '../services/supabaseClient';
import { CheckCircle, AlertCircle, ChevronRight, ChevronLeft, ShieldCheck, User } from 'lucide-react';

interface BallotBoxProps {
    currentUser: Member;
    positions: Position[];
    members: Member[];
    candidacyResponses: CandidacyResponse[];
    onVoteComplete: () => void;
}

export const BallotBox: React.FC<BallotBoxProps> = ({ currentUser, positions, members, candidacyResponses, onVoteComplete }) => {
    const [step, setStep] = useState<'EXECUTIVE' | 'DIRECTORS' | 'REVIEW'>('EXECUTIVE');
    const [votes, setVotes] = useState<Record<string, string>>({}); // positionId -> candidateId
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Prepare Qualified Candidates Map
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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const votesToInsert = Object.entries(votes).map(([posId, candId]) => ({
                voter_id: currentUser.id,
                position_id: posId,
                candidate_id: candId
            }));

            if (votesToInsert.length === 0) {
                alert("No votes selected.");
                setIsSubmitting(false);
                return;
            }

            const { error } = await supabase
                .from('votes')
                .insert(votesToInsert);

            if (error) throw error;

            onVoteComplete();
        } catch (error) {
            console.error("Voting failed:", error);
            alert("Failed to cast vote. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderPositionGroup = (categoryFilter: (cat: PositionCategory) => boolean) => {
        const groupPositions = positions.filter(p => categoryFilter(p.category));

        return (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
                {groupPositions.map(pos => {
                    const candidates = candidatesByPosition[pos.id] || [];

                    // Specific sorting: President/Secretary first if explicit order needed, but positions array order is usually fine.

                    return (
                        <div key={pos.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-slate-200 mb-2">{pos.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{pos.description}</p>

                            {candidates.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {candidates.map(cand => {
                                        const isSelected = votes[pos.id] === cand.id;
                                        return (
                                            <div
                                                key={cand.id}
                                                onClick={() => handleSelect(pos.id, cand.id)}
                                                className={`cursor-pointer relative flex items-center p-4 rounded-xl border-2 transition-all
                                                    ${isSelected
                                                        ? 'bg-cranberry-900/20 border-cranberry-500 shadow-lg shadow-cranberry-900/10'
                                                        : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800'}
                                                `}
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 shrink-0
                                                    ${isSelected ? 'bg-cranberry-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}
                                                `}>
                                                    {cand.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{cand.name}</h4>
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
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed text-slate-500 text-sm italic">
                                    No qualified candidates on the ballot for this position.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderReview = () => (
        <div className="space-y-6 animate-in zoom-in duration-300">
            <div className="bg-cranberry-900/20 border border-cranberry-500/30 p-6 rounded-xl flex items-start space-x-4">
                <ShieldCheck className="text-cranberry-400 shrink-0" size={32} />
                <div>
                    <h3 className="text-cranberry-100 font-bold text-lg">Confirm Your Ballot</h3>
                    <p className="text-cranberry-200/70 text-sm mt-1">
                        Please review your choices carefully. Once submitted, your vote is final and cannot be changed.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
                {positions.map(pos => {
                    const selectedId = votes[pos.id];
                    const selectedCandidate = members.find(m => m.id === selectedId);

                    // Skip positions with no candidates if we want, or show "Abstain"/"No Candidate"
                    if ((candidatesByPosition[pos.id] || []).length === 0) return null;

                    return (
                        <div key={pos.id} className="p-4 flex justify-between items-center">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{pos.title}</span>
                                <div className="font-bold text-slate-200 text-lg mt-1">
                                    {selectedCandidate ? selectedCandidate.name : <span className="text-slate-600 italic">No Selection (Abstain)</span>}
                                </div>
                            </div>
                            {selectedCandidate && (
                                <div className="w-8 h-8 rounded-full bg-cranberry-900/50 text-cranberry-400 flex items-center justify-center font-bold text-xs border border-cranberry-500/20">
                                    {selectedCandidate.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Progress Stepper */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10"></div>
                {['EXECUTIVE', 'DIRECTORS', 'REVIEW'].map((s, idx) => {
                    const isActive = s === step;
                    const isCompleted =
                        (step === 'DIRECTORS' && idx === 0) ||
                        (step === 'REVIEW' && idx <= 1);

                    return (
                        <div key={s} className="flex flex-col items-center bg-slate-950 px-2 rounded">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2
                                ${isActive ? 'bg-cranberry-600 border-cranberry-600 text-white scale-110' :
                                    isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' :
                                        'bg-slate-900 border-slate-700 text-slate-500'}
                            `}>
                                {isCompleted ? <CheckCircle size={14} /> : idx + 1}
                            </div>
                            <span className={`text-[10px] uppercase font-bold mt-2 tracking-widest ${isActive ? 'text-cranberry-400' : 'text-slate-600'}`}>
                                {s}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {step === 'EXECUTIVE' && renderPositionGroup(c => c === PositionCategory.EXECUTIVE || c === PositionCategory.SUCCESSION)}
                {step === 'DIRECTORS' && renderPositionGroup(c => c === PositionCategory.DIRECTOR)}
                {step === 'REVIEW' && renderReview()}
            </div>

            {/* Navigation Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 p-4 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8 flex justify-between">
                <button
                    onClick={() => {
                        if (step === 'DIRECTORS') setStep('EXECUTIVE');
                        if (step === 'REVIEW') setStep('DIRECTORS');
                    }}
                    disabled={step === 'EXECUTIVE'}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all
                        ${step === 'EXECUTIVE' ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                    `}
                >
                    <ChevronLeft size={20} className="mr-2" />
                    Back
                </button>

                {step === 'REVIEW' ? (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all w-full md:w-auto justify-center"
                    >
                        {isSubmitting ? 'Submitting...' : 'Cast Final Vote'}
                        {!isSubmitting && <ShieldCheck size={20} className="ml-2" />}
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            if (step === 'EXECUTIVE') setStep('DIRECTORS');
                            if (step === 'DIRECTORS') setStep('REVIEW');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center px-8 py-3 bg-cranberry-600 hover:bg-cranberry-500 text-white rounded-xl font-bold shadow-lg shadow-cranberry-900/20 active:scale-95 transition-all w-full md:w-auto justify-center"
                    >
                        Next Step
                        <ChevronRight size={20} className="ml-2" />
                    </button>
                )}
            </div>
        </div>
    );
};

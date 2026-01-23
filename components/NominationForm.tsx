
import React, { useState } from 'react';
import { X, Search, Info, CheckCircle } from 'lucide-react';
import { Member, Position, Nomination } from '../types';

interface NominationFormProps {
  onClose: () => void;
  members: Member[];
  positions: Position[];
  onSubmit: (nomination: Partial<Nomination>) => void;
  currentUser: Member;
}

export const NominationForm: React.FC<NominationFormProps> = ({ onClose, members, positions, onSubmit, currentUser }) => {
  const [step, setStep] = useState(1);
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [selectedNomineeId, setSelectedNomineeId] = useState('');
  const [statement, setStatement] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelfNom, setIsSelfNom] = useState(false);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.rotaryId.includes(searchQuery)
  );

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nomineeId: isSelfNom ? currentUser.id : selectedNomineeId,
      positionId: selectedPositionId,
      statement,
      isSelfNomination: isSelfNom,
      timestamp: Date.now()
    });
  };

  const selectedPosition = positions.find(p => p.id === selectedPositionId);
  const selectedNominee = members.find(m => m.id === selectedNomineeId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">New Nomination</h3>
            <p className="text-xs text-gray-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Which position are you nominating for?</label>
              <div className="grid grid-cols-1 gap-2">
                {positions.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPositionId(p.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selectedPositionId === p.id 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">{p.title}</span>
                      {selectedPositionId === p.id && <CheckCircle size={18} className="text-blue-600" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Who are you nominating?</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="selfNom" 
                    checked={isSelfNom} 
                    onChange={(e) => setIsSelfNom(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="selfNom" className="text-xs text-gray-600 cursor-pointer font-medium">Self-nominate</label>
                </div>
              </div>

              {!isSelfNom ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search member name or Rotary ID..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredMembers.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedNomineeId(m.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          selectedNomineeId === m.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium text-gray-900">{m.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {m.rotaryId}</span>
                        </div>
                        {selectedNomineeId === m.id && <CheckCircle size={16} className="text-blue-600" />}
                      </button>
                    ))}
                    {filteredMembers.length === 0 && (
                      <p className="text-center py-8 text-sm text-gray-500">No members found.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">{currentUser.name}</p>
                    <p className="text-xs text-blue-600">You are self-nominating</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Position</span>
                  <span className="font-bold text-gray-900">{selectedPosition?.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Nominee</span>
                  <span className="font-bold text-gray-900">{isSelfNom ? currentUser.name : selectedNominee?.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Supporting Statement (Optional)</label>
                <textarea
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-sm min-h-[120px]"
                  placeholder="Why is this member the right fit for this leadership role?"
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                />
              </div>

              <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-700 leading-tight">
                  By submitting, you confirm this member is in good standing and demonstrates the 4-Way Test in their conduct.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 ? !selectedPositionId : !isSelfNom && !selectedNomineeId}
              className="bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-sm hover:bg-blue-700"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-emerald-600 text-white px-8 py-2 rounded-lg font-bold transition-all shadow-lg hover:bg-emerald-700 hover:shadow-emerald-100"
            >
              Submit Nomination
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

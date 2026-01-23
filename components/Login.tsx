
import React, { useState } from 'react';
import { ShieldCheck, User, Key, ArrowRight, AlertCircle } from 'lucide-react';
import { Member, UserRole } from '../types';
import { MOCK_MEMBERS } from '../constants';

interface LoginProps {
  onLogin: (user: Member) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [rotaryId, setRotaryId] = useState('');
  const [specialCode, setSpecialCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const CONTACT_SUPPORT = " Please contact any member of the elections committee for support with any challenge.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const member = MOCK_MEMBERS.find(m => m.rotaryId === rotaryId);

    // If the user provided a special code, we must validate the entire combination
    // to avoid revealing whether the Rotary ID itself exists (opaque failure).
    if (specialCode) {
      const expectedCode = `${rotaryId}-EC26`;
      const isValidCommitteeAccess = member && 
                                     member.role === 'COMMITTEE' && 
                                     specialCode === expectedCode && 
                                     member.isGoodStanding;

      if (isValidCommitteeAccess) {
        onLogin({
          ...member!,
          role: 'COMMITTEE'
        });
        return;
      } else {
        setError("Invalid access combination." + CONTACT_SUPPORT);
        return;
      }
    }

    // Standard login flow (no special code)
    if (!member) {
      setError("Rotary ID not found in the member database." + CONTACT_SUPPORT);
      return;
    }

    if (!member.isGoodStanding) {
      setError("Member is not in good standing and cannot participate in nominations." + CONTACT_SUPPORT);
      return;
    }

    // Success for regular member (or committee member signing in without code)
    onLogin({
      ...member,
      role: 'MEMBER'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white font-extrabold text-3xl shadow-lg mb-4">
            W
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Rotaract Westlands</h1>
          <p className="text-gray-500 mt-2">RY 2026/2027 Nominations Platform</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-2 animate-in fade-in zoom-in duration-200">
                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">My Rotary ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="e.g. 6789012"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-mono"
                  value={rotaryId}
                  onChange={(e) => setRotaryId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 block">Committee Access Code</label>
                <span className="text-[10px] text-gray-400 font-medium italic">Optional for Members</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  placeholder="[RotaryID]-EC26"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-mono"
                  value={specialCode}
                  onChange={(e) => setSpecialCode(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Authorized committee members should enter their code to access administrative tools.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <span>Sign In</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-start space-x-3 text-gray-400">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                Secure session management. By logging in, you agree to uphold the 4-Way Test and club bylaws regarding election integrity.
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-xs text-gray-400">
          Trouble signing in? Contact the Elections Committee Chair.
        </p>
      </div>
    </div>
  );
};

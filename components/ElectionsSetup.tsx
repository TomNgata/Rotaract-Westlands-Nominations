import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { ElectionSettings } from '../types';
import { Calendar, Save, Loader2, AlertCircle, CheckCircle, Scale, ToggleLeft, ToggleRight } from 'lucide-react';

interface ElectionsSetupProps {
    settings: ElectionSettings | null;
    onUpdate: (newSettings: ElectionSettings) => void;
}

export const ElectionsSetup: React.FC<ElectionsSetupProps> = ({ settings, onUpdate }) => {
    const defaultSettings: ElectionSettings = {
        id: 'CONFIG',
        nomination_start: new Date().toISOString(),
        nomination_end: new Date().toISOString(),
        voting_start: new Date().toISOString(),
        voting_end: new Date().toISOString(),
        require_two_seconds: true,
        limit_one_position: true
    };

    const [formData, setFormData] = useState<ElectionSettings>(settings || defaultSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeSection, setActiveSection] = useState<'SCHEDULE' | 'BYLAWS'>('SCHEDULE');

    // Sync specific fields on mount/update, ensuring defaults
    useEffect(() => {
        if (settings) {
            const formatForInput = (isoString: string) => {
                try {
                    return new Date(isoString).toISOString().slice(0, 16);
                } catch (e) {
                    return '';
                }
            };

            setFormData({
                ...settings,
                nomination_start: formatForInput(settings.nomination_start),
                nomination_end: formatForInput(settings.nomination_end),
                voting_start: formatForInput(settings.voting_start),
                voting_end: formatForInput(settings.voting_end),
                require_two_seconds: settings.require_two_seconds ?? true,
                limit_one_position: settings.limit_one_position ?? true
            });
        }
    }, [settings]);

    const handleChange = (field: keyof ElectionSettings, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const payload = {
                nomination_start: new Date(formData.nomination_start).toISOString(),
                nomination_end: new Date(formData.nomination_end).toISOString(),
                voting_start: new Date(formData.voting_start).toISOString(),
                voting_end: new Date(formData.voting_end).toISOString(),
                require_two_seconds: formData.require_two_seconds,
                limit_one_position: formData.limit_one_position
            };

            // Optimistic update locally
            const newSettings = { ...formData, ...payload, id: 'CONFIG' };
            onUpdate(newSettings);

            const { error } = await supabase
                .from('election_settings')
                .update(payload)
                .eq('id', 'CONFIG');

            if (error) {
                // If column doesn't exist, we might get an error.
                // We'll throw but we already updated local state so UI feels responsive.
                console.warn("Backend update failed, likely due to missing columns:", error);
                throw new Error("Could not save to database. Ensure 'require_two_seconds' and 'limit_one_position' columns exist.");
            }

            setMessage({ type: 'success', text: 'Election configuration updated successfully.' });

        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: err.message || 'Failed to update settings.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
            <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 flex items-center">
                        <SettingsIcon className="mr-3 text-slate-800" size={32} />
                        Elections Set-Up
                    </h2>
                    <p className="text-slate-500 mt-1">Configure schedule and enforce bylaw constraints.</p>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setActiveSection('SCHEDULE')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeSection === 'SCHEDULE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Schedule
                    </button>
                    <button
                        onClick={() => setActiveSection('BYLAWS')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeSection === 'BYLAWS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Bylaws & Rules
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-start space-x-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {activeSection === 'SCHEDULE' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                <Calendar className="mr-2 text-blue-600" size={20} />
                                Nominations Phase
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.nomination_start}
                                        onChange={(e) => handleChange('nomination_start', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm focus:ring-2 focus:ring-cranberry-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">End Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.nomination_end}
                                        onChange={(e) => handleChange('nomination_end', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm focus:ring-2 focus:ring-cranberry-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                <Calendar className="mr-2 text-emerald-600" size={20} />
                                Voting Phase
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.voting_start}
                                        onChange={(e) => handleChange('voting_start', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm focus:ring-2 focus:ring-cranberry-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">End Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.voting_end}
                                        onChange={(e) => handleChange('voting_end', e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm focus:ring-2 focus:ring-cranberry-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'BYLAWS' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                                <Scale className="mr-2 text-slate-600" size={20} />
                                Qualification Rules
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <h4 className="font-bold text-slate-800">Minimum Nomination Threshold</h4>
                                        <p className="text-sm text-slate-500 mt-1">Candidates must receive at least 2 nominations (Proposer + Seconder) to be qualified.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('require_two_seconds', !formData.require_two_seconds)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cranberry-500 focus:ring-offset-2 ${formData.require_two_seconds ? 'bg-cranberry-600' : 'bg-slate-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.require_two_seconds ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <h4 className="font-bold text-slate-800">Single Candidate Position</h4>
                                        <p className="text-sm text-slate-500 mt-1">One member can knownly be nominated to one position (User warning/Restriction).</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('limit_one_position', !formData.limit_one_position)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cranberry-500 focus:ring-offset-2 ${formData.limit_one_position ? 'bg-cranberry-600' : 'bg-slate-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.limit_one_position ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 sticky bottom-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg transform active:scale-95 transition-all"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                        Save Configuration
                    </button>
                </div>

            </form>
        </div>
    );
};

// Helper for icon
const SettingsIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { ElectionSettings } from '../types';
import { Calendar, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminConfigProps {
    settings: ElectionSettings | null;
    onUpdate: (newSettings: ElectionSettings) => void;
}

export const AdminConfig: React.FC<AdminConfigProps> = ({ settings, onUpdate }) => {
    const [formData, setFormData] = useState<ElectionSettings | null>(settings);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (settings) {
            // Ensure format is compatible with datetime-local input (YYYY-MM-DDThh:mm)
            // The DB returns dynamic ISO string, input needs truncated ISO
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
            });
        }
    }, [settings]);

    const handleChange = (field: keyof ElectionSettings, value: string) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setIsLoading(true);
        setMessage(null);

        try {
            // Convert back to full ISO string with timezone if needed, 
            // but Supabase/Postgres handles ISO 8601 well.
            // verifying timezone handling might be key here, but let's send ISO
            const payload = {
                nomination_start: new Date(formData.nomination_start).toISOString(),
                nomination_end: new Date(formData.nomination_end).toISOString(),
                voting_start: new Date(formData.voting_start).toISOString(),
                voting_end: new Date(formData.voting_end).toISOString(),
            };

            const { error } = await supabase
                .from('election_settings')
                .update(payload)
                .eq('id', 'CONFIG');

            if (error) throw error;

            onUpdate({ ...formData, ...payload, id: 'CONFIG' });
            setMessage({ type: 'success', text: 'Election schedule updated successfully.' });

        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: err.message || 'Failed to update settings.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!formData) return <div>Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto pb-20 animate-in fade-in duration-500">
            <div className="mb-8 border-b border-slate-200 pb-6">
                <h2 className="text-3xl font-heading font-bold text-slate-900 flex items-center">
                    <Calendar className="mr-3 text-cranberry-600" size={32} />
                    Election Schedule
                </h2>
                <p className="text-slate-500 mt-1">
                    Manage the start and end dates for nominations and voting phases.
                    <br />
                    <span className="text-xs text-amber-600 font-bold">WARNING: Changing these dates affects the entire live application immediately.</span>
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-start space-x-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Nominations Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-3">1</span>
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

                {/* Voting Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs mr-3">2</span>
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

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg transform active:scale-95 transition-all"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                        Save Schedule Changes
                    </button>
                </div>

            </form>
        </div>
    );
};

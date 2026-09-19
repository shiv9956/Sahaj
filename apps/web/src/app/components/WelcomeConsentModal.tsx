'use client';

import React, { useState } from 'react';
import { ShieldCheck, Check, Sparkles, Globe, Mic, Database } from 'lucide-react';

interface WelcomeConsentModalProps {
  isOpen: boolean;
  onClose: (consent: { lang: 'en' | 'hi' | 'hinglish'; memory: boolean; voice: boolean }) => void;
}

export function WelcomeConsentModal({ isOpen, onClose }: WelcomeConsentModalProps) {
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'hinglish'>('hinglish');
  const [memoryConsent, setMemoryConsent] = useState(true);
  const [voiceConsent, setVoiceConsent] = useState(true);

  if (!isOpen) return null;

  const handleStart = () => {
    onClose({
      lang: selectedLang,
      memory: memoryConsent,
      voice: voiceConsent,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Welcome to Sahaj</h2>
            <p className="text-sm text-slate-400">Your AI-Powered Financial Journey Companion</p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" /> Choose Language / भाषा चुनें
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'hinglish', label: 'Hinglish', desc: 'Mix of Hi & En' },
              { id: 'hi', label: 'हिंदी', desc: 'Devanagari' },
              { id: 'en', label: 'English', desc: 'Standard' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLang(lang.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedLang === lang.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-sm">{lang.label}</div>
                <div className="text-[11px] opacity-75">{lang.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* DPDP Consent Options */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Data Privacy & Transparency (DPDP 2023 Principles)
          </div>

          <label className="flex items-start gap-3 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={memoryConsent}
              onChange={(e) => setMemoryConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            <div>
              <div className="font-medium text-slate-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" /> Enable Cognee Journey Memory
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Allows Sahaj to remember preferences & shortlist across sessions. You can delete or forget anytime.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer text-slate-300 pt-2 border-t border-slate-800/60">
            <input
              type="checkbox"
              checked={voiceConsent}
              onChange={(e) => setVoiceConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            <div>
              <div className="font-medium text-slate-200 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-400" /> Allow Voice Input & Audio Synthesis
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Enables Sarvam STT/TTS audio processing. Audio is processed transiently for transcript extraction.
              </p>
            </div>
          </label>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
        >
          <Check className="w-4 h-4" /> Start Journey / यात्रा शुरू करें
        </button>
      </div>
    </div>
  );
}

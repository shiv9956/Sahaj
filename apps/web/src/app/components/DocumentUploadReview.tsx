'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Eye, ArrowRight } from 'lucide-react';

interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  needs_review: boolean;
}

interface DocumentUploadReviewProps {
  onDocConfirmed: (docType: string, fields: Record<string, string>) => void;
  onNextStep?: () => void;
}

export function DocumentUploadReview({ onDocConfirmed, onNextStep }: DocumentUploadReviewProps) {
  const [docType, setDocType] = useState<'admission_letter' | 'salary_slip'>('admission_letter');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'review' | 'confirmed'>('idle');
  const [fields, setFields] = useState<ExtractedField[]>([]);

  const handleSimulatedUpload = (fileType: 'admission_letter' | 'salary_slip') => {
    setDocType(fileType);
    setUploadState('uploading');

    setTimeout(() => {
      if (fileType === 'admission_letter') {
        setFields([
          { name: 'Institution', value: 'IIT Delhi (Indian Institute of Technology)', confidence: 0.98, needs_review: false },
          { name: 'Course', value: 'B.Tech Computer Science & Engineering', confidence: 0.95, needs_review: false },
          { name: 'Annual Fee', value: '₹2,20,000', confidence: 0.92, needs_review: false },
          { name: 'Admission Year', value: '2026-2030', confidence: 0.88, needs_review: true },
        ]);
      } else {
        setFields([
          { name: 'Employer', value: 'Tata Consultancy Services', confidence: 0.96, needs_review: false },
          { name: 'Gross Monthly Income', value: '₹45,000', confidence: 0.94, needs_review: false },
          { name: 'Net Salary', value: '₹41,200', confidence: 0.91, needs_review: false },
          { name: 'Existing Deductions', value: '₹3,800', confidence: 0.85, needs_review: true },
        ]);
      }
      setUploadState('review');
    }, 1200);
  };

  const handleFieldChange = (index: number, newValue: string) => {
    const updated = [...fields];
    updated[index].value = newValue;
    updated[index].needs_review = false;
    setFields(updated);
  };

  const handleConfirm = () => {
    setUploadState('confirmed');
    const fieldMap = fields.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    onDocConfirmed(docType, fieldMap);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-slate-100 text-sm">Document Autopilot (Sarvam Vision)</h3>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          S6 Autopilot
        </span>
      </div>

      {uploadState === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Upload your Admission / Fee letter or Salary slip to auto-fill your profile securely.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSimulatedUpload('admission_letter')}
              className="p-4 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl bg-slate-950/40 hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
            >
              <Upload className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-slate-200">Admission / Fee Letter</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Synthetic sample document</div>
            </button>

            <button
              type="button"
              onClick={() => handleSimulatedUpload('salary_slip')}
              className="p-4 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl bg-slate-950/40 hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
            >
              <Upload className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-slate-200">Salary Slip (Co-applicant)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Synthetic sample document</div>
            </button>
          </div>
        </div>
      )}

      {uploadState === 'uploading' && (
        <div className="py-8 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <div className="text-xs text-slate-300 font-medium">Processing Document with Sarvam Vision AI...</div>
          <div className="text-[11px] text-slate-500">Extracting fields & validating schema...</div>
        </div>
      )}

      {uploadState === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-300 font-medium">Extracted Fields ({docType})</span>
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Please review below
            </span>
          </div>

          <div className="space-y-2.5">
            {fields.map((f, i) => (
              <div key={i} className="flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>{f.name}</span>
                  <span className={f.needs_review ? 'text-amber-400 flex items-center gap-1' : 'text-slate-500'}>
                    {f.needs_review && <AlertCircle className="w-3 h-3" />}
                    Confidence: {(f.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => handleFieldChange(i, e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-slate-950 text-slate-100 border text-xs font-medium focus:outline-none focus:ring-1 ${
                    f.needs_review
                      ? 'border-amber-500/50 focus:ring-amber-500'
                      : 'border-slate-800 focus:ring-emerald-500'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm & Auto-Fill Profile
            </button>
            <button
              type="button"
              onClick={() => setUploadState('idle')}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {uploadState === 'confirmed' && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
          <div className="text-xs font-semibold text-emerald-300">Document Fields Confirmed!</div>
          <p className="text-[11px] text-slate-400">
            Profile has been auto-filled with provenance tag <code className="text-emerald-400">extracted_from_doc</code>.
          </p>
          {onNextStep && (
            <button
              type="button"
              onClick={onNextStep}
              className="w-full py-2.5 px-4 bg-[#00BAF2] hover:bg-cyan-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Proceed to Products & Protection (S9)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <div>
            <button
              type="button"
              onClick={() => setUploadState('idle')}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline pt-1 cursor-pointer"
            >
              Upload another document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

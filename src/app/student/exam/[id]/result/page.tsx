'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, Award, ArrowLeft, Clock, FileCheck, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ResultData {
  examTitle: string;
  showResults: boolean;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  status: string;
  submittedAt?: string;
}

export default function StudentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Loading examination status...</div>}>
      <StudentResultContent />
    </Suspense>
  );
}

function StudentResultContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id as string;
  const autoSubmitted = searchParams.get('autoSubmitted');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResult();
  }, [examId]);

  const fetchResult = async () => {
    try {
      const res = await fetch('/api/student/exams');
      if (!res.ok) throw new Error('Failed to load result');
      const data = await res.json();
      const exam = data.exams?.find((e: any) => e.id === examId);
      
      if (!exam) throw new Error('Exam result record not found');

      // Fetch attempt score if showResults is true
      if (exam.attempt) {
        setResult({
          examTitle: exam.title,
          showResults: true,
          status: exam.attempt.status,
          submittedAt: exam.attempt.submittedAt,
        });
      } else {
        setResult({
          examTitle: exam.title,
          showResults: false,
          status: 'Submitted',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading examination status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full space-y-6">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          
          <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {autoSubmitted ? 'EXAM AUTO-SUBMITTED' : 'EXAMINATION COMPLETED'}
            </span>
            <h1 className="text-2xl font-black text-white mt-1">{result?.examTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">Your answers have been securely recorded into SQLite database.</p>
          </div>

          {result?.showResults ? (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>AI Justification Evaluation Completed</span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <span className="block font-semibold">STATUS</span>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold uppercase">
                  {result.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <FileCheck className="w-8 h-8 text-blue-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">
                Your examination has been submitted successfully.
              </p>
              <p className="text-xs text-slate-400">
                Detailed results will be published by the administrator.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO STUDENT DASHBOARD</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

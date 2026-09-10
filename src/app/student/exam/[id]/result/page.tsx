'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, Award, ArrowLeft, Clock, FileCheck, ShieldCheck, BarChart3, Percent } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ResultData {
  examTitle: string;
  showResults: boolean;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  submittedAt?: string;
}

export default function StudentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Loading examination results...</div>}>
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
  const reason = searchParams.get('reason');

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

      const attempt = exam.attempt;
      const score = attempt?.score ?? 0;
      const totalMarks = attempt?.totalMarks ?? exam.totalMarks ?? 30;
      const percentage = attempt?.percentage ?? (totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0);

      setResult({
        examTitle: exam.title,
        showResults: true,
        score: score,
        totalMarks: totalMarks,
        percentage: percentage,
        status: attempt?.status === 'submitted' ? 'Completed' : (attempt?.status || 'Completed'),
        submittedAt: attempt?.submittedAt || new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading examination results...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-6">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          
          {/* Success Badge */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
            reason === 'proctoring_alerts_exceeded'
              ? 'bg-red-950/80 border border-red-800 text-red-400 shadow-red-950'
              : 'bg-emerald-950/80 border border-emerald-800 text-emerald-400 shadow-emerald-950'
          }`}>
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className={`text-[11px] font-bold uppercase tracking-widest ${
              reason === 'proctoring_alerts_exceeded' ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {reason === 'proctoring_alerts_exceeded'
                ? 'AUTO-SUBMITTED (3 PROCTORING ALERTS EXCEEDED)'
                : autoSubmitted
                ? 'EXAMINATION AUTO-SUBMITTED'
                : 'EXAMINATION COMPLETED'}
            </span>
            <h1 className="text-2xl font-black text-white mt-1.5">{result?.examTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">
              {reason === 'proctoring_alerts_exceeded'
                ? 'Your test was automatically submitted after reaching 3 proctoring alerts.'
                : 'Your responses have been recorded and evaluated.'}
            </p>
          </div>

          {/* Marks Display Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
            
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              FINAL EXAMINATION SCORE
            </span>

            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-5xl font-black text-white tracking-tight">
                  {result?.score}
                </span>
                <span className="text-xl font-bold text-slate-500">
                  / {result?.totalMarks}
                </span>
              </div>
            </div>

            {/* Score Percentage Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/80 text-xs font-bold font-mono">
              <Percent className="w-3.5 h-3.5" />
              <span>{result?.percentage}% Aggregate</span>
            </div>

            {/* Status breakdown */}
            <div className="pt-4 border-t border-slate-900 grid grid-cols-2 gap-3 text-left text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">STATUS</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">{result?.status}</span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">SUBMITTED AT</span>
                <span className="font-bold text-slate-300 mt-0.5 block truncate">
                  {result?.submittedAt ? new Date(result.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recorded'}
                </span>
              </div>
            </div>

          </div>

          <div className="pt-2">
            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO DASHBOARD</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

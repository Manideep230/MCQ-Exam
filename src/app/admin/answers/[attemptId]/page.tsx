'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, GraduationCap, Award, CheckCircle2, XCircle, ShieldCheck, HelpCircle, FileText, AlertTriangle } from 'lucide-react';

interface AnswerSheetData {
  attempt: {
    id: string;
    status: string;
    startedAt: string;
    submittedAt: string;
    fullscreenExitCount: number;
    tabSwitchCount: number;
    score: number;
    totalMarks: number;
    percentage: number;
  };
  student: {
    rollNumber: string;
    fullName: string;
    branch: string;
    collegeName: string;
  };
  exam: {
    title: string;
    durationMinutes: number;
  };
  items: Array<{
    questionId: string;
    questionText: string;
    marks: number;
    correctOption: 'A' | 'B' | 'C' | 'D';
    options: Array<{ optionKey: 'A' | 'B' | 'C' | 'D'; optionText: string }>;
    studentAnswer: {
      selectedOption: 'A' | 'B' | 'C' | 'D';
      justification: string;
      aiOptionCorrect: boolean;
      aiJustificationQuality: string;
      aiJustificationScore: number;
      finalScore: number;
      aiReason: string;
      evaluationStatus: string;
      answeredAt: string;
    } | null;
  }>;
}

export default function AdminAnswerSheetPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [data, setData] = useState<AnswerSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnswerSheet();
  }, [attemptId]);

  const fetchAnswerSheet = async () => {
    try {
      const res = await fetch(`/api/admin/attempts/${attemptId}/answers`);
      if (!res.ok) throw new Error('Failed to load answer sheet');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        Loading student answer sheet and AI evaluations...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm space-y-4">
        <p>{error || 'Answer sheet not found'}</p>
        <button
          onClick={() => router.push('/admin/results')}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
        >
          Return to Results
        </button>
      </div>
    );
  }

  const { attempt, student, exam, items } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/results')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Results</span>
        </button>

        <span className="text-xs font-mono bg-blue-950 text-blue-400 border border-blue-800 px-3 py-1 rounded-full font-bold">
          OFFICIAL ANSWER AUDIT SHEET
        </span>
      </div>

      {/* Student & Exam Metadata Card (Rule #33) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-800 pb-6">
          {/* Student Info */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">STUDENT INFORMATION</span>
            <h2 className="text-xl font-black text-white">{student.fullName}</h2>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Roll Number: <span className="font-mono text-white font-bold">{student.rollNumber}</span></p>
              <p>Branch: <span className="text-slate-200">{student.branch}</span></p>
              <p>College: <span className="text-slate-200">{student.collegeName}</span></p>
            </div>
          </div>

          {/* Exam Info */}
          <div className="space-y-2 md:text-right">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">EXAM SCORE SUMMARY</span>
            <h3 className="text-xl font-black text-white">{exam.title}</h3>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Submitted At: <span className="text-slate-200">{new Date(attempt.submittedAt).toLocaleString()}</span></p>
              <p>Proctoring Exits: <span className="text-amber-400 font-bold">{attempt.fullscreenExitCount} FS Exits, {attempt.tabSwitchCount} Tab Switches</span></p>
              <p className="text-base font-black text-emerald-400 pt-1">
                Final Score: {attempt.score} / {attempt.totalMarks} ({attempt.percentage}%)
              </p>
            </div>
          </div>
        </div>

        {/* Question-by-Question Breakdown (Rule #33) */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Question-by-Question Evaluation Breakdown</span>
          </h3>

          {items.map((item, idx) => {
            const ans = item.studentAnswer;
            const isUnanswered = !ans;
            const isSelectedCorrect = ans?.selectedOption === item.correctOption;

            return (
              <div
                key={item.questionId}
                className={`p-6 rounded-2xl border space-y-4 shadow-xl ${
                  isUnanswered
                    ? 'bg-slate-950/60 border-slate-800'
                    : isSelectedCorrect && ans?.finalScore > 0
                    ? 'bg-emerald-950/20 border-emerald-800/80'
                    : 'bg-red-950/20 border-red-800/80'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-400">Q{idx + 1}.</span>
                    <span className="text-xs font-bold text-white">Question ({item.marks} Mark)</span>
                  </div>

                  <div>
                    {isUnanswered ? (
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                        UNANSWERED
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ans.finalScore > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        Score: {ans.finalScore} / {item.marks}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-white leading-relaxed">{item.questionText}</p>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {item.options.map((opt) => {
                    const isAuthoritativeCorrect = item.correctOption === opt.optionKey;
                    const isStudentChoice = ans?.selectedOption === opt.optionKey;

                    return (
                      <div
                        key={opt.optionKey}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isAuthoritativeCorrect
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                            : isStudentChoice
                            ? 'bg-red-950/80 border-red-500 text-red-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span><strong className="font-mono mr-1.5">{opt.optionKey}.</strong> {opt.optionText}</span>
                        
                        <div className="flex items-center space-x-1">
                          {isAuthoritativeCorrect && (
                            <span className="text-[9px] bg-emerald-900 px-1.5 py-0.5 rounded text-white font-bold">CORRECT</span>
                          )}
                          {isStudentChoice && (
                            <span className="text-[9px] bg-blue-900 px-1.5 py-0.5 rounded text-white font-bold">STUDENT CHOICE</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Student Justification & AI Evaluation (Rule #33) */}
                {!isUnanswered && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">STUDENT JUSTIFICATION:</span>
                      <p className="text-xs text-slate-200 italic leading-relaxed">"{ans.justification}"</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-400 flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>AI Justification Evaluation Breakdown</span>
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                          Quality: <strong className="text-white">{ans.aiJustificationQuality}</strong>
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        <strong className="text-slate-400">AI Evaluator Reason:</strong> {ans.aiReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

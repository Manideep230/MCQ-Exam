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
    correctOption: string;
    options: Array<{ optionKey: string; optionText: string }>;
    studentAnswer: {
      selectedOption: string;
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
      <div className="py-12 text-center text-[#064E3B]/70 font-semibold text-sm">
        Loading student answer sheet and AI evaluations...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center text-[#064E3B] text-sm space-y-4">
        <p className="font-bold">{error || 'Answer sheet not found'}</p>
        <button
          onClick={() => router.push('/admin/results')}
          className="px-4 py-2 bg-[#064E3B] text-[#f8e7c9] text-xs font-bold rounded-xl shadow-sm hover:bg-[#064E3B]/90 transition-all"
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
          className="flex items-center space-x-2 text-xs font-bold text-[#064E3B] hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Results</span>
        </button>

        <span className="text-xs font-mono bg-[#faedd7] text-[#064E3B] border-2 border-[#064E3B]/30 px-3 py-1 rounded-full font-black">
          OFFICIAL ANSWER AUDIT SHEET
        </span>
      </div>

      {/* Student & Exam Metadata Card (Rule #33) */}
      <div className="bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b-2 border-[#064E3B]/20 pb-6">
          {/* Student Info */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-[#064E3B] uppercase tracking-widest block">STUDENT INFORMATION</span>
            <h2 className="text-xl font-black text-[#064E3B]">{student.fullName}</h2>
            <div className="text-xs text-[#064E3B]/80 space-y-1 font-medium">
              <p>Roll Number: <span className="font-mono text-[#064E3B] font-bold">{student.rollNumber}</span></p>
              <p>Branch: <span className="text-[#064E3B] font-semibold">{student.branch}</span></p>
              <p>College: <span className="text-[#064E3B] font-semibold">{student.collegeName}</span></p>
            </div>
          </div>

          {/* Exam Info */}
          <div className="space-y-2 md:text-right">
            <span className="text-[10px] font-black text-[#064E3B] uppercase tracking-widest block">EXAM SCORE SUMMARY</span>
            <h3 className="text-xl font-black text-[#064E3B]">{exam.title}</h3>
            <div className="text-xs text-[#064E3B]/80 space-y-1 font-medium">
              <p>Submitted At: <span className="text-[#064E3B] font-semibold">{new Date(attempt.submittedAt).toLocaleString()}</span></p>
              <p>Proctoring Exits: <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{attempt.fullscreenExitCount} FS Exits, {attempt.tabSwitchCount} Tab Switches</span></p>
              <p className="text-base font-black text-[#064E3B] pt-1">
                Final Score: {attempt.score} / {attempt.totalMarks} ({attempt.percentage}%)
              </p>
            </div>
          </div>
        </div>

        {/* Question-by-Question Breakdown (Rule #33) */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-[#064E3B] uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#064E3B]" />
            <span>Question-by-Question Evaluation Breakdown</span>
          </h3>

          {items.map((item, idx) => {
            const ans = item.studentAnswer;
            const isUnanswered = !ans;
            const isSelectedCorrect = ans?.selectedOption === item.correctOption;

            return (
              <div
                key={item.questionId}
                className={`p-6 rounded-2xl border-2 space-y-4 shadow-sm ${
                  isUnanswered
                    ? 'bg-[#faedd7]/40 border-[#064E3B]/20'
                    : isSelectedCorrect && ans?.finalScore > 0
                    ? 'bg-emerald-50 border-emerald-600/40'
                    : 'bg-red-50 border-red-500/40'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-[#064E3B]/15 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-[#064E3B]">Q{idx + 1}.</span>
                    <span className="text-xs font-black text-[#064E3B]">Question ({item.marks} Mark)</span>
                  </div>

                  <div>
                    {isUnanswered ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#faedd7] text-[#064E3B]/70 border border-[#064E3B]/20 text-[10px] font-bold uppercase">
                        UNANSWERED
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        ans.finalScore > 0 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
                      }`}>
                        Score: {ans.finalScore} / {item.marks}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-bold text-[#064E3B] leading-relaxed">{item.questionText}</p>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {item.options.map((opt) => {
                    const isAuthoritativeCorrect = item.correctOption === opt.optionKey;
                    const isStudentChoice = ans?.selectedOption === opt.optionKey;

                    return (
                      <div
                        key={opt.optionKey}
                        className={`p-3 rounded-xl border-2 flex items-center justify-between ${
                          isAuthoritativeCorrect
                            ? 'bg-[#064E3B] border-[#064E3B] text-[#f8e7c9] font-bold'
                            : isStudentChoice
                            ? 'bg-red-100 border-red-500 text-red-900 font-bold'
                            : 'bg-[#fffdf9] border-[#064E3B]/20 text-[#064E3B]'
                        }`}
                      >
                        <span><strong className="font-mono mr-1.5">{opt.optionKey}.</strong> {opt.optionText}</span>
                        
                        <div className="flex items-center space-x-1">
                          {isAuthoritativeCorrect && (
                            <span className="text-[9px] bg-[#faedd7] px-1.5 py-0.5 rounded text-[#064E3B] font-black">CORRECT</span>
                          )}
                          {isStudentChoice && (
                            <span className="text-[9px] bg-red-800 px-1.5 py-0.5 rounded text-white font-black">STUDENT CHOICE</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Student Justification & AI Evaluation (Rule #33) */}
                {!isUnanswered && (
                  <div className="pt-3 border-t border-[#064E3B]/15 space-y-3">
                    <div className="bg-[#fffdf9] p-3.5 rounded-xl border border-[#064E3B]/20 space-y-1">
                      <span className="text-[10px] font-black text-[#064E3B] uppercase block">STUDENT JUSTIFICATION:</span>
                      <p className="text-xs text-[#064E3B] italic leading-relaxed font-medium">"{ans.justification}"</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#faedd7] border border-[#064E3B]/25 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[#064E3B] flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
                          <span>AI Justification Evaluation Breakdown</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#064E3B] uppercase">
                          Quality: <strong className="text-[#064E3B] underline">{ans.aiJustificationQuality}</strong>
                        </span>
                      </div>

                      <p className="text-xs text-[#064E3B]">
                        <strong className="text-[#064E3B]/80 font-bold">AI Evaluator Reason:</strong> {ans.aiReason}
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

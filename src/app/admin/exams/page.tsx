'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Calendar, Clock, HelpCircle, Users, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

interface AdminExamItem {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  startAt: string;
  endAt: string;
  status: string;
  showResults: boolean;
  questionCount: number;
  attemptCount: number;
}

export default function AdminExamsListPage() {
  const [exams, setExams] = useState<AdminExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/admin/exams');
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (err) {
      console.error('Fetch admin exams failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam and all associated questions/attempts?')) return;
    try {
      const res = await fetch(`/api/admin/exams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchExams();
      }
    } catch (err) {
      console.error('Delete exam error:', err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const targetStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
    const actionText = targetStatus === 'disabled' ? 'DISABLE' : 'ENABLE';
    if (!confirm(`Are you sure you want to ${actionText} this exam for students?`)) return;

    try {
      const res = await fetch(`/api/admin/exams/${id}/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        fetchExams();
      }
    } catch (err) {
      console.error('Toggle exam status error:', err);
    }
  };

  return (
    <div className="space-y-8 text-[#064E3B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#064E3B] tracking-tight">EXAMINATION MANAGEMENT</h1>
          <p className="text-xs text-[#064E3B]/80 mt-1 font-semibold">Schedule exams, configure window timing, assign question banks, and enable/disable exams for batches.</p>
        </div>

        <Link
          href="/admin/exams/create"
          className="px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-md border-2 border-[#064E3B]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Exam</span>
        </Link>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-[#064E3B]/60 text-sm font-bold">Loading examination schedules...</div>
        ) : exams.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-[#faedd7] border-2 border-[#064E3B]/20 rounded-2xl text-[#064E3B] text-sm font-semibold">
            No examinations created yet. Click "Create New Exam" to schedule one.
          </div>
        ) : (
          exams.map((exam) => {
            const start = new Date(exam.startAt);
            const isDisabled = exam.status === 'disabled';
            return (
              <div key={exam.id} className={`bg-[#fffdf9] border-2 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between transition-all ${
                isDisabled ? 'border-red-300 bg-red-50/20' : 'border-[#064E3B]/20'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#faedd7] text-[#064E3B] border border-[#064E3B]/30 text-[10px] font-black uppercase">
                        {exam.durationMinutes} MINS
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isDisabled
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-[#064E3B] text-[#f8e7c9]'
                      }`}>
                        {isDisabled ? 'DISABLED' : 'ACTIVE'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="p-1 text-[#064E3B]/50 hover:text-red-700 transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-[#064E3B]">{exam.title}</h3>
                  <p className="text-xs text-[#064E3B]/70 line-clamp-2 font-medium">{exam.description || 'No description'}</p>
                </div>

                <div className="space-y-2 border-t-2 border-[#064E3B]/10 pt-3 text-xs text-[#064E3B]">
                  <div className="flex justify-between">
                    <span className="text-[#064E3B]/70 flex items-center space-x-1 font-semibold">
                      <HelpCircle className="w-3.5 h-3.5 text-[#064E3B]" />
                      <span>Questions:</span>
                    </span>
                    <span className="font-black text-[#064E3B]">{exam.questionCount} Questions</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#064E3B]/70 flex items-center space-x-1 font-semibold">
                      <Users className="w-3.5 h-3.5 text-[#064E3B]" />
                      <span>Attempts:</span>
                    </span>
                    <span className="font-black text-[#064E3B]">{exam.attemptCount} Attempts</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#064E3B]/70 flex items-center space-x-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-[#064E3B]" />
                      <span>Start:</span>
                    </span>
                    <span className="font-mono font-bold text-[11px] text-[#064E3B]">{start.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <Link
                    href={`/admin/questions?examId=${exam.id}`}
                    className="flex-1 py-2.5 bg-[#faedd7] hover:bg-[#f3deba] text-[#064E3B] font-black text-xs uppercase tracking-wider rounded-xl text-center border-2 border-[#064E3B]/30 transition-all"
                  >
                    Questions ({exam.questionCount})
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(exam.id, exam.status)}
                    className={`px-3 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border-2 transition-all ${
                      isDisabled
                        ? 'bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] border-[#064E3B]'
                        : 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300'
                    }`}
                    title={isDisabled ? 'Enable Exam for Students' : 'Disable Exam for Students'}
                  >
                    {isDisabled ? 'Enable Exam' : 'Disable Exam'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

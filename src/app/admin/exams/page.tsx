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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">EXAMINATION MANAGEMENT</h1>
          <p className="text-xs text-slate-400 mt-1">Schedule exams, configure window timing, assign question banks, and enable/disable exams for batches.</p>
        </div>

        <Link
          href="/admin/exams/create"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Exam</span>
        </Link>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">Loading examination schedules...</div>
        ) : exams.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            No examinations created yet. Click "Create New Exam" to schedule one.
          </div>
        ) : (
          exams.map((exam) => {
            const start = new Date(exam.startAt);
            const isDisabled = exam.status === 'disabled';
            return (
              <div key={exam.id} className={`bg-slate-900 border rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between transition-all ${
                isDisabled ? 'border-red-900/60 opacity-85' : 'border-slate-800'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold uppercase">
                        {exam.durationMinutes} MINS
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isDisabled
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {isDisabled ? 'DISABLED' : 'ACTIVE'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white">{exam.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{exam.description || 'No description'}</p>
                </div>

                <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>Questions:</span>
                    </span>
                    <span className="font-bold text-white">{exam.questionCount} Questions</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Attempts:</span>
                    </span>
                    <span className="font-bold text-white">{exam.attemptCount} Attempts</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Start:</span>
                    </span>
                    <span className="font-mono text-[11px]">{start.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <Link
                    href={`/admin/questions?examId=${exam.id}`}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center border border-slate-700 transition-all"
                  >
                    Questions ({exam.questionCount})
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(exam.id, exam.status)}
                    className={`px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
                      isDisabled
                        ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                        : 'bg-red-950 hover:bg-red-900 text-red-300 border-red-800'
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

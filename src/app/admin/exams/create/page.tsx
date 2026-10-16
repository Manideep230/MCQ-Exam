'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, Clock, Award, Shield, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminCreateExamPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalMarks, setTotalMarks] = useState(30);

  // Dates default to current & tomorrow
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [startAt, setStartAt] = useState(now.toISOString().slice(0, 16));
  const [endAt, setEndAt] = useState(tomorrow.toISOString().slice(0, 16));

  const [showResults, setShowResults] = useState(true);
  const [allowBackNav, setAllowBackNav] = useState(true);
  const [abandonmentTimeoutSeconds, setAbandonmentTimeoutSeconds] = useState(60);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          durationMinutes: Number(durationMinutes),
          totalMarks: Number(totalMarks),
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          showResults,
          allowBackNav,
          abandonmentTimeoutSeconds: Number(abandonmentTimeoutSeconds),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create exam');

      router.push('/admin/exams');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-[#064E3B]">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/exams')}
          className="flex items-center space-x-2 text-xs font-black text-[#064E3B] hover:text-[#04382b] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exams</span>
        </button>
      </div>

      <div className="bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <span className="text-xs font-black text-[#064E3B] uppercase tracking-widest">EXAM CREATION WIZARD</span>
          <h1 className="text-2xl font-black text-[#064E3B] mt-1">Schedule New MCQ Examination</h1>
          <p className="text-xs text-[#064E3B]/80 mt-1 font-semibold">Configure exam parameters, window timing, and anti-cheating rule settings.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-100 border-2 border-red-400 text-red-900 text-xs flex items-center space-x-3 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-2">
              Exam Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MongoDB Basics"
              className="w-full px-4 py-3 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-2">
              Description / Instructions Summary
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter exam guidelines or topic coverage summary..."
              className="w-full px-4 py-3 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs leading-relaxed font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-2">
                Duration (Minutes)
              </label>
              <input
                type="number"
                required
                min={5}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-sm font-mono font-black focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-2">
                Total Marks
              </label>
              <input
                type="number"
                required
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-sm font-mono font-black focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>
          </div>

          {/* Server-Controlled Scheduling Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#fffdf9] border-2 border-[#064E3B]/20">
            <div>
              <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#064E3B]" />
                <span>Start Date & Time (Server Time)</span>
              </label>
              <input
                type="datetime-local"
                required
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#064E3B]" />
                <span>End Date & Time (Server Time)</span>
              </label>
              <input
                type="datetime-local"
                required
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>
          </div>

          {/* Settings Toggles */}
          <div className="space-y-4 pt-2 border-t-2 border-[#064E3B]/10">
            <h4 className="text-xs font-black text-[#064E3B] uppercase tracking-wider">Exam Control Settings</h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#fffdf9] border-2 border-[#064E3B]/20 cursor-pointer">
                <div>
                  <span className="text-xs font-black text-[#064E3B] block">Show Results to Students Immediately</span>
                  <span className="text-[10px] text-[#064E3B]/70 block font-semibold">If turned off, students see "Results will be released by administrator" upon submission.</span>
                </div>
                <input
                  type="checkbox"
                  checked={showResults}
                  onChange={(e) => setShowResults(e.target.checked)}
                  className="h-4 w-4 rounded border-[#064E3B] text-[#064E3B] focus:ring-[#064E3B]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#fffdf9] border-2 border-[#064E3B]/20 cursor-pointer">
                <div>
                  <span className="text-xs font-black text-[#064E3B] block">Allow Previous Question Navigation</span>
                  <span className="text-[10px] text-[#064E3B]/70 block font-semibold">Allows students to return and edit previous answers during the exam.</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowBackNav}
                  onChange={(e) => setAllowBackNav(e.target.checked)}
                  className="h-4 w-4 rounded border-[#064E3B] text-[#064E3B] focus:ring-[#064E3B]"
                />
              </label>

              <div className="p-3.5 rounded-xl bg-[#fffdf9] border-2 border-[#064E3B]/20 space-y-2">
                <label className="block text-xs font-black text-[#064E3B]">
                  Abandonment Heartbeat Timeout (Seconds)
                </label>
                <input
                  type="number"
                  required
                  min={15}
                  max={300}
                  value={abandonmentTimeoutSeconds}
                  onChange={(e) => setAbandonmentTimeoutSeconds(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-[#064E3B]/70 block font-medium">
                  If student heartbeat is lost for more than this duration (default 60s), the exam is submitted as abandoned.
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md border-2 border-[#064E3B]"
          >
            {loading ? 'CREATING EXAM SCHEDULE...' : 'SAVE & SCHEDULE EXAMINATION'}
          </button>
        </form>
      </div>
    </div>
  );
}

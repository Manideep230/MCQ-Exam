'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Search, Filter, ArrowUpDown, FileText, ExternalLink } from 'lucide-react';

interface ResultRow {
  attemptId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  branch: string;
  collegeName: string;
  status: string;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'time'>('time');

  useEffect(() => {
    fetchResults();
  }, [selectedExam]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/results?examId=${selectedExam}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Fetch results error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  // Sort logic
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'score') {
      return b.percentage - a.percentage;
    }
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">EXAMINATION RESULTS</h1>
          <p className="text-xs text-slate-400 mt-1">Comparative student performance reports, percentage scores, and answer sheets.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Roll Number, Student Name, or Exam Title..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSortBy(sortBy === 'score' ? 'time' : 'score')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Sort by {sortBy === 'score' ? 'Score' : 'Submission Time'}</span>
          </button>
        </div>
      </div>

      {/* Results Table (Rule #32) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
                <th className="py-4 px-6">Exam Title</th>
                <th className="py-4 px-6">Roll Number</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Branch</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6">Percentage</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Answer Sheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">Loading exam results...</td>
                </tr>
              ) : sortedResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">No examination submission records found.</td>
                </tr>
              ) : (
                sortedResults.map((res) => (
                  <tr key={res.attemptId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{res.examTitle}</td>
                    <td className="py-4 px-6 font-mono font-bold text-blue-400">{res.rollNumber}</td>
                    <td className="py-4 px-6 font-medium text-slate-200">{res.studentName}</td>
                    <td className="py-4 px-6 text-slate-400">{res.branch}</td>
                    <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                      {res.score} / {res.totalMarks}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-amber-400">
                      {res.percentage}%
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase">
                        {res.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/answers/${res.attemptId}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-950 text-blue-400 hover:bg-blue-900 border border-blue-800 text-xs font-bold transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect Sheet</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

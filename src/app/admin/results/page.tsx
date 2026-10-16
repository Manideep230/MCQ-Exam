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
    <div className="space-y-8 text-[#064E3B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#064E3B] tracking-tight">EXAMINATION RESULTS</h1>
          <p className="text-xs text-[#064E3B]/80 mt-1 font-semibold">Comparative student performance reports, percentage scores, and answer sheets.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#faedd7] border-2 border-[#064E3B]/20 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 flex space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#064E3B]/60 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Roll Number, Student Name, or Exam Title..."
              className="w-full pl-10 pr-4 py-2 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs placeholder-[#064E3B]/40 font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] text-xs font-black rounded-xl border border-[#064E3B]"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSortBy(sortBy === 'score' ? 'time' : 'score')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-xs font-black text-[#064E3B] hover:bg-[#faedd7]"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#064E3B]" />
            <span>Sort by {sortBy === 'score' ? 'Score' : 'Submission Time'}</span>
          </button>
        </div>
      </div>

      {/* Results Table (Rule #32) */}
      <div className="bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#faedd7] text-[#064E3B] text-[10px] uppercase font-black tracking-wider border-b-2 border-[#064E3B]/20">
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
            <tbody className="divide-y divide-[#064E3B]/10 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#064E3B]/60 font-bold">Loading exam results...</td>
                </tr>
              ) : sortedResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#064E3B]/60 font-bold">No examination submission records found.</td>
                </tr>
              ) : (
                sortedResults.map((res) => (
                  <tr key={res.attemptId} className="hover:bg-[#faedd7]/40 transition-colors">
                    <td className="py-4 px-6 font-black text-[#064E3B]">{res.examTitle}</td>
                    <td className="py-4 px-6 font-mono font-black text-[#064E3B]">{res.rollNumber}</td>
                    <td className="py-4 px-6 font-bold text-[#064E3B]">{res.studentName}</td>
                    <td className="py-4 px-6 text-[#064E3B]/80 font-medium">{res.branch}</td>
                    <td className="py-4 px-6 font-mono font-black text-[#064E3B]">
                      {res.score} / {res.totalMarks}
                    </td>
                    <td className="py-4 px-6 font-mono font-black text-[#064E3B]">
                      {res.percentage}%
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        res.status.toLowerCase().includes('submitted') || res.status.toLowerCase().includes('completed')
                          ? 'bg-[#064E3B]/15 text-[#064E3B] border border-[#064E3B]/30'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/answers/${res.attemptId}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#faedd7] hover:bg-[#064E3B] text-[#064E3B] hover:text-[#f8e7c9] border border-[#064E3B]/30 text-xs font-black transition-all"
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

'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  GraduationCap,
  Sparkles,
  X,
  ShieldAlert,
  Flame,
  Star
} from 'lucide-react';

interface ExamBreakdown {
  attemptId: string;
  examId: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  submittedAt?: string;
  violations: number;
}

interface LeaderboardStudent {
  rank: number;
  studentId: string;
  rollNumber: string;
  fullName: string;
  branch: string;
  collegeName: string;
  examsAttempted: number;
  examsCompleted: number;
  totalScore: number;
  totalMaxMarks: number;
  aggregatePercentage: number;
  bestExamPercentage: number;
  bestExamTitle: string;
  totalViolations: number;
  examBreakdowns: ExamBreakdown[];
}

interface LeaderboardStats {
  totalStudents: number;
  activeStudents: number;
  totalExamsCount: number;
  averagePercentage: number;
  topPerformer: {
    rank: number;
    name: string;
    rollNumber: string;
    branch: string;
    totalScore: number;
    aggregatePercentage: number;
  } | null;
}

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardStudent[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<LeaderboardStudent | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [branchFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (branchFilter !== 'all') params.set('branch', branchFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/admin/leaderboard?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeaderboard();
  };

  const exportCSV = () => {
    if (!leaderboard.length) {
      alert('No leaderboard data to export');
      return;
    }

    const headers = [
      'Rank',
      'Roll Number',
      'Full Name',
      'Branch',
      'Exams Completed',
      'Total Score',
      'Total Max Marks',
      'Aggregate Percentage',
      'Best Exam',
      'Best Exam Score %',
      'Total Security Violations',
    ];

    const rows = leaderboard.map(s => [
      s.rank,
      `"${s.rollNumber}"`,
      `"${s.fullName}"`,
      `"${s.branch}"`,
      s.examsCompleted,
      s.totalScore,
      s.totalMaxMarks,
      `${s.aggregatePercentage}%`,
      `"${s.bestExamTitle}"`,
      `${s.bestExamPercentage}%`,
      s.totalViolations,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top 3 Podium Students
  const top1 = leaderboard.find(s => s.rank === 1 && s.examsCompleted > 0);
  const top2 = leaderboard.find(s => s.rank === 2 && s.examsCompleted > 0);
  const top3 = leaderboard.find(s => s.rank === 3 && s.examsCompleted > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/30 via-blue-900/30 to-purple-900/20 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Performance Rankings
              </span>
              <span className="text-xs text-slate-400">GMRIT Final Year Technical Exam Assessment</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400" />
              Student Performance Leaderboard
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Cross-exam performance ranking based on total marks accumulated, aggregate score accuracy, completed test submissions, and integrity audit metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchLeaderboard}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Export Leaderboard CSV
            </button>
          </div>
        </div>

        {/* Global Key Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Ranked Students</span>
            <span className="text-2xl font-bold text-white mt-1 block">
              {stats?.totalStudents || 0}
            </span>
            <span className="text-[11px] text-slate-400">
              Active test takers: {stats?.activeStudents || 0}
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Average Score</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-bold text-blue-400">
                {stats?.averagePercentage || 0}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Across completed exams</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Available Exams</span>
            <span className="text-2xl font-bold text-purple-400 mt-1 block">
              {stats?.totalExamsCount || 0}
            </span>
            <span className="text-[11px] text-purple-400/80">Portal Assessments</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Top Performer</span>
            <div className="mt-1">
              <span className="text-sm font-bold text-amber-400 truncate block">
                {stats?.topPerformer?.name || 'No submissions yet'}
              </span>
              <span className="text-[11px] text-slate-400">
                {stats?.topPerformer ? `${stats.topPerformer.rollNumber} (${stats.topPerformer.totalScore} pts)` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {top1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Silver #2 */}
          <div className="order-2 md:order-1 bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="absolute top-3 right-3 text-2xl font-black text-slate-500/40">#2</div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700/80 border border-slate-500/50 flex items-center justify-center text-slate-200">
                  <Medal className="w-6 h-6 text-slate-300" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-600">
                  Runner Up
                </span>
              </div>
              {top2 ? (
                <>
                  <h3 className="text-lg font-bold text-white truncate">{top2.fullName}</h3>
                  <div className="text-xs font-mono text-blue-400">{top2.rollNumber} • {top2.branch}</div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-200">{top2.totalScore}</span>
                    <span className="text-xs text-slate-400 font-medium">points</span>
                    <span className="ml-auto text-sm font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                      {top2.aggregatePercentage}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    {top2.examsCompleted} exam(s) completed
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 mt-4">Awaiting 2nd place participant</p>
              )}
            </div>
            {top2 && (
              <button
                onClick={() => setSelectedStudent(top2)}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                View Breakdown
              </button>
            )}
          </div>

          {/* Gold #1 */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-900/40 via-amber-950/20 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-amber-500/10 scale-100 md:-translate-y-2">
            <div className="absolute top-3 right-3 text-3xl font-black text-amber-500/30">#1</div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/30">
                  <Trophy className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 1st Place
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white truncate">{top1.fullName}</h3>
              <div className="text-xs font-mono text-amber-300 font-semibold">{top1.rollNumber} • {top1.branch}</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-400">{top1.totalScore}</span>
                <span className="text-xs text-amber-200/80 font-medium">points</span>
                <span className="ml-auto text-base font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/30">
                  {top1.aggregatePercentage}%
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-2">
                {top1.examsCompleted} exam(s) completed • Best: {top1.bestExamPercentage}% ({top1.bestExamTitle})
              </div>
            </div>
            <button
              onClick={() => setSelectedStudent(top1)}
              className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-amber-500/30 transition"
            >
              Inspect Complete Record
            </button>
          </div>

          {/* Bronze #3 */}
          <div className="order-3 bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-700/40 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="absolute top-3 right-3 text-2xl font-black text-amber-700/40">#3</div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-700/50 flex items-center justify-center text-amber-500">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800">
                  3rd Place
                </span>
              </div>
              {top3 ? (
                <>
                  <h3 className="text-lg font-bold text-white truncate">{top3.fullName}</h3>
                  <div className="text-xs font-mono text-blue-400">{top3.rollNumber} • {top3.branch}</div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-amber-300">{top3.totalScore}</span>
                    <span className="text-xs text-slate-400 font-medium">points</span>
                    <span className="ml-auto text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                      {top3.aggregatePercentage}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    {top3.examsCompleted} exam(s) completed
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 mt-4">Awaiting 3rd place participant</p>
              )}
            </div>
            {top3 && (
              <button
                onClick={() => setSelectedStudent(top3)}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                View Breakdown
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Roll No, Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Branches</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition"
          >
            Filter
          </button>
        </form>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{leaderboard.length}</span> students
        </div>
      </div>

      {/* Main Leaderboard Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
          Calculating leaderboard rankings...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-medium text-slate-300">No students found matching your criteria</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 text-center w-16">Rank</th>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Branch</th>
                  <th className="px-4 py-3.5 text-center">Exams Done</th>
                  <th className="px-4 py-3.5 text-center">Total Score</th>
                  <th className="px-4 py-3.5 text-center">Aggregate %</th>
                  <th className="px-4 py-3.5">Best Score</th>
                  <th className="px-4 py-3.5 text-center">Violations</th>
                  <th className="px-4 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaderboard.map((student) => {
                  const isTop1 = student.rank === 1 && student.examsCompleted > 0;
                  const isTop2 = student.rank === 2 && student.examsCompleted > 0;
                  const isTop3 = student.rank === 3 && student.examsCompleted > 0;

                  return (
                    <tr
                      key={student.studentId}
                      className={`hover:bg-slate-800/40 transition ${
                        isTop1 ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3.5 text-center font-bold">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs shadow-sm">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 text-slate-200 border border-slate-500 text-xs shadow-sm">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-900/40 text-amber-500 border border-amber-700 text-xs shadow-sm">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">
                            #{student.rank}
                          </span>
                        )}
                      </td>

                      {/* Student Details */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {student.fullName}
                          {isTop1 && <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        </div>
                        <div className="text-xs text-blue-400 font-mono">{student.rollNumber}</div>
                      </td>

                      {/* Branch */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          student.branch?.toUpperCase().includes('ECE')
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {student.branch || '-'}
                        </span>
                      </td>

                      {/* Exams Done */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex px-2.5 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300">
                          {student.examsCompleted}
                        </span>
                      </td>

                      {/* Total Score */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="text-sm font-extrabold text-white">
                          {student.totalScore}
                          <span className="text-xs text-slate-500 font-normal"> / {student.totalMaxMarks}</span>
                        </div>
                      </td>

                      {/* Aggregate % */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.aggregatePercentage >= 80
                                  ? 'bg-emerald-500'
                                  : student.aggregatePercentage >= 65
                                  ? 'bg-blue-500'
                                  : student.aggregatePercentage >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${student.aggregatePercentage}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${
                            student.aggregatePercentage >= 80
                              ? 'text-emerald-400'
                              : student.aggregatePercentage >= 65
                              ? 'text-blue-400'
                              : student.aggregatePercentage >= 50
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}>
                            {student.aggregatePercentage}%
                          </span>
                        </div>
                      </td>

                      {/* Best Score */}
                      <td className="px-4 py-3.5">
                        {student.bestExamPercentage > 0 ? (
                          <div>
                            <span className="text-xs font-semibold text-slate-200">{student.bestExamPercentage}%</span>
                            <span className="text-[11px] text-slate-400 truncate block max-w-[160px]">{student.bestExamTitle}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">-</span>
                        )}
                      </td>

                      {/* Violations */}
                      <td className="px-4 py-3.5 text-center">
                        {student.totalViolations > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            <ShieldAlert className="w-3 h-3" />
                            {student.totalViolations}
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-400 font-medium">0</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/30 flex items-center gap-1 ml-auto transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Breakdown
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT EXAM BREAKDOWN MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Rank #{selectedStudent.rank}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedStudent.fullName}</h3>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Roll No: <span className="font-mono text-blue-400">{selectedStudent.rollNumber}</span> • {selectedStudent.branch} • {selectedStudent.collegeName}
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Summary Cards */}
            <div className="grid grid-cols-3 gap-3 p-6 bg-slate-950/40 border-b border-slate-800">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Score</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {selectedStudent.totalScore} / {selectedStudent.totalMaxMarks}
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Aggregate Accuracy</span>
                <span className="text-xl font-bold text-blue-400 mt-1 block">
                  {selectedStudent.aggregatePercentage}%
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Violations</span>
                <span className={`text-xl font-bold mt-1 block ${selectedStudent.totalViolations > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedStudent.totalViolations}
                </span>
              </div>
            </div>

            {/* Exams List */}
            <div className="p-6 overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Exam History & Submissions ({selectedStudent.examBreakdowns.length})
              </h4>

              {selectedStudent.examBreakdowns.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No exam attempts recorded yet for this student.
                </div>
              ) : (
                selectedStudent.examBreakdowns.map((att) => (
                  <div key={att.attemptId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <h5 className="font-semibold text-white text-sm">{att.examTitle}</h5>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          att.status === 'submitted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {att.status.toUpperCase()}
                        </span>
                        {att.submittedAt && (
                          <span>Submitted: {new Date(att.submittedAt).toLocaleDateString()}</span>
                        )}
                        {att.violations > 0 && (
                          <span className="text-red-400 font-semibold">
                            ⚠️ {att.violations} violation(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-extrabold text-white">
                        {att.score} <span className="text-xs text-slate-500 font-normal">/ {att.totalMarks}</span>
                      </div>
                      <span className={`text-xs font-bold ${
                        att.percentage >= 80 ? 'text-emerald-400' : att.percentage >= 60 ? 'text-blue-400' : 'text-amber-400'
                      }`}>
                        {att.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

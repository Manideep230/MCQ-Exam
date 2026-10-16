'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Settings,
  BarChart3,
  Users,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  GraduationCap,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  Sliders,
  HelpCircle,
  Clock,
  Layers,
  ThumbsUp,
  Lightbulb
} from 'lucide-react';
import { FEEDBACK_QUESTIONS, FEEDBACK_SECTIONS, FeedbackQuestion } from '@/lib/feedbackQuestions';

interface FeedbackSummary {
  _id: string;
  studentId: string;
  rollNumber: string;
  fullName: string;
  branch: string;
  collegeEmail?: string;
  submittedAt: string;
  summaryStats?: {
    avgTopicRating: number;
    avgTrainerRating: number;
    avgPracticalRating: number;
    overallSatisfaction: number;
  };
  answers: Record<string, any>;
}

interface AnalyticsData {
  totalResponses: number;
  branchCounts: { ECE: number; EEE: number; Other: number };
  avgOverallSatisfaction: number;
  avgTrainerScore: number;
  avgTopicScore: number;
  avgPracticalScore: number;
  topicAnalysis: Array<{
    id: string;
    number: number;
    topicText: string;
    avgRating: number;
    responseCount: number;
    notAttendedCount: number;
  }>;
  trainerAnalysis: Array<{
    id: string;
    number: number;
    questionText: string;
    avgRating: number;
    responseCount: number;
  }>;
  practicalAnalysis: Array<{
    id: string;
    number: number;
    questionText: string;
    avgRating: number;
    responseCount: number;
  }>;
  outcomesAnalysis: Array<{
    id: string;
    number: number;
    questionText: string;
    counts: Record<string, number>;
  }>;
  projectAnalysis: Array<{
    id: string;
    number: number;
    questionText: string;
    counts: Record<string, number>;
  }>;
  qualitativeData: Record<string, Array<{ student: string; rollNumber: string; branch: string; text: string }>>;
}

interface FormSettings {
  isFormEnabled: boolean;
  isGoogleFormEnabled: boolean;
  googleFormUrl: string;
}

export default function AdminFeedbackPage() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'topics_trainer' | 'outcomes_project' | 'qualitative' | 'settings'>('submissions');
  const [feedbacks, setFeedbacks] = useState<FeedbackSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [settings, setSettings] = useState<FormSettings>({
    isFormEnabled: true,
    isGoogleFormEnabled: false,
    googleFormUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  // Inspection Modal
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackSummary | null>(null);

  // Qualitative question selector
  const [selectedQualQuestion, setSelectedQualQuestion] = useState('q73');

  useEffect(() => {
    loadData();
    loadSettings();
  }, [branchFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (branchFilter !== 'all') params.set('branch', branchFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/admin/feedback?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
        setAnalytics(data.analytics || null);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/feedback/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings({
            isFormEnabled: data.settings.isFormEnabled ?? true,
            isGoogleFormEnabled: data.settings.isGoogleFormEnabled ?? false,
            googleFormUrl: data.settings.googleFormUrl || '',
          });
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsStatus(null);
    try {
      const res = await fetch('/api/admin/feedback/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettingsStatus('Settings saved successfully!');
        setTimeout(() => setSettingsStatus(null), 3000);
      } else {
        setSettingsStatus('Failed to save settings.');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setSettingsStatus('Network error while saving settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteFeedback = async (id: string, roll: string) => {
    if (!confirm(`Are you sure you want to delete feedback from ${roll}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/feedback/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedbacks(prev => prev.filter(f => f._id !== id));
        if (selectedFeedback?._id === id) setSelectedFeedback(null);
        loadData();
      } else {
        alert('Failed to delete feedback');
      }
    } catch (err) {
      console.error('Delete feedback error:', err);
      alert('Error occurred while deleting feedback');
    }
  };

  const exportCSV = () => {
    if (!feedbacks.length) {
      alert('No feedbacks to export');
      return;
    }

    const headers = [
      'Roll Number',
      'Full Name',
      'Branch',
      'College Email',
      'Attendance (Q9)',
      'Prior Knowledge (Q10)',
      'Overall Stars (Q78)',
      'Avg Topic Rating',
      'Avg Trainer Rating',
      'Avg Practical Rating',
      'Submitted At',
      ...FEEDBACK_QUESTIONS.map(q => `Q${q.number}: ${q.questionText.slice(0, 30).replace(/,/g, '')}`),
    ];

    const rows = feedbacks.map(f => {
      const ans = f.answers || {};
      const qValues = FEEDBACK_QUESTIONS.map(q => {
        const val = ans[q.id];
        if (val === undefined || val === null) return '';
        if (q.type === 'rating_topic' && val === 0) return 'Not Attended';
        return `"${String(val).replace(/"/g, '""')}"`;
      });

      return [
        `"${f.rollNumber}"`,
        `"${f.fullName}"`,
        `"${f.branch}"`,
        `"${f.collegeEmail || ''}"`,
        `"${ans.q9 || ''}"`,
        `"${ans.q10 || ''}"`,
        ans.q78 || '',
        f.summaryStats?.avgTopicRating || '',
        f.summaryStats?.avgTrainerRating || '',
        f.summaryStats?.avgPracticalRating || '',
        `"${f.submittedAt ? new Date(f.submittedAt).toLocaleString() : ''}"`,
        ...qValues,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FSI_Training_Feedback_Submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> FSI GMRIT Training Hub
              </span>
              <span className="text-xs text-slate-400">Final Year ECE & EEE (83 Questions Evaluation)</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              Student Training Feedback & Analytics
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Comprehensive analytics across IoT, IIoT, Edge AI, Python & Databases curriculum. Monitor student learning outcomes, trainer effectiveness, hands-on activities, and project ideation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { loadData(); loadSettings(); }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Global Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Total Responses</span>
            <span className="text-2xl font-bold text-white mt-1 block">
              {analytics?.totalResponses ?? feedbacks.length}
            </span>
            <span className="text-[11px] text-slate-400">
              ECE: {analytics?.branchCounts.ECE || 0} | EEE: {analytics?.branchCounts.EEE || 0}
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Overall Rating</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-2xl font-bold text-amber-400">
                {analytics?.avgOverallSatisfaction || '0.0'}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <span className="text-[11px] text-slate-400">Student Satisfaction</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Trainer Score</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-bold text-emerald-400">
                {analytics?.avgTrainerScore || '0.0'}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <span className="text-[11px] text-emerald-400/80">Q31–Q41 Average</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Topic Mastery</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-bold text-indigo-400">
                {analytics?.avgTopicScore || '0.0'}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <span className="text-[11px] text-indigo-400/80">Q11–Q30 Average</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Practical Activities</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-bold text-purple-400">
                {analytics?.avgPracticalScore || '0.0'}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <span className="text-[11px] text-purple-400/80">Hands-on Rating</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Form Status</span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.isFormEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm font-semibold text-white">
                {settings.isFormEnabled ? 'Portal Active' : 'Disabled'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {settings.isGoogleFormEnabled ? 'Google Form Linked' : 'In-Portal Only'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'submissions'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Submissions & Inspector ({feedbacks.length})
        </button>

        <button
          onClick={() => setActiveTab('topics_trainer')}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'topics_trainer'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Topics & Trainer Metrics
        </button>

        <button
          onClick={() => setActiveTab('outcomes_project')}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'outcomes_project'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Learning Outcomes & Projects
        </button>

        <button
          onClick={() => setActiveTab('qualitative')}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'qualitative'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4" /> Qualitative Responses & Feedback
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" /> Form & Portal Settings
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS & INSPECTOR */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Roll No, Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadData()}
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
                onClick={loadData}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition"
              >
                Apply
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-200">{feedbacks.length}</span> submissions
            </div>
          </div>

          {/* Submissions Table */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
              Loading feedback submissions...
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-300">No feedback submissions found</p>
              <p className="text-xs text-slate-500 mt-1">Students can submit feedback from their dashboard.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3 text-center">Overall</th>
                      <th className="px-4 py-3 text-center">Trainer</th>
                      <th className="px-4 py-3 text-center">Topics</th>
                      <th className="px-4 py-3 text-center">Practical</th>
                      <th className="px-4 py-3">Submitted At</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {feedbacks.map((f) => (
                      <tr key={f._id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-white">{f.fullName}</div>
                          <div className="text-xs text-blue-400 font-mono">{f.rollNumber}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                            f.branch?.toUpperCase().includes('ECE')
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {f.branch || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-xs font-bold border border-amber-500/20">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {f.summaryStats?.overallSatisfaction || f.answers?.q78 || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-medium text-emerald-400">
                          {f.summaryStats?.avgTrainerRating ? `${f.summaryStats.avgTrainerRating} / 5` : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-center font-medium text-indigo-400">
                          {f.summaryStats?.avgTopicRating ? `${f.summaryStats.avgTopicRating} / 5` : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-center font-medium text-purple-400">
                          {f.summaryStats?.avgPracticalRating ? `${f.summaryStats.avgPracticalRating} / 5` : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-400">
                          {f.submittedAt ? new Date(f.submittedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedFeedback(f)}
                              className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-semibold rounded-lg border border-blue-500/30 flex items-center gap-1.5 transition"
                            >
                              <Eye className="w-3.5 h-3.5" /> Inspect
                            </button>
                            <button
                              onClick={() => handleDeleteFeedback(f._id, f.rollNumber)}
                              className="p-1.5 bg-red-600/10 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/20 transition"
                              title="Delete submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TOPICS & TRAINER ANALYTICS */}
      {activeTab === 'topics_trainer' && analytics && (
        <div className="space-y-8">
          {/* Section 2: Topic-Wise Evaluation (Q11 to Q30) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Section 2: Topic-Wise Training Evaluation (Q11–Q30)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aggregated average score (Scale 1–5). Evaluated by attended students only.
                </p>
              </div>
              <div className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 self-start sm:self-auto">
                Avg Rating across all topics: {analytics.avgTopicScore} / 5.0
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.topicAnalysis.map((topic) => {
                const pct = (topic.avgRating / 5) * 100;
                const barColor =
                  topic.avgRating >= 4.2
                    ? 'bg-emerald-500'
                    : topic.avgRating >= 3.5
                    ? 'bg-blue-500'
                    : topic.avgRating >= 3.0
                    ? 'bg-amber-500'
                    : 'bg-red-500';

                return (
                  <div key={topic.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="text-sm font-medium text-slate-200">
                        <span className="text-xs font-mono text-indigo-400 font-bold mr-2">Q{topic.number}.</span>
                        {topic.topicText}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-bold text-white">{topic.avgRating}</span>
                        <span className="text-xs text-slate-500">/5</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{topic.responseCount} rated</span>
                      {topic.notAttendedCount > 0 && (
                        <span className="text-amber-500/80">{topic.notAttendedCount} not attended</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Trainer Evaluation (Q31 to Q41) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  Section 3: Trainer Evaluation Metrics (Q31–Q41)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Teaching clarity, subject knowledge, pacing, and project guidance (Scale 1–5).
                </p>
              </div>
              <div className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 self-start sm:self-auto">
                Trainer Average Score: {analytics.avgTrainerScore} / 5.0
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.trainerAnalysis.map((item) => {
                const pct = (item.avgRating / 5) * 100;
                return (
                  <div key={item.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="text-sm font-medium text-slate-200">
                        <span className="text-xs font-mono text-emerald-400 font-bold mr-2">Q{item.number}.</span>
                        {item.questionText}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-bold text-emerald-400">{item.avgRating}</span>
                        <span className="text-xs text-slate-500">/5</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1.5">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 text-right">
                      {item.responseCount} student ratings
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Practical Activities (Q42 to Q50) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="pb-4 mb-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                Section 4: Hands-on Practical Learning & Activities (Q42–Q50)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation of MQTT, EMQX, MongoDB, Python, Circuit Simulation (Wokwi) and 3D Visualization exercises.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.practicalAnalysis.map((item) => {
                const pct = (item.avgRating / 5) * 100;
                return (
                  <div key={item.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="text-sm font-medium text-slate-200">
                        <span className="text-xs font-mono text-purple-400 font-bold mr-2">Q{item.number}.</span>
                        {item.questionText}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-bold text-purple-400">{item.avgRating}</span>
                        <span className="text-xs text-slate-500">/5</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1.5">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 text-right">
                      {item.responseCount} responses
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OUTCOMES & PROJECT PREPARATION */}
      {activeTab === 'outcomes_project' && analytics && (
        <div className="space-y-8">
          {/* Section 5: Student Learning Outcomes (Q52 to Q61) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="pb-4 mb-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Section 5: Student Learning Outcomes & Self-Reliance (Q52–Q61)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Students self-rating their ability to perform technical tasks independently vs with guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analytics.outcomesAnalysis.map((outcome) => {
                const independent = outcome.counts['Yes, independently'] || 0;
                const partial = outcome.counts['Partially, with some help'] || 0;
                const notYet = outcome.counts['Not yet'] || 0;
                const total = independent + partial + notYet || 1;

                const indPct = Math.round((independent / total) * 100);
                const partPct = Math.round((partial / total) * 100);
                const notPct = Math.round((notYet / total) * 100);

                return (
                  <div key={outcome.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-sm font-medium text-slate-200 mb-3">
                      <span className="text-xs font-mono text-emerald-400 font-bold mr-2">Q{outcome.number}.</span>
                      {outcome.questionText}
                    </div>

                    {/* Stacked Multi-Color Bar */}
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 mb-3">
                      <div
                        style={{ width: `${indPct}%` }}
                        className="bg-emerald-500 h-full transition-all"
                        title={`Yes, independently: ${independent} (${indPct}%)`}
                      />
                      <div
                        style={{ width: `${partPct}%` }}
                        className="bg-amber-500 h-full transition-all"
                        title={`Partially, with help: ${partial} (${partPct}%)`}
                      />
                      <div
                        style={{ width: `${notPct}%` }}
                        className="bg-red-500 h-full transition-all"
                        title={`Not yet: ${notYet} (${notPct}%)`}
                      />
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Independent: {independent} ({indPct}%)</span>
                      </div>
                      <div className="text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>With Help: {partial} ({partPct}%)</span>
                      </div>
                      <div className="text-red-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Not Yet: {notYet} ({notPct}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: Project Ideation & Readiness (Q62 to Q72) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="pb-4 mb-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Section 6: Project Ideation & Preparation Status (Q62–Q72)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution of selected domains, problem statements, component planning, and simulation progress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analytics.projectAnalysis.map((item) => {
                const entries = Object.entries(item.counts);
                const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;

                return (
                  <div key={item.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                    <div className="text-sm font-medium text-slate-200 mb-3">
                      <span className="text-xs font-mono text-blue-400 font-bold mr-2">Q{item.number}.</span>
                      {item.questionText}
                    </div>

                    <div className="space-y-2">
                      {entries.map(([label, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={label} className="text-xs">
                            <div className="flex justify-between text-slate-300 mb-1">
                              <span className="truncate pr-2">{label}</span>
                              <span className="font-semibold text-white">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUALITATIVE RESPONSES */}
      {activeTab === 'qualitative' && analytics && (
        <div className="space-y-6">
          {/* Question Selector */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" /> Select Topic:
            </span>
            {[
              { id: 'q73', label: 'Q73: What Went Well' },
              { id: 'q74', label: 'Q74: Topics Needing More Practice' },
              { id: 'q76', label: 'Q76: Specific Project Help Needed' },
              { id: 'q77', label: 'Q77: Suggestions to Improve Training' },
              { id: 'q79', label: 'Q79: Key Takeaways' },
              { id: 'q80', label: 'Q80: Additional Comments' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedQualQuestion(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedQualQuestion === item.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Qualitative Cards Feed */}
          {(!analytics.qualitativeData[selectedQualQuestion] || analytics.qualitativeData[selectedQualQuestion].length === 0) ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-300">No written feedback for this question yet</p>
              <p className="text-xs text-slate-500 mt-1">Students will provide answers in their submitted forms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.qualitativeData[selectedQualQuestion].map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
                  <p className="text-sm text-slate-200 italic mb-4 leading-relaxed whitespace-pre-wrap">
                    "{item.text}"
                  </p>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white block">{item.student}</span>
                      <span className="text-[11px] text-blue-400 font-mono">{item.rollNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {item.branch}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FORM & PORTAL SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              Student Feedback Form Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Control student access to the FSI training feedback form and optionally link an external Google Form.
            </p>
          </div>

          {settingsStatus && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
              settingsStatus.includes('success')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{settingsStatus}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Setting 1: Portal Form Switch */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="text-sm font-semibold text-white block">
                  Enable In-Portal Feedback Form
                </label>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  When enabled, students can access and fill out the interactive 83-question FSI Training Feedback Form from their dashboard (/student/feedback).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings.isFormEnabled}
                  onChange={(e) => setSettings({ ...settings, isFormEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Setting 2: External Google Form Switch */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="text-sm font-semibold text-white block">
                  Enable Google Form Link / Alternative
                </label>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  When enabled, students will see an option or notice directing them to fill out the external Google Form alongside or instead of the portal form.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={settings.isGoogleFormEnabled}
                  onChange={(e) => setSettings({ ...settings, isGoogleFormEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Setting 3: Google Form URL */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <label className="text-sm font-semibold text-white block flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                Google Form URL
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/forms/d/e/.../viewform"
                value={settings.googleFormUrl}
                onChange={(e) => setSettings({ ...settings, googleFormUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
              <p className="text-[11px] text-slate-500">
                Enter your GMRIT FSI feedback Google Form link if you want students to submit through Google Forms directly.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {savingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* INSPECT STUDENT MODAL */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{selectedFeedback.fullName}</h3>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {selectedFeedback.rollNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">
                    {selectedFeedback.branch}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Submitted at: {selectedFeedback.submittedAt ? new Date(selectedFeedback.submittedAt).toLocaleString() : 'N/A'}
                </div>
              </div>

              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Complete 83 Question Inspector */}
            <div className="p-6 overflow-y-auto space-y-8 divide-y divide-slate-800/80">
              {FEEDBACK_SECTIONS.map((sec) => {
                const sectionQuestions = FEEDBACK_QUESTIONS.filter(q => q.section === sec.id);

                return (
                  <div key={sec.id} className="pt-6 first:pt-0">
                    <div className="mb-4">
                      <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                        {sec.title}
                      </span>
                      <p className="text-xs text-slate-400">{sec.description}</p>
                    </div>

                    <div className="space-y-3">
                      {sectionQuestions.map((q) => {
                        const answer = selectedFeedback.answers?.[q.id];

                        let displayAnswer: React.ReactNode = '-';
                        if (answer !== undefined && answer !== null && answer !== '') {
                          if (q.type === 'rating_topic') {
                            if (answer === 0) {
                              displayAnswer = (
                                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                                  Not Attended / Unable to Evaluate
                                </span>
                              );
                            } else {
                              displayAnswer = (
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1 w-fit">
                                  <Star className="w-3.5 h-3.5 fill-emerald-400" />
                                  {answer} / 5 Stars
                                </span>
                              );
                            }
                          } else if (q.type === 'rating_5') {
                            displayAnswer = (
                              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 flex items-center gap-1 w-fit">
                                <Star className="w-3.5 h-3.5 fill-indigo-400" />
                                {answer} / 5
                              </span>
                            );
                          } else if (q.type === 'paragraph') {
                            displayAnswer = (
                              <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap leading-relaxed">
                                {String(answer)}
                              </p>
                            );
                          } else {
                            displayAnswer = (
                              <span className="text-xs font-medium text-slate-200 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                                {String(answer)}
                              </span>
                            );
                          }
                        } else {
                          displayAnswer = <span className="text-xs text-slate-600 italic">No answer provided</span>;
                        }

                        return (
                          <div key={q.id} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="max-w-xl">
                              <span className="text-xs font-mono font-bold text-slate-400 mr-2">Q{q.number}.</span>
                              <span className="text-xs font-medium text-slate-300">{q.questionText}</span>
                            </div>
                            <div className="flex-shrink-0 sm:text-right">
                              {displayAnswer}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

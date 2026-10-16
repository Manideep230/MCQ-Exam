'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  ExternalLink, 
  Star, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Info,
  Clock,
  Award
} from 'lucide-react';
import { 
  FEEDBACK_QUESTIONS, 
  FEEDBACK_SECTIONS, 
  TOPIC_RATING_OPTIONS, 
  STANDARD_5_SCALE,
  FeedbackQuestion 
} from '@/lib/feedbackQuestions';

export default function StudentFeedbackPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState<{
    isFormEnabled: boolean;
    isGoogleFormEnabled: boolean;
    googleFormUrl: string;
  }>({
    isFormEnabled: true,
    isGoogleFormEnabled: false,
    googleFormUrl: '',
  });

  const [studentInfo, setStudentInfo] = useState<{
    id: string;
    rollNumber: string;
    fullName: string;
    branch: string;
    collegeName: string;
  } | null>(null);

  const [existingFeedback, setExistingFeedback] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [activeSection, setActiveSection] = useState<number>(1);

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/feedback');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load feedback form');
      }

      setSettings(data.settings);
      setStudentInfo(data.student);

      const initialAnswers: Record<string, any> = {};

      // If existing feedback exists, prefill all answers
      if (data.existingFeedback?.answers) {
        setExistingFeedback(data.existingFeedback);
        Object.assign(initialAnswers, data.existingFeedback.answers);
      } else {
        // Pre-fill student details
        if (data.student?.fullName) initialAnswers.q1 = data.student.fullName;
        if (data.student?.rollNumber) initialAnswers.q2 = data.student.rollNumber;
        if (data.student?.branch) {
          const b = data.student.branch.toUpperCase();
          if (b.includes('ECE') || b.includes('ELECTRONICS')) {
            initialAnswers.q3 = 'Electronics and Communication Engineering (ECE)';
          } else if (b.includes('EEE') || b.includes('ELECTRICAL')) {
            initialAnswers.q3 = 'Electrical and Electronics Engineering (EEE)';
          } else {
            initialAnswers.q3 = data.student.branch;
          }
        }
        initialAnswers.q4 = 'Final Year — 4th Year';
        initialAnswers.q9 = 'Above 90%';
        initialAnswers.q10 = 'Basic Knowledge';
      }

      setAnswers(initialAnswers);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: value,
    }));
  };

  const calculateCompletion = () => {
    const total = FEEDBACK_QUESTIONS.length;
    let filled = 0;
    FEEDBACK_QUESTIONS.forEach(q => {
      const v = answers[q.id];
      if (v !== undefined && v !== null && v !== '') {
        filled++;
      }
    });
    return {
      filled,
      total,
      percentage: Math.round((filled / total) * 100),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate required questions
    const missing: string[] = [];
    FEEDBACK_QUESTIONS.forEach(q => {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === '') {
          missing.push(`Q${q.number}: ${q.questionText}`);
        }
      }
    });

    if (missing.length > 0) {
      setErrorMsg(`Please answer the following required question(s): ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` and ${missing.length - 3} more` : ''}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/student/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccessMsg('Your feedback has been successfully submitted! Thank you for helping us improve the FSI Technical Training.');
      setExistingFeedback(data.feedback);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8e7c9] flex items-center justify-center text-[#064E3B] text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold">Loading feedback form...</span>
        </div>
      </div>
    );
  }

  const { filled, total, percentage } = calculateCompletion();

  return (
    <div className="min-h-screen bg-[#f8e7c9] text-[#064E3B] flex flex-col pb-28">
      {/* Header Bar */}
      <header className="bg-[#f8e7c9]/95 backdrop-blur-md border-b border-[#064E3B]/20 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/student/dashboard"
              className="p-2 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] transition-all shadow-sm"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-black text-[#064E3B] tracking-wide flex items-center space-x-2">
                <span>FSI TRAINING FEEDBACK</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#064E3B] text-[#f8e7c9] font-mono font-bold">
                  GMRIT
                </span>
              </h1>
              <p className="text-xs text-[#064E3B]/80 font-medium">Student Portal — Technical Training Evaluation</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#faedd7] border border-[#064E3B]/30 text-xs font-mono">
              <span className="text-[#064E3B]/70 font-semibold">Progress:</span>
              <span className="font-extrabold text-[#064E3B]">
                {filled} / {total} ({percentage}%)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        
        {/* Banner Card */}
        <div className="bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#064E3B] text-[#f8e7c9] text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-[#f8e7c9]" />
                <span>OFFICIAL FEEDBACK FORM</span>
              </span>
              <span className="text-xs text-[#064E3B] font-bold">
                GMR Institute of Technology (GMRIT)
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#064E3B] tracking-tight">
              FSI Technical Training — Student Feedback Form
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#064E3B] pt-1">
              <div>
                <span className="text-[#064E3B]/70 font-medium">Programme:</span> <strong className="text-[#064E3B]">B.Tech Final Year — ECE & EEE</strong>
              </div>
              <div>
                <span className="text-[#064E3B]/70 font-medium">Domains:</span> <span className="font-semibold text-[#064E3B]">IoT, IIoT, AIoT, Databases, Python, Edge AI, Neural Networks & Project Planning</span>
              </div>
            </div>

            <p className="text-xs text-[#064E3B]/90 leading-relaxed pt-2 border-t border-[#064E3B]/20 font-medium">
              Dear Student, please provide your honest feedback on the FSI technical training sessions. Your feedback will help evaluate the effectiveness of the training, teaching methodology, technical content, practical activities, and overall learning experience. Please answer based on your actual experience.
            </p>
          </div>
        </div>

        {/* Google Form Notice Banner if Enabled */}
        {settings.isGoogleFormEnabled && settings.googleFormUrl && (
          <div className="bg-[#faedd7] border-2 border-[#064E3B]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center space-x-3 text-[#064E3B]">
              <Info className="w-5 h-5 text-[#064E3B] shrink-0" />
              <span>
                <strong>Google Form Available:</strong> You may also submit feedback using the official Google Form if requested by your faculty.
              </span>
            </div>
            <a
              href={settings.googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-bold text-xs shrink-0 transition-all shadow-md"
            >
              <span>Open Google Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Feedback Closed Notice */}
        {!settings.isFormEnabled && (
          <div className="p-6 rounded-2xl bg-red-100 border border-red-300 text-red-900 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h3 className="font-bold text-base text-red-900">Feedback Form Currently Closed</h3>
            <p className="text-xs text-red-700">
              The feedback submission period has been concluded by the training administration.
            </p>
          </div>
        )}

        {/* Submission Confirmation Alert */}
        {successMsg && (
          <div className="p-5 rounded-2xl bg-[#faedd7] border-2 border-[#064E3B] text-[#064E3B] text-sm flex items-start space-x-3 shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-[#064E3B] shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[#064E3B]">{successMsg}</p>
              <p className="text-xs text-[#064E3B]/80 mt-1 font-medium">
                You can review or modify your responses anytime while the form remains active.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-100 border border-red-400 text-red-800 text-xs flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Existing Feedback Status Badge if previously submitted */}
        {existingFeedback && !successMsg && (
          <div className="bg-[#faedd7] border border-[#064E3B]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[#064E3B] text-[#f8e7c9] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#064E3B]">Feedback Record On File</span>
                <p className="text-[11px] text-[#064E3B]/70">
                  Last submitted on {new Date(existingFeedback.submittedAt).toLocaleDateString()} at{' '}
                  {new Date(existingFeedback.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#f8e7c9] bg-[#064E3B] px-3 py-1.5 rounded-xl font-mono font-bold shadow-sm">
              Overall: {existingFeedback.summaryStats?.overallSatisfaction || 5} ★
            </span>
          </div>
        )}

        {/* Navigation Tabs for Sections */}
        <div className="sticky top-20 z-20 bg-[#f8e7c9]/95 backdrop-blur-md py-2 border-b border-[#064E3B]/20 flex overflow-x-auto gap-2 no-scrollbar">
          {FEEDBACK_SECTIONS.map(s => {
            const isActive = activeSection === s.id;
            const secQuestions = FEEDBACK_QUESTIONS.filter(q => q.section === s.id);
            const secFilled = secQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length;
            const isComplete = secFilled === secQuestions.length;

            return (
              <button
                type="button"
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  const el = document.getElementById(`section-${s.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 border shrink-0 ${
                  isActive
                    ? 'bg-[#064E3B] text-[#f8e7c9] border-[#064E3B] shadow-md font-extrabold'
                    : isComplete
                    ? 'bg-[#faedd7] text-[#064E3B] border-[#064E3B] font-bold hover:bg-[#f3deba]'
                    : 'bg-[#faedd7] text-[#064E3B]/80 border-[#064E3B]/30 hover:border-[#064E3B] hover:text-[#064E3B]'
                }`}
              >
                <span>Sec {s.id}</span>
                {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-[#064E3B]" />}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-12">
          {FEEDBACK_SECTIONS.map(section => {
            const sectionQuestions = FEEDBACK_QUESTIONS.filter(q => q.section === section.id);

            return (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="bg-[#faedd7] border-2 border-[#064E3B]/25 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl scroll-mt-36"
              >
                {/* Section Header */}
                <div className="border-b border-[#064E3B]/20 pb-4 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#064E3B] text-[#f8e7c9] text-[10px] font-mono font-bold shadow-sm">
                      SECTION {section.id}
                    </span>
                    <h3 className="text-lg font-black text-[#064E3B] tracking-wide">{section.title}</h3>
                  </div>
                  <p className="text-xs text-[#064E3B]/80 font-medium">{section.description}</p>
                </div>

                {/* Questions Grid */}
                <div className="space-y-6">
                  {sectionQuestions.map(q => {
                    const value = answers[q.id];

                    return (
                      <div
                        key={q.id}
                        className="bg-[#fffdf9] border border-[#064E3B]/25 rounded-2xl p-5 space-y-3.5 transition-all hover:border-[#064E3B]/50 shadow-sm"
                      >
                        {/* Question Label */}
                        <div className="flex items-start justify-between gap-3">
                          <label className="text-xs sm:text-sm font-bold text-[#064E3B] leading-snug">
                            <span className="font-mono text-[#064E3B] font-extrabold mr-1.5">{q.number}.</span>
                            <span>{q.questionText}</span>
                            {q.required && <span className="text-red-600 ml-1 font-bold">*</span>}
                          </label>
                        </div>

                        {q.helpText && (
                          <p className="text-[11px] text-[#064E3B]/70 font-medium">{q.helpText}</p>
                        )}

                        {/* Question Type: Short Answer */}
                        {q.type === 'short_answer' && (
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || 'Your response...'}
                            disabled={!settings.isFormEnabled}
                            className="w-full bg-[#f8e7c9]/40 border border-[#064E3B]/30 rounded-xl px-4 py-2.5 text-xs text-[#064E3B] placeholder-[#064E3B]/40 focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] disabled:opacity-50 font-medium"
                          />
                        )}

                        {/* Question Type: Paragraph */}
                        {q.type === 'paragraph' && (
                          <textarea
                            rows={3}
                            value={value || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || 'Type your detailed feedback here...'}
                            disabled={!settings.isFormEnabled}
                            className="w-full bg-[#f8e7c9]/40 border border-[#064E3B]/30 rounded-xl px-4 py-2.5 text-xs text-[#064E3B] placeholder-[#064E3B]/40 focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] disabled:opacity-50 resize-y font-medium"
                          />
                        )}

                        {/* Question Type: Multiple Choice */}
                        {q.type === 'multiple_choice' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {q.options.map(opt => {
                              const isChecked = value === opt;
                              return (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() => handleAnswerChange(q.id, opt)}
                                  disabled={!settings.isFormEnabled}
                                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-start space-x-2.5 ${
                                    isChecked
                                      ? 'bg-[#064E3B] border-2 border-[#064E3B] text-[#f8e7c9] shadow-md'
                                      : 'bg-[#f8e7c9]/30 border-[#064E3B]/30 text-[#064E3B] hover:border-[#064E3B] hover:bg-[#faedd7]'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                                    isChecked ? 'border-[#f8e7c9] bg-[#f8e7c9]' : 'border-[#064E3B]/60'
                                  }`}>
                                    {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-[#064E3B]" />}
                                  </div>
                                  <span className="leading-tight">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Question Type: Rating Topic (1 to 5 + 0 for Not Attended) */}
                        {q.type === 'rating_topic' && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {TOPIC_RATING_OPTIONS.map(opt => {
                              const isSelected = value === opt.value || (value === undefined && opt.value === 4);
                              return (
                                <button
                                  type="button"
                                  key={opt.value}
                                  onClick={() => handleAnswerChange(q.id, opt.value)}
                                  disabled={!settings.isFormEnabled}
                                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    isSelected
                                      ? 'bg-[#064E3B] text-[#f8e7c9] border-2 border-[#064E3B] shadow-md'
                                      : 'bg-[#faedd7] text-[#064E3B] border-[#064E3B]/30 hover:border-[#064E3B] hover:bg-[#f3deba]'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Question Type: Rating 1 to 5 */}
                        {q.type === 'rating_5' && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {STANDARD_5_SCALE.map(opt => {
                              const isSelected = value === opt.value || (value === undefined && opt.value === 5);
                              return (
                                <button
                                  type="button"
                                  key={opt.value}
                                  onClick={() => handleAnswerChange(q.id, opt.value)}
                                  disabled={!settings.isFormEnabled}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    isSelected
                                      ? 'bg-[#064E3B] text-[#f8e7c9] border-2 border-[#064E3B] shadow-md'
                                      : 'bg-[#faedd7] text-[#064E3B] border-[#064E3B]/30 hover:border-[#064E3B] hover:bg-[#f3deba]'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Sticky Submit Bar */}
          <div className="fixed bottom-0 inset-x-0 bg-[#faedd7]/95 backdrop-blur-md border-t border-[#064E3B]/20 p-4 z-30 shadow-2xl">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-xs">
                <span className="font-mono text-[#064E3B]/80 font-semibold">
                  Filled: <strong className="text-[#064E3B]">{filled}</strong> of {total} questions
                </span>
                <div className="hidden sm:block w-32 bg-[#e8cda2] rounded-full h-2 overflow-hidden border border-[#064E3B]/20">
                  <div
                    className="bg-[#064E3B] h-2 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href="/student/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-[#faedd7] hover:bg-[#e8cda2] text-[#064E3B] font-bold text-xs border border-[#064E3B]/40 transition-all"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting || !settings.isFormEnabled}
                  className="px-6 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#04382b] disabled:opacity-50 text-[#f8e7c9] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#064E3B]/20 flex items-center space-x-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : existingFeedback ? 'Update Feedback' : 'Submit Feedback'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>

      </main>
    </div>
  );
}

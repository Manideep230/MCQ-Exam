'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Plus, Edit3, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface QuestionItem {
  id: string;
  examId: string;
  examTitle: string;
  questionText: string;
  marks: number;
  correctOption: string;
  orderIndex: number;
  options: Record<string, string>;
}

interface ExamOption {
  id: string;
  title: string;
}

export default function AdminQuestionsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Loading questions...</div>}>
      <AdminQuestionsContent />
    </Suspense>
  );
}

function AdminQuestionsContent() {
  const searchParams = useSearchParams();
  const initialExamId = searchParams.get('examId') || '';

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Question Creation / Editing
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);

  const [formExamId, setFormExamId] = useState(initialExamId);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<string>('A');
  const [marks, setMarks] = useState(1);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchQuestions(selectedExamId);
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/admin/exams');
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
        if (!selectedExamId && data.exams?.length > 0) {
          setSelectedExamId(data.exams[0].id);
          setFormExamId(data.exams[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch exams error:', err);
    }
  };

  const fetchQuestions = async (examId = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions${examId ? `?examId=${examId}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectOption('A');
    setMarks(1);
    setFormExamId(selectedExamId || (exams[0]?.id || ''));
    setShowModal(true);
  };

  const openEditModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormExamId(q.examId);
    setQuestionText(q.questionText);
    setOptionA(q.options.A);
    setOptionB(q.options.B);
    setOptionC(q.options.C);
    setOptionD(q.options.D);
    setCorrectOption(q.correctOption);
    setMarks(q.marks);
    setShowModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveLoading(true);

    try {
      const payload = {
        examId: formExamId,
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctOption,
        marks: Number(marks),
      };

      const url = editingQuestion ? `/api/admin/questions/${editingQuestion.id}` : '/api/admin/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save question');

      setShowModal(false);
      fetchQuestions(selectedExamId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchQuestions(selectedExamId);
    } catch (err) {
      console.error('Delete question error:', err);
    }
  };

  return (
    <div className="space-y-8 text-[#064E3B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#064E3B] tracking-tight">QUESTION BANK MANAGER</h1>
          <p className="text-xs text-[#064E3B]/80 mt-1 font-semibold">Create, edit, and assign MCQ questions and authoritative correct options.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-md border-2 border-[#064E3B]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-100 border-2 border-red-400 text-red-900 text-xs flex items-center space-x-3 font-semibold">
          <AlertCircle className="w-4 h-4 text-red-700" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter by Exam */}
      <div className="bg-[#faedd7] border-2 border-[#064E3B]/20 p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
        <label className="text-xs font-black text-[#064E3B] uppercase tracking-wider">
          Filter Exam:
        </label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl px-3.5 py-2 text-xs font-bold text-[#064E3B] focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
        >
          <option value="">All Exams</option>
          {exams.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-[#064E3B]/60 text-sm font-bold">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center bg-[#faedd7] border-2 border-[#064E3B]/20 rounded-2xl text-[#064E3B] text-sm font-semibold">
            No questions found for this examination. Click "Add New Question" to create one.
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="bg-[#fffdf9] border-2 border-[#064E3B]/20 rounded-2xl p-6 space-y-4 shadow-sm text-[#064E3B]">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-lg bg-[#faedd7] border-2 border-[#064E3B]/30 text-[#064E3B] font-mono text-xs font-black flex items-center justify-center">
                    Q{idx + 1}
                  </span>
                  <div>
                    <span className="text-[10px] font-black text-[#064E3B]/70 uppercase">{q.examTitle}</span>
                    <span className="text-xs font-mono text-[#064E3B] font-black ml-3">({q.marks} Mark)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 rounded-lg bg-[#faedd7] hover:bg-[#f3deba] border border-[#064E3B]/30 text-[#064E3B] transition-colors"
                    title="Edit Question"
                  >
                    <Edit3 className="w-4 h-4 text-[#064E3B]" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg bg-[#faedd7] hover:bg-[#f3deba] border border-[#064E3B]/30 text-[#064E3B] transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4 text-red-700" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-black text-[#064E3B] leading-relaxed">{q.questionText}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {Object.keys(q.options || {}).sort().map(key => {
                  const isCorrect = q.correctOption === key;
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border-2 text-xs flex items-center justify-between ${
                        isCorrect
                          ? 'bg-[#faedd7] border-[#064E3B] text-[#064E3B] font-black'
                          : 'bg-[#fffdf9] border-[#064E3B]/15 text-[#064E3B]/80 font-medium'
                      }`}
                    >
                      <span><strong className="font-mono mr-2">{key}.</strong> {q.options[key]}</span>
                      {isCorrect && <span className="text-[10px] bg-[#064E3B] px-2 py-0.5 rounded-md uppercase font-black text-[#f8e7c9]">CORRECT</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal (Rule #30) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faedd7] border-2 border-[#064E3B] rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto text-[#064E3B]">
            <div className="flex items-center justify-between border-b-2 border-[#064E3B]/15 pb-3">
              <h3 className="text-sm font-black text-[#064E3B] uppercase tracking-wider">
                {editingQuestion ? 'Edit Question' : 'Create New MCQ Question'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#064E3B]/70 hover:text-[#064E3B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-1">
                  Assign to Exam
                </label>
                <select
                  value={formExamId}
                  onChange={(e) => setFormExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-bold"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-1">
                  Question Text
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question scenario..."
                  className="w-full p-3 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs leading-relaxed font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-[#064E3B]/70 uppercase mb-1">Option A</label>
                  <input
                    type="text"
                    required
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#064E3B]/70 uppercase mb-1">Option B</label>
                  <input
                    type="text"
                    required
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#064E3B]/70 uppercase mb-1">Option C</label>
                  <input
                    type="text"
                    required
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#064E3B]/70 uppercase mb-1">Option D</label>
                  <input
                    type="text"
                    required
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-1">
                    Correct Option
                  </label>
                  <select
                    value={correctOption}
                    onChange={(e) => setCorrectOption(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-mono font-black"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs font-mono font-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="w-full py-3.5 bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md border-2 border-[#064E3B]"
              >
                {saveLoading ? 'SAVING QUESTION...' : 'SAVE QUESTION'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

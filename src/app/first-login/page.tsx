'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Building2, BookOpen, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function FirstLoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [collegeName, setCollegeName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          branch: branch.trim(),
          collegeName: collegeName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      router.push('/student/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8e7c9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <div className="flex justify-center items-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-[#faedd7] border-2 border-[#064E3B]/30 flex items-center justify-center text-[#064E3B] shadow-sm">
            <UserCheck className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-[#064E3B] tracking-tight">
          Complete Your Student Profile
        </h2>
        <p className="mt-2 text-center text-sm text-[#064E3B]/80 font-medium">
          Welcome to the AI Exam Portal! Please verify your official details before proceeding to your examination dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <div className="bg-[#fffdf9] border-2 border-[#064E3B]/25 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-100 border border-red-300 flex items-start space-x-3 text-red-900 text-sm">
              <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-2">
                FULL NAME
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#064E3B]/60">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="block w-full pl-11 pr-4 py-3 bg-[#faedd7] border border-[#064E3B]/30 rounded-xl text-[#064E3B] font-semibold placeholder-[#064E3B]/50 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-2">
                BRANCH / DEPARTMENT
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#064E3B]/60">
                  <BookOpen className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="block w-full pl-11 pr-4 py-3 bg-[#faedd7] border border-[#064E3B]/30 rounded-xl text-[#064E3B] font-semibold placeholder-[#064E3B]/50 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-2">
                COLLEGE NAME
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#064E3B]/60">
                  <Building2 className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. National Institute of Technology"
                  className="block w-full pl-11 pr-4 py-3 bg-[#faedd7] border border-[#064E3B]/30 rounded-xl text-[#064E3B] font-semibold placeholder-[#064E3B]/50 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-[#064E3B] rounded-xl shadow-md text-sm font-black text-[#f8e7c9] bg-[#064E3B] hover:bg-[#064E3B]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#064E3B] transition-all disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'SAVING PROFILE...' : 'SAVE & CONTINUE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, GraduationCap, Lock, User, Key, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  
  // Student Form State
  const [rollNumber, setRollNumber] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  // Admin Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginType: 'student',
          identifier: rollNumber.trim(),
          password: studentPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Student authentication failed');
      }

      router.push(data.redirect || '/student/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginType: 'admin',
          identifier: adminUsername.trim(),
          password: adminPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      router.push(data.redirect || '/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#021f18] text-[#faeed9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration in Emerald Ink */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#064E3B_1px,transparent_1px),linear-gradient(to_bottom,#064E3B_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[#064E3B] border border-[#f8e7c9]/30 flex items-center justify-center shadow-lg shadow-[#064E3B]/40">
            <GraduationCap className="w-7 h-7 text-[#f8e7c9]" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-[#f8e7c9] tracking-tight">
          AI EXAM PORTAL
        </h2>
        <p className="mt-1 text-center text-sm text-[#c7b89f] font-medium">
          Official University Online Examination System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-[#03261d]/95 backdrop-blur-md border border-[#064E3B] py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-[#021f18] p-1 border border-[#064E3B] mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setError(null); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'student'
                  ? 'bg-[#f8e7c9] text-[#064E3B] font-extrabold shadow-md shadow-[#f8e7c9]/20'
                  : 'text-[#c7b89f] hover:text-[#f8e7c9] hover:bg-[#064E3B]/30'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setError(null); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-[#f8e7c9] text-[#064E3B] font-extrabold shadow-md shadow-[#f8e7c9]/20'
                  : 'text-[#c7b89f] hover:text-[#f8e7c9] hover:bg-[#064E3B]/30'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-800 flex items-start space-x-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'student' ? (
            /* STUDENT LOGIN FORM */
            <form onSubmit={handleStudentLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#faeed9] uppercase tracking-wider mb-2">
                  Roll Number
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c7b89f]">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 23CSE001"
                    className="block w-full pl-11 pr-4 py-3 bg-[#021f18] border border-[#064E3B] rounded-xl text-[#faeed9] placeholder-[#a89f90] focus:outline-none focus:border-[#f8e7c9] focus:ring-1 focus:ring-[#f8e7c9] text-sm uppercase tracking-wide transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#faeed9] uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c7b89f]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-3 bg-[#021f18] border border-[#064E3B] rounded-xl text-[#faeed9] placeholder-[#a89f90] focus:outline-none focus:border-[#f8e7c9] focus:ring-1 focus:ring-[#f8e7c9] text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-extrabold text-[#064E3B] bg-[#f8e7c9] hover:bg-[#faeed9] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[#f8e7c9]/20"
              >
                {loading ? 'AUTHENTICATING...' : 'LOGIN TO STUDENT PORTAL'}
              </button>
            </form>
          ) : (
            /* ADMIN LOGIN FORM */
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#faeed9] uppercase tracking-wider mb-2">
                  Admin Username
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c7b89f]">
                    <Shield className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="block w-full pl-11 pr-4 py-3 bg-[#021f18] border border-[#064E3B] rounded-xl text-[#faeed9] placeholder-[#a89f90] focus:outline-none focus:border-[#f8e7c9] focus:ring-1 focus:ring-[#f8e7c9] text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#faeed9] uppercase tracking-wider mb-2">
                  Admin Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c7b89f]">
                    <Key className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-3 bg-[#021f18] border border-[#064E3B] rounded-xl text-[#faeed9] placeholder-[#a89f90] focus:outline-none focus:border-[#f8e7c9] focus:ring-1 focus:ring-[#f8e7c9] text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-extrabold text-[#064E3B] bg-[#f8e7c9] hover:bg-[#faeed9] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-[#f8e7c9]/20"
              >
                {loading ? 'AUTHENTICATING...' : 'ADMINISTRATOR LOGIN'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center border-t border-[#064E3B]/80 pt-4">
            <p className="text-xs text-[#c7b89f]">
              Need access? Student accounts are created exclusively by the university examination department.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, CheckCircle, XCircle, Key, History, AlertCircle, X } from 'lucide-react';

interface StudentItem {
  id: string;
  rollNumber: string;
  fullName: string;
  branch: string;
  collegeName: string;
  profileCompleted: boolean;
  accountStatus: 'active' | 'disabled';
  createdAt: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Password Reset Modal State
  const [resetModalStudent, setResetModalStudent] = useState<StudentItem | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // History Drawer State
  const [historyStudent, setHistoryStudent] = useState<StudentItem | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (query = '') => {
    try {
      const res = await fetch(`/api/admin/students${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(searchQuery);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAddLoading(true);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber, password: tempPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add student');

      setShowAddModal(false);
      setRollNumber('');
      setTempPassword('');
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const toggleAccountStatus = async (student: StudentItem) => {
    const newStatus = student.accountStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountStatus: newStatus }),
      });
      if (res.ok) {
        fetchStudents(searchQuery);
      }
    } catch (err) {
      console.error('Failed toggling student status:', err);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStudent || !newPassword.trim()) return;

    try {
      const res = await fetch(`/api/admin/students/${resetModalStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      });
      if (res.ok) {
        setResetModalStudent(null);
        setNewPassword('');
        fetchStudents(searchQuery);
      }
    } catch (err) {
      console.error('Reset password error:', err);
    }
  };

  const openHistory = async (student: StudentItem) => {
    setHistoryStudent(student);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data.examHistory || []);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">STUDENT MANAGEMENT</h1>
          <p className="text-xs text-slate-400 mt-1">Enroll student accounts using Roll Number and Temporary Password.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <form onSubmit={handleSearch} className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Roll Number, Name, Branch, or College..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
                <th className="py-4 px-6">Roll Number</th>
                <th className="py-4 px-6">Full Name</th>
                <th className="py-4 px-6">Branch</th>
                <th className="py-4 px-6">College</th>
                <th className="py-4 px-6">Profile Status</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">Loading student directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No student records found.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-white">{student.rollNumber}</td>
                    <td className="py-4 px-6 font-medium text-slate-200">{student.fullName}</td>
                    <td className="py-4 px-6 text-slate-400">{student.branch}</td>
                    <td className="py-4 px-6 text-slate-400 truncate max-w-[150px]">{student.collegeName}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        student.profileCompleted
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {student.profileCompleted ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        student.accountStatus === 'active'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {student.accountStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openHistory(student)}
                        title="View Exam History"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        <History className="w-4 h-4 text-blue-400" />
                      </button>
                      
                      <button
                        onClick={() => setResetModalStudent(student)}
                        title="Reset Password"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        <Key className="w-4 h-4 text-amber-400" />
                      </button>

                      <button
                        onClick={() => toggleAccountStatus(student)}
                        title={student.accountStatus === 'active' ? 'Disable Account' : 'Enable Account'}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        {student.accountStatus === 'active' ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal (Requirement #9) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Student Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Only enter the Roll Number and Temporary Password. Name, branch, and college will be populated by the student upon first login.
            </p>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 23CSE005"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={addLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30"
              >
                {addLoading ? 'CREATING STUDENT...' : 'CREATE STUDENT ACCOUNT'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reset Password: {resetModalStudent.rollNumber}</h3>
              <button onClick={() => setResetModalStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-600/30"
              >
                RESET PASSWORD NOW
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal Drawer */}
      {historyStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Student History: {historyStudent.rollNumber}</h3>
                <p className="text-xs text-slate-400">{historyStudent.fullName} • {historyStudent.branch}</p>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {historyLoading ? (
                <p className="text-xs text-slate-500 text-center py-6">Loading student history...</p>
              ) : historyData.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No exam attempts recorded for this student.</p>
              ) : (
                historyData.map((h, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white">{h.examTitle}</h4>
                      <p className="text-[10px] text-slate-400">
                        Status: <span className="text-slate-200">{h.status}</span> | Fullscreen Exits: {h.fullscreenExits} | Tab Switches: {h.tabSwitches}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-emerald-400 text-sm">{h.score} / {h.totalMarks}</span>
                      <span className="block text-[10px] text-slate-500">{h.percentage}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

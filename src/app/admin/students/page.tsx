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
    <div className="space-y-8 text-[#064E3B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#064E3B] tracking-tight">STUDENT MANAGEMENT</h1>
          <p className="text-xs text-[#064E3B]/80 mt-1 font-semibold">Enroll student accounts using Roll Number and Temporary Password.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-md border-2 border-[#064E3B]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-100 border-2 border-red-400 text-red-900 text-xs flex items-center space-x-3 font-semibold">
          <AlertCircle className="w-4 h-4 text-red-700" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-[#faedd7] border-2 border-[#064E3B]/20 p-4 rounded-2xl shadow-sm">
        <form onSubmit={handleSearch} className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#064E3B]/60 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Roll Number, Name, Branch, or College..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-xl text-[#064E3B] text-xs placeholder-[#064E3B]/40 font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] text-xs font-black rounded-xl border border-[#064E3B]"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-[#fffdf9] border-2 border-[#064E3B]/25 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#faedd7] text-[#064E3B] text-[10px] uppercase font-black tracking-wider border-b-2 border-[#064E3B]/20">
                <th className="py-4 px-6">Roll Number</th>
                <th className="py-4 px-6">Full Name</th>
                <th className="py-4 px-6">Branch</th>
                <th className="py-4 px-6">College</th>
                <th className="py-4 px-6">Profile Status</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#064E3B]/10 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#064E3B]/60 font-bold">Loading student directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#064E3B]/60 font-bold">No student records found.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#faedd7]/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-black text-[#064E3B]">{student.rollNumber}</td>
                    <td className="py-4 px-6 font-black text-[#064E3B]">{student.fullName}</td>
                    <td className="py-4 px-6 text-[#064E3B]/80 font-bold">{student.branch}</td>
                    <td className="py-4 px-6 text-[#064E3B]/80 font-semibold truncate max-w-[150px]">{student.collegeName}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        student.profileCompleted
                          ? 'bg-[#064E3B]/15 text-[#064E3B] border border-[#064E3B]/40'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {student.profileCompleted ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        student.accountStatus === 'active'
                          ? 'bg-[#064E3B] text-[#f8e7c9]'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {student.accountStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openHistory(student)}
                        title="View Exam History"
                        className="p-1.5 rounded-lg bg-[#faedd7] hover:bg-[#f3deba] border border-[#064E3B]/30 text-[#064E3B] transition-colors"
                      >
                        <History className="w-4 h-4 text-[#064E3B]" />
                      </button>
                      
                      <button
                        onClick={() => setResetModalStudent(student)}
                        title="Reset Password"
                        className="p-1.5 rounded-lg bg-[#faedd7] hover:bg-[#f3deba] border border-[#064E3B]/30 text-[#064E3B] transition-colors"
                      >
                        <Key className="w-4 h-4 text-[#064E3B]" />
                      </button>

                      <button
                        onClick={() => toggleAccountStatus(student)}
                        title={student.accountStatus === 'active' ? 'Disable Account' : 'Enable Account'}
                        className="p-1.5 rounded-lg bg-[#faedd7] hover:bg-[#f3deba] border border-[#064E3B]/30 text-[#064E3B] transition-colors"
                      >
                        {student.accountStatus === 'active' ? (
                          <XCircle className="w-4 h-4 text-red-700" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-[#064E3B]" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faedd7] border-2 border-[#064E3B] rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl text-[#064E3B]">
            <div className="flex items-center justify-between border-b-2 border-[#064E3B]/15 pb-3">
              <h3 className="text-sm font-black text-[#064E3B] uppercase tracking-wider">Add Student Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#064E3B]/70 hover:text-[#064E3B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#064E3B]/80 font-medium">
              Only enter the Roll Number and Temporary Password. Name, branch, and college will be populated by the student upon first login.
            </p>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 23CSE005"
                  className="w-full px-3.5 py-2.5 bg-[#fffdf9] border-2 border-[#064E3B]/30 rounded-xl text-[#064E3B] text-xs uppercase tracking-wide font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#fffdf9] border-2 border-[#064E3B]/30 rounded-xl text-[#064E3B] text-xs focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <button
                type="submit"
                disabled={addLoading}
                className="w-full py-3 bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md border-2 border-[#064E3B]"
              >
                {addLoading ? 'CREATING STUDENT...' : 'CREATE STUDENT ACCOUNT'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faedd7] border-2 border-[#064E3B] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-[#064E3B]">
            <div className="flex items-center justify-between border-b-2 border-[#064E3B]/15 pb-3">
              <h3 className="text-sm font-black text-[#064E3B] uppercase tracking-wider">Reset Password: {resetModalStudent.rollNumber}</h3>
              <button onClick={() => setResetModalStudent(null)} className="text-[#064E3B]/70 hover:text-[#064E3B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#064E3B] uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 bg-[#fffdf9] border-2 border-[#064E3B]/30 rounded-xl text-[#064E3B] text-xs focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#064E3B] hover:bg-[#04382b] text-[#f8e7c9] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md border-2 border-[#064E3B]"
              >
                RESET PASSWORD NOW
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal Drawer */}
      {historyStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faedd7] border-2 border-[#064E3B] rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl text-[#064E3B]">
            <div className="flex items-center justify-between border-b-2 border-[#064E3B]/15 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#064E3B] uppercase tracking-wider">Student History: {historyStudent.rollNumber}</h3>
                <p className="text-xs text-[#064E3B]/80 font-semibold">{historyStudent.fullName} • {historyStudent.branch}</p>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="text-[#064E3B]/70 hover:text-[#064E3B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {historyLoading ? (
                <p className="text-xs text-[#064E3B]/60 text-center py-6 font-bold">Loading student history...</p>
              ) : historyData.length === 0 ? (
                <p className="text-xs text-[#064E3B]/60 text-center py-6 font-bold">No exam attempts recorded for this student.</p>
              ) : (
                historyData.map((h, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#fffdf9] border-2 border-[#064E3B]/20 flex items-center justify-between text-xs text-[#064E3B]">
                    <div>
                      <h4 className="font-black text-[#064E3B]">{h.examTitle}</h4>
                      <p className="text-[10px] text-[#064E3B]/80 font-semibold mt-0.5">
                        Status: <span className="font-black text-[#064E3B]">{h.status}</span> | Fullscreen Exits: {h.fullscreenExits} | Tab Switches: {h.tabSwitches}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-black text-[#064E3B] text-sm">{h.score} / {h.totalMarks}</span>
                      <span className="block text-[10px] text-[#064E3B]/70 font-bold">{h.percentage}%</span>
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

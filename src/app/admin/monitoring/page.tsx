'use client';

import { useState, useEffect } from 'react';
import { Eye, ShieldAlert, Maximize2, Minimize2, Search, RefreshCw, AlertTriangle, Clock } from 'lucide-react';

interface AttemptAuditItem {
  attemptId: string;
  rollNumber: string;
  studentName: string;
  examTitle: string;
  status: string;
  fullscreenExits: number;
  tabSwitches: number;
  startedAt: string;
  submittedAt: string;
}

export default function AdminMonitoringPage() {
  const [attempts, setAttempts] = useState<AttemptAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected attempt drawer / modal for events
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    fetchAuditAttempts();
  }, []);

  const fetchAuditAttempts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/results');
      if (res.ok) {
        const data = await res.json();
        setAttempts(data.results || []);
      }
    } catch (err) {
      console.error('Fetch monitoring attempts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEventsModal = async (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setEventsLoading(true);
    try {
      const res = await fetch(`/api/admin/attempts/${attemptId}/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const filteredAttempts = attempts.filter(a =>
    a.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.examTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">PROCTORING AUDIT MONITORING</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time anti-cheating audit trail: fullscreen exit events, tab switches, and heartbeat timestamps.</p>
        </div>

        <button
          onClick={fetchAuditAttempts}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-slate-700"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Roll Number, Student Name, or Exam Title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
                <th className="py-4 px-6">Roll Number</th>
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Exam Title</th>
                <th className="py-4 px-6">Fullscreen Exits</th>
                <th className="py-4 px-6">Tab Switches</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">Loading audit records...</td>
                </tr>
              ) : filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No monitoring records found.</td>
                </tr>
              ) : (
                filteredAttempts.map((att) => (
                  <tr key={att.attemptId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-blue-400">{att.rollNumber}</td>
                    <td className="py-4 px-6 font-medium text-slate-200">{att.studentName}</td>
                    <td className="py-4 px-6 text-slate-400">{att.examTitle}</td>
                    <td className="py-4 px-6">
                      <span className={`font-mono font-bold ${att.fullscreenExits > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {att.fullscreenExits} Exits
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-mono font-bold ${att.tabSwitches > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {att.tabSwitches} Switches
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-bold uppercase">
                        {att.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openEventsModal(att.attemptId)}
                        className="px-3 py-1.5 rounded-lg bg-blue-950 text-blue-400 hover:bg-blue-900 border border-blue-800 text-xs font-bold transition-all"
                      >
                        Inspect Audit Log
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events Log Modal (Section 34) */}
      {selectedAttemptId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Detailed Audit Log Events</span>
              </h3>
              <button onClick={() => setSelectedAttemptId(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto font-mono text-xs">
              {eventsLoading ? (
                <p className="text-slate-500 text-center py-6">Loading audit events...</p>
              ) : events.length === 0 ? (
                <p className="text-slate-500 text-center py-6">No specific anti-cheating events logged for this attempt.</p>
              ) : (
                events.map((evt) => {
                  const timeStr = new Date(evt.eventTimestamp).toLocaleTimeString();
                  return (
                    <div
                      key={evt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        evt.eventType === 'fullscreen_exited' ? 'bg-red-950/60 border-red-800 text-red-300' :
                        evt.eventType === 'tab_hidden' ? 'bg-amber-950/60 border-amber-800 text-amber-300' :
                        'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-semibold">[{timeStr}] {evt.eventType.toUpperCase().replace('_', ' ')}</span>
                      <span className="text-[10px] opacity-75">{evt.metadata || ''}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

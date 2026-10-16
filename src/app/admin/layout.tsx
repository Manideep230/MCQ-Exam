'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, HelpCircle, Award, Eye, LogOut, GraduationCap, Menu, X, Shield, Trophy, MessageSquare } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Leaderboard', href: '/admin/leaderboard', icon: Trophy },
    { label: 'Exams', href: '/admin/exams', icon: BookOpen },
    { label: 'Question Bank', href: '/admin/questions', icon: HelpCircle },
    { label: 'Results', href: '/admin/results', icon: Award },
    { label: 'Audit Monitoring', href: '/admin/monitoring', icon: Eye },
    { label: 'Student Feedback', href: '/admin/feedback', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#021f18] text-[#faeed9] flex flex-col md:flex-row">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-[#03261d] border-b border-[#064E3B] p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#064E3B] border border-[#f8e7c9]/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#f8e7c9]" />
          </div>
          <span className="font-bold text-sm text-[#f8e7c9] tracking-wide">AI EXAM ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#c7b89f] hover:text-[#f8e7c9]"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#03261d] border-r border-[#064E3B] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 space-y-8">
          {/* Logo Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#064E3B] border border-[#f8e7c9]/30 flex items-center justify-center shadow-lg shadow-[#064E3B]/40">
              <Shield className="w-6 h-6 text-[#f8e7c9]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#f8e7c9] tracking-wider">AI EXAM PORTAL</h2>
              <span className="text-[10px] text-[#f8e7c9] font-bold uppercase tracking-widest bg-[#064E3B] px-1.5 py-0.5 rounded border border-[#f8e7c9]/20">
                ADMIN PANEL
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#f8e7c9] text-[#064E3B] font-extrabold shadow-lg shadow-[#f8e7c9]/20'
                      : 'text-[#c7b89f] hover:text-[#f8e7c9] hover:bg-[#064E3B]/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-[#064E3B]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#021f18] hover:bg-[#064E3B] text-[#faeed9] text-xs font-bold border border-[#064E3B] transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Administrator</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-auto bg-[#021f18]">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
          {children}
        </main>
      </div>

    </div>
  );
}

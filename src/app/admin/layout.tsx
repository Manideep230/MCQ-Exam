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
    <div className="min-h-screen bg-[#f8e7c9] text-[#064E3B] flex flex-col md:flex-row">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-[#faedd7] border-b-2 border-[#064E3B]/25 p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#064E3B] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#f8e7c9]" />
          </div>
          <span className="font-extrabold text-sm text-[#064E3B] tracking-wide">AI EXAM ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#064E3B] hover:text-[#04382b]"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#faedd7] border-r-2 border-[#064E3B]/25 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-lg ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 space-y-8">
          {/* Logo Header */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#064E3B] flex items-center justify-center shadow-md shadow-[#064E3B]/20">
              <Shield className="w-6 h-6 text-[#f8e7c9]" />
            </div>
            <div>
              <h2 className="font-black text-sm text-[#064E3B] tracking-wider">AI EXAM PORTAL</h2>
              <span className="text-[10px] text-[#064E3B] font-bold uppercase tracking-widest bg-[#064E3B]/10 px-1.5 py-0.5 rounded border border-[#064E3B]/20">
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
                      ? 'bg-[#064E3B] text-[#f8e7c9] shadow-md font-black'
                      : 'text-[#064E3B]/80 hover:text-[#064E3B] hover:bg-[#064E3B]/10'
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
        <div className="p-4 border-t-2 border-[#064E3B]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#faedd7] hover:bg-[#f3deba] text-[#064E3B] text-xs font-black border-2 border-[#064E3B] transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Administrator</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-auto bg-[#f8e7c9]">
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
          {children}
        </main>
      </div>

    </div>
  );
}

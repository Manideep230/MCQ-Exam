import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Exam Portal - Academic Examination System",
  description: "Secure online MCQ examination portal with AI justification evaluation and real-time proctoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full bg-slate-950 text-slate-100">
      <body className="min-h-screen flex flex-col antialiased text-slate-100 bg-slate-950 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

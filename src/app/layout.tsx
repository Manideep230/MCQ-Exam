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
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full flex flex-col antialiased text-slate-900 bg-slate-50">
        {children}
      </body>
    </html>
  );
}

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
    <html lang="en" className="min-h-full bg-[#f8e7c9] text-[#064E3B]">
      <body className="min-h-screen flex flex-col antialiased text-[#064E3B] bg-[#f8e7c9] selection:bg-[#064E3B] selection:text-[#f8e7c9]">
        {children}
      </body>
    </html>
  );
}

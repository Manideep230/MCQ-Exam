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
    <html lang="en" className="min-h-full bg-[#021f18] text-[#f8e7c9]">
      <body className="min-h-screen flex flex-col antialiased text-[#faeed9] bg-[#021f18] selection:bg-[#f8e7c9] selection:text-[#064E3B]">
        {children}
      </body>
    </html>
  );
}

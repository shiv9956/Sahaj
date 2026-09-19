import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sahaj — AI-Powered Financial Journey Companion',
  description: 'Clarity before credit: AI-powered financial journey engine for lending and insurance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

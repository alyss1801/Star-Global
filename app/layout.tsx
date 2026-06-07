import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 3D Asset Organizer',
  description: 'Classify and organize 3D project assets with AI'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

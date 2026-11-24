import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Support',
  description: 'Get help with Ahjoorxmr savings circles.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

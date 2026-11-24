import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your Ahjoorxmr account password.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

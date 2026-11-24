import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Ahjoorxmr account.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

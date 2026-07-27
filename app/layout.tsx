import type { Metadata } from "next";
import "./global.css";
import Providers from "./providers";
import Toaster from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "Ahjoor — Save With Friends",
  description:
    "All on Your Decentralized Savings Group In One Place. Join a circle, contribute in crypto, receive payouts — borderless, trustless, automated.",
  keywords: ["savings group", "decentralized", "crypto", "susu", "chama", "ajo", "blockchain"],
  openGraph: {
    title: "Ahjoor — Save With Friends",
    description: "Decentralized savings circles powered by blockchain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./global.css";
import Providers from "./providers";
import Toaster from "@/components/ui/Toaster";
import CommandPalette from "@/components/ui/CommandPalette";

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
      <head>
        {/* Applies the persisted/system theme before hydration to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ahjoor-theme');var d=t==='dark'||((t==null||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <Toaster />
          <CommandPalette />
          {children}
        </Providers>
      </body>
    </html>
  );
}

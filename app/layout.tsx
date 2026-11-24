import type { Metadata, Viewport } from "next";
import "./global.css";
import Providers from "./providers";
import Toaster from "@/components/ui/Toaster";
import CommandPalette from "@/components/ui/CommandPalette";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ahjoorxmr.com'),
  title: { template: '%s | Ahjoorxmr', default: 'Ahjoorxmr — Collaborative Savings Circles' },
  description:
    "Save together with friends and family in rotating savings circles backed by blockchain.",
  keywords: ["savings group", "decentralized", "crypto", "susu", "chama", "ajo", "blockchain"],
  openGraph: {
    title: "Ahjoor — Save With Friends",
    description: "Decentralized savings circles powered by blockchain.",
    type: "website",
    siteName: 'Ahjoorxmr',
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahjoor — Save With Friends",
    description: "Decentralized savings circles powered by blockchain.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ahjoor",
  },
};

export const viewport: Viewport = {
  themeColor: "#6c5ce7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Applies the persisted/system theme before hydration to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ahjoor-theme');var d=t==='dark'||((t==null||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
        {/* Applies the persisted language and direction before hydration to avoid a flash of LTR. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('ahjoor-language')||'en';var rtl=['ar','he','fa','ur'].indexOf(l.toLowerCase())!==-1;document.documentElement.lang=l;document.documentElement.dir=rtl?'rtl':'ltr';document.documentElement.dataset.direction=rtl?'rtl':'ltr';}catch(e){}})();`,
          }}
        />
        {/* Exposes stored cookie consent so analytics scripts can check it before loading. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('cookie-consent');window.__ahjoorConsent=raw?JSON.parse(raw):null;}catch(e){window.__ahjoorConsent=null;}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <Providers>
          <Toaster />
          <CommandPalette />
          {children}
        </Providers>
      </body>
    </html>
  );
}

import Link from "next/link";
import { LayoutGrid, Lock, FileText, Settings, Users, LogOut, Wallet, Trophy, Bell, HelpCircle, Award, Target, type LucideIcon } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import NotificationDropdown from "@/components/layout/NotificationDropdown";
import OnboardingModal from "@/components/modals/OnboardingModal";
import DashboardHeaderSearch from "@/components/layout/DashboardHeaderSearch";
import ThemeToggle from "@/components/ui/ThemeToggle";
import InstallPWAButton from "@/components/ui/InstallPWAButton";
import FeatureSpotlight from "@/components/ui/FeatureSpotlight";
import FeedbackWidget from "@/components/ui/FeedbackWidget";
import ShortcutsModal from "@/components/ui/ShortcutsModal";
import EmailVerificationBanner from "@/components/settings/EmailVerificationBanner";
import { ConnectionStatusProvider } from "@/contexts/ConnectionStatusContext";
import ConnectionStatusIndicator from "@/components/ui/ConnectionStatusIndicator";
import StaleDataBanner from "@/components/ui/StaleDataBanner";
import NetworkGuard from "@/components/wallet/NetworkGuard";
import TrustlineBanner from "@/components/wallet/TrustlineBanner";

const WALLET_ADDRESS = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";
const WALLET_DISPLAY = "0x23g43gdaa...";

const NAV_LINK_CLASS =
  "flex items-center gap-3 px-4 py-3 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] rounded-lg transition-colors border-l-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon; spotlight?: string }[] = [
  { href: "/dashboard/circles", label: "Circles", icon: Users },
  { href: "/dashboard/locked-funds", label: "Locked Funds", icon: Lock },
  { href: "/dashboard/payouts", label: "Payouts", icon: Wallet },
  { href: "/dashboard/contributions", label: "Contributions", icon: FileText },
  { href: "/dashboard/statements", label: "Statements", icon: FileText },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet, spotlight: "multi-wallet" },
  { href: "/dashboard/achievements", label: "Achievements", icon: Award },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help Center", icon: HelpCircle },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConnectionStatusProvider>
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex print:hidden w-[260px] flex-col border-r border-[var(--ov-0f)] bg-[var(--surface)]">
        <div className="p-8 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center" aria-hidden="true">
              <span className="font-bold text-sm">$</span>
            </div>
            <span className="text-xl font-bold font-sora">Ahjoor</span>
          </div>

          {/* Navigation */}
          <nav aria-label="Dashboard navigation">
            <ul className="space-y-2 list-none p-0 m-0">
              <li>
                <Link
                  href="/dashboard"
                  aria-current="page"
                  className="flex items-center gap-3 px-4 py-3 text-[var(--text)] bg-[var(--ov-0a)] rounded-lg transition-colors border-l-2 border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  <LayoutGrid size={20} className="text-[var(--text)]" aria-hidden="true" />
                  <span className="font-medium">Overview</span>
                </Link>
              </li>
              {NAV_ITEMS.map(({ href, label, icon: Icon, spotlight }) => {
                const link = (
                  <Link href={href} className={NAV_LINK_CLASS}>
                    <Icon size={20} aria-hidden="true" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
                return (
                  <li key={href}>
                    {spotlight ? (
                      <FeatureSpotlight featureId={spotlight} align="left">
                        {link}
                      </FeatureSpotlight>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="mt-auto pt-10">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-[#FF5B5B] hover:bg-[#ff5b5b1a] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B5B]"
            >
              <LogOut size={20} aria-hidden="true" />
              <span className="font-medium">Log out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* Issue #217 – Network mismatch guard wraps the entire dashboard */}
      <NetworkGuard>
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="print:hidden flex items-center justify-end p-6 md:px-10 py-5 gap-3">
            <DashboardHeaderSearch />
            <ConnectionStatusIndicator />
            <InstallPWAButton />
            <ThemeToggle />
            <NotificationDropdown />
            <div
              className="flex items-center border border-[var(--ov-1a)] rounded-full px-4 py-2 gap-2 bg-[var(--ov-05)]"
              role="status"
              aria-label={`Connected wallet: ${WALLET_DISPLAY}`}
            >
              <span className="text-sm font-medium text-[var(--muted2)]">{WALLET_DISPLAY}</span>
              <CopyButton value={WALLET_ADDRESS} aria-label="Copy wallet address" />
            </div>
          </header>

          {/* Page Content */}
          <main id="main-content" tabIndex={-1} className="flex-1 px-6 md:px-10 pb-10 focus:outline-none">
            <EmailVerificationBanner />
            <StaleDataBanner />
            {/* Issue #217 – USDC trustline check banner */}
            <TrustlineBanner />
            {children}
          </main>

          <MobileBottomNav />
        </div>
      </NetworkGuard>
      <OnboardingModal />
      <FeedbackWidget />
      <ShortcutsModal />
    </div>
    </ConnectionStatusProvider>
  );
}

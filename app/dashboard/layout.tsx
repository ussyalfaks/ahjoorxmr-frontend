import Link from "next/link";
import { LogOut } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import DashboardSidebarNav from "@/components/layout/DashboardSidebarNav";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import NotificationDropdown from "@/components/layout/NotificationDropdown";
import OnboardingModal from "@/components/modals/OnboardingModal";
import DashboardHeaderSearch from "@/components/layout/DashboardHeaderSearch";
import ThemeToggle from "@/components/ui/ThemeToggle";
import InstallPWAButton from "@/components/ui/InstallPWAButton";
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConnectionStatusProvider>
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex print:hidden w-[260px] flex-col border-e border-[var(--ov-0f)] bg-[var(--surface)]">
        <div className="p-8 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center" aria-hidden="true">
              <span className="font-bold text-sm">$</span>
            </div>
            <span className="text-xl font-bold font-sora">Ahjoor</span>
          </div>

          {/* Navigation */}
          <DashboardSidebarNav />

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

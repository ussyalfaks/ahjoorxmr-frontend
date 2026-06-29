import Link from "next/link";
import { LayoutGrid, Lock, FileText, User, Settings, Users, LogOut } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

const WALLET_ADDRESS = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";
const WALLET_DISPLAY = "0x23g43gdaa...";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#111111] text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-[260px] flex-col border-r border-[#ffffff0f] bg-[#161616]">
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
                  className="flex items-center gap-3 px-4 py-3 text-[#EBEBEB] bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  <LayoutGrid size={20} className="text-white" aria-hidden="true" />
                  <span className="font-medium">Overview</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/circles"
                  className="flex items-center gap-3 px-4 py-3 text-[#9A9A9A] hover:text-[#EBEBEB] hover:bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  <Users size={20} aria-hidden="true" />
                  <span className="font-medium">Circles</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/locked-funds"
                  className="flex items-center gap-3 px-4 py-3 text-[#9A9A9A] hover:text-[#EBEBEB] hover:bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  <Lock size={20} aria-hidden="true" />
                  <span className="font-medium">Locked Funds</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 text-[#9A9A9A] hover:text-[#EBEBEB] hover:bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  <FileText size={20} aria-hidden="true" />
                  <span className="font-medium">Investments</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 text-[#9A9A9A] hover:text-[#EBEBEB] hover:bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  <User size={20} aria-hidden="true" />
                  <span className="font-medium">Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 text-[#9A9A9A] hover:text-[#EBEBEB] hover:bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                >
                  <Settings size={20} aria-hidden="true" />
                  <span className="font-medium">Settings</span>
                </Link>
              </li>
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="flex items-center justify-end p-6 md:px-10 py-5">
          <div
            className="flex items-center border border-[#ffffff1a] rounded-full px-4 py-2 gap-2 bg-[#ffffff05]"
            role="status"
            aria-label={`Connected wallet: ${WALLET_DISPLAY}`}
          >
            <span className="text-sm font-medium text-[#c0c0c0]">{WALLET_DISPLAY}</span>
            <CopyButton value={WALLET_ADDRESS} aria-label="Copy wallet address" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 md:px-10 pb-10">
          {children}
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}

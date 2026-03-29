import Link from "next/link";
import { Copy, LayoutGrid, Lock, FileText, User, Settings, ArrowUpRight, Users, Clock, Hourglass, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#111111] text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-[260px] flex-col border-r border-[#ffffff0f] bg-[#161616]">
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
              <span className="font-bold text-sm">$</span>
            </div>
            <span className="text-xl font-bold font-sora">Ahjoor</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-[#EBEBEB] bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-white"
            >
              <LayoutGrid size={20} className="text-white" />
              <span className="font-medium">Overview</span>
            </Link>
            <Link
              href="/dashboard/locked-funds"
              className="flex items-center gap-3 px-4 py-3 text-[#9A9A9A] hover:text-[#EBEBEB] hover:bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-transparent"
            >
              <Lock size={20} />
              <span className="font-medium">Locked Funds</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-[#9A9A9A] hover:text-[#EBEBEB] hover:bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-transparent"
            >
              <FileText size={20} />
              <span className="font-medium">Investments</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-[#9A9A9A] hover:text-[#EBEBEB] hover:bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-transparent"
            >
              <User size={20} />
              <span className="font-medium">Profile</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-3 text-[#9A9A9A] hover:text-[#EBEBEB] hover:bg-[#ffffff0a] rounded-lg transition-colors border-l-2 border-transparent"
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>

          {/* Logout - at bottom of sidebar */}
          <div className="mt-auto pt-10">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-[#FF5B5B] hover:bg-[#ff5b5b1a] rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Log out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="flex items-center justify-end p-6 md:px-10 py-5">
          <div className="flex items-center border border-[#ffffff1a] rounded-full px-4 py-2 gap-2 bg-[#ffffff05] cursor-pointer hover:bg-[#ffffff0a] transition-colors">
            <span className="text-sm font-medium text-[#c0c0c0]">0x23g43gdaa...</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 md:px-10 pb-10">
          {children}
        </main>

        {/* Mobile Bottom Nav (Optional, based on requirements but typical for responsive) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161616] border-t border-[#ffffff0f] flex justify-around p-4 z-50">
          <Link href="/dashboard" className="text-white flex flex-col items-center gap-1">
            <LayoutGrid size={20} />
            <span className="text-[10px]">Overview</span>
          </Link>
          <Link href="/dashboard/locked-funds" className="text-[#9A9A9A] flex flex-col items-center gap-1">
            <Lock size={20} />
            <span className="text-[10px]">Locked</span>
          </Link>
          <Link href="#" className="text-[#9A9A9A] flex flex-col items-center gap-1">
            <User size={20} />
            <span className="text-[10px]">Profile</span>
          </Link>
          <Link href="#" className="text-[#9A9A9A] flex flex-col items-center gap-1">
            <Settings size={20} />
            <span className="text-[10px]">Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

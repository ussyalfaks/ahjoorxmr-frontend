"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Lock, User, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutGrid, label: "Overview" },
  { href: "/dashboard/circles", icon: Users, label: "Circles" },
  { href: "/dashboard/locked-funds", icon: Lock, label: "Locked" },
  { href: "/dashboard/payouts", icon: User, label: "Payouts" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161616] border-t border-[#ffffff0f] flex justify-around p-4 z-50"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] rounded transition-colors ${
              isActive ? "text-white" : "text-[#9A9A9A] hover:text-[#EBEBEB]"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            <span className="text-[10px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

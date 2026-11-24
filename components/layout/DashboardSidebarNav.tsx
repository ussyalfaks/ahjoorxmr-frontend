"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { usePathname } from "next/navigation";
import FeatureSpotlight from "@/components/ui/FeatureSpotlight";
import { isNavigationItemActive, NAV_ITEMS } from "@/components/layout/dashboardNavigation";

const ACTIVE_NAV_LINK_CLASS =
  "flex items-center gap-3 px-4 py-3 text-[var(--text)] bg-[var(--ov-0a)] rounded-lg transition-colors border-s-2 border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]";

const NAV_LINK_CLASS =
  "flex items-center gap-3 px-4 py-3 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--ov-0a)] rounded-lg transition-colors border-s-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]";

export default function DashboardSidebarNav() {
  const pathname = usePathname();
  const isOverviewActive = pathname === "/dashboard";

  return (
    <nav aria-label="Dashboard navigation">
      <ul className="space-y-2 list-none p-0 m-0">
        <li>
          <Link
            href="/dashboard"
            aria-current={isOverviewActive ? "page" : undefined}
            className={isOverviewActive ? ACTIVE_NAV_LINK_CLASS : NAV_LINK_CLASS}
          >
            <LayoutGrid size={20} className={isOverviewActive ? "text-[var(--text)]" : undefined} aria-hidden="true" />
            <span className="font-medium">Overview</span>
          </Link>
        </li>
        {NAV_ITEMS.map(({ href, label, icon: Icon, spotlight }) => {
          const isActive = isNavigationItemActive(pathname, href);
          const link = (
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={isActive ? ACTIVE_NAV_LINK_CLASS : NAV_LINK_CLASS}
            >
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
  );
}

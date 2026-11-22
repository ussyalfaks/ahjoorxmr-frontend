import { type LucideIcon, Award, Bell, FileText, HelpCircle, Lock, Settings, Target, Trophy, Users, Wallet } from "lucide-react";

export const NAV_ITEMS: { href: string; label: string; icon: LucideIcon; spotlight?: string }[] = [
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

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

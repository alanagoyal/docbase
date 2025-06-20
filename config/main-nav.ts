import { Link, Briefcase, User, Mail, LucideIcon } from "lucide-react";

export interface MainNavItem {
  icon: LucideIcon;
  label: string;
  shortcut: string;
  href: string;
  action?: string;
  darkIcon?: LucideIcon;
}

export const mainNavItems: MainNavItem[] = [
  { href: "/links", label: "Links", shortcut: "L", icon: Link },
  { href: "/contacts", label: "Contacts", shortcut: "C", icon: User },
  { href: "/messages", label: "Messages", shortcut: "M", icon: Mail },
];

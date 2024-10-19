import { Link, Briefcase, User, Mail, LucideIcon } from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  shortcut: string;
  href: string;
  action?: string;
  darkIcon?: LucideIcon;
}

export const mainNavItems: MenuItem[] = [
  { href: "/links", label: "Links", shortcut: "L", icon: Link },
  { href: "/investments", label: "Investments", shortcut: "I", icon: Briefcase },
  { href: "/contacts", label: "Contacts", shortcut: "C", icon: User },
  { href: "/messages", label: "Messages", shortcut: "M", icon: Mail },
];

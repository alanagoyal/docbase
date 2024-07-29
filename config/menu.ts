import { LogOut, Moon, Plus, Sun, User, LucideIcon, Link as LinkIcon } from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  shortcut: string;
  href?: string;
  action?: string;
  darkIcon?: LucideIcon;
}

export const menuItems: MenuItem[] = [
  { icon: Plus, label: "New", shortcut: "N", href: "/new" },
  { icon: LinkIcon, label: "Links", shortcut: "L", href: "/links" },
  { icon: User, label: "Account", shortcut: "A", href: "/account" },
  { icon: Sun, label: "Theme", shortcut: "D", action: "theme", darkIcon: Moon },
  { icon: LogOut, label: "Log out", shortcut: "O", action: "logout" },
];
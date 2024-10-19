import { LogOut, Moon, Sun, User, LucideIcon } from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  shortcut: string;
  href?: string;
  action?: string;
  darkIcon?: LucideIcon;
}

export const menuItems: MenuItem[] = [
  { icon: User, label: "Account", shortcut: "A", href: "/account" },
  { icon: Sun, label: "Theme", shortcut: "T", action: "theme", darkIcon: Moon },
  { icon: LogOut, label: "Log out", shortcut: "O", action: "logout" },
];

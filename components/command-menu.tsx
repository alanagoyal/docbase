"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  CommandSeparator,
} from "./ui/command";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { DialogTitle, DialogDescription } from "./ui/dialog";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { VisuallyHidden } from "./ui/visually-hidden";
import { menuItems } from "@/config/user-nav";

const isTyping = () => {
  const activeElement = document.activeElement;
  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    (activeElement instanceof HTMLElement && activeElement.isContentEditable)
  );
};

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navigateAndCloseDialog = useCallback(
    (path: string) => {
      router.push(path);
      setOpen(false);
    },
    [router]
  );

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error);
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!isTyping()) {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((open) => !open);
        } else {
          const pressedKey = e.key.toLowerCase();
          const matchedItem = menuItems.find(item => item.shortcut.toLowerCase() === pressedKey);
          
          if (matchedItem) {
            e.preventDefault();
            if (matchedItem.href) {
              navigateAndCloseDialog(matchedItem.href);
            } else if (matchedItem.action === 'theme') {
              setTheme(theme === "light" ? "dark" : "light");
            } else if (matchedItem.action === 'logout') {
              handleSignOut();
            }
          }
        }
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router, theme, setTheme, navigateAndCloseDialog, handleSignOut]);

  const handleSelect = useCallback((value: string) => {
    const selectedItem = menuItems.find(item => 
      item.href === `/${value}` || item.action === value
    );
    if (selectedItem) {
      if (selectedItem.href) {
        navigateAndCloseDialog(selectedItem.href);
      } else if (selectedItem.action === 'theme') {
        setTheme(theme === 'light' ? 'dark' : 'light');
        setOpen(false);
      } else if (selectedItem.action === 'logout') {
        handleSignOut();
      }
    }
  }, [navigateAndCloseDialog, setTheme, theme, handleSignOut]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle asChild>
        <VisuallyHidden>Command Menu</VisuallyHidden>
      </DialogTitle>
      <DialogDescription asChild>
        <VisuallyHidden>
          Use this menu to quickly access various features of the application
        </VisuallyHidden>
      </DialogDescription>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.action === "logout" && <CommandSeparator />}
              <CommandItem 
                onSelect={() => handleSelect(item.href?.slice(1) || item.action || '')}
              >
                {item.action === "theme" ? (
                  theme === "light" ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )
                ) : (
                  <item.icon className="mr-2 h-4 w-4" />
                )}
                <span>{item.label}</span>
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            </React.Fragment>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
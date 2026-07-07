"use client";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  Tags,
  Quote,
  Sparkles,
  MessageSquare,
  Flag,
  Bell,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/stories", label: "Stories", icon: BookOpen },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/quotes", label: "Quotes", icon: Quote },
  { href: "/reflections", label: "Reflections", icon: Sparkles },
  { href: "/comments", label: "Comments", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: Flag },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
      <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-3">
        <ThemeToggle />
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}

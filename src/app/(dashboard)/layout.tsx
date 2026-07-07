import { Menu } from "lucide-react";

import { AdminSidebarNav } from "@/components/admin-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { requireAdmin } from "@/lib/require-admin";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { email, admin } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="border-b px-4 py-4">
          <p className="text-sm font-semibold">StoryPlugs Admin</p>
          <p className="truncate text-xs text-sidebar-foreground/60">{email}</p>
        </div>
        <AdminSidebarNav />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <Sheet>
            <SheetTrigger className="rounded-md p-2 hover:bg-accent">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 bg-sidebar p-0 text-sidebar-foreground">
              <div className="border-b px-4 py-4">
                <p className="text-sm font-semibold">StoryPlugs Admin</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{email}</p>
              </div>
              <AdminSidebarNav />
            </SheetContent>
          </Sheet>
          <p className="text-sm font-semibold">StoryPlugs Admin</p>
          <p className="text-xs text-muted-foreground">{admin.role}</p>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, PanelRight, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { LABELS } from "@/lib/constants";
import {
  canAccessRoute,
  getNavForRole,
  getRouteMeta,
} from "@/lib/navigation";
import { formatVersionLabel, getBuildInfo } from "@/lib/build-info";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppShell({
  children,
  rightPanel,
}: {
  children: ReactNode;
  rightPanel?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const nav = getNavForRole(profile?.role);
  const routeMeta = getRouteMeta(pathname);

  useEffect(() => {
    if (!profile?.role) return;
    if (!canAccessRoute(pathname, profile.role)) {
      router.replace("/dashboard");
    }
  }, [pathname, profile?.role, router]);

  const initials =
    profile?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "G";

  const { version, buildTime, gitSha } = getBuildInfo();
  const versionLine = formatVersionLabel(version);
  const versionTitle = [buildTime && `Build: ${buildTime}`, gitSha && `Commit: ${gitSha}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Menüyü kapat"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            G
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">GOS</p>
            <p className="truncate text-xs text-muted-foreground">
              Growth Operating System
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Menüyü kapat"
          >
            <X className="size-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="flex flex-col gap-0.5" aria-label="Ana menü">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                  )}
                >
                  <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="border-t border-sidebar-border px-3 py-2">
          <p
            className="px-1 font-mono text-xs text-muted-foreground tabular-nums"
            title={versionTitle || undefined}
          >
            {versionLine}
          </p>
        </div>
        <div className="border-t border-sidebar-border p-3">
          <p className="px-1 text-xs text-muted-foreground">Giriş yapan</p>
          <p className="truncate px-1 text-sm font-medium">{profile?.name}</p>
          <p className="truncate px-1 text-xs text-muted-foreground">
            {profile?.email}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <Breadcrumb>
              <BreadcrumbList>
                {routeMeta.parent ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={routeMeta.parent.href}>
                        {routeMeta.parent.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                ) : null}
                <BreadcrumbItem>
                  <BreadcrumbPage>{routeMeta.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {routeMeta.title}
            </h1>
          </div>
          {rightPanel ? (
            <Button
              variant="outline"
              size="icon-sm"
              className="hidden xl:flex"
              onClick={() => setShowRight((v) => !v)}
              title="Sağ panel"
              aria-label="Sağ paneli aç/kapat"
            >
              <PanelRight className="size-4" />
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "gap-2 px-2 data-[popup-open]:bg-muted"
              )}
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/15 text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm sm:inline">
                {profile?.name}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span>{profile?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {profile?.role
                      ? LABELS.role[profile.role]
                      : "Rol atanmadı"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 size-4" />
                Çıkış
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
          {rightPanel && showRight ? (
            <>
              <Separator orientation="vertical" className="hidden xl:block" />
              <aside className="hidden w-80 shrink-0 overflow-y-auto border-l bg-muted/20 p-4 xl:block">
                {rightPanel}
              </aside>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

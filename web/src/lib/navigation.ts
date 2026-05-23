import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  UserSearch,
  UsersRound,
} from "lucide-react";
import type { UserRole } from "@/types/models";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[] | "all";
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: "all",
  },
  {
    href: "/leads",
    label: "Lead'ler",
    icon: UserSearch,
    roles: [
      "admin",
      "education_sales",
      "business_dev",
      "operations",
      "mentor",
    ],
  },
  {
    href: "/pipeline/education",
    label: "Eğitim Pipeline",
    icon: GraduationCap,
    roles: ["admin", "education_sales", "operations", "mentor"],
  },
  {
    href: "/pipeline/corporate",
    label: "Kurumsal Pipeline",
    icon: Briefcase,
    roles: ["admin", "business_dev", "operations"],
  },
  {
    href: "/tasks",
    label: "Görevler",
    icon: ClipboardList,
    roles: "all",
  },
  {
    href: "/calendar",
    label: "Takvim",
    icon: CalendarDays,
    roles: "all",
  },
  {
    href: "/programs",
    label: "Programlar",
    icon: BookOpen,
    roles: [
      "admin",
      "education_sales",
      "operations",
      "mentor",
    ],
  },
  {
    href: "/proposals",
    label: "Teklifler",
    icon: FileText,
    roles: ["admin", "business_dev", "operations"],
  },
  {
    href: "/team",
    label: "Personel",
    icon: UsersRound,
    roles: ["admin"],
  },
  {
    href: "/reports",
    label: "Raporlar",
    icon: BarChart3,
    roles: ["admin", "business_dev", "operations"],
  },
  {
    href: "/settings",
    label: "Ayarlar",
    icon: Settings,
    roles: "all",
  },
];

export function getNavForRole(role: UserRole | undefined): NavItem[] {
  if (!role) return NAV_ITEMS.filter((i) => i.href === "/dashboard");
  return NAV_ITEMS.filter(
    (item) =>
      item.roles === "all" ||
      (Array.isArray(item.roles) && item.roles.includes(role))
  );
}

export type RouteMeta = {
  title: string;
  parent?: { href: string; label: string };
};

const ROUTE_META: Record<string, RouteMeta> = {
  "/dashboard": { title: "Dashboard" },
  "/leads": { title: "Lead'ler" },
  "/pipeline/education": {
    title: "Eğitim Pipeline",
    parent: { href: "/dashboard", label: "Dashboard" },
  },
  "/pipeline/corporate": {
    title: "Kurumsal Pipeline",
    parent: { href: "/dashboard", label: "Dashboard" },
  },
  "/pipeline/corporate/new": {
    title: "Yeni fırsat",
    parent: { href: "/pipeline/corporate", label: "Kurumsal Pipeline" },
  },
  "/tasks": { title: "Görevler" },
  "/calendar": { title: "Takvim" },
  "/programs": { title: "Programlar" },
  "/proposals": { title: "Teklifler" },
  "/team": { title: "Personel" },
  "/reports": { title: "Raporlar" },
  "/settings": { title: "Ayarlar" },
};

export function getRouteMeta(pathname: string): RouteMeta {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];

  if (pathname.startsWith("/leads/")) {
    return {
      title: "Lead detayı",
      parent: { href: "/leads", label: "Lead'ler" },
    };
  }
  if (pathname.match(/^\/pipeline\/corporate\/[^/]+$/)) {
    return {
      title: "Fırsat detayı",
      parent: { href: "/pipeline/corporate", label: "Kurumsal Pipeline" },
    };
  }
  if (pathname.startsWith("/programs/")) {
    return {
      title: "Program detayı",
      parent: { href: "/programs", label: "Programlar" },
    };
  }

  const sorted = Object.keys(ROUTE_META).sort((a, b) => b.length - a.length);
  for (const path of sorted) {
    if (pathname.startsWith(path + "/") || pathname === path) {
      return ROUTE_META[path];
    }
  }

  return { title: "Panel" };
}

export function canAccessRoute(
  pathname: string,
  role: UserRole | undefined
): boolean {
  const nav = getNavForRole(role);
  const basePaths = nav.map((n) => n.href);
  if (basePaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }
  if (pathname.startsWith("/leads/") && basePaths.includes("/leads")) {
    return true;
  }
  if (pathname.startsWith("/programs/") && basePaths.includes("/programs")) {
    return true;
  }
  if (
    pathname.match(/^\/pipeline\/corporate\/[^/]+$/) &&
    basePaths.includes("/pipeline/corporate")
  ) {
    return true;
  }
  return pathname === "/dashboard";
}

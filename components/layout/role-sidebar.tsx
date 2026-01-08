"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import LanguageSwitcher, { LanguageSwitcherCompact } from "@/components/language-switcher";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Settings,
  LogOut,
  Home,
  CreditCard,
  MessageSquare,
  Bell,
  BarChart3,
  Shield,
  UserCog,
  Wrench,
  Menu,
  X,
} from "lucide-react";

// Navigation items per role
const navConfig = {
  ADMIN: {
    title: "Admin Panel",
    baseUrl: "/admin",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Users", href: "/users", icon: Users },
      { label: "Properties", href: "/properties", icon: Building2 },
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Roles & Permissions", href: "/roles", icon: Shield },
      { label: "System Settings", href: "/settings", icon: UserCog },
    ],
  },
  HOUSEOWNER: {
    title: "Owner Portal",
    baseUrl: "/owner",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Properties", href: "/properties", icon: Building2 },
      { label: "Tenants", href: "/tenants", icon: Users },
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Maintenance", href: "/maintenance", icon: Wrench },
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Messages", href: "/messages", icon: MessageSquare },
    ],
  },
  RENTER: {
    title: "Renter Portal",
    baseUrl: "/renter",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Rental", href: "/rental", icon: Home },
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Maintenance", href: "/maintenance", icon: Wrench },
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Messages", href: "/messages", icon: MessageSquare },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
} as const;

type UserRole = keyof typeof navConfig;

export default function RoleSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const role = (session?.user?.role as UserRole) || "RENTER";
  const config = navConfig[role];
  
  // Get translated title based on role
  const getTitle = () => {
    switch (role) {
      case "ADMIN": return t.adminPanel;
      case "HOUSEOWNER": return t.ownerPortal;
      case "RENTER": return t.renterPortal;
      default: return config.title;
    }
  };

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border">
        <Link
          href={`${config.baseUrl}/dashboard`}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-lg">{getTitle()}</span>
        </Link>
        {/* Close button - mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {config.items.map((item) => {
          const fullHref = `${config.baseUrl}${item.href}`;
          const isActive =
            pathname === fullHref || pathname.startsWith(`${fullHref}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User & Settings */}
      <div className="p-4 border-t border-border space-y-1">
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        <Link
          href={`${config.baseUrl}/settings`}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === `${config.baseUrl}/settings`
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="w-5 h-5" />
          {t.settings}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t.signOut}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <Link
          href={`${config.baseUrl}/dashboard`}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-lg">{getTitle()}</span>
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcherCompact />
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop (always visible) */}
      <aside className="hidden lg:flex w-64 h-screen bg-card border-r border-border flex-col fixed left-0 top-0">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile (slide out) */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 w-72 h-screen bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Spacer for desktop layout */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
      
      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}

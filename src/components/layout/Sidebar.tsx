"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Search,
  Settings,
  X,
  Bell,
} from "lucide-react";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Entreprises", href: "/entreprises", icon: Building2 },
  { name: "BÃ©nÃ©ficiaires", href: "/beneficiaires", icon: Users },
  { name: "Recherche", href: "/recherche", icon: Search },
];

const adminNav = [
  { name: "Administration", href: "/admin", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();

  const allNav = userRole === "ADMIN" ? [...navigation, ...adminNav] : navigation;

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-xl font-bold text-primary-900">SEVE Emploi</h2>
            <p className="text-xs text-gray-500 mt-0.5">Module Prospection</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 px-3 space-y-1">
          {allNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

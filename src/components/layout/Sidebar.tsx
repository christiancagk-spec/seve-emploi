"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Building2,
  Users,
  Search,
  Settings,
  X,
} from "lucide-react";

const AGK_BASE_URL = process.env.NEXT_PUBLIC_AGK_URL || "https://agk-app-production.up.railway.app";

// Navigation AGK principale (liens vers l'app AGK)
const agkNavigation = [
  { name: "Tableau de bord", href: `${AGK_BASE_URL}/dashboard`, icon: "📊", external: true },
  { name: "Salariés en transition", href: `${AGK_BASE_URL}/dashboard`, icon: "👥", external: true },
  { name: "Suivi ACI", href: `${AGK_BASE_URL}/dashboard`, icon: "📋", external: true },
  { name: "SEVE 2", href: `${AGK_BASE_URL}/dashboard`, icon: "🌿", external: true },
];

// Navigation du module Prospection (liens internes)
const prospectionNav = [
  { name: "Tableau de bord", href: "/dashboard", icon: Building2 },
  { name: "Entreprises", href: "/entreprises", icon: Building2 },
  { name: "Salariés en transition", href: "/beneficiaires", icon: Users },
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
  const { data: session } = useSession();

  const allProspectionNav = userRole === "ADMIN" ? [...prospectionNav, ...adminNav] : prospectionNav;

  const userInitial = session?.user?.firstName?.charAt(0)?.toUpperCase() || session?.user?.lastName?.charAt(0)?.toUpperCase() || "U";
  const userName = session?.user?.firstName
    ? `${session.user.firstName} ${session.user.lastName || ""}`.trim()
    : session?.user?.email || "Utilisateur";
  const userRoleLabel = session?.user?.role?.toLowerCase() || "utilisateur";

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
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#0F2D18" }}
      >
        {/* Logo AGK */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-green-300 hover:text-white hover:bg-white/10 absolute top-3 right-3"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-2xl">🌿</span>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">An Grèn Kouler</h1>
              <span className="text-green-400/70 text-xs">Écritures sociales · La Réunion</span>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white font-semibold text-sm">
              {userInitial}
            </div>
            <div>
              <div className="text-white text-sm font-medium leading-tight">{userName}</div>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-green-600 text-white">
                {userRoleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation AGK */}
        <nav className="mt-1 px-3 flex-1 overflow-y-auto">
          <div className="mb-1">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-green-500/60">
              Navigation
            </p>
          </div>

          {agkNavigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-green-200/80 hover:bg-white/10 hover:text-white transition-colors mb-0.5"
            >
              <span className="text-base">{item.icon}</span>
              {item.name}
            </a>
          ))}

          {/* Section Prospection SEVE */}
          <div className="mt-4 mb-1">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-green-500/60">
              Prospection SEVE
            </p>
          </div>

          {allProspectionNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name + item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                  isActive
                    ? "bg-green-700 text-white"
                    : "text-green-200/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion en bas */}
        <div className="px-5 py-4 border-t border-white/10">
          <a
            href={`${AGK_BASE_URL}/logout`}
            className="text-green-300/70 hover:text-white text-sm flex items-center gap-2 transition-colors"
          >
            Déconnexion
          </a>
        </div>
      </aside>
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  Clock,
  Calendar,
  TrendingUp,
  Bell,
  CheckCircle,
  ArrowRight,
  Check,
  Users,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Stats {
  total: number;
  enAttente: number;
  pmsmp: number;
  contrats: number;
}

interface ReminderItem {
  id: string;
  date: string;
  type: string;
  comment: string;
  company: { id: string; companyName: string; city: string };
}

interface PlacementStats {
  total: number;
  byType: Record<string, number>;
  enCours: number;
}

const placementTypeLabel: Record<string, string> = {
  PMSMP: "PMSMP",
  STAGE: "Stage",
  CDD: "CDD",
  CDI: "CDI",
  APPRENTISSAGE: "Apprentissage",
  INTERIM: "Intérim",
  AUTRE: "Autre",
};

const placementTypeColor: Record<string, string> = {
  PMSMP: "bg-blue-100 text-blue-700",
  STAGE: "bg-purple-100 text-purple-700",
  CDD: "bg-orange-100 text-orange-700",
  CDI: "bg-green-100 text-green-700",
  APPRENTISSAGE: "bg-teal-100 text-teal-700",
  INTERIM: "bg-yellow-100 text-yellow-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({ total: 0, enAttente: 0, pmsmp: 0, contrats: 0 });
  const [placementStats, setPlacementStats] = useState<PlacementStats>({ total: 0, byType: {}, enCours: 0 });
  const [benefCount, setBenefCount] = useState(0);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [companiesRes, remindersRes, prospectsRes, benefRes] = await Promise.all([
        fetch("/api/entreprises?limit=10"),
        fetch("/api/rappels?status=EN_ATTENTE"),
        fetch("/api/prospections"),
        fetch("/api/beneficiaires"),
      ]);

      const companiesData = await companiesRes.json();
      const remindersData = await remindersRes.json();

      const companies = companiesData.companies || [];
      setRecentCompanies(companies.slice(0, 5));
      setReminders(Array.isArray(remindersData) ? remindersData.slice(0, 5) : []);

      // Nombre de salaries en transition
      if (benefRes.ok) {
        const benefData = await benefRes.json();
        setBenefCount(Array.isArray(benefData) ? benefData.length : 0);
      }

      // Stats entreprises
      const allRes = await fetch("/api/entreprises?limit=1000");
      const allData = await allRes.json();
      const all = allData.companies || [];

      setStats({
        total: allData.pagination?.total || all.length,
        enAttente: all.filter((c: any) => c.contactStatus === "EN_ATTENTE").length,
        pmsmp: all.filter((c: any) => c.contactStatus === "PMSMP").length,
        contrats: all.filter((c: any) => c.contactStatus === "CONTRAT").length,
      });

      // Stats placements
      if (prospectsRes.ok) {
        const prospects = await prospectsRes.json();
        const prospectArray = Array.isArray(prospects) ? prospects : [];
        const byType: Record<string, number> = {};
        let enCours = 0;
        prospectArray.forEach((p: any) => {
          const t = p.placementType || "AUTRE";
          byType[t] = (byType[t] || 0) + 1;
          if (p.status === "EN_COURS") enCours++;
        });
        setPlacementStats({ total: prospectArray.length, byType, enCours });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDismissReminder = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissingId(id);
    try {
      const res = await fetch("/api/rappels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "COMPLETE" }),
      });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
        toast.success("Rappel terminé");
      } else {
        toast.error("Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setDismissingId(null);
    }
  };

  const statCards = [
    { label: "Salaries", value: benefCount, icon: Users, bgColor: "bg-primary-50", textColor: "text-primary-600", href: "/beneficiaires" },
    { label: "Entreprises", value: stats.total, icon: Building2, bgColor: "bg-indigo-50", textColor: "text-indigo-600", href: "/entreprises" },
    { label: "Placements actifs", value: placementStats.enCours, icon: TrendingUp, bgColor: "bg-green-50", textColor: "text-green-600" },
    { label: "Contrats signes", value: stats.contrats, icon: Briefcase, bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
    { label: "En attente", value: stats.enAttente, icon: Clock, bgColor: "bg-yellow-50", textColor: "text-yellow-600" },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      EN_ATTENTE: "badge badge-attente",
      PMSMP: "badge badge-pmsmp",
      CONTRAT: "badge badge-contrat",
      REFUS: "badge badge-refus",
    };
    const labels: Record<string, string> = {
      EN_ATTENTE: "En attente",
      PMSMP: "PMSMP",
      CONTRAT: "Contrat",
      REFUS: "Refus",
    };
    return <span className={map[status] || "badge"}>{labels[status] || status}</span>;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-24 bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card h-64 bg-gray-100" />
          <div className="card h-64 bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {session?.user?.firstName} !
        </h1>
        <p className="mt-1 text-gray-500">
          Voici le résumé de votre activité de prospection.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const CardWrapper = stat.href ? Link : "div";
          const cardProps = stat.href ? { href: stat.href } : {};
          return (
            <CardWrapper key={stat.label} {...(cardProps as any)} className={`card p-5 ${stat.href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Placements par type */}
      {placementStats.total > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Placements par type
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(placementStats.byType).map(([type, count]) => (
              <div
                key={type}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${placementTypeColor[type] || "bg-gray-100 text-gray-700"}`}
              >
                <span className="text-sm font-medium">{placementTypeLabel[type] || type}</span>
                <span className="text-lg font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rappels */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-500" />
              Rappels en attente
            </h2>
            <span className="badge bg-red-100 text-red-700">{reminders.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {reminders.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Aucun rappel en attente</p>
              </div>
            ) : (
              reminders.map((reminder) => {
                const isOverdue = new Date(reminder.date) < new Date();
                return (
                  <div key={reminder.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${isOverdue ? "bg-red-50/50" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/entreprises/${reminder.company.id}`}
                        className="flex-1 min-w-0"
                      >
                        <p className="text-sm font-medium text-gray-900 hover:text-primary-600">
                          {reminder.company.companyName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {reminder.comment}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs whitespace-nowrap ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                          {new Date(reminder.date).toLocaleDateString("fr-FR")}
                        </span>
                        <button
                          onClick={(e) => handleDismissReminder(reminder.id, e)}
                          disabled={dismissingId === reminder.id}
                          className="p-1 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Marquer comme fait"
                        >
                          <Check className={`h-4 w-4 ${dismissingId === reminder.id ? "opacity-50" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dernières entreprises */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-500" />
              Dernières entreprises
            </h2>
            <Link
              href="/entreprises"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentCompanies.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <Building2 className="h-8 w-8 mx-auto mb-2" />
                <p>Aucune entreprise</p>
                <Link href="/entreprises" className="text-primary-600 text-sm hover:underline mt-1 inline-block">
                  Ajouter une entreprise
                </Link>
              </div>
            ) : (
              recentCompanies.map((company: any) => (
                <Link
                  key={company.id}
                  href={`/entreprises/${company.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {company.companyName}
                    </p>
                    <p className="text-xs text-gray-500">{company.city} &middot; {company.sector}</p>
                  </div>
                  {statusBadge(company.contactStatus)}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

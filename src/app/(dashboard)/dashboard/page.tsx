"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  Clock,
  Calendar,
  TrendingUp,
  Bell,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({ total: 0, enAttente: 0, pmsmp: 0, contrats: 0 });
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [companiesRes, remindersRes] = await Promise.all([
          fetch("/api/entreprises?limit=10"),
          fetch("/api/rappels?status=EN_ATTENTE"),
        ]);

        const companiesData = await companiesRes.json();
        const remindersData = await remindersRes.json();

        const companies = companiesData.companies || [];
        setRecentCompanies(companies.slice(0, 5));
        setReminders(Array.isArray(remindersData) ? remindersData.slice(0, 5) : []);

        const allRes = await fetch("/api/entreprises?limit=1000");
        const allData = await allRes.json();
        const all = allData.companies || [];

        setStats({
          total: allData.pagination?.total || all.length,
          enAttente: all.filter((c: any) => c.contactStatus === "EL_ATTENTE").length,
          pmsmp: all.filter((c: any) => c.contactStatus === "PMSMP").length,
          contrats: all.filter((c: any) => c.contactStatus === "CONTRAT").length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    { label: "Total entreprises", value: stats.total, icon: Building2, color: "bg-primary-500", bgColor: "bg-primary-50", textColor: "text-primary-600" },
    { label: "En attente", value: stats.enAttente, icon: Clock, color: "bg-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-600" },
    { label: "PMSMP", value: stats.pmsmp, icon: Calendar, color: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-600" },
    { label: "Contrats", value: stats.contrats, icon: TrendingUp, color: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-600" },
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {session?.user?.firstName} !
        </h1>
        <p className="mt-1 text-gray-500">
          Voici le resume de votre activite de prospection.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              reminders.map((reminder) => (
                <div key={reminder.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reminder.company.companyName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {reminder.comment}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(reminder.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-500" />
              Dernieres entreprises
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

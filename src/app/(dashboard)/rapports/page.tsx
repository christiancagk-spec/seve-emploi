"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Phone,
  Mail,
  MapPin,
  Bell,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  UserCheck,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface RapportData {
  entreprises: {
    total: number;
    parStatut: Record<string, number>;
    parSecteur: { secteur: string; count: number }[];
  };
  prospections: {
    total: number;
    parStatut: Record<string, number>;
    parType: Record<string, number>;
    ceMois: number;
    moisPrecedent: number;
    variation: number;
  };
  contacts: {
    ceMois: number;
    moisPrecedent: number;
    variation: number;
    parType: Record<string, number>;
    parOutcome: Record<string, number>;
  };
  rappels: {
    enAttente: number;
    enRetard: number;
  };
  beneficiaires: {
    total: number;
    actifs: number;
    enEmploi: number;
    enFormation: number;
    sortis: number;
  };
}

const statusLabels: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PMSMP: "PMSMP",
  CONTRAT: "Contrat",
  REFUS: "Refus",
};
const statusColors: Record<string, string> = {
  EN_ATTENTE: "bg-yellow-500",
  PMSMP: "bg-blue-500",
  CONTRAT: "bg-green-500",
  REFUS: "bg-red-400",
};

const prospStatusLabels: Record<string, string> = {
  EN_COURS: "En cours",
  PMSMP: "PMSMP",
  CONTRAT: "Contrat",
  REFUS: "Refus",
  TERMINE: "Termine",
};
const prospStatusColors: Record<string, string> = {
  EN_COURS: "bg-blue-500",
  PMSMP: "bg-indigo-500",
  CONTRAT: "bg-green-500",
  REFUS: "bg-red-400",
  TERMINE: "bg-gray-400",
};

const placementLabels: Record<string, string> = {
  PMSMP: "PMSMP",
  STAGE: "Stage",
  CDD: "CDD",
  CDI: "CDI",
  APPRENTISSAGE: "Apprentissage",
  INTERIM: "Interim",
  AUTRE: "Autre",
};
const placementColors: Record<string, string> = {
  PMSMP: "bg-blue-100 text-blue-700",
  STAGE: "bg-purple-100 text-purple-700",
  CDD: "bg-orange-100 text-orange-700",
  CDI: "bg-green-100 text-green-700",
  APPRENTISSAGE: "bg-teal-100 text-teal-700",
  INTERIM: "bg-yellow-100 text-yellow-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

const contactTypeLabels: Record<string, string> = {
  APPEL: "Appels",
  EMAIL: "Emails",
  VISITE: "Visites",
  AUTRE: "Autre",
};
const contactTypeIcons: Record<string, any> = {
  APPEL: Phone,
  EMAIL: Mail,
  VISITE: MapPin,
  AUTRE: BarChart3,
};

const outcomeLabels: Record<string, string> = {
  POSITIF: "Positif",
  NEGATIF: "Negatif",
  EN_ATTENTE: "En attente",
};
const outcomeColors: Record<string, string> = {
  POSITIF: "bg-green-500",
  NEGATIF: "bg-red-400",
  EN_ATTENTE: "bg-yellow-500",
};

export default function RapportsPage() {
  const [data, setData] = useState<RapportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rapports")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-28 bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card h-72 bg-gray-100" />
          <div className="card h-72 bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        Impossible de charger les rapports.
      </div>
    );
  }

  const moisLabel = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h1>
        <p className="mt-1 text-gray-500">Vue d'ensemble de l'activite SEVE - {moisLabel}</p>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={Building2}
          label="Entreprises"
          value={data.entreprises.total}
          sub={`${data.entreprises.parStatut.CONTRAT || 0} contrats`}
          color="indigo"
        />
        <KpiCard
          icon={Users}
          label="Salaries"
          value={data.beneficiaires.total}
          sub={`${data.beneficiaires.actifs} actifs`}
          color="blue"
        />
        <KpiCard
          icon={Briefcase}
          label="Prospections"
          value={data.prospections.total}
          sub={`${data.prospections.ceMois} ce mois`}
          variation={data.prospections.variation}
          color="green"
        />
        <KpiCard
          icon={Phone}
          label="Interactions"
          value={data.contacts.ceMois}
          sub="ce mois"
          variation={data.contacts.variation}
          color="purple"
        />
        <KpiCard
          icon={Bell}
          label="Rappels"
          value={data.rappels.enAttente}
          sub={data.rappels.enRetard > 0 ? `${data.rappels.enRetard} en retard` : "a jour"}
          color={data.rappels.enRetard > 0 ? "red" : "gray"}
        />
      </div>

      {/* Row 2: Entreprises par statut + Beneficiaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entreprises par statut */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            Entreprises par statut
          </h2>
          <div className="space-y-3">
            {Object.entries(data.entreprises.parStatut).map(([statut, count]) => (
              <StatusBar
                key={statut}
                label={statusLabels[statut] || statut}
                value={count}
                total={data.entreprises.total}
                color={statusColors[statut] || "bg-gray-400"}
              />
            ))}
          </div>
        </div>

        {/* Beneficiaires */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            Salaries en transition
          </h2>
          <div className="space-y-3">
            <StatusBar label="Actifs" value={data.beneficiaires.actifs} total={data.beneficiaires.total} color="bg-green-500" />
            <StatusBar label="En emploi" value={data.beneficiaires.enEmploi} total={data.beneficiaires.total} color="bg-blue-500" />
            <StatusBar label="En formation" value={data.beneficiaires.enFormation} total={data.beneficiaires.total} color="bg-amber-500" />
            <StatusBar label="Sortis" value={data.beneficiaires.sortis} total={data.beneficiaires.total} color="bg-gray-400" />
          </div>
          <div className="mt-4 pt-3 border-t flex justify-between text-xs text-gray-400">
            <span>Total : {data.beneficiaires.total}</span>
            <span>Taux emploi : {data.beneficiaires.total > 0 ? Math.round((data.beneficiaires.enEmploi / data.beneficiaires.total) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Row 3: Prospections statut + type placement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospections par statut */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            Prospections par statut
          </h2>
          {data.prospections.total === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune prospection</p>
          ) : (
            <>
              <div className="space-y-3">
                {Object.entries(data.prospections.parStatut).map(([statut, count]) => (
                  <StatusBar
                    key={statut}
                    label={prospStatusLabels[statut] || statut}
                    value={count}
                    total={data.prospections.total}
                    color={prospStatusColors[statut] || "bg-gray-400"}
                  />
                ))}
              </div>
              <div className="mt-4 pt-3 border-t text-xs text-gray-400">
                Taux de conversion : {data.prospections.total > 0 ? Math.round(((data.prospections.parStatut.CONTRAT || 0) / data.prospections.total) * 100) : 0}%
              </div>
            </>
          )}
        </div>

        {/* Placements par type */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-400" />
            Types de placement
          </h2>
          {Object.keys(data.prospections.parType).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun placement</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(data.prospections.parType).map(([type, count]) => (
                <div
                  key={type}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg ${placementColors[type] || "bg-gray-100 text-gray-700"}`}
                >
                  <span className="text-sm font-medium">{placementLabels[type] || type}</span>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Interactions + Secteurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactions ce mois */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            Interactions ce mois
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {Object.entries(data.contacts.parType).map(([type, count]) => {
              const Icon = contactTypeIcons[type] || BarChart3;
              return (
                <div key={type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">{count}</p>
                    <p className="text-xs text-gray-500">{contactTypeLabels[type] || type}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Outcomes */}
          {Object.keys(data.contacts.parOutcome).length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Resultats des interactions</p>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                {Object.entries(data.contacts.parOutcome).map(([outcome, count]) => {
                  const totalOutcomes = Object.values(data.contacts.parOutcome).reduce((a, b) => a + b, 0);
                  const pct = totalOutcomes > 0 ? (count / totalOutcomes) * 100 : 0;
                  return pct > 0 ? (
                    <div
                      key={outcome}
                      className={`${outcomeColors[outcome] || "bg-gray-400"} h-full`}
                      style={{ width: `${pct}%` }}
                      title={`${outcomeLabels[outcome] || outcome}: ${count}`}
                    />
                  ) : null;
                })}
              </div>
              <div className="flex gap-4 mt-2">
                {Object.entries(data.contacts.parOutcome).map(([outcome, count]) => (
                  <span key={outcome} className="text-xs text-gray-500 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${outcomeColors[outcome] || "bg-gray-400"}`} />
                    {outcomeLabels[outcome] || outcome}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top secteurs */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            Top secteurs d'activite
          </h2>
          {data.entreprises.parSecteur.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun secteur renseigne</p>
          ) : (
            <div className="space-y-2">
              {data.entreprises.parSecteur.map((s, i) => (
                <div key={s.secteur} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-400 w-5">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 truncate">{s.secteur}</span>
                      <span className="font-medium text-gray-800 ml-2">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-500 h-full rounded-full"
                        style={{ width: `${(s.count / data.entreprises.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Composants internes ────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  variation,
}: {
  icon: any;
  label: string;
  value: number;
  sub?: string;
  color: string;
  variation?: number;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600",
    gray: "bg-gray-50 text-gray-500",
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colors[color] || colors.gray}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {variation !== undefined && variation !== 0 && (
              <span
                className={`text-xs font-medium flex items-center ${
                  variation > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {variation > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(variation)}%
              </span>
            )}
          </div>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-800 font-medium">
          {value} <span className="text-gray-400 text-xs">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

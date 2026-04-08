"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, LayoutGrid, Table2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import BeneficiaryFormModal from "@/components/beneficiaires/BeneficiaryFormModal";

const STATUT_LABELS: Record<string, string> = {
  actif: "Actif", en_cours: "En cours", formation: "Formation",
  emploi: "Emploi", sortie: "Sorti",
};
const STATUT_STYLES: Record<string, string> = {
  actif: "bg-green-100 text-green-700", en_cours: "bg-blue-100 text-blue-700",
  formation: "bg-amber-100 text-amber-700", emploi: "bg-purple-100 text-purple-700",
  sortie: "bg-gray-100 text-gray-600",
};

export default function BeneficiairesPage() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/beneficiaires");
      const data = await res.json();
      setBeneficiaries(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Extraire les sites uniques pour le filtre
  const sites = Array.from(new Set(beneficiaries.map((b: any) => b.siteAffectation).filter(Boolean)));

  const filtered = beneficiaries.filter((b) => {
    const searchMatch = `${b.firstName || ""} ${b.lastName || ""} ${b.email || ""} ${b.targetJob || ""}`
      .toLowerCase().includes(search.toLowerCase());
    const statutMatch = !filterStatut || b.statut === filterStatut;
    const siteMatch = !filterSite || b.siteAffectation === filterSite;
    return searchMatch && statutMatch && siteMatch;
  });

  const stats = {
    total: beneficiaries.length,
    actifs: beneficiaries.filter(b => b.statut === "actif" || b.statut === "en_cours").length,
    pmsmp: beneficiaries.filter(b => b.prospections?.some((p: any) => p.status === "PMSMP")).length,
    contrats: beneficiaries.filter(b => b.prospections?.some((p: any) => p.status === "CONTRAT")).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Liste & recherche des salaries en transition
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerez et recherchez vos salaries en transition
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Nouveau salarie
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" className="input pl-10 text-sm"
            placeholder="Rechercher par nom, prenom, email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input text-sm w-auto" value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select className="input text-sm w-auto" value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)}>
          <option value="">Tous les sites</option>
          {sites.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Toggle vue + compteur */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm ${view === "table" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
            <Table2 className="h-4 w-4" /> Tableau
          </button>
          <button onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm ${view === "grid" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
            <LayoutGrid className="h-4 w-4" /> Grille
          </button>
        </div>
        <p className="text-sm text-gray-500">
          {filtered.length} salarie(s) — {stats.actifs} actifs, {stats.pmsmp} PMSMP, {stats.contrats} contrats
        </p>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="card p-8 text-center text-gray-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun resultat</h3>
          <p className="text-gray-400 text-sm mt-1 mb-6">
            {search || filterStatut ? "Modifiez vos filtres" : "Commencez par ajouter un premier salarie"}
          </p>
        </div>
      ) : view === "table" ? (
        /* VUE TABLEAU */
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Nom</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Telephone</th>
                <th className="px-6 py-3">Site</th>
                <th className="px-6 py-3">CIP</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Entretiens</th>
                <th className="px-6 py-3">Prospections</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {b.firstName} {b.lastName}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{b.email || "-"}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{b.phone || "-"}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{b.siteAffectation || "-"}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{b.encadrantReferent || "-"}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUT_STYLES[b.statut] || "bg-gray-100 text-gray-600"}`}>
                      {STATUT_LABELS[b.statut] || b.statut || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 text-center">{b._count?.entretiens || 0}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 text-center">{b._count?.prospections || 0}</td>
                  <td className="px-6 py-3">
                    <Link href={`/beneficiaires/${b.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700">
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* VUE GRILLE */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b: any) => (
            <Link key={b.id} href={`/beneficiaires/${b.id}`}
              className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {b.firstName?.[0]}{b.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{b.firstName} {b.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{b.targetJob || "Poste non renseigne"}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUT_STYLES[b.statut] || "bg-gray-100"}`}>
                  {STATUT_LABELS[b.statut] || b.statut}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{b._count?.prospections || 0} entreprise(s)</span>
                <span>{b._count?.entretiens || 0} entretien(s)</span>
                <span>{b._count?.evaluations || 0} eval.</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <BeneficiaryFormModal
          beneficiary={null}
          onClose={() => setShowModal(false)}
          onSuccess={async () => {
            setShowModal(false);
            setLoading(true);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

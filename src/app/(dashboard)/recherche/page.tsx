"use client";

import { useState } from "react";
import { Search, Filter, Building2, MapPin, Phone } from "lucide-react";
import { SECTORS } from "@/lib/sectors";
import toast from "react-hot-toast";

export default function RecherchePage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [params, setParams] = useState({
    search: "",
    sector: "",
    status: "",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set("search", params.search);
      if (params.sector) searchParams.set("sector", params.sector);
      if (params.status) searchParams.set("status", params.status);
      searchParams.set("limit", "100");

      const res = await fetch(`/api/entreprises?${searchParams}`);
      const data = await res.json();
      setResults(data.companies || []);
    } catch {
      toast.error("Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel: Record<string, string> = {
    EN_ATTENTE: "En attente",
    PMSMP: "PMSMP",
    CONTRAT: "Contrat",
    REFUS: "Refus",
  };

  const statusClass: Record<string, string> = {
    EN_ATTENTE: "badge badge-attente",
    PMSMP: "badge badge-pmsmp",
    CONTRAT: "badge badge-contrat",
    REFUS: "badge badge-refus",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recherche avancée</h1>
        <p className="text-gray-500 text-sm mt-1">
          Recherchez des entreprises avec des filtres combinés
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Recherche texte</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Nom, ville, téléphone..."
                  value={params.search}
                  onChange={(e) => setParams({ ...params, search: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Secteur</label>
              <select
                className="input"
                value={params.sector}
                onChange={(e) => setParams({ ...params, sector: e.target.value })}
              >
                <option value="">Tous les secteurs</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Statut</label>
              <select
                className="input"
                value={params.status}
                onChange={(e) => setParams({ ...params, status: e.target.value })}
              >
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="PMSMP">PMSMP</option>
                <option value="CONTRAT">Contrat</option>
                <option value="REFUS">Refus</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </div>
        </form>
      </div>

      {searched && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {results.length} résultat{results.length > 1 ? "s" : ""}
            </h2>
          </div>
          {results.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Aucun résultat pour ces critères
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((company: any) => (
                <div key={company.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{company.companyName}</p>
                        <p className="text-sm text-gray-500">
                          {company.city} &middot; {company.sector}
                        </p>
                      </div>
                    </div>
                    <span className={statusClass[company.contactStatus] || "badge"}>
                      {statusLabel[company.contactStatus] || company.contactStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

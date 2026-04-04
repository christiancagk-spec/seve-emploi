"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Building2, User, MapPin, Briefcase, Users } from "lucide-react";
import Link from "next/link";

interface CompanyResult {
  id: string;
  companyName: string;
  city: string;
  sector: string;
  contactStatus: string;
  _count: { prospections: number };
}

interface BeneficiaryResult {
  id: string;
  firstName: string;
  lastName: string;
  targetJob: string;
  ville: string;
  _count: { prospections: number };
}

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

export default function RecherchePage() {
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<CompanyResult[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setCompanies([]);
      setBeneficiaries([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/recherche?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setCompanies(data.companies || []);
      setBeneficiaries(data.beneficiaries || []);
      setSearched(true);
    } catch {
      setCompanies([]);
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const totalResults = companies.length + beneficiaries.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recherche</h1>
        <p className="text-gray-500 text-sm mt-1">
          Recherchez parmi les entreprises et les salariés en transition
        </p>
      </div>

      {/* Search bar */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="input pl-12 text-lg py-3"
            placeholder="Nom, ville, secteur, métier..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        {searched && (
          <p className="text-sm text-gray-500 mt-2">
            {totalResults} résultat{totalResults > 1 ? "s" : ""} pour « {query} »
          </p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      )}

      {!loading && searched && totalResults === 0 && (
        <div className="card p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun résultat</h3>
          <p className="text-gray-500">Essayez avec d'autres termes de recherche</p>
        </div>
      )}

      {/* Entreprises */}
      {companies.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-500" />
              Entreprises
              <span className="text-sm font-normal text-gray-400">({companies.length})</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/entreprises/${c.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.companyName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    {c.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {c.city}
                      </span>
                    )}
                    {c.sector && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {c.sector}
                      </span>
                    )}
                    {c._count.prospections > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {c._count.prospections} placement{c._count.prospections > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
                <span className={statusClass[c.contactStatus] || "badge"}>
                  {statusLabel[c.contactStatus] || c.contactStatus}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bénéficiaires */}
      {beneficiaries.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              Salariés en transition
              <span className="text-sm font-normal text-gray-400">({beneficiaries.length})</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {beneficiaries.map((b) => (
              <Link
                key={b.id}
                href={`/beneficiaires/${b.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {b.firstName} {b.lastName}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    {b.targetJob && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {b.targetJob}
                      </span>
                    )}
                    {b.ville && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {b.ville}
                      </span>
                    )}
                    {b._count.prospections > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {b._count.prospections} placement{b._count.prospections > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

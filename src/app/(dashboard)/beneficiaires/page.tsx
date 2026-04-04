"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function BeneficiairesPage() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/beneficiaires");
        const data = await res.json();
        setBeneficiaries(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = beneficiaries.filter((b) =>
    `${b.firstName} ${b.lastName} ${b.targetJob}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const stats = {
    total: beneficiaries.length,
    pmsmp: beneficiaries.filter((b) =>
      b.prospections?.some((p: any) => p.status === "PMSMP")
    ).length,
    contrats: beneficiaries.filter((b) =>
      b.prospections?.some((p: any) => p.status === "CONTRAT")
    ).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salariés en transition</h1>
          <p className="text-gray-500 text-sm mt-1">
            Suivi des salariés en transition et leurs parcours
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Nouveau salarié
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">En PMSMP</p>
          <p className="text-2xl font-bold text-green-600">{stats.pmsmp}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">En contrat</p>
          <p className="text-2xl font-bold text-blue-600">{stats.contrats}</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Rechercher un salarié en transition..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun salarié en transition</h3>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {filtered.map((b: any) => (
            <div
              key={b.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {b.firstName?.[0]}{b.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {b.firstName} {b.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {b.targetJob || "Poste non renseigné"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {b._count?.prospections || 0} entreprise(s)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
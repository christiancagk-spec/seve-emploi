"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import BeneficiaryFormModal from "@/components/beneficiaires/BeneficiaryFormModal";

export default function BeneficiairesPage() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

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
    `${b.firstName || ""} ${b.lastName || ""} ${b.targetJob || ""}`
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
        <button className="btn-primary" onClick={() => setShowModal(true)}>
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
        <div className="card divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun salarié en transition</h3>
          <p className="text-gray-400 text-sm mt-1 mb-6">Commencez par ajouter un premier salarié</p>
          <button className="btn-primary mx-auto" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau salarié
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {filtered.map((b: any) => (
            <Link
              key={b.id}
              href={`/beneficiaires/${b.id}`}
              className="block p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {b.firstName?.[0]}{b.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 hover:text-primary-600">
                      {b.firstName || ""} {b.lastName || ""}
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
            try {
              const res = await fetch("/api/beneficiaires");
              const data = await res.json();
              setBeneficiaries(Array.isArray(data) ? data : []);
            } catch {
              toast.error("Erreur de rechargement");
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}
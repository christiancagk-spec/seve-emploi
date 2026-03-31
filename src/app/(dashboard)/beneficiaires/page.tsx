"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Search, Building2, ArrowRight, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import BeneficiaryFormModal from "@/components/beneficiaires/BeneficiaryFormModal";
import ProspectionFormModal from "@/components/beneficiaires/ProspectionFormModal";

export default function BeneficiairesPage() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [prospectionTarget, setProspectionTarget] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/beneficiaires");
      const data = await res.json();
      setBeneficiaries(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingBeneficiary(null);
    fetchData();
  };

  const handleProspectionSuccess = () => {
    setProspectionTarget(null);
    fetchData();
  };

  const statusLabel: Record<string, string> = {
    EN_COURS: "En cours",
    PMSMP: "PMSMP (immersion)",
    CONTRAT: "Contrat",
    REFUS: "Refusé",
    TERMINE: "Terminé",
  };

  const statusClass: Record<string, string> = {
    EN_COURS: "badge badge-attente",
    PMSMP: "badge badge-pmsmp",
    CONTRAT: "badge badge-contrat",
    REFUS: "badge badge-refus",
    TERMINE: "bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bénéficiaires</h1>
          <p className="text-gray-500 text-sm mt-1">
            Suivi des bénéficiaires et leurs parcours en entreprise
          </p>
        </div>
        <button
          onClick={() => { setEditingBeneficiary(null); setIsFormOpen(true); }}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau bénéficiaire
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">En PMSMP / immersion</p>
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
          placeholder="Rechercher un bénéficiaire..."
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
          <h3 className="text-lg font-medium text-gray-900">Aucun bénéficiaire</h3>
          <p className="text-gray-500 mt-1 mb-4">Ajoutez votre premier bénéficiaire pour commencer le suivi.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un bénéficiaire
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {filtered.map((b: any) => (
            <div key={b.id}>
              <div
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingBeneficiary(b); setIsFormOpen(true); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-400">
                      {b.prospections?.length || 0} entreprise(s)
                    </span>
                    {expandedId === b.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Historique stages / immersions */}
              {expandedId === b.id && (
                <div className="px-4 pb-4">
                  <div className="ml-13 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Historique entreprises (stages / immersions)
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProspectionTarget(b);
                        }}
                        className="text-xs btn-primary py-1 px-3"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Ajouter
                      </button>
                    </div>
                    {b.prospections && b.prospections.length > 0 ? (
                      <div className="space-y-2">
                        {b.prospections.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <div>
                                <Link
                                  href={`/entreprises/${p.companyId}`}
                                  className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {p.company?.companyName || "Entreprise"}
                                </Link>
                                <p className="text-xs text-gray-400">
                                  {p.startDate ? new Date(p.startDate).toLocaleDateString("fr-FR") : ""}
                                  {p.endDate ? ` - ${new Date(p.endDate).toLocaleDateString("fr-FR")}` : " - en cours"}
                                </p>
                                {p.notes && (
                                  <p className="text-xs text-gray-500 italic mt-0.5">{p.notes}</p>
                                )}
                              </div>
                            </div>
                            <span className={statusClass[p.status] || "badge"}>
                              {statusLabel[p.status] || p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Aucun stage / immersion enregistré pour ce bénéficiaire</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire bénéficiaire */}
      {isFormOpen && (
        <BeneficiaryFormModal
          beneficiary={editingBeneficiary}
          onClose={() => { setIsFormOpen(false); setEditingBeneficiary(null); }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal ajout prospection / stage */}
      {prospectionTarget && (
        <ProspectionFormModal
          beneficiaryId={prospectionTarget.id}
          beneficiaryName={`${prospectionTarget.firstName} ${prospectionTarget.lastName}`}
          onClose={() => setProspectionTarget(null)}
          onSuccess={handleProspectionSuccess}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Briefcase,
  Building2,
  Calendar,
  ClipboardList,
  MapPin,
  Phone,
  Mail,
  Plus,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import ProspectionFormModal from "@/components/beneficiaires/ProspectionFormModal";
import BeneficiaryFormModal from "@/components/beneficiaires/BeneficiaryFormModal";

const placementTypeLabel: Record<string, string> = {
  PMSMP: "PMSMP",
  STAGE: "Stage",
  CDD: "CDD",
  CDI: "CDI",
  APPRENTISSAGE: "Apprentissage",
  INTERIM: "Intérim",
  AUTRE: "Autre",
};

const placementTypeClass: Record<string, string> = {
  PMSMP: "bg-blue-100 text-blue-700",
  STAGE: "bg-purple-100 text-purple-700",
  CDD: "bg-orange-100 text-orange-700",
  CDI: "bg-green-100 text-green-700",
  APPRENTISSAGE: "bg-teal-100 text-teal-700",
  INTERIM: "bg-yellow-100 text-yellow-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

const prospectionStatusLabel: Record<string, string> = {
  EN_COURS: "En cours",
  PMSMP: "PMSMP",
  CONTRAT: "Contrat",
  REFUS: "Refusé",
  TERMINE: "Terminé",
};

const prospectionStatusClass: Record<string, string> = {
  EN_COURS: "bg-blue-50 text-blue-700 border-blue-200",
  PMSMP: "bg-indigo-50 text-indigo-700 border-indigo-200",
  CONTRAT: "bg-green-50 text-green-700 border-green-200",
  REFUS: "bg-red-50 text-red-700 border-red-200",
  TERMINE: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function BeneficiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProspOpen, setIsProspOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [cipData, setCipData] = useState<any>(null);
  const [cipLoading, setCipLoading] = useState(true);

  const fetchBeneficiary = async () => {
    try {
      const res = await fetch(`/api/beneficiaires/${params.id}`);
      if (!res.ok) {
        toast.error("Salarié non trouvé");
        router.push("/beneficiaires");
        return;
      }
      const data = await res.json();
      setBeneficiary(data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchBeneficiary();
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/beneficiaires/${params.id}/cip`)
        .then((r) => (r.ok ? r.json() : null))
        .then(setCipData)
        .catch(() => null)
        .finally(() => setCipLoading(false));
    }
  }, [params.id]);

  const handleProspectionAdded = () => {
    setIsProspOpen(false);
    fetchBeneficiary();
  };

  const handleStatusChange = async (prospectionId: string, newStatus: string) => {
    setUpdatingId(prospectionId);
    try {
      const res = await fetch("/api/prospections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prospectionId, status: newStatus }),
      });
      if (res.ok) {
        toast.success("Statut mis à jour");
        fetchBeneficiary();
      } else {
        toast.error("Erreur de mise à jour");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!beneficiary) return null;

  const prospections = beneficiary.prospections || [];

  // Compute type counts
  const typeCounts: Record<string, number> = {};
  prospections.forEach((p: any) => {
    const t = p.placementType || "AUTRE";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/beneficiaires"
            className="mt-1 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {beneficiary.firstName} {beneficiary.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              {beneficiary.targetJob && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> {beneficiary.targetJob}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => setIsEditOpen(true)} className="btn-secondary text-sm">
          Modifier les infos
        </button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Informations</h3>
          <div className="space-y-2">
            {beneficiary.phone && (
              <p className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" /> {beneficiary.phone}
              </p>
            )}
            {beneficiary.email && (
              <p className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" /> {beneficiary.email}
              </p>
            )}
            {beneficiary.ville && (
              <p className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400" /> {beneficiary.ville}
              </p>
            )}
            {!beneficiary.phone && !beneficiary.email && !beneficiary.ville && (
              <p className="text-sm text-gray-400 italic">Aucune info renseignée</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Parcours</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-primary-600">{prospections.length}</p>
              <p className="text-xs text-gray-500">Placements</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {prospections.filter((p: any) => p.status === "CONTRAT").length}
              </p>
              <p className="text-xs text-gray-500">Contrats</p>
            </div>
          </div>
        </div>

        {/* Placement type counters */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Types de placement</h3>
          {Object.keys(typeCounts).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCounts).map(([type, count]) => (
                <span
                  key={type}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    placementTypeClass[type] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {placementTypeLabel[type] || type}
                  <span className="bg-white/60 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Aucun placement</p>
          )}
        </div>
      </div>

      {/* Entreprises / Placements */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-500" />
              Entreprises & Placements
            </h2>
            <button
              onClick={() => setIsProspOpen(true)}
              className="btn-primary text-sm py-1.5 px-3"
            >
              <Plus className="h-4 w-4 mr-1" />
              Associer
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {prospections.length > 0 ? (
            prospections.map((p: any) => (
              <div key={p.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/entreprises/${p.company?.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600 hover:underline"
                      >
                        {p.company?.companyName || "Entreprise inconnue"}
                      </Link>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          placementTypeClass[p.placementType] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {placementTypeLabel[p.placementType] || p.placementType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.company?.city || ""} {p.company?.sector ? `· ${p.company.sector}` : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Depuis le {new Date(p.startDate).toLocaleDateString("fr-FR")}
                      {p.endDate && ` → ${new Date(p.endDate).toLocaleDateString("fr-FR")}`}
                    </p>
                  </div>

                  {/* Quick status */}
                  <div className="flex-shrink-0">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      disabled={updatingId === p.id}
                      className={`text-xs rounded-lg border px-2 py-1.5 cursor-pointer focus:ring-2 focus:ring-primary-500 ${
                        prospectionStatusClass[p.status] || "bg-gray-50 text-gray-700 border-gray-200"
                      } ${updatingId === p.id ? "opacity-50" : ""}`}
                    >
                      {Object.entries(prospectionStatusLabel).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {p.notes && (
                  <p className="text-xs text-gray-500 mt-1.5 italic">{p.notes}</p>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">
              <Building2 className="h-8 w-8 mx-auto mb-2" />
              <p>Aucun placement pour le moment</p>
              <p className="text-xs mt-1">Cliquez sur "Associer" pour ajouter un placement en entreprise</p>
            </div>
          )}
        </div>
      </div>

      {/* Parcours CIP */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary-500" />
            Parcours CIP
            {cipData && (
              <span className="text-xs text-gray-400 font-normal ml-2">
                {cipData.counts.entretiens} entretiens &middot; {cipData.counts.evaluations} evaluations &middot; {cipData.counts.pmsmp} PMSMP &middot; {cipData.counts.emplois} emplois
              </span>
            )}
          </h2>
        </div>

        <div className="px-6 py-4">
          {cipLoading ? (
            <div className="text-gray-400 text-sm">Chargement...</div>
          ) : cipData ? (
            <div className="space-y-6">
              {/* Score evaluation */}
              {cipData.scoreMoyen !== null && (
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-primary-600">{cipData.scoreMoyen}/5</div>
                  <div className="text-sm text-gray-500">Score moyen derniere evaluation</div>
                </div>
              )}

              {/* Entretiens recents */}
              {cipData.entretiens.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Derniers entretiens</h3>
                  <div className="space-y-2">
                    {cipData.entretiens.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div>
                          <span className="font-medium">{e.typeEntretien || "Entretien"}</span>
                          {e.lieu && <span className="text-gray-400 ml-2">— {e.lieu}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              e.statut === "realise"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {e.statut || "-"}
                          </span>
                          <span className="text-gray-400">
                            {e.dateEntretien
                              ? new Date(e.dateEntretien).toLocaleDateString("fr-FR")
                              : "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PMSMP */}
              {cipData.pmsmp.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">PMSMP realisees</h3>
                  <div className="space-y-2">
                    {cipData.pmsmp.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                        <div>
                          <span className="font-medium">{p.entreprise || "-"}</span>
                        </div>
                        <div className="text-gray-400">
                          {p.dateDebut ? new Date(p.dateDebut).toLocaleDateString("fr-FR") : ""} →{" "}
                          {p.dateFin ? new Date(p.dateFin).toLocaleDateString("fr-FR") : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emplois */}
              {cipData.emplois.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Emplois obtenus</h3>
                  <div className="space-y-2">
                    {cipData.emplois.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                        <div>
                          <span className="font-medium">{e.entreprise || "-"}</span>
                          <span className="text-gray-400 ml-2">
                            — {e.poste || "-"} ({e.typeContrat || "-"})
                          </span>
                        </div>
                        <div className="text-gray-400">
                          {e.dateDebut ? new Date(e.dateDebut).toLocaleDateString("fr-FR") : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cipData.counts.entretiens === 0 &&
                cipData.counts.pmsmp === 0 &&
                cipData.counts.emplois === 0 && (
                  <p className="text-sm text-gray-400">
                    Aucune donnee CIP disponible pour ce beneficiaire.
                  </p>
                )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Donnees CIP non disponibles.</p>
          )}
        </div>
      </div>

      {/* Modals */}
      {isProspOpen && (
        <ProspectionFormModal
          beneficiaryId={String(beneficiary.id)}
          beneficiaryName={`${beneficiary.firstName} ${beneficiary.lastName}`}
          onClose={() => setIsProspOpen(false)}
          onSuccess={handleProspectionAdded}
        />
      )}

      {isEditOpen && (
        <BeneficiaryFormModal
          beneficiary={beneficiary}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            fetchBeneficiary();
          }}
        />
      )}
    </div>
  );
}

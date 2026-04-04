"use client";

import { useState, useEffect } from "react";
import { X, Save, Users } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  companyId: string;
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const placementOptions = [
  { value: "PMSMP", label: "PMSMP (immersion professionnelle)" },
  { value: "STAGE", label: "Stage" },
  { value: "CDD", label: "CDD" },
  { value: "CDI", label: "CDI" },
  { value: "APPRENTISSAGE", label: "Apprentissage" },
  { value: "INTERIM", label: "Intérim" },
  { value: "AUTRE", label: "Autre" },
];

const statusOptions = [
  { value: "EN_COURS", label: "En cours" },
  { value: "TERMINE", label: "Terminé" },
  { value: "REFUS", label: "Refusé" },
];

export default function AddProspectionModal({
  companyId,
  companyName,
  onClose,
  onSuccess,
}: Props) {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loadingBenef, setLoadingBenef] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    beneficiaryId: "",
    placementType: "PMSMP",
    status: "EN_COURS",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/beneficiaires")
      .then((res) => res.json())
      .then((data) => setBeneficiaries(data || []))
      .catch(() => toast.error("Erreur chargement salariés"))
      .finally(() => setLoadingBenef(false));
  }, []);

  const filteredBenef = beneficiaries.filter((b) => {
    const fullName = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.beneficiaryId) {
      toast.error("Sélectionnez un salarié");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/prospections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          beneficiaryId: parseInt(form.beneficiaryId),
          placementType: form.placementType,
          status: form.status,
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          notes: form.notes,
        }),
      });

      if (res.ok) {
        toast.success("Salarié associé à l'entreprise");
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-500" />
            Associer un salarié
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-primary-50 rounded-lg p-3">
            <p className="text-sm text-primary-700">
              <span className="font-medium">Entreprise :</span> {companyName}
            </p>
          </div>

          {/* Sélection du salarié avec recherche */}
          <div>
            <label className="label">Salarié en transition *</label>
            <input
              type="text"
              className="input mb-2"
              placeholder="Rechercher un salarié..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {loadingBenef ? (
              <p className="text-sm text-gray-400">Chargement...</p>
            ) : (
              <select
                className="input"
                value={form.beneficiaryId}
                onChange={(e) =>
                  setForm({ ...form, beneficiaryId: e.target.value })
                }
                required
                size={5}
              >
                {filteredBenef.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.lastName} {b.firstName}
                    {b.targetJob ? ` — ${b.targetJob}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Type de placement */}
          <div>
            <label className="label">Type de placement *</label>
            <select
              className="input"
              value={form.placementType}
              onChange={(e) =>
                setForm({ ...form, placementType: e.target.value })
              }
            >
              {placementOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="label">Statut</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date de début</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Date de fin</label>
              <input
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Observations, objectifs du placement..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              <Save className="h-4 w-4 mr-2" />
              {submitting ? "Enregistrement..." : "Associer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

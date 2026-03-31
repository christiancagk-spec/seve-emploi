"use client";

import { useState, useEffect } from "react";
import { X, Save, Building2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  beneficiaryId: string;
  beneficiaryName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProspectionFormModal({ beneficiaryId, beneficiaryName, onClose, onSuccess }: Props) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    companyId: "",
    status: "EN_COURS",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/entreprises")
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data.companies || []);
      })
      .catch(() => toast.error("Erreur chargement entreprises"))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyId) {
      toast.error("Sélectionnez une entreprise");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/prospections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          beneficiaryId,
        }),
      });

      if (res.ok) {
        toast.success("Stage / immersion ajouté");
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

  const statusOptions = [
    { value: "EN_COURS", label: "En cours" },
    { value: "PMSMP", label: "PMSMP (immersion)" },
    { value: "CONTRAT", label: "Contrat" },
    { value: "REFUS", label: "Refusé" },
    { value: "TERMINE", label: "Terminé" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-500" />
            Ajouter un stage / immersion
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
              <span className="font-medium">Bénéficiaire :</span> {beneficiaryName}
            </p>
          </div>

          <div>
            <label className="label">Entreprise *</label>
            {loadingCompanies ? (
              <p className="text-sm text-gray-400">Chargement...</p>
            ) : (
              <select
                className="input"
                value={form.companyId}
                onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                required
              >
                <option value="">-- Sélectionner une entreprise --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} — {c.city || "Ville non renseignée"}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label">Type / Statut *</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date de début</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
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

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Observations, résultat du stage..."
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
              {submitting ? "Enregistrement..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

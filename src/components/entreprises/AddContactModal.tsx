"use client";

import { useState } from "react";
import { X, Save, Phone } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  companyId: string;
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const typeOptions = [
  { value: "APPEL", label: "Appel" },
  { value: "EMAIL", label: "Email" },
  { value: "VISITE", label: "Visite" },
  { value: "AUTRE", label: "Autre" },
];

const outcomeOptions = [
  { value: "POSITIF", label: "Positif" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "NEGATIF", label: "Négatif" },
];

export default function AddContactModal({ companyId, companyName, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "APPEL",
    outcome: "EN_ATTENTE",
    date: new Date().toISOString().split("T")[0],
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          date: form.date,
          type: form.type,
          outcome: form.outcome,
          comment: form.comment,
        }),
      });

      if (res.ok) {
        toast.success("Interaction enregistrée");
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary-500" />
            Nouvelle interaction
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

          <div>
            <label className="label">Type d'interaction</label>
            <div className="flex gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: opt.value })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.type === opt.value
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Résultat</label>
            <div className="flex gap-2">
              {outcomeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, outcome: opt.value })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.outcome === opt.value
                      ? opt.value === "POSITIF" ? "bg-green-600 text-white border-green-600"
                      : opt.value === "NEGATIF" ? "bg-red-600 text-white border-red-600"
                      : "bg-yellow-500 text-white border-yellow-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Commentaire</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Ex: Échange avec le directeur, intéressé par un profil ASH..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              <Save className="h-4 w-4 mr-2" />
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

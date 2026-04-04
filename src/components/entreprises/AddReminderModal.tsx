"use client";

import { useState } from "react";
import { X, Save, Bell } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  companyId: string;
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const typeOptions = [
  { value: "SUIVI", label: "Suivi" },
  { value: "ECHEANCE", label: "Échéance" },
  { value: "OPPORTUNITE", label: "Opportunité" },
];

export default function AddReminderModal({ companyId, companyName, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);

  // Date par défaut = demain
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [form, setForm] = useState({
    type: "SUIVI",
    date: tomorrow.toISOString().split("T")[0],
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) {
      toast.error("Choisissez une date");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/rappels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          date: form.date,
          type: form.type,
          comment: form.comment,
        }),
      });

      if (res.ok) {
        toast.success("Rappel créé");
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
            <Bell className="h-5 w-5 text-primary-500" />
            Nouveau rappel
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
            <label className="label">Type de rappel</label>
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
            <label className="label">Date du rappel *</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Commentaire</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Ex: Rappeler pour suivi PMSMP Dylan BARRE..."
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
              {submitting ? "Création..." : "Créer le rappel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

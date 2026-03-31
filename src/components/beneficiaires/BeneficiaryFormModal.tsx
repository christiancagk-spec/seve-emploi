"use client";

import { useState } from "react";
import { X, Save, Users } from "lucide-react";
import toast from "react-hot-toast";

interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  targetJob: string;
  phone: string;
  email: string;
  notes: string;
}

interface Props {
  beneficiary: Beneficiary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BeneficiaryFormModal({ beneficiary, onClose, onSuccess }: Props) {
  const isEditing = !!beneficiary;

  const [form, setForm] = useState({
    firstName: beneficiary?.firstName || "",
    lastName: beneficiary?.lastName || "",
    targetJob: beneficiary?.targetJob || "",
    phone: beneficiary?.phone || "",
    email: beneficiary?.email || "",
    notes: beneficiary?.notes || "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = isEditing ? `/api/beneficiaires/${beneficiary.id}` : "/api/beneficiaires";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(isEditing ? "B\u00e9n\u00e9ficiaire mis \u00e0 jour" : "B\u00e9n\u00e9ficiaire cr\u00e9\u00e9");
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur r\u00e9seau");
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
            {isEditing ? "Modifier le b\u00e9n\u00e9ficiaire" : "Nouveau b\u00e9n\u00e9ficiaire"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Pr\u00e9nom *</label>
              <input
                type="text"
                className="input"
                placeholder="Pr\u00e9nom"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Nom *</label>
              <input
                type="text"
                className="input"
                placeholder="Nom"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Poste recherch\u00e9</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Aide-soignante, Ma\u00e7on..."
              value={form.targetJob}
              onChange={(e) => setForm({ ...form, targetJob: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">T\u00e9l\u00e9phone</label>
              <input
                type="tel"
                className="input"
                placeholder="0692 XX XX XX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="email@exemple.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Notes sur le b\u00e9n\u00e9ficiaire..."
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
              {submitting ? "Enregistrement..." : isEditing ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

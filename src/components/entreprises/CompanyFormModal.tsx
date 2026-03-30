"use client";

import { useState } from "react";
import { X, Save, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { SECTORS } from "@/lib/sectors";

interface Company {
  id: string;
  companyName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  sector: string;
  contactStatus: string;
  notes: string;
}

interface Props {
  company: Company | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompanyFormModal({ company, onClose, onSuccess }: Props) {
  const isEditing = !!company;

  const [form, setForm] = useState({
    companyName: company?.companyName || "",
    address: company?.address || "",
    city: company?.city || "",
    phone: company?.phone || "",
    email: company?.email || "",
    sector: company?.sector || "",
    contactStatus: company?.contactStatus || "EN_ATTENTE",
    notes: company?.notes || "",
  });

  const [customSector, setCustomSector] = useState("");
  const [showCustomSector, setShowCustomSector] = useState(
    company?.sector ? !SECTORS.includes(company.sector as any) : false
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSectorChange = (value: string) => {
    if (value === "__custom__") {
      setShowCustomSector(true);
      setForm({ ...form, sector: "" });
    } else {
      setShowCustomSector(false);
      setForm({ ...form, sector: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const finalSector = showCustomSector ? customSector : form.sector;
    const payload = { ...form, sector: finalSector };

    try {
      const url = isEditing ? `/api/entreprises/${company.id}` : "/api/entreprises";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEditing ? "Entreprise mise à jour" : "Entreprise créée");
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-500" />
            {isEditing ? "Modifier l'entreprise" : "Nouvelle entreprise"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label">Nom de l'entreprise *</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Société Exemple"
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Adresse</label>
              <input
                type="text"
                className="input"
                placeholder="Adresse complète"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Ville</label>
              <input
                type="text"
                className="input"
                placeholder="Ville"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Téléphone</label>
              <input
                type="tel"
                className="input"
                placeholder="0262 XX XX XX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="contact@entreprise.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Secteur d'activité</label>
              <select
                className="input"
                value={showCustomSector ? "__custom__" : form.sector}
                onChange={(e) => handleSectorChange(e.target.value)}
              >
                <option value="">Sélectionner un secteur</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="__custom__">Autre secteur...</option>
              </select>
              {showCustomSector && (
                <input
                  type="text"
                  className="input mt-2"
                  placeholder="Secteur personnalisé"
                  value={customSector}
                  onChange={(e) => setCustomSector(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="label">Statut</label>
              <select
                className="input"
                value={form.contactStatus}
                onChange={(e) => setForm({ ...form, contactStatus: e.target.value })}
              >
                <option value="EN_ATTENTE">En attente</option>
                <option value="PMSMP">PMSMP</option>
                <option value="CONTRAT">Contrat</option>
                <option value="REFUS">Refus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Notes libres sur l'entreprise..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              <Save className="h-4 w-4 mr-2" />
              {submitting
                ? "Enregistrement..."
                : isEditing
                ? "Enregistrer"
                : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

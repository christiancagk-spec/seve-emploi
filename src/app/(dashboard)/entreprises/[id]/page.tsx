"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Pencil,
  Users,
  Calendar,
  Clock,
  FileText,
  User,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import CompanyFormModal from "@/components/entreprises/CompanyFormModal";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchCompany = async () => {
    try {
      const res = await fetch(`/api/entreprises/${params.id}`);
      if (!res.ok) {
        toast.error("Entreprise non trouvée");
        router.push("/entreprises");
        return;
      }
      const data = await res.json();
      setCompany(data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchCompany();
  }, [params.id]);

  const handleEditSuccess = () => {
    setIsFormOpen(false);
    fetchCompany();
  };

  const statusLabel: Record<string, string> = {
    EN_ATTENTE: "En attente",
    PMSMP: "PMSMP",
    CONTRAT: "Contrat",
    REFUS: "Refus",
  };

  const statusClass: Record<string, string> = {
    EN_ATTENTE: "badge badge-attente",
    PMSMP: "badge badge-pmsmp",
    CONTRAT: "badge badge-contrat",
    REFUS: "badge badge-refus",
  };

  const prospectionStatusLabel: Record<string, string> = {
    EN_COURS: "En cours",
    PMSMP: "PMSMP",
    CONTRAT: "Contrat",
    REFUS: "Refus",
    TERMINE: "Terminé",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/entreprises"
            className="mt-1 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{company.companyName}</h1>
              <span className={statusClass[company.contactStatus] || "badge"}>
                {statusLabel[company.contactStatus] || company.contactStatus}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              {company.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {company.city}
                </span>
              )}
              {company.sector && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" /> {company.sector}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-secondary"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Coordonnées</h3>
          <div className="space-y-2">
            {company.phone && (
              <p className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                {company.phone}
              </p>
            )}
            {company.email && (
              <p className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                {company.email}
              </p>
            )}
            {company.address && (
              <p className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400" />
                {company.address}
              </p>
            )}
            {!company.phone && !company.email && !company.address && (
              <p className="text-sm text-gray-400 italic">Aucune coordonnée renseignée</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Référent</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {company.supervisor?.firstName} {company.supervisor?.lastName}
              </p>
              <p className="text-xs text-gray-500">{company.supervisor?.email}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Statistiques</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-primary-600">{company.contacts?.length || 0}</p>
              <p className="text-xs text-gray-500">Interactions</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{company.prospections?.length || 0}</p>
              <p className="text-xs text-gray-500">Prospections</p>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-600">{company.reminders?.length || 0}</p>
              <p className="text-xs text-gray-500">Rappels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {company.notes && (
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{company.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospections / Salariés en transition */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-500" />
              Salariés en transition accueillis (stages / immersions)
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {company.prospections && company.prospections.length > 0 ? (
              company.prospections.map((p: any) => (
                <div key={p.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {p.beneficiary?.firstName} {p.beneficiary?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.beneficiary?.targetJob || "Poste non renseigné"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Depuis le {new Date(p.startDate).toLocaleDateString("fr-FR")}
                        {p.endDate && ` jusqu'au ${new Date(p.endDate).toLocaleDateString("fr-FR")}`}
                      </p>
                    </div>
                    <span className={statusClass[p.status] || "badge badge-attente"}>
                      {prospectionStatusLabel[p.status] || p.status}
                    </span>
                  </div>
                  {p.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">{p.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>Aucun salarié en transition accueilli pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Historique des interactions */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-500" />
              Historique des interactions
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {company.contacts && company.contacts.length > 0 ? (
              company.contacts.map((c: any) => (
                <div key={c.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.comment || "Pas de commentaire"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(c.date).toLocaleDateString("fr-FR")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.createdBy?.firstName} {c.createdBy?.lastName}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>Aucune interaction enregistrée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rappels */}
      {company.reminders && company.reminders.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-500" />
              Rappels
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {company.reminders.map((r: any) => (
              <div key={r.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.type}</p>
                    <p className="text-xs text-gray-500">{r.comment}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(r.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isFormOpen && (
        <CompanyFormModal
          company={company}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

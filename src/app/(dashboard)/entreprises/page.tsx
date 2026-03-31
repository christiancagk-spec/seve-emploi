"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Plus,
  Search,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { SECTORS } from "@/lib/sectors";
import CompanyFormModal from "@/components/entreprises/CompanyFormModal";

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
  updatedAt: string;
  supervisor: { id: string; firstName: string; lastName: string };
  _count: { contacts: number; prospections: number; reminders: number };
}

export default function EntreprisesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterSector) params.set("sector", filterSector);
      if (filterStatus) params.set("status", filterStatus);

      const res = await fetch(`/api/entreprises?${params}`);
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [search, filterSector, filterStatus]);

  useEffect(() => {
    const debounce = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [fetchCompanies]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer l'entreprise \"${name}\" ?`)) return;

    try {
      const res = await fetch(`/api/entreprises/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Entreprise supprimée");
        setCompanies((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCompany(null);
    fetchCompanies();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      EN_ATTENTE: "badge badge-attente",
      PMSMP: "badge badge-pmsmp",
      CONTRAT: "badge badge-contrat",
      REFUS: "badge badge-refus",
    };
    const labels: Record<string, string> = {
      EN_ATTENTE: "En attente",
      PMSMP: "PMSMP",
      CONTRAT: "Contrat",
      REFUS: "Refus",
    };
    return <span className={map[status] || "badge"}>{labels[status] || status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
          <p className="text-gray-500 text-sm mt-1">
            {companies.length} entreprise{companies.length > 1 ? "s" : ""} dans
            votre portefeuille
          </p>
        </div>
        <button
          onClick={() => { setEditingCompany(null); setIsFormOpen(true); }}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle entreprise
        </button>
      </div>

      {/* Filtres */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Rechercher une entreprise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-full sm:w-48"
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
          >
            <option value="">Tous les secteurs</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="input w-full sm:w-44"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="PMSMP">PMSMP</option>
            <option value="CONTRAT">Contrat</option>
            <option value="REFUS">Refus</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : companies.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Aucune entreprise
          </h3>
          <p className="text-gray-500 mb-4">
            Commencez par ajouter une entreprise à votre portefeuille.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter une entreprise
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Secteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div>
                          <Link href={`/entreprises/${company.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 hover:underline">
                            {company.companyName}
                          </Link>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {company.city || "Non renseigné"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {company.sector || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {company.phone || "Non renseigné"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {company._count.contacts} interaction{company._count.contacts > 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge(company.contactStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/entreprises/${company.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50"
                          title="Voir la fiche"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => { setEditingCompany(company); setIsFormOpen(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id, company.companyName)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="md:hidden divide-y divide-gray-100">
            {companies.map((company) => (
              <div key={company.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/entreprises/${company.id}`} className="font-medium text-gray-900 hover:text-primary-600 hover:underline">{company.companyName}</Link>
                    <p className="text-sm text-gray-500 mt-0.5">{company.city} &middot; {company.sector}</p>
                    {company.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="h-3.5 w-3.5" /> {company.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {statusBadge(company.contactStatus)}
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingCompany(company); setIsFormOpen(true); }}
                        className="p-1.5 rounded text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id, company.companyName)}
                        className="p-1.5 rounded text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal formulaire */}
      {isFormOpen && (
        <CompanyFormModal
          company={editingCompany}
          onClose={() => { setIsFormOpen(false); setEditingCompany(null); }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

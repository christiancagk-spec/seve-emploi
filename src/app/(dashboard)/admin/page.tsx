"use client";

import { useSession } from "next-auth/react";
import { Shield, Users, Settings } from "lucide-react";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary-500" />
          Administration
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestion des utilisateurs et des paramètres
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900">Utilisateurs</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Gérez les comptes utilisateurs, attribuez les rôles et
            activez/désactivez les accès.
          </p>
          <button className="btn-primary">
            Gérer les utilisateurs
          </button>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900">Paramètres</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Configurez les listes de secteurs, les statuts et les
            paramètres généraux de l'application.
          </p>
          <button className="btn-secondary">
            Configurer
          </button>
        </div>
      </div>
    </div>
  );
}

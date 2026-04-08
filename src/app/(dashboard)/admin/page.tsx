"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Shield, Users, Plus, X, Save, Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "REFERENT" | "LECTEUR";
  active: boolean;
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  REFERENT: "bg-blue-100 text-blue-700",
  LECTEUR: "bg-gray-100 text-gray-700",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      toast.error("Erreur chargement utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: UserData) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, active: !user.active }),
      });
      if (res.ok) {
        toast.success(user.active ? "Utilisateur désactivé" : "Utilisateur activé");
        fetchUsers();
      }
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-500" />
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.length} utilisateur{users.length > 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400">Chargement...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Nom</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rôle</th>
                <th className="px-6 py-3">Actif</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ROLE_STYLES[u.role] || "bg-gray-100"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${u.active ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${u.active ? "left-5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setEditingUser(u); setShowModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UserFormModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}

function UserFormModal({ user, onClose, onSuccess }: {
  user: UserData | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEditing = !!user;
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    role: user?.role || "REFERENT",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: any = { ...form };
      if (isEditing) {
        body.id = user.id;
        if (!body.password) delete body.password;
      }

      const res = await fetch("/api/users", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(isEditing ? "Utilisateur mis à jour" : "Utilisateur créé");
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
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-500" />
            {isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom *</label>
              <input type="text" className="input" required
                value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="label">Nom *</label>
              <input type="text" className="input" required
                value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div>
            <label className="label">Rôle</label>
            <select className="input" value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
              <option value="ADMIN">Admin</option>
              <option value="REFERENT">Référent</option>
              <option value="LECTEUR">Lecteur</option>
            </select>
          </div>

          <div>
            <label className="label">{isEditing ? "Nouveau mot de passe (laisser vide pour garder)" : "Mot de passe *"}</label>
            <input type="password" className="input" required={!isEditing} minLength={6}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={isEditing ? "Inchangé" : ""} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              <Save className="h-4 w-4 mr-2" />
              {submitting ? "..." : isEditing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

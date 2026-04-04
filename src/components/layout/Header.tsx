"use client";

import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 lg:px-6">
      {/* Bouton menu mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-3"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1" />
    </header>
  );
}

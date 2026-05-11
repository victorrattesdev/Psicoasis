"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/cursos", label: "Cursos" },
  { href: "/psicologos", label: "Terapia Online" },
  { href: "/avaliacao-neuropsicologica", label: "Avaliação Neuropsicológica" },
  { href: "/blog", label: "Artigos" },
];


export default function SiteHeader() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { user, logout } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "#") return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.type === "profissional"
        ? "/dashboard/profissional"
        : user?.type === "paciente"
          ? "/dashboard/paciente"
          : undefined;

  useEffect(() => {
    const loadPhoto = async () => {
      if (!user?.id) {
        setPhotoUrl(null);
        return;
      }
      try {
        if (user.role === "ADMIN" || user.type === "paciente") {
          const token = localStorage.getItem("psicoasis_token");
          const res = await fetch(`/api/admin/users/${user.id}`, {
            cache: "no-store",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) return;
          const data = await res.json();
          setPhotoUrl(data?.profile?.photoUrl ?? null);
          return;
        }
        if (user.type === "profissional") {
          const res = await fetch(`/api/therapists/${user.id}`, { cache: "no-store" });
          if (!res.ok) return;
          const data = await res.json();
          setPhotoUrl(data?.photoUrl ?? null);
        }
      } catch {}
    };
    loadPhoto();
  }, [user?.id, user?.role, user?.type]);

  return (
    <nav className="bg-gray-900 shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-nowrap items-center justify-between gap-2 h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-[20px] font-bold text-[#b8860b] -ml-2">
              <Image
                src="https://image2url.com/r2/default/images/1769521007685-2ccd6641-4a16-4883-b3d6-9506f656ff3b.jpeg"
                alt="Logo OASIS da Superdotação"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
                priority
              />
              <span>OASIS da Superdotação</span>
            </Link>
          </div>
          <div className="hidden md:flex flex-1 min-w-0">
            <div className="flex items-baseline gap-3 whitespace-nowrap">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-2 py-1 rounded-md text-[14px] font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-white"
                      : "text-white hover:text-white/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 whitespace-nowrap" suppressHydrationWarning>
            {user ? (
              <div className="flex items-center gap-3">
                {dashboardHref && (
                  <Link
                    href={dashboardHref}
                    className="text-white hover:text-white/80 px-2 py-1 rounded-md text-[14px] font-medium transition-colors"
                  >
                    Painel
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                  )}
                  <span className="text-[14px] text-white/80 leading-5">Olá, {user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.replace("/");
                  }}
                  className="text-white/80 hover:text-white text-[14px] leading-5"
                >
                  Sair
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#b8860b] hover:text-[#9c6f0a] px-2 py-1 rounded-md text-[14px] font-bold transition-colors border border-[#b8860b]"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  className="bg-[#b8860b] hover:bg-[#9c6f0a] text-black px-3 py-1 rounded-md text-[14px] font-bold transition-colors border border-[#b8860b]"
                >
                  Registrar
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-white hover:text-white/80"
              aria-label="Abrir menu"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700 px-4 py-3 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 text-[14px] font-medium transition-colors border-l-2 ${
                isActive(link.href)
                  ? "text-white border-[#b8860b]"
                  : "text-white/70 border-transparent hover:text-white hover:border-white/30"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-700 pt-3 mt-1 flex flex-col gap-2">
            {user ? (
              <>
                {dashboardHref && (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Painel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    router.replace("/");
                  }}
                  className="text-left px-3 py-2 rounded-md text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-[14px] font-bold text-[#b8860b] border border-[#b8860b] text-center"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-[14px] font-bold bg-[#b8860b] text-black text-center"
                >
                  Registrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

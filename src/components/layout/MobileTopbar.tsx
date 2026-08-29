"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/viagens", label: "Minhas Viagens" },
  { href: "/pessoas", label: "Pessoas" },
  { href: "/mapa", label: "Mapa" },
  { href: "/sugestoes", label: "Sugestões" },
];

export function MobileTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  if (pathname === "/login") return null;

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between border-b px-4 py-3 md:hidden">
      <p className="text-sm font-semibold tracking-tight">Viajando pelo Mundo</p>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAberto(false)}
          />
          <nav className="relative ml-auto flex h-full w-64 flex-col bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between pb-4">
              <p className="text-sm font-semibold">Menu</p>
              <button type="button" onClick={() => setAberto(false)} aria-label="Fechar menu">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-0.5">
              {LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setAberto(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <button
              type="button"
              onClick={sair}
              className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppearanceMenu } from "@/components/layout/AppearanceMenu";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/viagens", label: "Minhas Viagens" },
  { href: "/pessoas", label: "Pessoas" },
  { href: "/mapa", label: "Mapa" },
  { href: "/sugestoes", label: "Sugestões" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-muted/30 md:min-h-screen">
      <div className="px-6 py-5">
        <p className="text-sm font-semibold tracking-tight">Viajando pelo Mundo</p>
        <p className="text-xs text-muted-foreground">Seu diário de viagens</p>
      </div>
      <div className="px-3 pb-3">
        <AppearanceMenu />
      </div>
      <nav className="flex flex-col gap-0.5 px-3">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
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
      </nav>
      <div className="mt-auto px-3 pb-4">
        <button
          type="button"
          onClick={sair}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}

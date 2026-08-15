"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Moon, Sun, SunMoon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPCOES = [
  { valor: "light", label: "Claro", Icon: Sun },
  { valor: "dark", label: "Escuro", Icon: Moon },
  { valor: "system", label: "Sistema", Icon: SunMoon },
] as const;

export function AppearanceMenu() {
  const { theme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

  // Antes de montar no navegador, o servidor não sabe qual tema está salvo
  // (localStorage só existe no cliente) — usar sempre a opção "Sistema" aqui
  // evita que o ícone mude entre o HTML do servidor e o primeiro render no
  // cliente (erro de hidratação).
  const atual = montado
    ? OPCOES.find((o) => o.valor === theme) ?? OPCOES[2]
    : OPCOES[2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <atual.Icon className="size-4" />
        {montado ? `Aparência: ${atual.label}` : "Aparência"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {OPCOES.map((o) => (
          <DropdownMenuItem
            key={o.valor}
            onClick={() => setTheme(o.valor)}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              <o.Icon className="size-4" />
              {o.label}
            </span>
            {montado && theme === o.valor && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

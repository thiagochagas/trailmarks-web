import { NextRequest, NextResponse } from "next/server";
import { atualizarInteresses } from "@/lib/storage/perfil";
import { interessesSchema } from "@/lib/validation/perfil";
import type { InteresseViagem } from "@/lib/domain/types";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const parseResult = interessesSchema.safeParse(body.interesses);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Lista de interesses inválida." }, { status: 400 });
  }
  const perfil = await atualizarInteresses(parseResult.data as InteresseViagem[]);
  return NextResponse.json({ ok: true, interesses: perfil.interesses });
}

import { NextRequest, NextResponse } from "next/server";
import { excluirPessoa } from "@/lib/storage/pessoas";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const excluida = await excluirPessoa(id);
  if (!excluida) {
    return NextResponse.json({ error: "Pessoa não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

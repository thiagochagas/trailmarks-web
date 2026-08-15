import { NextRequest, NextResponse } from "next/server";
import { atualizarViagem, excluirViagem } from "@/lib/storage/viagens";
import { viagemInputSchema } from "@/lib/validation/viagem";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parseResult = viagemInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Dados da viagem inválidos.",
        detail: parseResult.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      },
      { status: 400 }
    );
  }

  const viagem = await atualizarViagem(id, parseResult.data);
  if (!viagem) {
    return NextResponse.json({ error: "Viagem não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const excluida = await excluirViagem(id);
  if (!excluida) {
    return NextResponse.json({ error: "Viagem não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

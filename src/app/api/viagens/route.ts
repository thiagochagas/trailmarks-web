import { NextRequest, NextResponse } from "next/server";
import { criarViagem } from "@/lib/storage/viagens";
import { viagemInputSchema } from "@/lib/validation/viagem";

export async function POST(req: NextRequest) {
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

  const viagem = await criarViagem(parseResult.data);
  return NextResponse.json({ ok: true, id: viagem.id });
}

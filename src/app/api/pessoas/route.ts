import { NextRequest, NextResponse } from "next/server";
import { criarPessoa } from "@/lib/storage/pessoas";
import { pessoaInputSchema } from "@/lib/validation/pessoa";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parseResult = pessoaInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Nome inválido.",
        detail: parseResult.error.issues.map((i) => i.message).join("; "),
      },
      { status: 400 }
    );
  }

  try {
    const pessoa = await criarPessoa(parseResult.data.nome);
    return NextResponse.json({ ok: true, pessoa });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao criar pessoa." },
      { status: 400 }
    );
  }
}

"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";

const BUCKET_FOTOS = "fotos-viagens";
const TAMANHO_MAXIMO = 8 * 1024 * 1024; // 8 MB

interface FotoUploadProps {
  urlInicial: string | null;
  onChange: (path: string | null) => void;
}

export function FotoUpload({ urlInicial, onChange }: FotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(urlInicial);
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function selecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      toast.error("A imagem precisa ter até 8 MB.");
      return;
    }

    setEnviando(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const extensao = arquivo.name.split(".").pop() || "jpg";
      const caminho = `${user.id}/${crypto.randomUUID()}.${extensao}`;

      const { error } = await supabase.storage.from(BUCKET_FOTOS).upload(caminho, arquivo);
      if (error) {
        toast.error(`Falha ao enviar foto: ${error.message}`);
        return;
      }

      setPreviewUrl(URL.createObjectURL(arquivo));
      onChange(caminho);
    } finally {
      setEnviando(false);
    }
  }

  function remover() {
    setPreviewUrl(null);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada/temporária, sem benefício de otimização */}
          <img
            src={previewUrl}
            alt="Foto da viagem"
            className="h-40 w-auto rounded-lg border border-border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute -right-2 -top-2"
            onClick={remover}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
        >
          <ImagePlus className="size-4" />
          {enviando ? "Enviando..." : "Adicionar foto"}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={selecionarArquivo}
      />
    </div>
  );
}

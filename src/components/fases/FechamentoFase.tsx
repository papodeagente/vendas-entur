"use client";

import { useState } from "react";
import { dinheiroNaMesa } from "@/lib/calculo";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";

interface Props {
  sessao: SessaoAoVivo;
  onRefresh: () => void;
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

type CTA = "demo" | "proposta" | "piloto";

const CTAS: { key: CTA; titulo: string; descricao: string; script: string }[] = [
  {
    key: "demo",
    titulo: "Agendar demo técnica",
    descricao: "Cliente pediu para ver a ferramenta funcionando antes de decidir",
    script: `"Combinado. Vou te mandar 3 horários pra uma demo de 45 min. Quem mais do seu time precisa ver? O ideal é trazer quem vai usar no dia-a-dia."`,
  },
  {
    key: "proposta",
    titulo: "Enviar proposta comercial",
    descricao: "Cliente está pronto, quer ver preço e condições",
    script: `"Perfeito. Vou montar uma proposta com o escopo do que a gente discutiu hoje. Te mando até amanhã com 2 caminhos de investimento. Quem mais vai avaliar com você?"`,
  },
  {
    key: "piloto",
    titulo: "Piloto em 1 alavanca",
    descricao: "Cliente hesitante — começa focado (ex: só Recuperação)",
    script: `"Que tal a gente começar com uma alavanca só? Rodamos 60 dias focados em Recuperação. Se entregar o retorno que mostrei aqui, a gente expande. Se não, não paga o resto."`,
  },
];

export function FechamentoFase({ sessao, onRefresh }: Props) {
  const respostasMap: Record<number, boolean> = {};
  sessao.respostas.forEach((r) => (respostasMap[r.perguntaId] = r.resposta));
  const r = sessao.dados ? dinheiroNaMesa(respostasMap, sessao.dados) : null;

  const [ctaSelecionado, setCtaSelecionado] = useState<CTA | null>(null);
  const [email, setEmail] = useState(sessao.prospect?.email || "");
  const [whatsapp, setWhatsapp] = useState(sessao.prospect?.whatsapp || "");
  const [salvando, setSalvando] = useState(false);

  async function salvarContato() {
    setSalvando(true);
    await fetch(`/api/sessoes/${sessao.id}/prospect`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: sessao.prospect?.nome || "",
        cargo: sessao.prospect?.cargo,
        tamanhoEquipe: sessao.prospect?.tamanhoEquipe,
        email,
        whatsapp,
      }),
    });
    setSalvando(false);
    onRefresh();
  }

  const problemasQtd = Object.values(respostasMap).filter((v) => v === false).length;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Pergunta-gatilho */}
      <div className="p-5 rounded-xl bg-indigo-900/20 border border-indigo-800/40">
        <p className="text-[10px] uppercase tracking-wider text-indigo-400 mb-2">
          Comprometimento progressivo — pergunte e CALE
        </p>
        <p className="text-lg text-slate-100 italic leading-relaxed font-medium">
          &ldquo;{sessao.prospect?.nome || "Me diz"}, faz sentido tudo que a gente conversou?
          Qual seria o próximo passo natural pra você?&rdquo;
        </p>
        <p className="text-[11px] text-indigo-300/70 mt-3 italic">
          Silêncio é bom. A primeira pessoa que fala depois dessa pergunta, perde. Deixe ele dizer primeiro.
        </p>
      </div>

      {/* Resumo da sessão */}
      {r && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">
            Resumo da sessão
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] text-slate-500">Dores identificadas</p>
              <p className="text-2xl font-bold text-red-400">{problemasQtd}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Dinheiro na Mesa / mês</p>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                {brl(r.totalMes)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Em 12 meses</p>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                {brl(r.totalAno)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Escolha de CTA */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">
          Leitura do sinal dele — qual caminho escolher
        </p>
        <div className="grid grid-cols-3 gap-3">
          {CTAS.map((c) => (
            <button
              key={c.key}
              onClick={() => setCtaSelecionado(c.key)}
              className={`text-left p-4 rounded-xl border transition-all ${
                ctaSelecionado === c.key
                  ? "bg-indigo-600/20 border-indigo-500"
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
              }`}
            >
              <p className="font-semibold text-slate-100 mb-1">{c.titulo}</p>
              <p className="text-xs text-slate-400">{c.descricao}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Script do CTA selecionado */}
      {ctaSelecionado && (
        <div className="p-4 rounded-xl bg-indigo-900/20 border border-indigo-800/40">
          <p className="text-[10px] uppercase tracking-wider text-indigo-400 mb-2">
            Frase de fechamento — use literal
          </p>
          <p className="text-slate-100 italic leading-relaxed">
            {CTAS.find((c) => c.key === ctaSelecionado)!.script}
          </p>
        </div>
      )}

      {/* Captura de contato */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        <h3 className="font-semibold">Contato para continuar</h3>
        <p className="text-xs text-slate-500">
          Só peça depois que ele disser "sim, próximo passo". Antes, não.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp"
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={salvarContato}
          disabled={salvando || !email}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm disabled:opacity-40"
        >
          {salvando ? "Salvando..." : "Registrar contato"}
        </button>
      </div>

      {/* Próximos passos para o vendedor */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Checklist pós-reunião (faça hoje)
        </p>
        <ul className="text-sm text-slate-300 space-y-1.5">
          <li>☐ Enviar WhatsApp de agradecimento em 1 hora</li>
          <li>☐ Agendar próximo passo ({ctaSelecionado ? CTAS.find((c) => c.key === ctaSelecionado)!.titulo.toLowerCase() : "definir"}) em 24h</li>
          <li>☐ Registrar a sessão no CRM com as frases capturadas</li>
          <li>☐ Enviar PDF de resumo por e-mail até o fim do dia</li>
        </ul>
      </div>
    </div>
  );
}

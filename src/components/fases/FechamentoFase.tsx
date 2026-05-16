"use client";

import { useState } from "react";
import { dinheiroNaMesa, TAXAS_REFERENCIA } from "@/lib/calculo";
import { PERGUNTAS, type Alavanca } from "@/lib/perguntas";
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
type ComercialStatus =
  | "nova"
  | "diagnostico"
  | "demo"
  | "proposta"
  | "piloto"
  | "negociacao"
  | "ganho"
  | "perdido";

const CTAS: { key: CTA; titulo: string; descricao: string; script: string }[] = [
  {
    key: "demo",
    titulo: "Agendar demo técnica",
    descricao: "Cliente quer ver a ferramenta funcionando",
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
    descricao: "Cliente hesitante — começar focado (ex: só Recuperação)",
    script: `"Que tal a gente começar com uma alavanca só? Rodamos 60 dias focados na que mais doer pra você. Se entregar o retorno que mostrei aqui, a gente expande. Se não, não paga o resto."`,
  },
];

const ANTI_OBJECOES: { obj: string; resp: (vars: Record<string, string>) => string }[] =
  [
    {
      obj: "É caro",
      resp: (v) =>
        `O sistema custa ${v.precoCrm}/mês. Você perde ${v.perDay}/dia. Em ${v.diasPayback} dias o sistema se paga. O resto é lucro.`,
    },
    {
      obj: "Já tentei CRM",
      resp: () =>
        `CRM genérico não tem as automações de turismo. Ele não sabe que 6 meses antes do aniversário é o momento de vender. Não tem gatilho de reativação por tempo sem compra. Não dispara pedido de indicação no pós-viagem.`,
    },
    {
      obj: "Minha equipe não vai usar",
      resp: () =>
        `O sistema faz a ação pela equipe. Não depende do vendedor lembrar. A automação dispara sozinha — vendedor só recebe o lead pronto pra conversar.`,
    },
    {
      obj: "Preciso pensar",
      resp: (v) =>
        `Entendo. Só um dado: a cada dia sem processo, são ${v.perDay} que passam pela sua mão. Em 30 dias de "pensar", são ${v.por30Dias}. Esse é o custo de esperar.`,
    },
  ];

export function FechamentoFase({ sessao, onRefresh }: Props) {
  const respostasMap: Record<number, boolean> = {};
  sessao.respostas.forEach((r) => (respostasMap[r.perguntaId] = r.resposta));
  const r = sessao.dados ? dinheiroNaMesa(respostasMap, sessao.dados) : null;

  const [ctaSelecionado, setCtaSelecionado] = useState<CTA | null>(
    (sessao.ctaEscolhido as CTA | null) || null
  );
  const [comercialStatus, setComercialStatus] = useState<ComercialStatus>(
    (sessao.comercialStatus as ComercialStatus) || "nova"
  );
  const [precoCrm, setPrecoCrm] = useState(
    sessao.precoCrmMes || TAXAS_REFERENCIA.precoCrmDefault
  );
  const [email, setEmail] = useState(sessao.prospect?.email || "");
  const [whatsapp, setWhatsapp] = useState(sessao.prospect?.whatsapp || "");
  const [salvando, setSalvando] = useState(false);
  const [salvandoDesfecho, setSalvandoDesfecho] = useState(false);
  const [followUpEm, setFollowUpEm] = useState(
    sessao.followUpEm ? sessao.followUpEm.slice(0, 16) : ""
  );
  const [observacaoFechamento, setObservacaoFechamento] = useState(
    sessao.observacaoFechamento || ""
  );
  const [objAberta, setObjAberta] = useState<string | null>(null);

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

  async function salvarDesfecho() {
    setSalvandoDesfecho(true);
    await fetch(`/api/sessoes/${sessao.id}/comercial`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comercialStatus,
        ctaEscolhido: ctaSelecionado,
        precoCrmMes: precoCrm,
        valorMesaMes: recomputado?.totalMes || null,
        valorMesaAno: recomputado?.totalAno || null,
        followUpEm: followUpEm ? new Date(followUpEm).toISOString() : null,
        observacaoFechamento,
      }),
    });
    setSalvandoDesfecho(false);
    onRefresh();
  }

  // Resumo das alavancas com problema confirmado
  function temDor(al: Alavanca): boolean {
    return PERGUNTAS.filter((p) => p.bloco === al).some(
      (p) => respostasMap[p.id] === false
    );
  }

  // Frases capturadas no Need-Payoff (palavras dele descrevendo a solução)
  const frasesPayoff = sessao.frases.filter((f) => f.fase === "needPayoff");
  const frasesOuro = sessao.frases.filter((f) => f.fase === "situacao");

  // Recomputa com preço editável
  const recomputado = sessao.dados
    ? dinheiroNaMesa(respostasMap, sessao.dados, { precoCrmMes: precoCrm })
    : r;

  const vendasMesesPayback =
    recomputado && r && sessao.dados
      ? Math.ceil(
          precoCrm /
            (sessao.dados.ticketMedio * (sessao.dados.comissaoPct / 100))
        )
      : 0;

  const objVars = recomputado && r
    ? {
        precoCrm: brl(precoCrm),
        perDay: brl(recomputado.perDay),
        por30Dias: brl(recomputado.totalMes),
        diasPayback: String(
          Math.ceil(precoCrm / (recomputado.perDay || 1))
        ),
      }
    : { precoCrm: "", perDay: "", por30Dias: "", diasPayback: "" };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Pergunta-gatilho */}
      <div className="p-5 rounded-xl bg-indigo-900/20 border border-indigo-800/40">
        <p className="text-[10px] uppercase tracking-wider text-indigo-400 mb-2">
          Pergunta-gatilho — pergunte e CALE
        </p>
        <p className="text-lg text-slate-100 italic leading-relaxed font-medium">
          &ldquo;{sessao.prospect?.nome || "Me diz"}, faz sentido tudo que a
          gente conversou? Qual seria o próximo passo natural pra você?&rdquo;
        </p>
        <p className="text-[11px] text-indigo-300/70 mt-3 italic">
          Silêncio é bom. A primeira pessoa que fala depois dessa pergunta,
          perde. Deixe ele dizer primeiro.
        </p>
      </div>

      {/* Resumo da sessão usando palavras dele */}
      {r && sessao.dados && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Resumo — leia usando os números E as frases dele
          </p>

          <div className="space-y-2 text-sm">
            <p className="text-slate-100 font-medium mb-2">
              {sessao.prospect?.nome || "Vamos lá"}, a gente viu hoje que:
            </p>

            {temDor("recuperacao") && (
              <div className="flex items-baseline gap-2 pl-3 border-l-2 border-red-500">
                <span className="text-red-300">🎯</span>
                <p className="text-slate-300">
                  Você perde {sessao.dados.atendPerdidos} atendimentos/mês sem
                  follow-up →{" "}
                  <span className="text-red-300 font-bold">
                    {brl(r.recuperacao)}/mês
                  </span>{" "}
                  na mesa
                </p>
              </div>
            )}
            {temDor("recorrencia") && (
              <div className="flex items-baseline gap-2 pl-3 border-l-2 border-amber-500">
                <span className="text-amber-300">🔄</span>
                <p className="text-slate-300">
                  Tem {sessao.dados.clientesInativos} clientes inativos sem
                  reativação →{" "}
                  <span className="text-amber-300 font-bold">
                    {brl(r.recorrencia)}/mês
                  </span>{" "}
                  na mesa
                </p>
              </div>
            )}
            {temDor("indicacao") && (
              <div className="flex items-baseline gap-2 pl-3 border-l-2 border-emerald-500">
                <span className="text-emerald-300">🌱</span>
                <p className="text-slate-300">
                  Não tem programa de indicação ativo →{" "}
                  <span className="text-emerald-300 font-bold">
                    {brl(r.indicacao)}/mês
                  </span>{" "}
                  na mesa
                </p>
              </div>
            )}

            {/* Frases dele */}
            {(frasesOuro.length > 0 || frasesPayoff.length > 0) && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-amber-400 mb-2">
                  Você mesmo me disse:
                </p>
                {[...frasesOuro.slice(0, 2), ...frasesPayoff.slice(0, 2)].map(
                  (f) => (
                    <p
                      key={f.id}
                      className="text-xs text-amber-200 italic pl-3 border-l-2 border-amber-500/50"
                    >
                      &ldquo;{f.texto.replace(/^\[\w+\]\s*/, "")}&rdquo;
                    </p>
                  )
                )}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="text-slate-100">
                O total que está passando pela sua mão:{" "}
                <span className="text-2xl font-bold text-emerald-300 tabular-nums">
                  {brl(r.totalMes)}
                </span>
                /mês →{" "}
                <span className="font-bold text-emerald-300">
                  {brl(r.totalAno)}
                </span>
                /ano
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ancoragem de preço */}
      {recomputado && sessao.dados && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-700/40">
          <p className="text-[10px] uppercase tracking-wider text-indigo-300 mb-3">
            Ancoragem de preço — leia em voz alta
          </p>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-xs text-slate-400">Preço Entur OS/mês:</label>
            <input
              type="number"
              value={precoCrm}
              onChange={(e) => setPrecoCrm(Number(e.target.value) || 0)}
              className="w-28 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-slate-500">
              (default {brl(TAXAS_REFERENCIA.precoCrmDefault)})
            </span>
          </div>

          <p className="text-slate-100 leading-relaxed mb-3">
            &ldquo;O investimento no Entur OS é de{" "}
            <span className="font-bold text-indigo-300">
              {brl(precoCrm)}/mês
            </span>
            . Ou seja, se ele recuperar{" "}
            <span className="font-bold text-emerald-300">
              UMA ÚNICA venda
            </span>{" "}
            das {sessao.dados.atendPerdidos} perdidas, já pagou{" "}
            <span className="font-bold text-emerald-300">
              {vendasMesesPayback} {vendasMesesPayback === 1 ? "mês" : "meses"}
            </span>{" "}
            de sistema.&rdquo;
          </p>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-indigo-700/30">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase">ROI mensal</p>
              <p className="text-lg font-bold text-emerald-300">
                {recomputado.roiMensal.toFixed(1)}x
              </p>
              <p className="text-[10px] text-slate-500">
                R$ 1 → R$ {recomputado.roiMensal.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase">Payback</p>
              <p className="text-lg font-bold text-emerald-300">
                {recomputado.payback.meses === 0
                  ? "—"
                  : `${recomputado.payback.meses} ${
                      recomputado.payback.meses === 1 ? "mês" : "meses"
                    }`}
              </p>
              <p className="text-[10px] text-slate-500">
                {recomputado.payback.vendasNecessarias} venda
                {recomputado.payback.vendasNecessarias === 1 ? "" : "s"} pagam
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase">
                Não é custo, é ferramenta
              </p>
              <p className="text-xs text-slate-200 italic mt-1">
                que pega o que já é seu
              </p>
            </div>
          </div>

          <p className="text-[11px] text-indigo-200/70 mt-3 pt-3 border-t border-indigo-700/30 italic">
            &ldquo;Na prática, o CRM não é um custo. É a ferramenta que pega o
            dinheiro que JÁ É SEU e que está na mesa.&rdquo;
          </p>
        </div>
      )}

      {/* CTA */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">
          Leitura do sinal dele — qual caminho escolher
        </p>
        <div className="grid grid-cols-3 gap-3">
          {CTAS.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                setCtaSelecionado(c.key);
                setComercialStatus(c.key);
              }}
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

      {/* Desfecho comercial */}
      <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-purple-300 mb-1">
            Registro comercial — obrigatório para gestão
          </p>
          <p className="text-xs text-slate-500">
            Salve o próximo passo real da conversa. Isso alimenta o dashboard do gestor.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Status comercial
            </label>
            <select
              value={comercialStatus}
              onChange={(e) => setComercialStatus(e.target.value as ComercialStatus)}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            >
              <option value="nova">Nova</option>
              <option value="diagnostico">Diagnóstico feito</option>
              <option value="demo">Demo marcada</option>
              <option value="proposta">Proposta solicitada</option>
              <option value="piloto">Piloto sugerido</option>
              <option value="negociacao">Negociação</option>
              <option value="ganho">Fechado ganho</option>
              <option value="perdido">Fechado perdido</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Follow-up
            </label>
            <input
              type="datetime-local"
              value={followUpEm}
              onChange={(e) => setFollowUpEm(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              Valor na mesa salvo
            </label>
            <div className="px-3 py-2 rounded bg-slate-950/70 border border-slate-800 text-sm text-emerald-300 font-semibold">
              {brl(recomputado?.totalMes || 0)}/mês
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">
            Observação de fechamento
          </label>
          <textarea
            value={observacaoFechamento}
            onChange={(e) => setObservacaoFechamento(e.target.value)}
            rows={3}
            placeholder="Ex: quer envolver sócio financeiro; pediu proposta até amanhã; objeção principal foi implementação do time."
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          onClick={salvarDesfecho}
          disabled={salvandoDesfecho || !ctaSelecionado}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-sm font-semibold disabled:opacity-40"
        >
          {salvandoDesfecho ? "Salvando..." : "Salvar desfecho comercial"}
        </button>
      </div>

      {/* Anti-objeções */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <p className="text-[10px] uppercase tracking-wider text-orange-400 mb-3">
          Anti-objeções — clique se ele soltar uma dessas
        </p>
        <div className="space-y-2">
          {ANTI_OBJECOES.map((o) => (
            <div key={o.obj}>
              <button
                onClick={() => setObjAberta(objAberta === o.obj ? null : o.obj)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                  objAberta === o.obj
                    ? "bg-orange-900/30 border border-orange-700/40 text-orange-200"
                    : "bg-slate-800/50 hover:bg-slate-800 text-slate-300"
                }`}
              >
                {objAberta === o.obj ? "▼" : "▶"} &ldquo;{o.obj}&rdquo;
              </button>
              {objAberta === o.obj && (
                <p className="mt-1 px-3 py-2 text-sm text-slate-100 italic leading-relaxed bg-orange-900/10 border-l-2 border-orange-500/50 rounded">
                  &ldquo;{o.resp(objVars)}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Captura de contato */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        <h3 className="font-semibold">Contato para continuar</h3>
        <p className="text-xs text-slate-500">
          Só peça depois que ele disser &ldquo;sim, próximo passo&rdquo;. Antes,
          não.
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

      {/* Checklist pós-reunião */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Checklist pós-reunião (faça hoje)
        </p>
        <ul className="text-sm text-slate-300 space-y-1.5">
          <li>☐ Enviar WhatsApp de agradecimento em 1 hora</li>
          <li>
            ☐ Agendar próximo passo (
            {ctaSelecionado
              ? CTAS.find((c) => c.key === ctaSelecionado)!.titulo.toLowerCase()
              : "definir"}
            ) em 24h
          </li>
          <li>☐ Registrar a sessão no CRM com as frases capturadas</li>
          <li>☐ Enviar PDF de resumo por e-mail até o fim do dia</li>
        </ul>
      </div>
    </div>
  );
}

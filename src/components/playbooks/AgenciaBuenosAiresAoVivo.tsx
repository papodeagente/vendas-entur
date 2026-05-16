"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import type { SessaoAoVivo } from "@/app/sessao/[id]/ao-vivo/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnturLogo } from "@/components/EnturLogo";
import {
  AGENCIA_FASES,
  AGENCIA_FASES_MAP,
  AgenciaFaseKey,
  frasesAltoNivelAgencia,
  microCompromissosAgencia,
  perdasMontarSozinho,
  perguntasImplicacaoAgencia,
  perguntasNeedPayoffAgencia,
  perguntasProblemaAgencia,
  perguntasSituacaoAgencia,
  perguntasWhatsApp,
  pilaresCuradoria,
  roteiroPropostaAgencia,
} from "@/lib/playbooks/agenciaBuenosAires";
import {
  Check,
  ChevronRight,
  Clock3,
  MessageCircle,
  Plane,
  Sparkles,
} from "lucide-react";

interface Props {
  sessao: SessaoAoVivo;
  onRefresh: () => void;
}

function primeiraFasePendente(sessao: SessaoAoVivo): AgenciaFaseKey {
  const progresso = new Map(sessao.progresso.map((p) => [p.fase, p]));
  return (
    AGENCIA_FASES.find((fase) => !progresso.get(fase.key)?.concluidaEm)?.key ??
    "fechamento"
  );
}

export function AgenciaBuenosAiresAoVivo({ sessao, onRefresh }: Props) {
  const [faseAtiva, setFaseAtiva] = useState<AgenciaFaseKey>(() =>
    primeiraFasePendente(sessao)
  );
  const [nome, setNome] = useState(sessao.prospect?.nome || "");
  const [whatsapp, setWhatsapp] = useState(sessao.prospect?.whatsapp || "");
  const [email, setEmail] = useState(sessao.prospect?.email || "");
  const [salvandoProspect, setSalvandoProspect] = useState(false);

  const progressoMap = useMemo(() => {
    const map: Record<string, { iniciada: boolean; concluida: boolean }> = {};
    sessao.progresso.forEach((p) => {
      map[p.fase] = {
        iniciada: !!p.iniciadaEm,
        concluida: !!p.concluidaEm,
      };
    });
    return map;
  }, [sessao.progresso]);

  useEffect(() => {
    fetch(`/api/sessoes/${sessao.id}/progresso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fase: faseAtiva, acao: "iniciar" }),
    });
  }, [faseAtiva, sessao.id]);

  async function concluirFase(fase: AgenciaFaseKey) {
    const idx = AGENCIA_FASES.findIndex((f) => f.key === fase);
    const proxima = AGENCIA_FASES[idx + 1]?.key ?? fase;
    await fetch(`/api/sessoes/${sessao.id}/progresso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fase, acao: "concluir" }),
    });
    setFaseAtiva(proxima);
    onRefresh();
  }

  async function salvarProspect() {
    setSalvandoProspect(true);
    await fetch(`/api/sessoes/${sessao.id}/prospect`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        cargo: "Cliente viajante",
        whatsapp,
        email,
      }),
    });
    setSalvandoProspect(false);
    onRefresh();
  }

  const faseMeta = AGENCIA_FASES_MAP[faseAtiva];
  const frasesDaFase = sessao.frases.filter((f) => f.fase === faseAtiva);
  const frasesCapturadas = sessao.frases.filter((f) =>
    AGENCIA_FASES.some((fase) => fase.key === f.fase)
  );

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center">
              <EnturLogo size="sm" />
            </Link>
            <div className="h-5 w-px bg-slate-800" />
            <div>
              <Link
                href="/"
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← sessões
              </Link>
              <h1 className="text-sm font-semibold">
                {sessao.agenciaNome}
                <span className="text-slate-500 font-normal ml-2">
                  · {sessao.vendedorNome}
                </span>
              </h1>
            </div>
          </div>
          <Badge className="bg-sky-900/60 text-sky-100 border border-sky-700/50">
            SPIN Agência · Experiência Curada
          </Badge>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto">
        <aside className="w-64 shrink-0 border-r border-slate-800 px-4 py-6 sticky top-0 h-screen overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-4 px-2">
            Playbook da agência
          </p>
          <nav className="flex flex-col gap-1">
            {AGENCIA_FASES.map((fase) => {
              const active = faseAtiva === fase.key;
              const concluida = progressoMap[fase.key]?.concluida;
              return (
                <button
                  key={fase.key}
                  onClick={() => setFaseAtiva(fase.key)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                    active
                      ? "bg-sky-600 text-white"
                      : concluida
                      ? "text-emerald-300 hover:bg-slate-900"
                      : "text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs w-5 h-5 rounded-full flex items-center justify-center ${
                        active
                          ? "bg-white/20"
                          : concluida
                          ? "bg-emerald-500/20"
                          : "bg-slate-800"
                      }`}
                    >
                      {concluida && !active ? "✓" : fase.num}
                    </span>
                    <span className="font-medium">{fase.label}</span>
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ml-7 ${
                      active ? "text-white/70" : "text-slate-500"
                    }`}
                  >
                    {fase.duracaoMin} min · {fase.subtitulo}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 px-8 py-6 pb-24 min-w-0">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-slate-800 text-slate-300 border border-slate-700">
                Fase {faseMeta.num}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                {faseMeta.duracaoMin} min
              </span>
            </div>
            <h2 className="text-2xl font-bold">{faseMeta.label}</h2>
            <p className="text-slate-400 text-sm">{faseMeta.objetivo}</p>
          </div>

          {faseAtiva === "whatsapp" && (
            <FaseBloco
              titulo="Condução pelo WhatsApp"
              subtitulo="O objetivo não é vender por mensagem. É levar para uma chamada onde a agência consiga escutar e orientar."
              icon={<MessageCircle className="h-5 w-5 text-sky-300" />}
            >
              <Script>
                &ldquo;Oi, [nome]. Vi que Buenos Aires está nos seus planos. Antes
                de te mandar qualquer coisa pronta, quero te ouvir melhor: o que
                te fez pensar nessa viagem e o que você imagina viver lá? A ideia
                não é vender um pacote genérico, é entender como você gosta de
                viajar para desenhar a experiência certa.&rdquo;
              </Script>
              <Perguntas perguntas={perguntasWhatsApp} />
              <Alerta>
                Regra comercial: não mande preço por WhatsApp. Preço sem contexto
                vira comparação com site. Primeiro, venda a conversa.
              </Alerta>
              <CapturaFrase
                sessaoId={sessao.id}
                fase={faseAtiva}
                frases={frasesDaFase}
                onRefresh={onRefresh}
                placeholder="ex: quero aproveitar cada minuto, mas não tenho tempo para pesquisar tudo"
              />
            </FaseBloco>
          )}

          {faseAtiva === "abertura" && (
            <FaseBloco
              titulo="Contrato da chamada"
              subtitulo="Dê clareza do processo e posicione a agência como curadora, não como emissora de passagem."
              icon={<Sparkles className="h-5 w-5 text-amber-300" />}
            >
              <Script>
                &ldquo;Antes de qualquer proposta, eu quero te fazer algumas
                perguntas para entender como você viaja, o que espera de Buenos
                Aires e o que não pode dar errado. Depois eu te mostro uma
                proposta desenhada a partir do que você me contou. Pode ser?&rdquo;
              </Script>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">
                  Dados do cliente
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="WhatsApp"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>
                <Button
                  type="button"
                  onClick={salvarProspect}
                  disabled={salvandoProspect || nome.trim().length < 2}
                  className="mt-3 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  {salvandoProspect ? "Salvando..." : "Salvar cliente"}
                </Button>
              </div>
            </FaseBloco>
          )}

          {faseAtiva === "situacao" && (
            <FaseBloco
              titulo="Abrir sonho e perfil"
              subtitulo="Aqui o vendedor escuta mais do que fala. História revela desejo, critério e medo."
              icon={<Plane className="h-5 w-5 text-emerald-300" />}
            >
              <Perguntas perguntas={perguntasSituacaoAgencia} />
              <CapturaFrase
                sessaoId={sessao.id}
                fase={faseAtiva}
                frases={frasesDaFase}
                onRefresh={onRefresh}
                placeholder="ex: eu quero voltar sentindo que valeu cada centavo"
              />
            </FaseBloco>
          )}

          {faseAtiva === "problema" && (
            <FaseBloco
              titulo="O problema de montar sozinho"
              subtitulo="Mostre que comprar é fácil, mas aproveitar bem é outra conversa."
              icon={<ChevronRight className="h-5 w-5 text-orange-300" />}
            >
              <Script>
                &ldquo;Buenos Aires parece simples: passagem, hotel e pronto. Só
                que existe um abismo entre comprar a viagem e aproveitar bem cada
                dia dela.&rdquo;
              </Script>
              <Perguntas perguntas={perguntasProblemaAgencia} />
              <CapturaFrase
                sessaoId={sessao.id}
                fase={faseAtiva}
                frases={frasesDaFase}
                onRefresh={onRefresh}
                placeholder="ex: fico com medo de escolher errado e perder tempo"
              />
            </FaseBloco>
          )}

          {faseAtiva === "implicacao" && (
            <FaseBloco
              titulo="As 5 perdas do montar sozinho"
              subtitulo="A implicação precisa sair do racional e tocar tempo, arrependimento e dinheiro."
              icon={<Clock3 className="h-5 w-5 text-red-300" />}
            >
              <div className="grid gap-3 md:grid-cols-5">
                {perdasMontarSozinho.map((perda, index) => (
                  <div
                    key={perda}
                    className="rounded-xl border border-red-900/40 bg-red-950/20 p-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-red-300">
                      Perda {index + 1}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      {perda}
                    </p>
                  </div>
                ))}
              </div>
              <Perguntas perguntas={perguntasImplicacaoAgencia} />
              <Alerta>
                Frases que valem ouro: &ldquo;quero aproveitar cada minuto&rdquo;,
                &ldquo;não quero voltar com arrependimento&rdquo;, &ldquo;quero
                alguém que pense comigo&rdquo;.
              </Alerta>
              <CapturaFrase
                sessaoId={sessao.id}
                fase={faseAtiva}
                frases={frasesDaFase}
                onRefresh={onRefresh}
                placeholder="ex: não quero voltar pensando que deveria ter feito diferente"
              />
            </FaseBloco>
          )}

          {faseAtiva === "needPayoff" && (
            <FaseBloco
              titulo="Fazer o cliente descrever a solução"
              subtitulo="Não fale curadoria cedo demais. Deixe o cliente pedir orientação com as palavras dele."
              icon={<Sparkles className="h-5 w-5 text-emerald-300" />}
            >
              <Perguntas perguntas={perguntasNeedPayoffAgencia} />
              <Script>
                &ldquo;Pelo que você trouxe, faz sentido não olhar só passagem e
                hotel, mas ter alguém organizando a experiência certa para o seu
                perfil. Isso faz sentido para você?&rdquo;
              </Script>
              <CapturaFrase
                sessaoId={sessao.id}
                fase={faseAtiva}
                frases={frasesDaFase}
                onRefresh={onRefresh}
                placeholder="ex: eu queria alguém que filtrasse isso para mim"
              />
            </FaseBloco>
          )}

          {faseAtiva === "proposta" && (
            <FaseBloco
              titulo="Apresentar experiência, não pacote"
              subtitulo="A proposta nasce do que ele contou. O investimento vem depois do valor."
              icon={<Check className="h-5 w-5 text-sky-300" />}
            >
              <Script>
                &ldquo;Agora faz sentido te mostrar a proposta, porque ela nasceu
                do que você me contou. Você disse que queria{" "}
                <FraseInline frases={frasesCapturadas} />. A ideia aqui é
                desenhar Buenos Aires para esse jeito de viajar.&rdquo;
              </Script>
              <Checklist itens={roteiroPropostaAgencia} />
              <Alerta>
                Se a apresentação parecer tabela de aéreo, hotel e transfer,
                você virou comparável. Se parecer uma viagem desenhada pelo que
                ele contou, você virou curadoria.
              </Alerta>
            </FaseBloco>
          )}

          {faseAtiva === "fechamento" && (
            <FaseBloco
              titulo="Compromisso estratégico de reserva"
              subtitulo="Fechamento com microcompromissos, timing real e perguntas de clareza."
              icon={<Check className="h-5 w-5 text-emerald-300" />}
            >
              <Checklist itens={microCompromissosAgencia} numerado />
              <Script>
                &ldquo;Como aéreo para Buenos Aires muda de preço toda semana e os
                melhores hotéis nos bairros certos têm disponibilidade limitada,
                o próximo passo é reservar as condições atuais. Quer que eu já
                comece a desenhar a sua Buenos Aires?&rdquo;
              </Script>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold text-slate-200">
                  Se houver hesitação
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  <li>&ldquo;Me conta o que ainda não está claro para você.&rdquo;</li>
                  <li>
                    &ldquo;O que precisaria mudar na proposta para você dizer sim com
                    tranquilidade?&rdquo;
                  </li>
                </ul>
              </div>
            </FaseBloco>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              type="button"
              onClick={() => concluirFase(faseAtiva)}
              className="bg-sky-600 hover:bg-sky-500 text-white"
            >
              {faseAtiva === "fechamento"
                ? "Marcar atendimento concluído"
                : "Concluir fase e avançar"}
            </Button>
          </div>
        </main>

        <aside className="w-80 shrink-0 border-l border-slate-800 px-5 py-6 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-5">
            <PainelCoachAgencia frases={frasesCapturadas} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function FaseBloco({
  titulo,
  subtitulo,
  icon,
  children,
}: {
  titulo: string;
  subtitulo: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="max-w-5xl space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{titulo}</h3>
            <p className="text-sm text-slate-400">{subtitulo}</p>
          </div>
        </div>
        <div className="space-y-5">{children}</div>
      </section>
    </div>
  );
}

function Script({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-sky-800/40 bg-sky-950/20 p-4">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-sky-300">
        Leia em voz alta
      </p>
      <p className="text-sm leading-relaxed text-slate-100 italic">{children}</p>
    </div>
  );
}

function Perguntas({
  perguntas,
}: {
  perguntas: { texto: string; foco: string; capturar?: string }[];
}) {
  return (
    <div className="space-y-3">
      {perguntas.map((pergunta, index) => (
        <div
          key={pergunta.texto}
          className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
        >
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Pergunta aberta {index + 1}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white italic">
            &ldquo;{pergunta.texto}&rdquo;
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <p className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Foco:</span>{" "}
              {pergunta.foco}
            </p>
            {pergunta.capturar && (
              <p className="rounded-lg bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                <span className="font-semibold">Capture:</span>{" "}
                {pergunta.capturar}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CapturaFrase({
  sessaoId,
  fase,
  frases,
  onRefresh,
  placeholder,
}: {
  sessaoId: number;
  fase: AgenciaFaseKey;
  frases: SessaoAoVivo["frases"];
  onRefresh: () => void;
  placeholder: string;
}) {
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!texto.trim()) return;
    setSalvando(true);
    await fetch(`/api/sessoes/${sessaoId}/frases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fase, texto: texto.trim(), perguntaId: null }),
    });
    setTexto("");
    setSalvando(false);
    onRefresh();
  }

  return (
    <div className="rounded-xl border border-amber-800/40 bg-amber-950/10 p-4">
      <p className="text-[10px] uppercase tracking-wider text-amber-300">
        Frase exata do cliente
      </p>
      <div className="mt-3 flex gap-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="min-h-16 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-500"
        />
        <Button
          type="button"
          onClick={salvar}
          disabled={salvando || !texto.trim()}
          className="self-end bg-amber-600 hover:bg-amber-500 text-white"
        >
          Salvar
        </Button>
      </div>
      {frases.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-amber-900/30 pt-3">
          {frases.map((frase) => (
            <p
              key={frase.id}
              className="border-l-2 border-amber-400/60 pl-3 text-xs italic text-amber-100"
            >
              &ldquo;{frase.texto}&rdquo;
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Checklist({
  itens,
  numerado = false,
}: {
  itens: string[];
  numerado?: boolean;
}) {
  return (
    <div className="space-y-2">
      {itens.map((item, index) => (
        <div
          key={item}
          className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-300">
            {numerado ? index + 1 : <Check className="h-3.5 w-3.5" />}
          </span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Alerta({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/15 p-4 text-sm leading-relaxed text-emerald-100">
      {children}
    </div>
  );
}

function FraseInline({ frases }: { frases: SessaoAoVivo["frases"] }) {
  const primeira = frases[0]?.texto;
  if (!primeira) return <span>uma viagem bem aproveitada</span>;
  return <span className="text-sky-200">&ldquo;{primeira}&rdquo;</span>;
}

function PainelCoachAgencia({
  frases,
}: {
  frases: SessaoAoVivo["frases"];
}) {
  return (
    <>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="mb-3 text-[10px] uppercase tracking-wider text-sky-300">
          Tese comercial
        </p>
        <p className="text-sm leading-relaxed text-slate-200">
          A agência não vende passagem. Vende a melhor versão possível da viagem:
          tempo bem usado, escolhas certas, logística fluida e menos
          arrependimento.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="mb-3 text-[10px] uppercase tracking-wider text-slate-500">
          4 pilares da curadoria
        </p>
        <div className="space-y-3">
          {pilaresCuradoria.map((pilar) => (
            <div key={pilar.titulo}>
              <p className="text-xs font-semibold text-white">{pilar.titulo}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {pilar.texto}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="mb-3 text-[10px] uppercase tracking-wider text-slate-500">
          Frases de alto nível
        </p>
        <div className="space-y-2">
          {frasesAltoNivelAgencia.map((frase) => (
            <p
              key={frase}
              className="rounded-lg bg-slate-950/50 px-3 py-2 text-xs italic text-slate-300"
            >
              &ldquo;{frase}&rdquo;
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-900/40 bg-amber-950/10 p-4">
        <p className="mb-3 text-[10px] uppercase tracking-wider text-amber-300">
          Palavras capturadas
        </p>
        {frases.length === 0 ? (
          <p className="text-xs text-slate-500">
            Capture as palavras exatas do cliente. Elas viram a ancoragem da
            proposta e do fechamento.
          </p>
        ) : (
          <div className="space-y-2">
            {frases.slice(-6).map((frase) => (
              <p
                key={frase.id}
                className="border-l-2 border-amber-300/60 pl-3 text-xs italic text-amber-100"
              >
                &ldquo;{frase.texto}&rdquo;
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

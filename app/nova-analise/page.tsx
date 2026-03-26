"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/formatCurrency"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import IconBox from "@/components/IconBox"
import { useAnalysis } from "@/context/AnalysisContext"
import toast, { Toaster } from "react-hot-toast"
import { ExternalLink, FileText, BookOpen, Info } from "lucide-react"
import Lottie from "lottie-react"
import radarAnimation from "@/lotties/animabot.json"

export default function NovaAnalise() {
  const [mensagemIndex, setMensagemIndex] = useState(0)
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    const interval = setInterval(() => {
      setMensagemIndex((prev) => (prev < 4 ? prev + 1 : prev))
    }, 1800)
  
    return () => clearInterval(interval)
  }, [])
useEffect(() => {
  console.log("HREF:", window.location.href)
  console.log("SEARCH:", window.location.search)

  const params = new URL(window.location.href).searchParams
  const id = params.get("user_id")

  console.log("USER ID FINAL:", id)

}, [])

useEffect(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search)

    const id = params.get("user_id")

    setUser({
      id: id,
      email: params.get("email"),
      name: params.get("name"),
    })
  }
}, [])
  const [bairrosLista, setBairrosLista] = useState<string[]>([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(0)
  const [showTop10, setShowTop10] = useState(false)
  const [showOutros, setShowOutros] = useState(false)
  const [empreendimentos, setEmpreendimentos] = useState<any[]>([])

  const router = useRouter()
  const { data, setData, reset } = useAnalysis()

  const step1Disabled = !data.nome || !data.renda || !data.entrada || !data.urgencia
  const step3Disabled = !data.tipo

  function toggleBairro(nome: string) {
    const bairros = data.bairros || []
    const updated = bairros.includes(nome)
      ? bairros.filter((b) => b !== nome)
      : [...bairros, nome]

    setData({ bairros: updated })
  }

  function gerarPDF() {

    // 🔥 IGUAL AO STEP 5 (ESSENCIAL)
    const tipoSelecionado = data.tipo
  
    const ordenados = [...empreendimentos].sort((a, b) => b.score - a.score)
  
    const mesmos = ordenados.filter(
      e => String(e.tipo || "").toLowerCase().trim() ===
           String(tipoSelecionado || "").toLowerCase().trim()
    )
  
    const top3 = mesmos.slice(0, 3)
  
    const html = `
    <html>
    <head>
      <title>Metro Radar</title>
  
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 32px;
          background: #f8fafc;
          color: #0f172a;
        }
  
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
  
        .logo {
          width: 40px;
          height: 40px;
        }
  
        h1 {
          font-size: 20px;
          margin: 0;
        }
  
        .cliente {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 24px;
        }
  
        .card {
          display: flex;
          gap: 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
        }
  
        .img {
          width: 160px;
          height: 120px;
          object-fit: cover;
          background: #e2e8f0;
        }
  
        .content {
          flex: 1;
          padding: 16px;
        }
  
        .title {
          font-weight: 600;
          font-size: 16px;
        }
  
        .bairro {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 8px;
        }
  
        .score {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }
  
        .ok { color: #16a34a; font-size: 13px; }
        .warn { color: #f59e0b; font-size: 13px; }
        .bad { color: #ef4444; font-size: 13px; }
      </style>
    </head>
  
    <body>
  
      <!-- HEADER -->
      <div class="header">
        <img class="logo" src="https://metrosquare.com.br/wp-content/uploads/2026/03/radar-1.png" />
        <h1>Metro Radar</h1>
      </div>
  
      <div class="cliente">
        Cliente: ${data.nome || "Não informado"}
      </div>
  
      <h2>Seu ranking personalizado</h2>
  
      ${top3.map(item => `
  
        <div class="card">
  
          <img 
            class="img" 
            src="${item.imagem || "https://via.placeholder.com/300"}"
            onerror="this.src='https://via.placeholder.com/300'"
          />
  
          <div class="content">
  
            <div class="title">${item.nome}</div>
            <div class="bairro">${item.bairro}</div>
  
            <div class="score">Score: ${item.score || 0}%</div>
  
            ${
              data.bairros?.includes(item.bairro)
                ? `<div class="ok">✔ Localização compatível</div>`
                : `<div class="warn">⚠ Localização diferente</div>`
            }
  
            ${
              String(data.tipo || "").toLowerCase().trim() ===
              String(item.tipo || "").toLowerCase().trim()
                ? `<div class="ok">✔ Tipo adequado</div>`
                : `<div class="warn">⚠ Tipo diferente</div>`
            }
  
            ${
              item.debug?.renda?.score >= 80
                ? `<div class="ok">✔ Renda adequada</div>`
                : item.debug?.renda?.score >= 50
                ? `<div class="warn">⚠ Renda parcialmente adequada</div>`
                : `<div class="bad">❌ Renda abaixo do ideal</div>`
            }
  
            ${
              item.debug?.entrada?.score >= 80
                ? `<div class="ok">✔ Entrada adequada</div>`
                : item.debug?.entrada?.score >= 50
                ? `<div class="warn">⚠ Entrada parcialmente adequada</div>`
                : `<div class="bad">❌ Entrada abaixo do ideal</div>`
            }
  
          </div>
  
        </div>
  
      `).join("")}
  
    </body>
    </html>
    `
  
    const win = window.open("", "_blank")
    if (!win) return
    
    win.document.open()
    win.document.write(html)
    win.document.close()
    
    // 🔥 só imprime quando terminar de carregar
    win.onload = () => {
      setTimeout(() => {
        win.print()
      }, 200)
    }
  }
  useEffect(() => {
    async function fetchBairros() {
      const { data, error } = await supabase
        .from("empreendimentos")
        .select("bairro")
  
      if (error) {
        console.error(error)
        return
      }
  
      // remove duplicados
      const unicos = [...new Set(data.map((i) => i.bairro).filter(Boolean))]
  
      setBairrosLista(unicos)
    }
  
    fetchBairros()
  }, [])
  useEffect(() => {
    if (step === 4 && loading < 100) {
      const t = setTimeout(() => setLoading((p) => p + 5), 80)
      return () => clearTimeout(t)
    }
    if (step === 4 && loading >= 100) {
      const t = setTimeout(() => setStep(5), 1200)
      return () => clearTimeout(t)
    }
  }, [step, loading])

  useEffect(() => {
    if (step !== 5) return
  
    async function fetchEmpreendimentos() {
      const { data: lista, error } = await supabase
        .from("empreendimentos")
        .select("*")
  
      if (error) {
        console.error(error)
        return
      }
  
      if (!lista || lista.length === 0) {
        console.warn("Nenhum empreendimento encontrado")
        return
      }
  
      function toNumber(v: any) {
        if (!v) return 0
      
        return Number(
          String(v)
            .replace(/\./g, "")   // remove milhar
            .replace(",", ".")    // troca vírgula por ponto
            .replace(/[^\d.]/g, "") // remove resto
        )
      }
  
      function scoreRenda(r: number, min: number) {
        if (!min) return 0
        if (r >= min) return 100
        return (r / min) * 100
      }
  
      function scoreEntrada(e: number, min: number) {
        if (!min) return 0
        if (e >= min) return 100
        return (e / min) * 100
      }
  
      function scoreLocal(bairros: string[], bairro: string) {
        return bairros?.includes(bairro) ? 100 : 0
      }
  
      function scoreTipo(t1: string, t2: string) {
        const a = String(t1 || "").toLowerCase().trim()
        const b = String(t2 || "").toLowerCase().trim()
      
        if (!a || !b) return 0
      
        if (a === b) return 100
      
        // 🔥 penalidade (mas não elimina)
        return 40
      }
  
      function scorePreco(faixa: string, preco: number) {
        if (!faixa) return 100 // 🔥 neutro se não informou
      
        if (!preco) return 0
      
        if (faixa === "Até R$ 200.000") return preco <= 200000 ? 100 : 0
        if (faixa === "R$ 200.000 - R$ 350.000") return preco <= 350000 ? 100 : 0
        if (faixa === "R$ 350.000 - R$ 500.000") return preco <= 500000 ? 100 : 0
        if (faixa === "Acima de R$ 500.000") return preco > 500000 ? 100 : 0
      
        return 0
      }
  
      function mesesAteEntrega(entrega: string) {
        if (!entrega) return 0
      
        const dataEntrega = new Date(entrega)
        const hoje = new Date()
      
        const ano = dataEntrega.getFullYear()
        const mes = dataEntrega.getMonth() + 1
      
        const anoAtual = hoje.getFullYear()
        const mesAtual = hoje.getMonth() + 1
      
        return (ano - anoAtual) * 12 + (mes - mesAtual)
      }
  
      function urgenciaMeses(u: string) {
        if (u === "12") return 12
        if (u === "24") return 24
        if (u === "36") return 36
        return 999
      }
  
      function scoreUrgencia(u: string, entrega: string) {
        const c = urgenciaMeses(u)
        const i = mesesAteEntrega(entrega)
  
        if (i < 0) return 100
        if (i <= c) return 100
  
        const diff = i - c
        if (diff <= 6) return 70
        if (diff <= 12) return 40
  
        return 0
      }
  
      const cliente = {
        renda: toNumber(data.renda),
        entrada: toNumber(data.entrada),
        bairros: data.bairros || [],
        tipo: data.tipo,
        preco: data.preco,
        urgencia: data.urgencia
      }
  
      const calculados = lista.map((e) => {
        const sRenda = scoreRenda(cliente.renda, e.renda_minima)
        const sEntrada = scoreEntrada(cliente.entrada, e.entrada_minima)
        const sLocal = scoreLocal(cliente.bairros || [], e.bairro || "")
        const sTipo = scoreTipo(cliente.tipo || "", e.tipo || "")                
        const sPreco = scorePreco(cliente.preco || "", e.preco || 0)
        const sUrg = scoreUrgencia(cliente.urgencia || "", e.entrega || "")
      
        const base =
          sRenda * 0.35 +
          sEntrada * 0.25 +
          sLocal * 0.15 +
          sTipo * 0.10 +
          sPreco * 0.10
      
        const final = base * 0.95 + sUrg * 0.05
      
        return {
          ...e,
          score: Math.round(final),
          debug: {
            renda: {
              informada: cliente.renda,
              ideal: e.renda_minima,
              score: Math.round(sRenda)
            },
            entrada: {
              informada: cliente.entrada,
              ideal: e.entrada_minima,
              score: Math.round(sEntrada)
            },
            localizacao: {
              informada: cliente.bairros,
              empreendimento: e.bairro,
              score: Math.round(sLocal)
            },
            tipo: {
              informado: cliente.tipo,
              empreendimento: e.tipo,
              score: Math.round(sTipo)
            },
            preco: {
              faixa: cliente.preco,
              valor: e.preco,
              score: Math.round(sPreco)
            },
            urgencia: {
              informada: cliente.urgencia,
              meses_ate_entrega: mesesAteEntrega(e.entrega),
              score: Math.round(sUrg)
            }
          }
        }
      })
      
      const ordenados = calculados
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
      
      setEmpreendimentos(ordenados)
      ordenados.slice(0, 5).forEach((item) => {
        console.group(`🏆 ${item.nome} → ${item.score}`)
      
        console.log(
          "Renda:",
          item.debug.renda.score,
          `(${item.debug.renda.informada} / ${item.debug.renda.ideal})`
        )
      
        console.log(
          "Entrada:",
          item.debug.entrada.score,
          `(${item.debug.entrada.informada} / ${item.debug.entrada.ideal})`
        )
      
        console.log(
          "Localização:",
          item.debug.localizacao.score,
          `(cliente: ${item.debug.localizacao.informada} | imóvel: ${item.debug.localizacao.empreendimento})`
        )
      
        console.log(
          "Tipo:",
          item.debug.tipo.score,
          `(${item.debug.tipo.informado} vs ${item.debug.tipo.empreendimento})`
        )
      
        console.log(
          "Preço:",
          item.debug.preco.score,
          `(faixa: ${item.debug.preco.faixa} | valor: ${item.debug.preco.valor})`
        )
      
        console.log(
          "Urgência:",
          item.debug.urgencia.score,
          `(meses: ${item.debug.urgencia.meses_ate_entrega})`
        )
      
        console.groupEnd()
      })
    }
  
    fetchEmpreendimentos()
  }, [step])

  async function salvarAnalise() {

    const finalUserId = user?.id
  
    if (!finalUserId) {
      alert("Usuário não identificado")
      return
    }
  
    const resultado = {
      top3: empreendimentos.slice(0, 3),
    }
  
    console.log("SALVANDO USER:", finalUserId)
  
    const { error } = await supabase.from("analises").insert([
      {
        user_id: finalUserId,
        nome: data.nome || `Análise ${new Date().toLocaleDateString()}`,
        renda: data.renda,
        entrada: data.entrada,
        urgencia: data.urgencia,
        bairros: data.bairros,
        tipo: data.tipo,
        preco: data.preco,
        resultado,
        created_at: new Date().toISOString()
      },
    ])
  
    if (error) {
      console.error(error)
      toast.error("Erro ao salvar análise")
    } else {
      toast.success("Análise salva com sucesso!")
    }
  }

  // ======================
  // STEP 1
  // ======================
  if (step === 1) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
  
        <div className="text-center mb-10">
          <IconBox src="https://metrosquare.com.br/wp-content/uploads/2026/03/radar-1.svg" />
  
          <h1 className="text-[26px] font-semibold tracking-tight text-[#0f172a]">
            Metro Radar
          </h1>
  
          <p className="text-[15px] text-gray-500">
            Encontre os lançamentos ideais para seu perfil
          </p>
        </div>
  
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
  
          <div>
            <h2 className="text-[18px] font-semibold text-[#0f172a]">
              Dados do Cliente
            </h2>
            <p className="text-[13px] text-gray-400">
              Passo 1 de 3
            </p>
          </div>
  
          {/* INPUTS ORIGINAIS */}
          {[
            { label: "Nome do cliente", key: "nome", placeholder: "Digite o nome completo" },
            { label: "Renda familiar mensal", key: "renda" },
            { label: "Valor disponível para entrada", key: "entrada" }
          ].map((item, i) => (
            <div key={i}>
              <label className="text-[13px] text-gray-500 font-medium">
                {item.label}
              </label>
              <input
                value={(data as any)[item.key] || ""}
                onChange={(e) =>
                  setData({
                    [item.key]:
                      item.key === "nome"
                        ? e.target.value
                        : formatCurrency(e.target.value),
                  })
                }
                placeholder={item.placeholder || "R$ 0,00"}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[15px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:bg-white transition"
              />
            </div>
          ))}
  
          {/* URGÊNCIA ORIGINAL */}
          <div>
            <label className="text-[13px] font-medium text-gray-500 block mb-2">
              Urgência
            </label>
  
            <div className="grid grid-cols-2 gap-3">
              {["12", "24", "36", "none"].map((u) => (
                <button
                  key={u}
                  onClick={() => setData({ urgencia: u })}
                  className={`px-4 py-3 rounded-xl text-[14px] font-medium border transition ${
                    data.urgencia === u
                      ? "bg-[#0f172a] text-white border-[#0f172a]"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {u === "none" ? "Sem urgência" : `Até ${u} meses`}
                </button>
              ))}
            </div>
          </div>
  
          {/* BOTÕES */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!user?.id) return
              
                if (window.top) {
                  window.top.location.href = `/historico?user_id=${user.id}`
                }
              }}
              className="w-1/2 bg-gray-100 py-3 rounded-lg text-[14px] font-medium"
            >
              Ver Histórico
            </button>
  
            <button
              disabled={step1Disabled}
              onClick={() => setStep(2)}
              className={`w-1/2 py-3 rounded-xl text-[15px] font-semibold transition ${
                step1Disabled
                  ? "bg-gray-200 text-gray-400"
                  : "bg-[#0f172a] text-white hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              Continuar
            </button>
          </div>
  
        </div>
      </div>
    )
  }

  // ======================
  // STEP 2
  // ======================
  if (step === 2) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
  
        <div className="text-center mb-10">
          <IconBox src="https://metrosquare.com.br/wp-content/uploads/2026/03/map-pin-line-1.svg" />
  
          <h1 className="text-[26px] font-semibold tracking-tight">
            Localização
          </h1>
        </div>
  
        <div className="bg-white rounded-2xl p-6 space-y-6 shadow-sm border border-gray-100">
  
          <div>
            <h2 className="text-[18px] font-semibold text-[#0f172a]">
              Bairros de interesse
            </h2>
            <p className="text-[13px] text-gray-400">
              Passo 2 de 3
            </p>
          </div>
  
          <p className="text-[14px] text-[#64748B]">
            Selecione um ou mais bairros:
          </p>
  
          <div className="flex gap-2 flex-wrap">
          {bairrosLista.map((b) => (
              <button
                key={b}
                onClick={() => toggleBairro(b)}
                className={`px-4 py-2 rounded-full text-[14px] font-medium border transition ${
                  (data.bairros || []).includes(b)
                    ? "bg-[#0f172a] text-white border-[#0f172a]"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1">
                  {b}
                  {(data.bairros || []).includes(b) && "✓"}
                </div>
              </button>
            ))}
          </div>
  
          <>
  <p className="text-[14px] text-[#64748B]">
    Selecionados
  </p>

  {(data.bairros || []).length === 0 ? (
    <p className="text-[13px] text-gray-400">
      Nenhum bairro selecionado
    </p>
  ) : (
    <div className="flex flex-wrap gap-3 mt-2">
      {(data.bairros || []).map((b) => (
        <div
          key={b}
          className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-700"
        >
          {b}
          ✕
        </div>
      ))}
    </div>
  )}
</>
  
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="w-1/2 bg-gray-100 py-3 rounded-lg text-[14px] font-medium"
            >
              Voltar
            </button>
  
            <button
              onClick={() => setStep(3)}
              className={`w-1/2 py-3 rounded-xl text-[15px] font-semibold transition ${
                step1Disabled
                  ? "bg-gray-200 text-gray-400"
                  : "bg-[#0f172a] text-white hover:scale-[1.02] active:scale-[0.98]"
              }`}>
              Continuar
            </button>
          </div>
  
        </div>
      </div>
    )
  }
  // ======================
  // STEP 3
  // ======================
  if (step === 3) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
  
        <IconBox src="https://metrosquare.com.br/wp-content/uploads/2026/03/home-6.svg" />
  
        <h1 className="text-[26px] font-semibold tracking-tight text-[#0f172a] text-center mb-2">
          Tipo de Imóvel
        </h1>
        <p className="text-[15px] text-gray-500 text-center mb-8">
  Defina o tipo e faixa ideal para seu perfil
</p>
  
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 space-y-7">
  
        <p className="text-[13px] font-medium text-gray-500">Tipo de imóvel</p>
  
          <div className="grid grid-cols-2 gap-3">
            {["Apartamento", "Casa", "Lote", "Misto"].map((t) => (
              <button
                key={t}
                onClick={() => setData({ tipo: t })}
                className={`p-4 rounded-xl border text-[14px] font-medium transition ${
                  data.tipo === t
                    ? "bg-[#0f172a] text-white border-[#0f172a]"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
  
          <p className="text-[13px] font-medium text-gray-500">Faixa de preço</p>
  
          <div className="space-y-2">
            {[
              "Até R$ 200.000",
              "R$ 200.000 - R$ 350.000",
              "R$ 350.000 - R$ 500.000",
              "Acima de R$ 500.000",
            ].map((f) => (
              <button
                key={f}
                onClick={() => setData({ preco: f })}
                className={`w-full text-left px-4 py-3 rounded-xl border text-[14px] font-medium transition ${
                  data.preco === f
                    ? "bg-gray-100 border-[#0f172a]"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
  
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="w-1/2 bg-white border border-gray-200 py-3 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Voltar
            </button>
  
            <button
              disabled={step3Disabled}
              onClick={() => {
                setLoading(0)
                setStep(4)
              }}
              className="w-1/2 bg-[#0f172a] text-white py-3 rounded-xl text-[15px] font-semibold transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Analisar
            </button>
          </div>
  
        </div>
      </div>
    )
  }

  // ======================
  // STEP 4
  // ======================
  if (step === 4) {
    const mensagens = [
      "Analisando seu perfil financeiro...",
      "Cruzando dados de renda e entrada...",
      "Escaneando bairros com oportunidades...",
      "Comparando mais de 2.000 combinações possíveis...",
      "Encontrando os melhores imóveis para você...",
    ]
  
    const mensagemAtual =
    loading >= 90
      ? "Finalizando análise..."
      : mensagens[mensagemIndex]  
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
  
        {/* RADAR (AGORA LOTTIE) */}
        <Lottie
          animationData={radarAnimation}
          loop
          className="w-40 h-40 mb-6"
        />
  
        <h1 className="text-[20px] font-semibold text-[#0f172a] mb-2">
          Analisando mercado
        </h1>
  
        <p className="text-[14px] text-gray-500 mb-6">
          {mensagemAtual}
        </p>
        <p className="text-[13px] text-gray-400 mb-4">
          Isso leva apenas alguns segundos
        </p>
  
        <div className="w-full max-w-xs bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#0f172a] h-2 transition-all duration-500 ease-out"
            style={{ width: `${loading}%` }}
          />
        </div>
  
        <p className="text-sm text-gray-400 mt-2">
          {loading}%
        </p>
  
      </div>
    )
  }

  // ======================
  // STEP 5
  // ======================
  if (step === 5) {

    const tipoSelecionado = data.tipo

// 🔥 1. Ordena tudo primeiro
const ordenados = [...empreendimentos].sort((a, b) => b.score - a.score)

// 🔥 2. Separa depois
const mesmos = ordenados.filter(
  e => String(e.tipo || "").toLowerCase().trim() === String(tipoSelecionado || "").toLowerCase().trim()
)

const outros = ordenados.filter(
  e => String(e.tipo || "").toLowerCase().trim() !== String(tipoSelecionado || "").toLowerCase().trim()
)

// 🔥 3. Detecta se tem melhor fora
const melhorMesmo = mesmos[0]
const melhorOutro = outros[0]

const temMelhorFora =
  melhorOutro && melhorMesmo &&
  melhorOutro.score > melhorMesmo.score
  
    const top3 = mesmos.slice(0, 3)
    const top10 = mesmos.slice(3, 10)
    const qtdBoas = ordenados.filter(e => e.score >= 70).length
        
    return (
      <>
      <Toaster position="top-right" />
      <div className="max-w-md mx-auto px-4 py-8 bg-[#f8fafc] min-h-screen">
  
        {/* BOTÕES */}
        
  
        <div id="resultado-pdf">

  {user?.name && (
    <p className="text-sm text-gray-500 mb-1">
      Olá, {user.name} 👋
    </p>
  )}

  <div className="text-center mb-10">

    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#0f172a] flex items-center justify-center">
      <img
        src="https://metrosquare.com.br/wp-content/uploads/2026/03/radar-1.svg"
        className="w-6 h-6 invert"
      />
    </div>

    <h1 className="text-[26px] font-semibold tracking-tight text-[#0f172a]">
      Seu ranking personalizado
    </h1>

    <p className="text-[15px] text-gray-500">
      Baseado no seu perfil financeiro e preferências
    </p>

  </div>

  <div className="mb-6 text-sm text-gray-500 space-y-1">
    {qtdBoas >= 10 && <p>🔥 Encontramos várias oportunidades ideais para você</p>}
    {qtdBoas >= 5 && qtdBoas < 10 && <p>👍 Boas opções disponíveis</p>}
    {qtdBoas > 0 && qtdBoas < 5 && <p>⚠ Apenas {qtdBoas} opções realmente compatíveis</p>}
    {qtdBoas === 0 && <p>Com alguns ajustes, você pode acessar boas oportunidades 👇</p>}
  </div>

          {temMelhorFora && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-yellow-800">
              ⚠ Você escolheu {data.tipo}, mas existem imóveis com score maior em outros tipos. Vale a pena conferir 👇
            </div>
          )}
  {/* TOP 3 */}
<div className="flex flex-col gap-4 mb-10">
  {top3.map((item, i) => {

    const tipoOk =
      String(data.tipo || "").toLowerCase().trim() ===
      String(item.tipo || "").toLowerCase().trim()

    return (
      <div key={item.id || i}>

        {i === 0 && (
          <div className="text-xs font-semibold text-green-600 mb-2 ml-1">
            MELHOR OPÇÃO PARA VOCÊ
          </div>
        )}

        <div
          className={`bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden
          ${i === 0 ? "border-green-500 shadow-lg scale-[1.02]" : "border-gray-200 hover:shadow-md"}
          `}
        >
    {/* IMAGEM */}
    <img
      src={item.imagem || "https://via.placeholder.com/400x300"}
      className="h-44 w-full object-cover"
    />

    <div className="p-5 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-[#0f172a] text-lg">
            {item.nome}
          </h3>
          <p className="text-sm text-gray-500">
            {item.bairro}
          </p>
        </div>

        <div className="bg-[#0f172a] text-white text-xs px-3 py-1.5 rounded-full shadow-sm">
          {item.score || 0}%
        </div>
      </div>

      <div className="h-px bg-gray-100 my-2" />

      {/* INFOS */}
      <div className="space-y-2 text-sm">

        {/* LOCAL */}
        <div className={
          !data.bairros?.length
            ? "text-gray-400"
            : data.bairros.includes(item.bairro)
            ? "text-green-600"
            : "text-yellow-600"
        }>
          {!data.bairros?.length
            ? "• Localização não informada"
            : data.bairros.includes(item.bairro)
            ? "✔ Localização compatível"
            : "⚠ Localização diferente"}
        </div>

        {/* TIPO */}
        <div className={tipoOk ? "text-green-600" : "text-yellow-600"}>
          {tipoOk
            ? "✔ Tipo ideal: " + item.tipo
            : "⚠ Tipo diferente: " + item.tipo}
        </div>

        {/* RENDA */}
        <div className="relative group">
          <div className={
            item.debug?.renda.score >= 80
              ? "text-green-600"
              : item.debug?.renda.score >= 50
              ? "text-yellow-600"
              : "text-red-600"
          }>
            {item.debug?.renda.score >= 80 ? (
              "✔ Renda adequada"
            ) : (
              <>
                {item.debug?.renda.score >= 50
                  ? "⚠ Renda parcialmente adequada"
                  : "❌ Renda muito abaixo do ideal"}

<div className="absolute hidden group-hover:block left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 bg-white text-gray-700 text-xs rounded-md px-3 py-2 shadow-md border border-gray-200 z-50 transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">

<div className="font-medium text-gray-900 mb-1">
  Renda ideal
</div>

<div>
  R$ {item.debug?.renda?.ideal || "—"}
</div>

</div>
              </>
            )}
          </div>
        </div>

        {/* ENTRADA */}
        <div className="relative group">
          <div className={
            item.debug?.entrada.score >= 80
              ? "text-green-600"
              : item.debug?.entrada.score >= 50
              ? "text-yellow-600"
              : "text-red-600"
          }>
            {item.debug?.entrada.score >= 80 ? (
              "✔ Entrada adequada"
            ) : (
              <>
                {item.debug?.entrada.score >= 50
                  ? "⚠ Entrada parcialmente adequada"
                  : "❌ Entrada muito abaixo do ideal"}

<div className="absolute hidden group-hover:block left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 bg-white text-gray-700 text-xs rounded-md px-3 py-2 shadow-md border border-gray-200 z-50 transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">

<div className="font-medium text-gray-900 mb-1">
  Entrada ideal
</div>

<div>
  R$ {item.debug?.entrada?.ideal || "—"}
</div>

</div>
              </>
            )}
          </div>
        </div>

      </div>

       {/* BOTÃO */}
       <div className="grid grid-cols-2 gap-3 mt-3">

  {/* SIMULAÇÃO */}
  <a
    href="https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
    target="_blank"
    className="flex items-center justify-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm py-2 rounded-xl transition"
  >
    <ExternalLink size={16} />
    Simulação
  </a>

  {/* TABELAS */}
  <button className="flex items-center justify-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm py-2 rounded-xl transition">
    <FileText size={16} />
    Tabelas
  </button>

  {/* BOOK */}
  <button className="flex items-center justify-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm py-2 rounded-xl transition">
    <BookOpen size={16} />
    Book
  </button>

  {/* DETALHES */}
  <button className="flex items-center justify-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm py-2 rounded-xl transition">
    <Info size={16} />
    Detalhes
  </button>

</div>

    </div> 
  </div> 

)
})}

</div> {/* FECHA GRID */}
{/* BOTÃO OUTROS TIPOS */}
{outros.length > 0 && (
  <button
    onClick={() => setShowOutros(!showOutros)}
    className="mb-6 bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
  >
    {showOutros
      ? "Ocultar outras opções"
      : temMelhorFora
      ? "🔥 Ver melhores oportunidades"
      : "Ver outras opções de imóveis"}
  </button>
)}

{/* OUTROS TIPOS */}
{showOutros && (
  <div className="space-y-4 mb-6">

    {ordenados.slice(3, 10).map((item, i) => {

      const tipoOk =
        String(data.tipo || "").toLowerCase().trim() ===
        String(item.tipo || "").toLowerCase().trim()

      return (
        <div
          key={i}
          className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
        >

          {/* IMAGEM */}
          <img
            src={item.imagem || "https://via.placeholder.com/120"}
            className="w-28 h-24 object-cover rounded-lg"
          />

          {/* CONTEÚDO */}
          <div className="flex-1 flex flex-col justify-between">

            {/* TOP */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[#0f172a]">
                    #{i + 4} {item.nome}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.bairro}
                  </p>
                </div>

                <div className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full">
                  {item.score}%
                </div>
              </div>

              {/* CRITÉRIOS */}
              <div className="mt-3 text-sm space-y-1">

                {/* LOCAL */}
                {data.bairros?.includes(item.bairro) && (
                  <div className="text-green-600">
                    ✔ Localização compatível
                  </div>
                )}

                {/* TIPO */}
                {tipoOk && (
                  <div className="text-green-600">
                    ✔ Tipo adequado
                  </div>
                )}

                {/* RENDA */}
                {item.debug?.renda.score >= 80 && (
                  <div className="text-green-600">
                    ✔ Renda adequada
                  </div>
                )}

                {/* ALERTAS */}
                {item.debug?.entrada.score < 80 && (
                  <div className="text-yellow-600">
                    ⚠ Entrada insuficiente
                  </div>
                )}

              </div>
            </div>

            {/* AÇÕES */}
            <div className="mt-3 flex gap-2">

              <button className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
                ℹ Ver detalhes
              </button>

              <a
                href="https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
                target="_blank"
                className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
              >
                🔗 Simular
              </a>

            </div>

          </div>

        </div>
      )
    })}

  </div>
)}
<div className="mt-10 flex flex-col gap-3">

<button
  onClick={() => {
    reset()
    setStep(1)
  }}
  className="bg-[#0f172a] text-white py-3 rounded-xl text-[15px] font-semibold"
>
  Nova análise
</button>

<div className="flex gap-3">

  <button
    onClick={salvarAnalise}
    className="flex-1 bg-gray-100 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
  >
    💾 Salvar
  </button>

  <button
    onClick={gerarPDF}
    className="flex-1 bg-gray-100 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
  >
    📄 PDF
  </button>

</div>

<button
  onClick={() => {
    if (!user?.id) return

    router.push(
      `/historico?user_id=${user.id}&email=${user.email}&name=${user.name}`
    )
  }}
  className="bg-gray-100 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
>
  Histórico
</button>

</div>
</div> {/* FECHA resultado-pdf */}

</div> {/* FECHA CONTAINER */}

</>
)
}
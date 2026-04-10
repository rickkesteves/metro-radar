"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/formatCurrency"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import IconBox from "@/components/IconBox"
import { useAnalysis } from "@/context/AnalysisContext"
import toast, { Toaster } from "react-hot-toast"
import { ExternalLink, FileText, BookOpen, Info } from "lucide-react"
import Lottie from "lottie-react"
import radarAnimation from "@/lotties/animabot.json"




export default function NovaAnalise() {
  function sugerirFaixaPorRenda(renda: number) {
    if (!renda) return null
  
    if (renda <= 3500) return "Até R$ 200.000"
    if (renda <= 8000) return "R$ 200.000 - R$ 350.000"
    if (renda <= 20000) return "R$ 350.000 - R$ 500.000"
    return "Acima de R$ 500.000"
  }
  function renderStars(nota: number, isMobile: boolean) {
    const base = nota / 2
  
    // 📱 MOBILE → sem meia estrela
    if (isMobile) {
      const estrelasCheias = Math.round(base)
      const vazias = 5 - estrelasCheias
  
      return "★".repeat(estrelasCheias) + "☆".repeat(vazias)
    }
  
    // 💻 DESKTOP → com meia estrela
    const estrelasCheias = Math.floor(base)
    const meia = base % 1 >= 0.5 ? 1 : 0
    const vazias = 5 - estrelasCheias - meia
  
    return (
      "★".repeat(estrelasCheias) +
      (meia ? "⯪" : "") +
      "☆".repeat(vazias)
    )
  }
  const [tipoFiltro, setTipoFiltro] = useState("todos")
  const [aba, setAba] = useState<"analise" | "historico">("analise")
  const [mensagemIndex, setMensagemIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [analiseId, setAnaliseId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
  
    checkMobile()
    window.addEventListener("resize", checkMobile)
  
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URL(window.location.href).searchParams
      const id = params.get("id")
      setAnaliseId(id)
    }
  }, [])
  
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

useEffect(() => {
  if (typeof window !== "undefined") {
    // 🚫 bloqueia acesso direto (fora do iframe do WordPress)
    if (window.top === window.self) {
      document.body.innerHTML = `
  <div style="
    display:flex;
    align-items:center;
    justify-content:center;
    height:100vh;
    font-family:system-ui;
    color:#0f172a;
    text-align:center;
    padding:20px;
    background:#f8fafc;
  ">
    <div style="max-width:320px;">

      <a href="https://metrosquare.com.br/assinar/" style="display:inline-block; margin-bottom:20px;">
        <img 
          src="https://metrosquare.com.br/wp-content/uploads/2025/08/Logo-Principal.svg" 
          alt="Metro Square"
          style="height:40px; opacity:0.9;"
        />
      </a>

      <h1 style="font-size:20px; margin-bottom:10px;">
        Acesso restrito
      </h1>

      <p style="color:#64748b; font-size:14px; margin-bottom:20px;">
        Esta ferramenta está disponível apenas para assinantes da Metro Square.
      </p>

      <a 
        href="https://metrosquare.com.br/assinar/"
        style="
          display:inline-block;
          background:#0f172a;
          color:#fff;
          padding:12px 18px;
          border-radius:10px;
          text-decoration:none;
          font-size:14px;
          font-weight:500;
        "
      >
        Assinar agora
      </a>

    </div>
  </div>
`
    }
  }
}, [])

useEffect(() => {
  if (user?.id) {
    window.history.replaceState({}, "", window.location.pathname)
  }
}, [user])

useEffect(() => {
  document.addEventListener("contextmenu", (e) => e.preventDefault())
}, [])
  const [bairrosLista, setBairrosLista] = useState<string[]>([])
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(0)
  const [showTop10, setShowTop10] = useState(false)
  const [showOutros, setShowOutros] = useState(false)
  const [empreendimentos, setEmpreendimentos] = useState<any[]>([])
  const [empreendimentosSalvos, setEmpreendimentosSalvos] = useState<any[]>([])

  const router = useRouter()
  const { data, setData, reset } = useAnalysis()
  useEffect(() => {
    if (!data.urgencia) {
      setData({ urgencia: "12" })
    }
  }, [data.urgencia]) 
  useEffect(() => {
    if (!data.renda) return
  
    const rendaNumero = Number(
      String(data.renda)
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "")
    )
  
    if (!rendaNumero) return
  
    const faixaSugerida = sugerirFaixaPorRenda(rendaNumero)
  
    // ⚠️ NÃO sobrescreve se usuário já escolheu
    if (faixaSugerida && !data.precoManual) {
      setData({
        preco: faixaSugerida,
        precoManual: false
      })
    }
  }, [data.renda])

  const step1Disabled = !data.nome || !data.renda || !data.urgencia
  const step3Disabled = !data.tipo
  useEffect(() => {
    if (!step1Disabled) {
      setReady(true)
  
      setTimeout(() => {
        setReady(false)
      }, 2000)
    }
  }, [step1Disabled])

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
  
    const baseLista = empreendimentosSalvos.length
      ? empreendimentosSalvos
      : empreendimentos
    
    const ordenados = [...baseLista].sort((a, b) => b.score - a.score)

    const listaFiltrada =
      tipoSelecionado === "todos"
        ? ordenados
        : ordenados.filter(
          e =>
            String(e.tipo || "").toLowerCase().trim() ===
            String(tipoSelecionado || "").toLowerCase().trim()
          )
    const top3 = listaFiltrada.slice(0, 3)
  
    
    const html = `
<html>
<head>
  <title>Metro Radar</title>

  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 24px 0;
      background: #ffffff;
      color: #0f172a;
    }

    h1 {
      font-size: 22px;
      margin-bottom: 4px;
    }

    h2 {
      font-size: 14px;
      margin-top: 32px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    .sub {
      color: #6b7280;
      font-size: 14px;
    }
    
    .cliente {
      margin-top: 6px;
      font-size: 13px;
      color: #9ca3af;
    }

    .wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .header {
      width: 50%;
      max-width: 480px;
      margin-bottom: 16px;
    }

    .lista-outros {
      width: 50%;
      max-width: 600px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      justify-items: center;
    }

    .card {
      width: 50%; /* 🔥 EXATAMENTE O QUE VOCÊ PEDIU */
      max-width: 480px; /* evita ficar gigante em tela grande */
      background: white;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      margin: 0 auto 24px;
    }

    .top {
      border: 2px solid #22c55e;
    }

    .overlay {
      background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
    }

    .container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center; /* 🔥 centraliza tudo */
    }
    
    .img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-bottom: 1px solid #e5e7eb;
    }

    .content {
      padding: 16px;
    }

    .title {
      font-weight: 600;
      font-size: 18px;
    }

    .bairro {
      color: #6b7280;
      font-size: 13px;
      margin-bottom: 6px;
    }

    .top {
      border: 2px solid #22c55e;
      box-shadow: 0 8px 24px rgba(34,197,94,0.15);
    }

    .badge {
      display: inline-block;
      background: #0f172a;
      color: white;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      margin-top: 6px;
    }

    .ok { color: #16a34a; font-size: 13px; }
    .warn { color: #f59e0b; font-size: 13px; }
    .bad { color: #ef4444; font-size: 13px; }

    .outro {
      padding: 12px;
      border-radius: 14px;
      background: #f9fafb;
      width: 100%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }

    .outro-title {
      font-weight: 600;
      font-size: 14px;
      line-height: 1.2;
      color: #0f172a;
    }

    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    }
  </style>
</head>

<body>

  <div class="wrapper">

  <!-- HEADER -->
  <div class="header">
    <h1>Seu ranking personalizado</h1>
    <p class="sub">Baseado no perfil financeiro e preferências</p>
    <p class="cliente">Cliente: ${data.nome || "Não informado"}</p>
  </div>
  
  <!-- TOP 3 -->
  ${top3.map((item, i) => `

    <div class="card ${i === 0 ? "top" : ""}">

      <img 
        class="img" 
        src="${item.imagem || "https://via.placeholder.com/400"}"
        onerror="this.src='https://via.placeholder.com/400'"
      />

      <div class="content">

        <div style="margin-bottom:8px;">

  <div class="title">
    ${item.nome}
  </div>

  <div class="bairro">
    ${item.bairro}
  </div>

  <div class="badge">
    ${item.score || 0}%
  </div>

</div>

        <div style="margin-top:10px; line-height:1.6;">

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
       
        </div>

      </div>

    </div>

  `).join("")}

  <!-- OUTROS -->
  ${listaFiltrada.length > 3 ? `
<div class="header">
  <h2>Outras oportunidades</h2>
</div>
<div class="lista-outros">
    ${listaFiltrada.slice(3, 10).map((item, i) => `
      <div class="outro">

  <div style="display:flex; justify-content:space-between; align-items:center;">
    
    <div>
      <div class="outro-title">#${i + 4} ${item.nome}</div>
      <div class="bairro">${item.bairro}</div>
    </div>

    <div class="badge">${item.score}%</div>

  </div>

</div>
    `).join("")}
    </div>
  ` : ""}

  <!-- FOOTER -->
  <div class="footer">
    Relatório gerado por Metro Radar • ${new Date().toLocaleDateString()}
  </div>
  </div> <!-- wrapper -->

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
    if (!analiseId) return
  
    async function buscar() {
      const { data } = await supabase
        .from("analises")
        .select("*")
        .eq("id", analiseId)
        .single()
  
      if (!data) return
  
      // 🔥 1. carrega empreendimentos salvos
      if (data.resultado) {
        const listaCompleta = [
          ...(data.resultado.top3 || []),
          ...(data.resultado.outros || [])
        ]
      
        setEmpreendimentosSalvos(listaCompleta)
      }
  
      // 🔥 2. carrega dados do cliente (ESSENCIAL)
      setData({
        nome: data.nome,
        renda: data.renda,
        urgencia: data.urgencia,
        bairros: data.bairros || [],
        tipo: data.tipo,
        preco: data.preco
      })
  
      // 🔥 3. vai direto pro resultado
      setStep(5)
    }
  
    buscar()
  }, [analiseId])

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
  
      function scoreRenda(rendaCliente: number, rendaMinima: number) {
        if (!rendaMinima) return 100
      
        const ratio = rendaCliente / rendaMinima
      
        if (ratio >= 1) return 100   // passou → ok
        if (ratio >= 0.8) return 60  // quase
        return 20                    // fora
      }
  
      function scoreEntrada(e: number, min: number) {
        if (!min) return 0
      
        const indice = e / min
      
        if (indice >= 1) return 100
        if (indice >= 0.7) return 80
        if (indice >= 0.4) return 60
        if (indice >= 0.2) return 40
        return 20
      }
        
      function scoreLocal(bairros: string[], bairro: string) {
        if (!bairros || bairros.length === 0) return 70 // 🔥 neutro
      
        return bairros.includes(bairro) ? 100 : 40
      }
  
      function scoreTipo(t1: string, t2: string) {
        const a = String(t1 || "").toLowerCase().trim()
        const b = String(t2 || "").toLowerCase().trim()
      
        if (!a || !b) return 0
      
        if (a === b) return 100
      
        // 🔥 penalidade (mas não elimina)
        return 40
      }
  
      function scorePreco(faixa: string, preco: number, renda: number) {
        if (!faixa) return 100
        if (!preco) return 0
      
        const limite =
          faixa === "Até R$ 200.000" ? 200000 :
          faixa === "R$ 200.000 - R$ 350.000" ? 350000 :
          faixa === "R$ 350.000 - R$ 500.000" ? 500000 :
          faixa === "Acima de R$ 500.000" ? 9999999 : 0
      
        // 🔥 cliente com alta renda
        if (renda >= 15000) {
          const ratio = preco / limite
        
          if (ratio <= 1) return 100          // dentro do esperado
          if (ratio <= 1.3) return 95         // leve upgrade
          if (ratio <= 1.6) return 85         // upgrade ok
          if (ratio <= 2.0) return 70         // já mais distante
          return 40                           // fora da realidade
        }
      
        // 🔹 cliente padrão
        if (preco <= limite) return 100
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
        if (!u || u === "none") return 999
        return Number(u)
      }
  
      function scoreUrgencia(meses: number) {
        if (meses <= 3) return 100
        if (meses <= 6) return 90
        if (meses <= 12) return 80
        if (meses <= 24) return 70
        return 60
      }
  
      const cliente = {
        renda: toNumber(data.renda),
        bairros: data.bairros || [],
        tipo: data.tipo,
        preco: data.preco,
        urgencia: data.urgencia
      }
  

      function entradaEstimada(valorImovel: number) {
        return valorImovel * 0.15 // 🔥 pode ajustar (10%–20%)
      }
      
        const calculados = lista.map((e) => {
        const noteMetro = Math.round(
          (
            (Number(e.densidade) || 0) +
            (Number(e.area) || 0) +
            (Number(e.localizacao) || 0)
          ) / 3 * 2 * 10
        ) / 10
        const valorImovel = toNumber(e.preco)
        const entradaCalc = entradaEstimada(valorImovel)
        const sRenda = scoreRenda(cliente.renda, e.renda_minima)
        const sLocal = scoreLocal(cliente.bairros || [], e.bairro || "")
        const sTipo = scoreTipo(cliente.tipo || "", e.tipo || "")                
        const sPreco = scorePreco(
          cliente.preco || "",
          valorImovel,
          cliente.renda
        )
        const mesesEntrega = mesesAteEntrega(e.entrega)
        const sUrg = scoreUrgencia(mesesEntrega)
        const base =
          sPreco * 0.35 +
          sTipo * 0.25 +
          sLocal * 0.20 +
          sUrg * 0.10 +
          sRenda * 0.10
        const variacao = (Math.random() - 0.5) * 4 // -2 a +2
        let final = base * 0.80 + sUrg * 0.10 + variacao

// 🎯 AJUSTE INTELIGENTE DE RENDA (SUBSTITUI O BLOQUEIO DURO)
const rendaMin = e.renda_minima || 0
const rendaCli = cliente.renda || 0

if (rendaMin > 0) {
  const ratio = rendaCli / rendaMin

  if (ratio < 0.3) {
    final = final * 0.1   // extremamente fora
  } else if (ratio < 0.5) {
    final = final * 0.25  // muito abaixo
  } else if (ratio < 0.7) {
    final = final * 0.5   // abaixo, mas possível
  } else if (ratio < 1) {
    final = final * 0.75  // quase lá
  }
}

final = Math.max(0, Math.min(100, final))
          
      
        return {
          ...e,
          score: Math.round(final),
          noteMetro,
          debug: {
            renda: {
              informada: cliente.renda,
              ideal: e.renda_minima,
              score: Math.round(sRenda)
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
      outros: empreendimentos.slice(3, 20) // 🔥 aqui está o segredo
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
  if (step === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-14 text-center">
  
  <div className="relative flex justify-center mb-6">

{/* GLOW */}
<div className="absolute w-52 h-52 bg-gradient-to-br from-blue-200 to-indigo-200 blur-3xl rounded-full opacity-50 animate-pulse" />

{/* ROBÔ */}
<Lottie
  animationData={radarAnimation}
  className="w-40 h-40 relative z-10"
/>

</div>

  <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mb-6" />

  
  <div className="flex flex-col items-center gap-1">

<h1 className="text-2xl font-semibold">
  Metro Radar
</h1>

<div className="flex items-center gap-2 text-xs text-gray-400">

  <span className="bg-yellow-100 text-yellow-700 px-2 py-[2px] rounded-full font-medium">
    Beta
  </span>

  <span>por Metro Square</span>

</div>

</div>
  
        <p className="text-[15px] text-gray-500 mt-3 leading-relaxed">
          O melhor imóvel para você, sem perder tempo.
        </p>
    
        <p className="text-xs text-gray-400 mt-6">
          ⚡ Resultado em segundos
        </p>

        <button
          onClick={() => setStep(1)}
          className="mt-10 w-full bg-[#0f172a] text-white py-3 rounded-xl font-semibold 
          hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md"
        >
          Ver Oportunidades
        </button>
  
      </div>
    )
  }



  // ======================
  // STEP 1
  // ======================
  if (step === 1) {
    const urgenciaValue = data.urgencia || "12"
    return (
      <div className="max-w-md mx-auto px-4 py-6">
  
        <div className="text-center mb-10">
          <IconBox src="https://metrosquare.com.br/wp-content/uploads/2026/03/radar-1.svg" />
  
          <h1 className="text-[26px] font-semibold tracking-tight text-[#0f172a]">
            Vamos começar pelo seu perfil
          </h1>
  
          <p className="text-[15px] text-gray-500">
            Encontre os lançamentos ideais para você
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
            { label: "Nome do cliente", key: "nome", placeholder: "Digite o nome" },
            { label: "Renda familiar mensal", key: "renda" },
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
  
  inputMode={item.key !== "nome" ? "numeric" : "text"}
  pattern={item.key !== "nome" ? "[0-9]*" : undefined}

  className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[15px] text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:bg-white transition"
/>
            </div>
          ))}
  
         {/* URGÊNCIA SLIDER */}
<div>
  <label className="text-[13px] font-medium text-gray-500 block mb-2">
    Urgência
  </label>

  <div className="mt-4">

    {/* LABEL DINÂMICO */}
    <div className="text-center text-sm text-gray-600 mb-2">
      {urgenciaValue === "none"
        ? "Sem urgência"
        : `Até ${urgenciaValue} meses`}
    </div>

    {/* SLIDER */}
    <input
      type="range"
      min={6}
      max={36}
      step={6}
      value={urgenciaValue === "none" ? 36 : Number(urgenciaValue)}
      onChange={(e) =>
        setData({ urgencia: String(e.target.value) })
      }
      className="w-full accent-[#0f172a]"
    />

    {/* MARCADORES */}
    <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
      <span>6</span>
      <span>12</span>
      <span>18</span>
      <span>24</span>
      <span>30</span>
      <span>36</span>
    </div>

    {/* BOTÃO SEM URGÊNCIA */}
    <button
      onClick={() => setData({ urgencia: "none" })}
      className={`mt-3 w-full py-2 rounded-lg text-sm border transition
        ${
          data.urgencia === "none"
            ? "bg-[#0f172a] text-white border-[#0f172a]"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        }
      `}
    >
      Sem urgência
    </button>

  </div>
</div>
  
          {/* BOTÕES */}
          <div className="mt-6">
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-2 shadow-lg">
            {ready && (
  <div className="mt-3 text-center text-xs text-green-600 animate-fade-in">
    ✨ Análise pronta — pode continuar
  </div>
)}
              <div className="grid grid-cols-2 gap-3"></div>
              
              <button
  onClick={() => {
    if (user?.id) {
      router.push(`/historico?user_id=${user.id}`)
    }
  }}
              className="w-full py-3 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Ver Histórico
            </button>
  
            <button
              disabled={step1Disabled}
              onClick={() => setStep(2)}
              className={`w-full py-3 rounded-xl text-[15px] font-semibold transition-all duration-300 ${
                step1Disabled
                  ? "bg-gray-200 text-gray-400"
                  : "bg-[#0f172a] text-white shadow-md scale-[1.02] animate-[pulse_0.6s_ease]"
              }`}
              
            >
              Continuar
            </button>
          </div>
  
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
            Tem algum bairro que você gostaria de priorizar?
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
    <span>{b}</span>

    <button
      onClick={() =>
        setData({
          bairros: (data.bairros || []).filter((item) => item !== b),
        })
      }
      className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-200 transition hover:scale-110 active:scale-96"
    >
      ✕
    </button>
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
                  : "bg-[#0f172a] text-white hover:scale-[1.02] active:scale-[0.96]"
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
  Tipo de imóvel
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
          {data.tipo && (
  <div className="mt-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg px-3 py-2 text-center transition-all duration-300">
    ✔ Priorizando {data.tipo.toLowerCase()}
  </div>
)}
  
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
                onClick={() =>
                  setData({
                    preco: f,
                    precoManual: true
                  })
                }
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
          {data.preco && (
  <p className="text-xs text-gray-400 mt-2">
    💡 Faixa sugerida com base no seu perfil
  </p>
)}
  
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
              className="w-1/2 bg-[#0f172a] text-white py-3 rounded-xl text-[15px] font-semibold transition hover:scale-[1.02] active:scale-[0.96]"
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
      "Cruzando dados de renda com o mercado...",
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
const baseLista = empreendimentosSalvos.length
  ? empreendimentosSalvos
  : empreendimentos

const ordenados = [...baseLista].sort((a, b) => b.score - a.score)
const listaFiltrada =
  tipoFiltro === "todos"
    ? ordenados
    : ordenados.filter(
        (e) =>
          String(e.tipo || "").toLowerCase().trim() ===
          String(tipoFiltro).toLowerCase().trim()
      )

// 🔥 3. Detecta se tem melhor fora
const melhorGeral = ordenados[0]

const temMelhorFora =
  melhorGeral &&
  String(melhorGeral.tipo || "").toLowerCase().trim() !==
  String(data.tipo || "").toLowerCase().trim()
  
let top3 = listaFiltrada.slice(0, 3)

// 🔥 fallback se não tiver nada no filtro
  if (top3.length === 0) {
    top3 = ordenados.slice(0, 3)
  }

const doTipo = ordenados.filter(
  (e) =>
    String(e.tipo || "").toLowerCase().trim() ===
    String(data.tipo || "").toLowerCase().trim()
  )
  
const jaTemTipo = top3.some(
  (e) =>
    String(e.tipo || "").toLowerCase().trim() ===
    String(data.tipo || "").toLowerCase().trim()
  )
  
if (!jaTemTipo && doTipo.length > 0) {
  top3[2] = doTipo[0]
}
  const top10 = listaFiltrada.slice(3, 10)
  const qtdBoas = ordenados.filter(e => e.score >= 70).length
  const listaExibida = listaFiltrada
        
    return (
      <>
      <Toaster position="bottom-center"
  toastOptions={{
    style: {
      marginTop: "60px",
    },
  }}
/>
      <div className="max-w-md mx-auto px-4 py-10 bg-[#f8fafc] min-h-screen">
  
        {/* BOTÕES */}
        
        <div className="flex gap-2 mb-6 justify-center">

<button
  onClick={() => setAba("analise")}


  className={`px-4 py-2 rounded-full text-sm font-medium transition
    ${aba === "analise"
      ? "bg-[#0f172a] text-white"
      : "bg-gray-100 text-gray-600"}
  `}
>
  Análise do Cliente
</button>

<button
  type="button"
  onClick={() => {
    if (user?.id) {
      router.push(`/historico?user_id=${user.id}`)
    } else {
      alert("Usuário não identificado")
    }
  }}
  className={`px-4 py-2 rounded-full text-sm font-medium transition
    ${aba === "historico"
      ? "bg-[#0f172a] text-white"
      : "bg-gray-100 text-gray-600"}
  `}
>
  Histórico
</button>

</div>
        <div id="resultado-pdf">

{aba === "analise" && (
  <>

  {user?.name && (
    <p className="text-sm text-gray-500 mb-1">
      Olá, {user.name} 👋
    </p>
  )}

  <div className="text-center mb-10">

  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#0f172a]/5 flex items-center justify-center">
      <img
        src="https://metrosquare.com.br/wp-content/uploads/2026/03/radar-1.svg"
        className="w-6 h-6 invert"
      />
    </div>

    <h1 className="text-[26px] font-semibold tracking-tight text-[#0f172a]">
      Seu ranking personalizado
    </h1>

    <p className="text-[15px] text-gray-500">
      Selecionamos os melhores imóveis para o seu perfil
    </p>

  </div>
  <p className="text-xs text-gray-500 mb-2 font-medium">
  Visualizar por tipo
</p>

{/* TODOS separado */}
<button
  onClick={() => setTipoFiltro("todos")}
  className={`w-full mb-3 px-4 py-2 rounded-full text-sm font-medium transition-all
    ${tipoFiltro === "todos"
      ? "bg-[#0f172a] text-white shadow-md"
      : "bg-gray-100 text-gray-700"
    }
  `}
>
  Todos
</button>

{/* OUTROS TIPOS */}
<div className="grid grid-cols-2 gap-2">
  {["Casa", "Apartamento", "Misto", "Lote"].map((t) => {

    const ativo = tipoFiltro === t

    return (
      <button
        key={t}
        onClick={() => setTipoFiltro(t)}
        className={`px-4 py-2 rounded-full text-sm font-medium text-center transition-all
          ${ativo
            ? "bg-[#0f172a] text-white shadow-md"
            : "bg-gray-100 text-gray-700"
          }
        `}
      >
        {t}
      </button>
    )
  })}
</div>
{tipoFiltro !== "todos" && (
  <p className="text-xs text-gray-500 mb-4">
    Mostrando imóveis do tipo <span className="font-medium">{tipoFiltro}</span>
  </p>
)}
  <div className="mb-6 text-sm">

  {temMelhorFora ? (

    // 🔥 PRIORIDADE MÁXIMA
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-yellow-800">
      ⚠ 💡 Existem imóveis com melhor pontuação em outros tipos — vale conferir 👇
    </div>

  ) : qtdBoas >= 10 ? (

    <p className="text-gray-500">
      🔥 Encontramos várias oportunidades ideais para você
    </p>

  ) : qtdBoas >= 5 ? (

    <p className="text-gray-500">
      👍 Boas opções disponíveis
    </p>

) : qtdBoas > 0 ? (

  <p className="text-gray-500">
    Encontramos {qtdBoas} boas opções dentro do seu perfil 👇
  </p>

) : (

    <p className="text-gray-500">
      Com pequenos ajustes, você pode acessar boas oportunidades 👇
    </p>

  )}

</div>
{!ordenados.some(
  (e) =>
    String(e.tipo || "").toLowerCase().trim() ===
    String(data.tipo || "").toLowerCase().trim()
) && (
  <div className="p-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 text-sm mb-4">
    😕 Não encontramos muitas opções exatamente no tipo escolhido, 
    mas selecionamos as melhores oportunidades para seu perfil 👇
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
  className={`bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 overflow-hidden
          ${i === 0 ? "border border-green-200 shadow-[0_0_0_1px_rgba(34,197,94,0.15)]" : "border-gray-200 hover:shadow-md"}
          `}
        >
    {/* IMAGEM */}
    <div className="relative">

      <img
        src={item.imagem || "https://via.placeholder.com/400x300"}
        className="h-44 w-full object-cover"
      />

    {/* BADGE % */}
    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
      {item.score || 0}%
    </div>

    </div>

    <div className="p-5">

      {/* HEADER */}
      <div className="flex justify-between items-start gap-3">

  {/* ESQUERDA */}
  <div className="flex-1 min-w-0">
    <h3 className="font-semibold text-[#0f172a] text-lg leading-tight line-clamp-2">
      {item.nome}
    </h3>
    <p className="text-sm text-gray-500">
      {item.bairro}
    </p>
    {String(item.tipo || "").toLowerCase().trim() ===
 String(data.tipo || "").toLowerCase().trim() && (
  <div className="text-xs text-green-600 font-semibold mt-1">
    ✔ Dentro do tipo desejado
  </div>
)}
  </div>

  {/* DIREITA */}
  <div className="flex flex-col items-end flex-shrink-0">
    
  <div className="text-yellow-500 text-lg mt-1 whitespace-nowrap leading-none tracking-tight" style={{ fontFamily: "system-ui" }}>
      {renderStars(Number(item.noteMetro), isMobile)}
    </div>

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
            ? "• Região não priorizada"
            : data.bairros.includes(item.bairro)
            ? "✔ Localização compatível"
            : "⚠ Localização diferente"}
        </div>

        

        {/* RENDA */}
        <div className="relative group">
          <div className={
            item.debug?.renda.score >= 85
              ? "text-green-600"
              : item.debug?.renda.score >= 65
              ? "text-yellow-600"
              : "text-red-600"
          }>
            {item.debug?.renda.score >= 80 ? (
              "✔ Dentro do perfil mínimo exigido"
              ) : item.debug?.renda.score >= 50 ? (
              "⚠ Pode exigir ajuste de renda ou maior entrada"
              ) : (
              "❌ Renda abaixo do mínimo ideal exigido para este imóvel"
              )}
                       

<div className="absolute hidden group-hover:block left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 bg-white text-gray-700 text-xs rounded-md px-3 py-2 shadow-md border border-gray-200 z-50 transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">

<div className="font-medium text-gray-900 mb-1">
  Renda ideal
</div>

<div>
  R$ {item.debug?.renda?.ideal || "—"}
</div>

</div>
              
            
          </div>
        </div>

        

        </div> {/* fecha INFOS */}
        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-100 !mt-6 !pt-4">

{/* SIMULAÇÃO */}
<a
  href="https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
  target="_blank"
  className="text-xs text-gray-400 hover:text-gray-600 transition text-center mt-1"
>
  Simulação →
</a>

{/* DETALHES */}
<button
  disabled={!item.url_wp}
  onClick={() => item.url_wp && window.open(item.url_wp, "_blank")}
  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm
    ${
      item.url_wp
        ? "bg-[#0f172a] text-white hover:scale-[1.02] active:scale-[0.97]"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }
  `}
>
  <Info size={16} />
  Detalhes
</button>

<div className="flex gap-2">

  {/* TABELA */}
  <button
  disabled={!item.tabela_url}
  onClick={() => item.tabela_url && window.open(item.tabela_url, "_blank")}
  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition
    ${
      item.tabela_url
        ? "border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-[1.02]"
        : "bg-gray-100 text-gray-400 cursor-not-allowed"
    }
  `}
>
  <FileText size={16} />
  Tabela
</button>

  {/* BOOK */}
  <button
  disabled={!item.book_url}
  onClick={() => item.book_url && window.open(item.book_url, "_blank")}
  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition
    ${
      item.book_url
        ? "border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-[1.02]"
        : "bg-gray-100 text-gray-400 cursor-not-allowed"
    }
  `}
>
  <BookOpen size={16} />
  Book
</button>

</div>

  

</div>


</div> {/* fecha p-5 */}

{/* BOTÃO */}


</div>

</div>

)
})}

</div> {/* FECHA GRID */}
{/* BOTÃO OUTROS TIPOS */}
{ordenados.length > 3 && (
  <button
    onClick={() => setShowOutros(!showOutros)}
    className="mb-6 bg-gray-100 px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition"
  >
    {showOutros
      ? "Ocultar outras opções"
      : temMelhorFora
      ? "🔥 Ver outras oportunidades"
      : "Ver outras opções de imóveis"}
  </button>
)}

{/* OUTROS TIPOS */}
{showOutros && (
  <div className="space-y-4 mb-6">

    {listaExibida.slice(3, 10).map((item, i) => {

      const tipoOk =
        String(data.tipo || "").toLowerCase().trim() ===
        String(item.tipo || "").toLowerCase().trim()

      return (
        <div
        key={i}
        className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
      >

          {/* IMAGEM */}
          <img
            src={item.imagem || "https://via.placeholder.com/120"}
            className="w-24 h-24 object-cover rounded-xl shadow-sm"
          />

          {/* CONTEÚDO */}
          <div className="flex-1 flex flex-col justify-between">

            {/* TOP */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                <div className="flex-1">

<p className="text-xs text-gray-400">
  #{i + 4}
</p>

<h3 className="font-semibold text-[#0f172a] leading-tight">
  {item.nome}
</h3>

<p className="text-sm text-gray-500">
  {item.bairro}
</p>

</div>
                  
                </div>

                <div className="bg-[#0f172a]/90 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
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
                {item.debug?.renda.score >= 85 && (
                  <div className="text-green-600">
                    ✔ Renda adequada
                  </div>
                )}

                
                

              </div>
            </div>

            {/* AÇÕES */}
            <div className="mt-3 flex gap-2">

  {/* DETALHES */}
  <button
    onClick={() => item.url_wp && window.open(item.url_wp, "_blank")}
    disabled={!item.url_wp}
    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200
      ${
        item.url_wp
          ? "bg-[#0f172a] text-white hover:scale-[1.02] active:scale-[0.97]"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
      }
    `}
  >
    <Info size={13} />
    Detalhes
  </button>

  {/* SIMULAR */}
  <a
    href="https://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso"
    target="_blank"
    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
  >
    <ExternalLink size={13} />
    Simular
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
  type="button"
  onClick={() => {
    if (user?.id) {
      router.push(`/historico?user_id=${user.id}`)
    } else {
      alert("Usuário não identificado")
    }
  }}
  className="bg-gray-100 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
>
  Histórico
</button>

</div>
</>
)}
</div> {/* FECHA resultado-pdf */}

</div> {/* FECHA CONTAINER */}
{aba === "historico" && (
  <div className="text-center py-10 text-gray-500">
    Histórico (vamos carregar aqui depois)
  </div>
)}

</>
)
}}
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"

export default function DetalheAnalise() {
  const { id } = useParams()
  const router = useRouter()

  const [analise, setAnalise] = useState<any>(null)

  useEffect(() => {
    if (id) buscarAnalise()
  }, [id])

  async function buscarAnalise() {
    const { data, error } = await supabase
      .from("analises")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao buscar análise:", error)
    } else {
      setAnalise(data)
    }
  }

  if (!analise) {
    return (
      <div className="p-6">
        <p>Carregando análise...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* HEADER */}
      <h1 className="text-xl font-semibold mb-6">
        Resultado da análise
      </h1>

      {/* AÇÕES */}
      <div className="flex gap-2 mb-6">
        <button className="bg-gray-100 px-3 py-2 rounded">📄 PDF</button>

        <button
          onClick={() => router.push("/nova-analise")}
          className="bg-black text-white px-3 py-2 rounded"
        >
          Nova Análise
        </button>

        <button
          onClick={() => router.push(`/historico?user_id=${analise.user_id}`)}
          className="bg-gray-100 px-3 py-2 rounded"
        >
          Histórico
        </button>
      </div>

      {/* DADOS */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-6">
        <p><strong>Nome:</strong> {analise.nome}</p>
        <p><strong>Renda:</strong> {analise.renda}</p>
        <p><strong>Entrada:</strong> {analise.entrada}</p>
        <p><strong>Urgência:</strong> {analise.urgencia}</p>
        <p><strong>Tipo:</strong> {analise.tipo}</p>

        <p>
          <strong>Bairros:</strong>{" "}
          {analise.bairros?.join(", ")}
        </p>
      </div>

      {/* TOP 3 */}
      {/* TOP 1 (DESTAQUE) */}
{(() => {
  const top1 = analise.resultado?.top3?.[0]
  if (!top1) return null

  return (
    <div className="mb-8">

      <p className="text-xs text-green-600 font-semibold mb-2">
       Recomendado para o seu perfil
      </p>

      <div
  onClick={() => {
    if (top1?.url_wp) {
      window.open(top1.url_wp, "_blank")
    }
  }}
  className="bg-white border border-green-300 shadow-[0_0_0_1px_rgba(34,197,94,0.15)] rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
>

        <img
          src={top1.imagem || "https://via.placeholder.com/400x300"}
          className="w-full h-52 object-cover"
        />

        <div className="p-5">

          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-lg text-[#0f172a]">
                {top1.nome}
              </h2>
              <p className="text-sm text-gray-500">
                {top1.bairro}
              </p>
            </div>

            <div className="bg-[#0f172a]/90 text-white text-[11px] px-3 py-1.5 rounded-full font-medium shadow-sm">
              {top1.score}%
            </div>
          </div>

        </div>

      </div>
    </div>
  )
})()}
{/* OUTROS TOP (2 e 3) */}
<div className="grid md:grid-cols-2 gap-4 mb-6">

  {analise.resultado?.top3?.slice(1).map((item: any, i: number) => (

    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">

      <p className="font-medium">{item.nome}</p>

      <p className="text-sm text-gray-500">
        {item.bairro}
      </p>

      <p className="text-sm text-green-600 mt-1">
        {item.score}%
      </p>

    </div>

  ))}

</div>

      {/* OUTROS */}
      <div className="space-y-3">
        {analise.resultado?.outros?.map((item: any, i: number) => (
          <div
            key={i}
            className="border rounded-xl p-4 flex justify-between"
          >

            <div>
              <p className="font-medium">
                {item.nome}
              </p>

              <p className="text-sm text-gray-500">
                {item.bairro}
              </p>
            </div>

            <p className="text-sm">
              Score: {item.score}
            </p>

          </div>
        ))}
      </div>

    </div>
  )
}
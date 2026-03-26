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
      <div className="bg-white border rounded-xl p-4 mb-6 space-y-2">
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
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {analise.resultado?.top3?.map((item: any, i: number) => (
          <div key={i} className="bg-white border rounded-xl p-4">

            <h3 className="font-medium">
              {item.nome}
            </h3>

            <p className="text-sm text-gray-500">
              {item.bairro}
            </p>

            <p className="text-sm text-green-600">
              Score: {item.score}
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
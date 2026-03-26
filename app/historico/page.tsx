"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Historico() {
  const [userId, setUserId] = useState<string | null>(null)
  const [analises, setAnalises] = useState<any[]>([])
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = new URLSearchParams(window.location.search).get("user_id")
      console.log("USER ID DA URL:", id) // 👈 AQUI
      setUserId(id)
    }
  }, [])
  useEffect(() => {
    if (!userId) return
  
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("analises")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
  
      if (error) {
        console.error(error)
      } else {
        setAnalises(data || [])
      }
    }
  
    fetchData()
  }, [userId])
  const router = useRouter()

   async function excluirAnalise(id: string) {
    const confirmar = confirm("Tem certeza que deseja excluir essa análise?")
  
    if (!confirmar) return
  
    const { error } = await supabase
      .from("analises")
      .delete()
      .eq("id", id)
  
    if (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir análise")
    } else {
      // remove da tela sem reload
      setAnalises((prev) => prev.filter((item) => item.id !== id))
    }
  }


  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-xl font-semibold mb-6">
        Histórico
      </h1>

      {analises.length === 0 && (
        <p className="text-gray-500">
          Nenhuma análise encontrada
        </p>
      )}

<div className="grid md:grid-cols-2 gap-6">

{analises.map((item) => {

  const top = item.resultado?.top3?.[0]

  return (
    <div
      key={item.id}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
    >

      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="font-semibold text-[#0f172a] text-lg">
            {item.nome || "Análise"}
          </h2>
          <p className="text-sm text-gray-500">
            {item.tipo || "-"}
          </p>
        </div>

        {/* SCORE */}
        <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full">
          {top?.score || 0}%
        </div>
      </div>

      {/* MELHOR OPÇÃO */}
      {top && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4">

          <p className="text-xs text-gray-500 mb-1">
            Melhor opção encontrada
          </p>

          <div className="font-medium text-[#0f172a]">
            {top.nome}
          </div>

          <div className="text-sm text-gray-500">
            {top.bairro}
          </div>

        </div>
      )}

      {/* INFO */}
      <div className="text-sm text-gray-500 space-y-1">
        <div>
          Bairros: {item.bairros?.join(", ") || "-"}
        </div>

        <div>
          Criado em:{" "}
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "-"}
        </div>
      </div>

      {/* AÇÕES */}
      <div className="flex gap-3 mt-4">

        <button
          onClick={() => router.push(`/historico/${item.id}`)}
          className="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Ver análise
        </button>

        <button
          onClick={() => excluirAnalise(item.id)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
        >
          Excluir
        </button>

      </div>

    </div>
  )
})}

</div>
</div>
  )
}
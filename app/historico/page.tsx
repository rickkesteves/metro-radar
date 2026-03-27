"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Historico() {
  const [userId, setUserId] = useState<string | null>(null)
  const [analises, setAnalises] = useState<any[]>([])
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URL(window.location.href).searchParams
      const id = params.get("user_id")
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
    <div className="max-w-2xl mx-auto rounded-3xl p-6">

      <h1 className="text-xl font-semibold mb-6">
        Histórico
      </h1>

      {analises.length === 0 && (
        <p className="text-gray-500">
          Nenhuma análise encontrada
        </p>
      )}

<div className="flex flex-col gap-4 relative">

{analises.map((item) => {

  const top = item.resultado?.top3?.[0]

  return (
    <div
      key={item.id}
      className="bg-white relative border min-h-[260px] border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      {/* DATA */}
  <p className="text-xs text-gray-400 mb-2">
    {item.created_at
      ? new Date(item.created_at).toLocaleDateString()
      : "-"}
  </p>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-2">

  <div>
    <h2 className="font-semibold text-[#0f172a] text-lg leading-tight">
      {item.nome || "Análise"}
    </h2>

    <p className="inline-block mt-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
    {item.tipo || "-"}
  </p>

  <p className="text-xs text-gray-400 mt-1">
    Baseado no seu perfil salvo
  </p>
</div>

 

</div>

      {/* MELHOR OPÇÃO */}
      {top && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-4">
  
        {/* IMAGEM */}
        <img
          src={top.imagem || "https://via.placeholder.com/400x200"}
          className="w-full h-32 object-cover transition duration-300 hover:scale-[1.03]"
        />
      {/* SCORE OVERLAY */}
  <div className="absolute top-2 right-2 bg-[#0f172a] text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md">
    ⭐ {top?.score || 0}%
  </div>
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-1">
            Melhor opção para você
          </p>
      
          <div className="font-semibold text-[#0f172a]">
            {top.nome}
          </div>
      
          <div className="text-sm text-gray-500">
            {top.bairro}
          </div>
        </div>
      
      </div>
      )}

      {/* INFO */}
      <div className="text-sm text-gray-500 space-y-1">
        <div>
          Bairros: {item.bairros?.join(", ") || "-"}
        </div>

        
      </div>

      {/* AÇÕES */}
      <div className="mt-4 flex flex-col gap-2">

      <button
  onClick={() => router.push(`/historico/${item.id}`)}
  className="w-full bg-[#0f172a] text-white py-3 rounded-xl text-sm font-semibold hover:scale-[1.02] active:scale-[0.97] hover:shadow-md transition-all"
>
  Abrir análise completa
</button>

<button
  onClick={() => excluirAnalise(item.id)}
  className="w-full border border-gray-200 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
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
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Historico() {
  const [analises, setAnalises] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    buscarAnalises()
  }, [])

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

  async function buscarAnalises() {
    const { data, error } = await supabase
      .from("analises")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar:", error)
    } else {
      setAnalises(data || [])
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

      <div className="grid md:grid-cols-3 gap-4">
        {analises.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-4 space-y-2"
          >
            <h2 className="font-medium text-gray-900">
              {item.nome || "Sem nome"}
            </h2>

            <p className="text-sm text-gray-500">
              Tipo: {item.tipo || "-"}
            </p>

            <p className="text-sm text-gray-500">
              Bairros: {item.bairros?.join(", ") || "-"}
            </p>

            <p className="text-sm text-gray-500">
              Criado em:{" "}
              {new Date(item.created_at).toLocaleDateString()}
            </p>

            <div className="flex gap-3 mt-2">

<button
  onClick={() => router.push(`/historico/${item.id}`)}
  className="text-sm text-blue-600"
>
  Ver análise
</button>

<button
  onClick={() => excluirAnalise(item.id)}
  className="text-sm text-red-500"
>
  Excluir
</button>

</div>
          </div>
        ))}
      </div>

    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function AnaliseSalva() {
  const { id } = useParams()
  const [analise, setAnalise] = useState<any>(null)

  useEffect(() => {
    if (id) buscar()
  }, [id])

  async function buscar() {
    const { data } = await supabase
      .from("analises")
      .select("*")
      .eq("id", id)
      .single()

    setAnalise(data)
  }

  if (!analise) {
    return <div className="p-6">Carregando...</div>
  }

  const empreendimentos = analise.resultado?.top3 || []

  return (
    <div className="max-w-md mx-auto px-4 py-10">

      <h1 className="text-xl font-semibold mb-6">
        Seu ranking personalizado
      </h1>

      <div className="flex flex-col gap-4">

        {empreendimentos.map((item: any, i: number) => (

          <div
            key={i}
            className="bg-white rounded-2xl border p-4 shadow-sm"
          >

            <img
              src={item.imagem}
              className="w-full h-40 object-cover rounded-xl mb-3"
            />

            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">
                  {item.nome}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.bairro}
                </p>
              </div>

              <div className="bg-black text-white text-xs px-3 py-1 rounded-full">
                {item.score}%
              </div>
            </div>

          </div>

        ))}

      </div>

    </div>
  )
}
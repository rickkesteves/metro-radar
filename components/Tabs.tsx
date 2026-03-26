"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function Tabs() {
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("user_id")

    console.log("TABS USER ID:", id)

    setUserId(id)
  }, [])

  if (!userId) {
    return null // evita render quebrado
  }

  const tabs = [
    { name: "Análise do Cliente", href: `/nova-analise?user_id=${userId}` },
    { name: "Histórico", href: `/historico?user_id=${userId}` },
  ]

  return (
    <div className="flex gap-2 border-b border-gray-200 pb-2">
      {tabs.map((tab) => {
        const active = pathname === tab.href.split("?")[0]

        return (
          <a
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm rounded-lg transition ${
              active
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.name}
          </a>
        )
      })}
    </div>
  )
}
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Tabs() {
  const pathname = usePathname()

  const tabs = [
    { name: "Análise do Cliente", href: "/nova-analise" },
    { name: "Histórico", href: "/historico" },
  ]

  return (
    <div className="flex gap-2 border-b border-gray-200 pb-2">

      {tabs.map((tab) => {
        const active = pathname === tab.href

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm rounded-lg transition ${
              active
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.name}
          </Link>
        )
      })}

    </div>
  )
}
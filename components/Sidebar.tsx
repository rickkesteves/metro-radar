"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const menu = [
    { name: "Dashboard", href: "/" },
    { name: "Nova Análise", href: "/nova-analise" },
    { name: "Histórico", href: "/historico" },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-5 flex flex-col justify-between">

      <div>
        <h1 className="text-lg font-semibold mb-8 text-gray-900">
          Metro Radar
        </h1>

        <nav className="space-y-2">
          {menu.map((item) => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block p-3 rounded-lg text-sm transition ${
                  active
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="text-xs text-gray-400">
        Metro Radar v1
      </div>
    </aside>
  )
}
type Props = {
  nome: string
  score: number
  destaque?: string
  bairro: string
  tipo: string
  rendaMinima: number
  entradaMinima: number
  cliente: {
    tipo: string
    bairros: string[]
    renda: number
    entrada: number
  }
}

export default function PropertyCard({
  nome,
  score,
  destaque,
  bairro,
  tipo,
  rendaMinima,
  entradaMinima,
  cliente
}: Props) {

  // =========================
  // NORMALIZAÇÃO
  // =========================
  const tipoCliente = String(cliente.tipo || "").toLowerCase().trim()
  const tipoImovel = String(tipo || "").toLowerCase().trim()

  const tipoOk =
    tipoCliente === tipoImovel ||
    tipoCliente === "misto" ||
    tipoImovel === "misto"

  const localOk = cliente.bairros?.includes(bairro)

  const rendaOk = cliente.renda >= (rendaMinima || 0)
  const entradaOk = cliente.entrada >= (entradaMinima || 0)

  // =========================
  // UI
  // =========================
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">

      {destaque && (
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
          {destaque}
        </span>
      )}

      <h3 className="mt-2 font-medium text-gray-900">
        {nome}
      </h3>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1 text-gray-500">
          <span>Score</span>
          <span>{score}%</span>
        </div>

        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* =========================
          STATUS DINÂMICO
      ========================= */}
      <div className="mt-4 space-y-1 text-sm">

        <div className={localOk ? "text-green-600" : "text-yellow-600"}>
          {localOk ? "✔ Localização compatível" : "⚠ Localização não selecionada"}
        </div>

        <div className={tipoOk ? "text-green-600" : "text-yellow-600"}>
          {tipoOk ? "✔ Tipologia adequada" : "⚠ Tipo diferente"}
        </div>

        <div className={rendaOk ? "text-green-600" : "text-yellow-600"}>
          {rendaOk ? "✔ Renda adequada" : "⚠ Renda insuficiente"}
        </div>

        <div className={entradaOk ? "text-green-600" : "text-yellow-600"}>
          {entradaOk ? "✔ Entrada adequada" : "⚠ Entrada abaixo do ideal"}
        </div>

      </div>

      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
        Ver análise completa
      </button>
    </div>
  )
}
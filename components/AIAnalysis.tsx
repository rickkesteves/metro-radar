export default function AIAnalysis({ texto }: { texto: string }) {
  return (
    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-slate-800 rounded-2xl p-5 mt-6">
      <p className="text-sm text-slate-300 leading-relaxed">
        {texto}
      </p>
    </div>
  )
}
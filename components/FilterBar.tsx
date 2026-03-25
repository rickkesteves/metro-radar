export default function FilterBar({
  neighborhoods,
  selectedNeighborhood,
  onNeighborhoodChange,
}: any) {
  return (
    <div className="flex gap-4">

      <select
        value={selectedNeighborhood}
        onChange={(e) => onNeighborhoodChange(e.target.value)}
        className="border rounded-lg px-3 py-2"
      >
        {neighborhoods.map((n: string) => (
          <option key={n}>{n}</option>
        ))}
      </select>

    </div>
  )
}
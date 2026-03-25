export default function IconBox({ src }: { src: string }) {
  return (
    <div className="w-16 h-16 bg-[#1E293B] rounded-2xl flex items-center justify-center mx-auto mb-4">
      <img
        src={src}
        className="w-8 h-8 brightness-0 invert"
      />
    </div>
  )
}
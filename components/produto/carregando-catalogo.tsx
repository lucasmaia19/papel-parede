export function CarregandoCatalogo({ titulo }: { titulo: string }) {
  return (
    <div className="container-loja flex flex-col gap-6 py-8 md:py-12" aria-busy="true">
      <h1 className="border-b border-border pb-6 text-3xl font-semibold md:text-4xl">{titulo}</h1>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="aspect-[4/5] animate-pulse rounded-md bg-muted" />
        ))}
      </ul>
    </div>
  )
}

import type { ComponentProps } from "react"

// Ícones de traço fino (1,4), no tom do texto. Desenhados aqui: o lucide não tem "pano" nem "teto".
function Icone({ children, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

/** Gota com brilhos: pode ser lavado */
export function IconeLavavel(props: ComponentProps<"svg">) {
  return (
    <Icone {...props}>
      <path d="M14 4.5c-3.6 5-7 9.3-7 13.6a7 7 0 0 0 14 0c0-4.3-3.4-8.6-7-13.6Z" />
      <path d="M10.6 18.6a3.6 3.6 0 0 0 2.6 3.2" />
      <path d="M24 5v4M22 7h4M26.5 13.5v2.6M25.2 14.8h2.6" />
    </Icone>
  )
}

/** Pano dobrado com gotinhas: limpeza com pano úmido */
export function IconePano(props: ComponentProps<"svg">) {
  return (
    <Icone {...props}>
      <path d="M5 15.5c3-1.4 6-1.4 9 0s6 1.4 9 0l3.5 8.5c-3 1.4-6 1.4-9 0s-6-1.4-9 0Z" />
      <path d="M8.6 20.6c2.4-.8 4.6-.6 6.8.4" />
      <path d="M12 5.5c-1 1.5-2 2.7-2 3.9a2 2 0 0 0 4 0c0-1.2-1-2.4-2-3.9ZM20 8.5c-.8 1.1-1.5 2-1.5 2.9a1.5 1.5 0 0 0 3 0c0-.9-.7-1.8-1.5-2.9Z" />
    </Icone>
  )
}

/** Chuveiro: vai no banheiro */
export function IconeBanheiro(props: ComponentProps<"svg">) {
  return (
    <Icone {...props}>
      <path d="M6 28V9a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
      <path d="M11.5 12.5h9a.5.5 0 0 1 .5.5 4.5 4.5 0 0 1-4.5 4.5h-1A4.5 4.5 0 0 1 11 13a.5.5 0 0 1 .5-.5Z" />
      <path d="M13.5 21v1.5M16 21.5v2M18.5 21v1.5M14.5 25.5v1M17.5 25.5v1" />
    </Icone>
  )
}

/** Canto da sala com o teto marcado e luminária: também no teto */
export function IconeTeto(props: ComponentProps<"svg">) {
  return (
    <Icone {...props}>
      <path d="M3.5 9.5 16 4l12.5 5.5" />
      <path d="M3.5 9.5V28M28.5 9.5V28M16 4v0" />
      <path d="M7 10.6 16 6.8l9 3.8" strokeDasharray="1.4 2.2" />
      <path d="M16 9v5" />
      <path d="M12.5 17.5a3.5 3.5 0 0 1 7 0Z" />
    </Icone>
  )
}

import Image from "next/image";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { width: 120, height: 22 },
  md: { width: 200, height: 36 },
  lg: { width: 300, height: 54 },
};

export function EnturLogo({ className = "", size = "md" }: Props) {
  const s = SIZES[size];

  return (
    <Image
      src="/logo-entur.png"
      alt="Entur — Escola de Negócios do Turismo"
      width={s.width}
      height={s.height}
      priority
      className={className}
    />
  );
}

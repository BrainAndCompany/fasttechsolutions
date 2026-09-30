import Image from "next/image";
import { BRAND } from "@/lib/branding";

interface LogoProps {
  /** White wordmark for dark / teal backgrounds. Default: colour on light. */
  reversed?: boolean;
  className?: string;
  priority?: boolean;
}

export function Logo({
  reversed = false,
  className = "h-8 w-auto sm:h-9",
  priority = false,
}: LogoProps) {
  const asset = reversed ? BRAND.logo.reversed : BRAND.logo.default;

  return (
    <Image
      src={asset.src}
      alt={BRAND.name}
      width={asset.width}
      height={asset.height}
      priority={priority}
      className={className}
    />
  );
}

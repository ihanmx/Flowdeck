import { useId } from "react";
import { cn } from "@/lib/cn";

const SIZES = { sm: 24, md: 32, lg: 40 } as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  iconOnly?: boolean;
  className?: string;
}

export function Logo({ size = "md", iconOnly = false, className }: LogoProps) {
  const id = useId(); // unique gradient ids so multiple logos never clash
  const h = SIZES[size];
  const gap = h * 0.14;
  const barW = (h - gap * 2) / 3;
  const fontSize = size === "sm" ? 16 : size === "md" ? 20 : 26;

  return (
    <div
      className={cn("flex items-center", className)}
      style={{ gap: h * 0.375 }}
    >
      <svg
        width={h}
        height={h}
        viewBox={`0 0 ${h} ${h}`}
        fill="none"
        aria-label="Flowdeck"
      >
        <defs>
          <linearGradient id={`${id}-t`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0" />
            <stop offset="40%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect
          x={0}
          y={h * 0.15}
          width={barW}
          height={h * 0.72}
          rx={barW * 0.35}
          fill={`url(#${id}-t)`}
        />
        <rect
          x={barW + gap}
          y={h * 0.28}
          width={barW}
          height={h * 0.56}
          rx={barW * 0.35}
          fill={`url(#${id}-t)`}
          opacity="0.85"
        />
        <rect
          x={(barW + gap) * 2}
          y={h * 0.42}
          width={barW}
          height={h * 0.43}
          rx={barW * 0.35}
          fill={`url(#${id}-t)`}
          opacity="0.7"
        />
        <rect
          x={barW * 0.1}
          y={h * 0.08}
          width={barW * 1.6}
          height={h * 0.22}
          rx={h * 0.05}
          fill={`url(#${id}-f)`}
          opacity="0.9"
        />
      </svg>
      {!iconOnly && (
        <span
          className="font-display font-semibold text-ink"
          style={{ fontSize, letterSpacing: "-0.03em", lineHeight: 1 }}
        >
          Flowdeck
        </span>
      )}
    </div>
  );
}

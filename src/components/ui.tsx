import { type ReactNode } from "react";

export function Eyebrow({
  children,
  color = "text-ink-dim",
}: {
  children: ReactNode;
  color?: string;
}): React.JSX.Element {
  return (
    <div
      className={`flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] ${color}`}
    >
      <span className="h-px w-[22px] bg-current opacity-60" />
      {children}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  accent?: "gold" | "teal";
  className?: string;
};

export function CtaButton({
  href,
  children,
  variant = "primary",
  accent = "gold",
  className = "",
}: ButtonProps): React.JSX.Element {
  const base =
    "group inline-flex items-center gap-2.5 rounded-sm px-7 py-[15px] text-[14.5px] font-semibold tracking-tight transition-transform duration-200 hover:-translate-y-0.5";

  const styles = {
    primary:
      accent === "gold"
        ? "bg-gold text-[#1B1508] hover:bg-[#cb9a44]"
        : "bg-teal text-white hover:bg-teal-light",
    ghost:
      accent === "gold"
        ? "border border-line-strong text-ink hover:border-ink-dim hover:bg-white/[0.03]"
        : "border border-teal/60 text-teal hover:bg-teal-soft",
  };

  return (
    <a href={href} className={`${base} ${styles[variant]} ${className}`}>
      {children}
      <span className="transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

export function Pill({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <span className="rounded-full border border-line-strong px-3 py-1.5 text-[12.5px] text-ink-dim">
      {children}
    </span>
  );
}

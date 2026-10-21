import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "quiet";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink shadow-[0_1px_0_rgb(0_0_0/0.15),0_10px_24px_-14px_var(--accent)] hover:-translate-y-px hover:shadow-[0_1px_0_rgb(0_0_0/0.15),0_14px_28px_-14px_var(--accent)] active:translate-y-0",
  secondary: "border border-rule-strong text-ink hover:border-ink hover:bg-paper-raised",
  quiet: "px-0 text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink",
};

export const buttonClass = (variant: Variant = "primary") =>
  `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color,border-color,text-decoration-color] duration-200 ease-out ${VARIANTS[variant]}`;

type Href = React.ComponentProps<typeof Link>["href"];

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: Href;
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonClass(variant)} ${className}`}>
      {children}
    </Link>
  );
}

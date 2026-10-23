import { Link } from "@/i18n/navigation";

export type ButtonVariant = "primary" | "secondary" | "text";

const BASE =
  "label inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 py-2 text-center no-underline select-none";

/** Hover and press invert ink and paper; disabled is a dashed border with no inversion. */
const VARIANTS: Record<ButtonVariant, { rest: string; inverted: string }> = {
  primary: {
    rest: "border-ink bg-ink text-paper hover:bg-paper hover:text-ink active:bg-paper active:text-ink",
    inverted: "border-ink bg-paper text-ink",
  },
  secondary: {
    rest: "border-ink bg-paper text-ink hover:bg-ink hover:text-paper active:bg-ink active:text-paper",
    inverted: "border-ink bg-ink text-paper",
  },
  text: {
    rest: "border-transparent px-1 underline decoration-2 underline-offset-4 hover:bg-ink hover:text-paper active:bg-ink active:text-paper",
    inverted: "border-transparent bg-ink px-1 text-paper underline decoration-2 underline-offset-4",
  },
};

const DISABLED =
  "disabled:cursor-not-allowed disabled:border-dashed disabled:border-ink disabled:bg-paper disabled:text-ink disabled:hover:bg-paper disabled:hover:text-ink";

/** `inverted` pins the hover look, so the styleguide can show it without a pointer. */
export const buttonClass = (variant: ButtonVariant = "primary", inverted = false) =>
  `${BASE} ${inverted ? VARIANTS[variant].inverted : VARIANTS[variant].rest} ${DISABLED}`;

type Href = React.ComponentProps<typeof Link>["href"];

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: Href;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonClass(variant)} ${className}`}>
      {children}
    </Link>
  );
}

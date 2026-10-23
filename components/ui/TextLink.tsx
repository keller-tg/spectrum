import { Link } from "@/i18n/navigation";
import { ExternalGlyph } from "./icons";

type Href = React.ComponentProps<typeof Link>["href"];

/**
 * Underlined at rest; a 2px rule draws in on hover. External links get a small
 * arrow. The underline sits on an inner span, so the anchor can be a 44px target.
 */
export function TextLink({
  href,
  children,
  className = "",
}: {
  href: Href;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`link-host ${className}`}>
      <span className="link">{children}</span>
    </Link>
  );
}

export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={`link-host ${className}`} rel="noreferrer">
      <span className="link">{children}</span>
      <ExternalGlyph />
    </a>
  );
}

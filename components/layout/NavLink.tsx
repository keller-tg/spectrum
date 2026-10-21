"use client";

import { Link, usePathname } from "@/i18n/navigation";

type Href = React.ComponentProps<typeof Link>["href"];

/** A nav link that marks itself current when the route is (inside) its target. */
export function NavLink({
  href,
  children,
  className,
}: {
  href: Href & string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { CheckGlyph, ExternalGlyph, RollingArrow } from "./icons";
import { Wipe } from "./Wipe";

export type ButtonVariant = "primary" | "secondary" | "text";
export type ButtonSize = "s" | "m" | "l";
export type ButtonStatus = "loading" | "success" | "error";
/** Pins a pointer state so the styleguide can show it without a pointer. */
export type PinnedState = "hover" | "active";

interface ButtonLook {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show the rolling arrow after the label. */
  arrow?: boolean;
  /** Keyboard hint such as "1", shown where a keyboard is likely. */
  keycap?: string;
  status?: ButtonStatus;
  /** Words for success or error ("Saved", "Failed, retry"); never colour. */
  statusLabel?: string;
  /** Spoken while loading; the visible label keeps its place. */
  loadingLabel?: string;
  state?: PinnedState;
  disabled?: boolean;
  children: ReactNode;
}

function Content({ arrow, keycap, status, statusLabel, children }: ButtonLook) {
  const showStatus = status === "success" || status === "error";
  return (
    <span className="btn-content inline-flex items-center gap-2.5">
      {keycap ? (
        <kbd className="keycap" aria-hidden="true">
          {keycap}
        </kbd>
      ) : null}
      {status === "success" ? <CheckGlyph className="btn-check" /> : null}
      <span className="btn-label">{showStatus ? statusLabel : children}</span>
      {arrow && !showStatus ? <RollingArrow /> : null}
    </span>
  );
}

/** The face, plus the shared wipe (not for the text variant, which underlines). */
function Faces(look: ButtonLook) {
  return (
    <>
      <span className="btn-face">
        <Content {...look} />
        {look.status === "loading" ? (
          <>
            <span className="btn-ticks" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {look.loadingLabel ? <span className="sr-only">{look.loadingLabel}</span> : null}
          </>
        ) : null}
      </span>
      {look.variant === "text" ? null : <Wipe />}
    </>
  );
}

function hostProps(look: ButtonLook, className = "") {
  return {
    className: `btn wipe-host ${className}`,
    "data-variant": look.variant ?? "primary",
    "data-size": look.size ?? "m",
    "data-state": look.state,
    "data-status": look.status,
    "aria-disabled": look.disabled ? true : undefined,
    "aria-busy": look.status === "loading" ? true : undefined,
  } as const;
}

type NativeButton = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled">;

/**
 * Button: primary (ink fill), secondary (paper fill, 1.5px frame) or text
 * (underline draws in). Sizes S 36 / M 44 / L 56px. Disabled uses
 * aria-disabled, so callers ignore clicks while it is set.
 */
export function Button({
  variant,
  size,
  arrow,
  keycap,
  status,
  statusLabel,
  loadingLabel,
  state,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonLook & NativeButton) {
  const look = {
    variant,
    size,
    arrow,
    keycap,
    status,
    statusLabel,
    loadingLabel,
    state,
    disabled,
    children,
  };
  return (
    <button type={type} {...rest} {...hostProps(look, className)}>
      <Faces {...look} />
    </button>
  );
}

type Href = React.ComponentProps<typeof Link>["href"];

/** A link that looks like a button (internal routes). */
export function ButtonLink({
  href,
  className,
  ...look
}: ButtonLook & { href: Href; className?: string }) {
  return (
    <Link href={href} {...hostProps(look, className)}>
      <Faces {...look} />
    </Link>
  );
}

/** A plain anchor in button form; external targets get the small arrow. */
export function ButtonAnchor({
  className,
  external,
  ...props
}: ButtonLook &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & { external?: boolean }) {
  const {
    variant,
    size,
    arrow,
    keycap,
    status,
    statusLabel,
    loadingLabel,
    state,
    disabled,
    children,
    ...rest
  } = props;
  const look = { variant, size, arrow, keycap, status, statusLabel, loadingLabel, state, disabled };
  const label = (
    <>
      {children}
      {external ? <ExternalGlyph /> : null}
    </>
  );
  return (
    <a {...rest} {...hostProps({ ...look, children: label }, className)}>
      <Faces {...look}>{label}</Faces>
    </a>
  );
}

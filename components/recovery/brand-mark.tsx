import Link from "next/link";

export function BrandMark({ linked = true }: { linked?: boolean }) {
  const mark = (
    <span className="brand-lockup" aria-label="Recovery Inventory home">
      <span className="brand-symbol" aria-hidden="true">
        <span>10</span>
        <i />
        <span>4</span>
      </span>
      <span className="brand-words">
        <strong>Recovery</strong>
        <span>Inventory</span>
      </span>
    </span>
  );

  return linked ? <Link href="/">{mark}</Link> : mark;
}

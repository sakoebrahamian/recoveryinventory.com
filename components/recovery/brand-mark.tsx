/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids a production client-router interception issue. */

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

  return linked ? <a href="/">{mark}</a> : mark;
}

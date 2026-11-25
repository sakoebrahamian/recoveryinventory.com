"use client";

let clearActivePreview: (() => void) | undefined;

export function openPrintPreview(className: string, title: string, onClose?: () => void) {
  clearActivePreview?.();
  const originalTitle = document.title;
  const root = document.documentElement;

  function clear() {
    if (clearActivePreview !== clear) return;
    clearActivePreview = undefined;
    window.removeEventListener("afterprint", restore);
    root.classList.remove(className);
    document.title = originalTitle;
  }

  function restore() {
    if (clearActivePreview !== clear) return;
    clear();
    onClose?.();
  }

  clearActivePreview = clear;
  root.classList.add(className);
  document.title = title;
  window.addEventListener("afterprint", restore, { once: true });
  try {
    window.print();
  } catch {
    restore();
  }
  return clear;
}

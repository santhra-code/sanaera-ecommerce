"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalFocus<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean
) {
  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const page = document.getElementById("main-content");
    const wasInert = page?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (page) page.inert = true;
    document.body.style.overflow = "hidden";

    const focusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    (focusable()[0] ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (page) page.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [active, ref]);
}
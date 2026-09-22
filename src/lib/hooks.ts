"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the resolved theme by watching the `data-theme` attribute the blocking
 * head script sets. Using the attribute rather than matchMedia keeps the 3D
 * palette in sync with an explicit toggle, not just the OS preference.
 */
export function useResolvedTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/**
 * Reduced-motion preference, live. The 3D scene uses this to stop auto-rotation
 * and packet animation entirely rather than just slowing them down.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * Fires once when the element first enters the viewport. Used to defer mounting
 * the WebGL canvas so three.js never lands in the initial page cost.
 */
export function useInView<T extends HTMLElement>(ref: React.RefObject<T | null>, rootMargin = "200px") {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, inView]);

  return inView;
}

"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Returns true only once it's safe to mount/start an expensive or distracting
 * subtree (e.g. an autoplaying motion sequence): after the browser goes idle
 * (so it never competes with LCP) and, if a `ref` is supplied, once that
 * element scrolls near the viewport.
 *
 * Below-fold instances pass a ref + rootMargin; above-fold instances omit the
 * ref and just wait for idle.
 */
export function useDeferredMount(options?: {
  ref?: RefObject<Element>;
  /** Idle deadline (ms) before mounting anyway. */
  timeout?: number;
  rootMargin?: string;
}): boolean {
  const { ref, timeout = 2000, rootMargin = "200px" } = options ?? {};
  const [ready, setReady] = useState(false);
  const idleDone = useRef(false);
  const inView = useRef(!ref);

  useEffect(() => {
    let cancelled = false;
    const settle = () => {
      if (!cancelled && idleDone.current && inView.current) setReady(true);
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = win.requestIdleCallback
      ? win.requestIdleCallback(
          () => {
            idleDone.current = true;
            settle();
          },
          { timeout },
        )
      : window.setTimeout(() => {
          idleDone.current = true;
          settle();
        }, 200);

    let observer: IntersectionObserver | undefined;
    const el = ref?.current;
    if (ref && el && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            inView.current = true;
            settle();
            observer?.disconnect();
          }
        },
        { rootMargin },
      );
      observer.observe(el);
    } else if (ref && !el) {
      // Ref given but not yet attached — don't deadlock; allow idle to mount.
      inView.current = true;
    }

    return () => {
      cancelled = true;
      if (win.cancelIdleCallback && typeof idleId === "number") {
        win.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId as unknown as number);
      }
      observer?.disconnect();
    };
  }, [ref, timeout, rootMargin]);

  return ready;
}

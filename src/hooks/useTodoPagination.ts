import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { APP_CONFIG } from "../config/app.config";

type Options<T> = {
  items: T[];
};

export function useTodoPagination<T>({ items }: Options<T>) {
  const PAGE_SIZE = APP_CONFIG.PAGE_SIZE;

  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- read page from URL ---------- */

  const rawPage = Number(searchParams.get("page") || 1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  // clamp page
  const page = Math.min(Math.max(rawPage, 1), totalPages);

  /* ---------- update page (sync URL) ---------- */

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  /* ---------- paged items ---------- */

  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page, PAGE_SIZE]);

  /* ---------- keyboard pagination (← →) ---------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        setPage(Math.max(page - 1, 1));
      }

      if (e.key === "ArrowRight") {
        setPage(Math.min(page + 1, totalPages));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [page, totalPages]);

  return {
    page,
    setPage,
    totalPages,
    pagedItems,
    nextPage: () => setPage(Math.min(page + 1, totalPages)),
    prevPage: () => setPage(Math.max(page - 1, 1)),
  };
}

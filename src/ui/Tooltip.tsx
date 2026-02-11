import { useCallback, useRef, useState } from "react";

type Props = {
  content: string;
  children: React.ReactNode;
  delay?: number;
};

type Position = "top" | "bottom";

export function Tooltip({ content, children, delay = 200 }: Props) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<Position>("top");

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const show = () => {
    timerRef.current = window.setTimeout(() => {
      setMounted(true);
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
    setMounted(false);
  };

  /**
   * ✅ Callback ref: đo tooltip layout đúng cách
   * Không dùng effect → không lint warning
   */
  const tooltipRef = useCallback((el: HTMLDivElement | null) => {
    if (!el || !wrapperRef.current) return;

    const tooltipRect = el.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();

    const spaceTop = wrapperRect.top;
    const spaceBottom = window.innerHeight - wrapperRect.bottom;

    const nextPosition: Position =
      spaceTop < tooltipRect.height + 8 && spaceBottom > tooltipRect.height + 8
        ? "bottom"
        : "top";

    // ❗ setState CHỈ khi khác
    setPosition((prev) => (prev !== nextPosition ? nextPosition : prev));
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}

      {mounted && (
        <div
          ref={tooltipRef}
          className={`
            absolute left-1/2 -translate-x-1/2
            z-50
            rounded-md bg-slate-800 px-3 py-2
            text-xs text-white
            transition-all duration-150
            ${visible ? "opacity-100" : "opacity-0"}

            ${
              position === "top"
                ? "-top-2 -translate-y-full"
                : "-bottom-2 translate-y-full"
            }

            /* WIDTH CONTROL */
            max-w-[calc(100vw-2rem)]
            sm:max-w-sm

            /* MULTI-LINE */
            whitespace-normal break-words
            text-center
          `}
        >
          {content}

          {/* Arrow */}
          <div
            className={`
              absolute left-1/2 -translate-x-1/2
              w-0 h-0
              border-l-4 border-r-4
              ${
                position === "top"
                  ? "top-full border-t-4 border-t-slate-800 border-l-transparent border-r-transparent"
                  : "bottom-full border-b-4 border-b-slate-800 border-l-transparent border-r-transparent"
              }
            `}
          />
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RefreshCcw, SlidersHorizontal, Smartphone, X } from "lucide-react";
import type { MotionStatus, TiltSource } from "@/lib/fold/use-tilt";
import { MAX_TILT_DEGREES } from "@/lib/fold/params";

type FoldControlsProps = {
  open: boolean;
  onToggle: () => void;
  degrees: number;
  source: TiltSource;
  motionStatus: MotionStatus;
  motionSupported: boolean;
  onManual: (value: number) => void;
  onAuto: () => void;
  onMotion: () => void;
  onRecalibrate: () => void;
};

const panelMotion = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: 8, filter: "blur(4px)" },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

export function FoldControls({
  open,
  onToggle,
  degrees,
  source,
  motionStatus,
  motionSupported,
  onManual,
  onAuto,
  onMotion,
  onRecalibrate,
}: FoldControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="pointer-events-none absolute top-[max(12px,env(safe-area-inset-top))] left-[max(12px,env(safe-area-inset-left))]">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-fg/12 bg-ink/78 px-3 py-1.5 text-xs font-medium text-frost shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <span className="tracking-tight">Fold Glass</span>
          <span className="h-1 w-1 rounded-full bg-steel" />
          <span className="tabular-nums text-frost/70">{degrees.toFixed(1)}°</span>
        </div>
      </div>

      <div className="pointer-events-auto absolute right-[max(12px,env(safe-area-inset-right))] bottom-[max(12px,env(safe-area-inset-bottom))] flex w-[min(280px,calc(100vw-24px))] flex-col items-end gap-2.5">
        <AnimatePresence>
          {open ? (
            <motion.div
              key="panel"
              {...panelMotion}
              className="w-full rounded-[20px] border border-fg/12 bg-ink/88 p-4 text-frost shadow-[0_16px_40px_rgba(0,0,0,0.38)] backdrop-blur-md"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <span className="tabular-nums">{degrees.toFixed(1)}</span>
                <span className="text-frost/55">°</span>
                <span className="ml-auto text-xs font-medium capitalize text-steel">
                  {source === "motion"
                    ? "giroscopio"
                    : source === "auto"
                      ? "auto"
                      : "manual"}
                </span>
                <button
                  type="button"
                  onClick={onRecalibrate}
                  disabled={source !== "motion"}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-frost/80 transition-colors hover:text-frost disabled:text-frost/30"
                >
                  <RefreshCcw className="size-3.5" strokeWidth={2} />
                  Recalibrar
                </button>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <ModeButton active={source === "auto"} onClick={onAuto}>
                  Auto
                </ModeButton>
                <ModeButton
                  active={source === "motion"}
                  onClick={onMotion}
                  disabled={!motionSupported && motionStatus !== "live"}
                >
                  <Smartphone className="size-3.5" strokeWidth={2} />
                  Giroscopio
                </ModeButton>
              </div>

              <label className="block">
                <span className="sr-only">Inclinación</span>
                <input
                  type="range"
                  min={-MAX_TILT_DEGREES}
                  max={MAX_TILT_DEGREES}
                  step={0.5}
                  value={Math.max(
                    -MAX_TILT_DEGREES,
                    Math.min(MAX_TILT_DEGREES, degrees),
                  )}
                  onChange={(event) => onManual(Number(event.target.value))}
                  className="fold-slider"
                />
                <span className="mt-1 flex justify-between text-[10px] text-steel">
                  <span>-45°</span>
                  <span>45°</span>
                </span>
              </label>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={open ? "Cerrar controles" : "Abrir controles"}
          className="grid size-11 place-items-center rounded-full border border-fg/12 bg-ink/82 text-frost shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          <span className="relative grid size-5 place-items-center">
            <SlidersHorizontal
              className={`absolute size-5 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                open
                  ? "scale-[0.25] opacity-0 blur-[4px]"
                  : "scale-100 opacity-100 blur-none"
              }`}
              strokeWidth={2}
            />
            <X
              className={`absolute size-5 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                open
                  ? "scale-100 opacity-100 blur-none"
                  : "scale-[0.25] opacity-0 blur-[4px]"
              }`}
              strokeWidth={2}
            />
          </span>
        </button>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-[12px] text-xs font-medium transition-colors duration-150 disabled:opacity-40 ${
        active ? "bg-frost text-ink" : "bg-fg/8 text-frost/85 hover:bg-fg/12"
      }`}
    >
      {children}
    </button>
  );
}

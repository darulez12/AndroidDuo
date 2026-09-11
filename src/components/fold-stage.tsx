import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Smartphone } from "lucide-react";
import { captureLayer } from "@/lib/fold/capture";
import { FoldRenderer } from "@/lib/fold/renderer";
import { useTilt } from "@/lib/fold/use-tilt";
import { DemoContent } from "./demo-content";
import { FoldControls } from "./fold-controls";

export function FoldStage() {
  const sourceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<FoldRenderer | null>(null);
  const dragRef = useRef<{ x: number; width: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(true);
  const tilt = useTilt();

  const recapture = useCallback(async () => {
    const node = sourceRef.current;
    const renderer = rendererRef.current;
    if (!node || !renderer) return;
    node.style.visibility = "visible";
    node.style.opacity = "1";
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const shot = await captureLayer(node, dpr);
    renderer.setLayer(shot);
    renderer.setAngle(tilt.angleRef.current);
    renderer.draw();
    node.style.visibility = "hidden";
    setReady(true);
  }, [tilt.angleRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: FoldRenderer;
    try {
      renderer = new FoldRenderer(canvas);
    } catch {
      setFailed(true);
      return;
    }
    rendererRef.current = renderer;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      renderer.resize(w, h, dpr);
    };
    resize();

    let frame = 0;
    const loop = () => {
      renderer.setAngle(tilt.angleRef.current);
      renderer.draw();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    let cancelled = false;
    const start = window.setTimeout(() => {
      void recapture().catch(() => {
        if (!cancelled) setFailed(true);
      });
    }, 60);

    let resizeTimer = 0;
    const onResize = () => {
      resize();
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        void recapture().catch(() => undefined);
      }, 220);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(start);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [recapture, tilt.angleRef]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, input, label")) return;
    dragRef.current = {
      x: event.clientX,
      width: event.currentTarget.clientWidth,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setHint(false);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    drag.x = event.clientX;
    tilt.nudgeFromDrag(dx, drag.width);
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-black select-none"
      data-fold-ready={ready ? "true" : "false"}
      data-fold-failed={failed ? "true" : "false"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={sourceRef} className="absolute inset-0 z-0">
        <DemoContent />
      </div>

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 h-full w-full touch-none bg-black ${
          ready && !failed ? "opacity-100" : "opacity-0"
        }`}
      />

      {failed ? (
        <div className="pointer-events-none absolute top-16 left-1/2 z-30 w-[min(320px,calc(100%-24px))] -translate-x-1/2 rounded-2xl border border-fg/12 bg-ink/80 px-4 py-3 text-center text-sm text-frost">
          El plegado WebGL no arrancó. Puedes seguir viendo la interfaz plana.
        </div>
      ) : null}

      <AnimatePresence>
        {!open && tilt.source !== "motion" ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[max(76px,calc(env(safe-area-inset-bottom)+64px))] left-1/2 z-20 flex w-[min(320px,calc(100%-24px))] -translate-x-1/2 flex-col items-center gap-2"
          >
            {hint ? (
              <p className="rounded-full border border-fg/10 bg-ink/72 px-4 py-2 text-center text-xs font-medium text-frost/90 backdrop-blur-md">
                Arrastra o activa el giroscopio
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setHint(false);
                void tilt.enableMotion();
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-fg/12 bg-frost px-4 text-sm font-medium text-ink shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              <Smartphone className="size-4" strokeWidth={2} />
              Activar giroscopio
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <FoldControls
        open={open}
        onToggle={() => setOpen((value) => !value)}
        degrees={tilt.degrees}
        source={tilt.source}
        motionStatus={tilt.motionStatus}
        motionSupported={tilt.motionSupported}
        onManual={tilt.setManualDegrees}
        onAuto={tilt.enableAuto}
        onMotion={() => {
          void tilt.enableMotion();
        }}
        onRecalibrate={tilt.recalibrate}
      />
    </div>
  );
}

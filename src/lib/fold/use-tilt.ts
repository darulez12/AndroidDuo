import { useCallback, useEffect, useRef, useState } from "react";
import { DEG, MAX_TILT_DEGREES } from "./params";

export type TiltSource = "auto" | "manual" | "motion";

export type MotionStatus = "idle" | "live" | "denied";

const SMOOTH = 0.55;

function clampDegrees(value: number) {
  return Math.max(-MAX_TILT_DEGREES, Math.min(MAX_TILT_DEGREES, value));
}

function wrapDelta(value: number) {
  let next = value;
  while (next > 180) next -= 360;
  while (next < -180) next += 360;
  return next;
}

function autoDegrees(now: number) {
  return Math.sin((now / 1000) * 0.55 + 1.05) * 14;
}

type DeviceOrientationEventWithPermission = {
  requestPermission?: () => Promise<string>;
};

export function useTilt() {
  const sourceRef = useRef<TiltSource>("auto");
  const angleRef = useRef(autoDegrees(0) * DEG);
  const motionTiltRef = useRef(0);
  const manualRef = useRef(autoDegrees(0));
  const refGamma = useRef<number | null>(null);
  const [source, setSource] = useState<TiltSource>("auto");
  const [degrees, setDegrees] = useState(autoDegrees(0));
  const [motionStatus, setMotionStatus] = useState<MotionStatus>("idle");
  const [motionSupported, setMotionSupported] = useState(false);

  const setSourceBoth = useCallback((next: TiltSource) => {
    sourceRef.current = next;
    setSource(next);
  }, []);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" && "DeviceOrientationEvent" in window;
    setMotionSupported(supported);
    if (!supported) return;

    const onOrient = (event: DeviceOrientationEvent) => {
      const portrait = window.innerHeight >= window.innerWidth;
      const raw = portrait ? event.gamma : event.beta;
      if (raw == null) return;
      setMotionSupported(true);

      if (refGamma.current == null) {
        refGamma.current = raw;
        return;
      }

      const nextDeg = clampDegrees(wrapDelta(raw - refGamma.current));
      const nextRad = nextDeg * DEG;
      motionTiltRef.current += (nextRad - motionTiltRef.current) * SMOOTH;

      if (sourceRef.current === "motion") {
        angleRef.current = motionTiltRef.current;
      }
    };

    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      if (sourceRef.current === "auto") {
        const deg = autoDegrees(now);
        angleRef.current = deg * DEG;
        manualRef.current = deg;
      } else if (sourceRef.current === "manual") {
        angleRef.current = manualRef.current * DEG;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const id = window.setInterval(() => {
      setDegrees(angleRef.current / DEG);
    }, 80);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(id);
    };
  }, []);

  const setManualDegrees = useCallback(
    (value: number) => {
      const next = clampDegrees(value);
      manualRef.current = next;
      angleRef.current = next * DEG;
      setSourceBoth("manual");
    },
    [setSourceBoth],
  );

  const nudgeFromDrag = useCallback(
    (deltaX: number, width: number) => {
      const deltaDeg = (deltaX / Math.max(1, width)) * 70;
      setManualDegrees(manualRef.current + deltaDeg);
    },
    [setManualDegrees],
  );

  const enableAuto = useCallback(() => {
    setSourceBoth("auto");
  }, [setSourceBoth]);

  const recalibrate = useCallback(() => {
    refGamma.current = null;
    motionTiltRef.current = 0;
    if (sourceRef.current === "motion") {
      angleRef.current = 0;
    }
  }, []);

  const enableMotion = useCallback(async () => {
    const DOE =
      DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
    try {
      if (typeof DOE.requestPermission === "function") {
        const result = await DOE.requestPermission();
        if (result !== "granted") {
          setMotionStatus("denied");
          return false;
        }
      }
      refGamma.current = null;
      motionTiltRef.current = 0;
      setMotionStatus("live");
      setSourceBoth("motion");
      return true;
    } catch {
      setMotionStatus("denied");
      return false;
    }
  }, [setSourceBoth]);

  return {
    angleRef,
    degrees,
    source,
    motionStatus,
    motionSupported,
    setManualDegrees,
    nudgeFromDrag,
    enableAuto,
    enableMotion,
    recalibrate,
  };
}

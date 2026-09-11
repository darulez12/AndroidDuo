import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as SlidersHorizontal, c as Moon, d as ChevronRight, f as Calendar, h as ArrowUpRight, i as Smartphone, l as Footprints, m as BookOpen, o as RefreshCcw, p as Brain, r as Sparkles, s as Plane, t as X, u as Droplets } from "../_libs/lucide-react.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { n as format, t as es } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-YfOu-kr4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function captureLayer(node, pixelRatio) {
	const { default: html2canvas } = await import("../_libs/html2canvas-pro.mjs").then((n) => n.t);
	const width = Math.max(1, Math.round(node.offsetWidth));
	const height = Math.max(1, Math.round(node.offsetHeight));
	return html2canvas(node, {
		scale: pixelRatio,
		width,
		height,
		windowWidth: width,
		windowHeight: height,
		backgroundColor: "#f2f2f7",
		useCORS: true,
		logging: false,
		imageTimeout: 4e3,
		foreignObjectRendering: false,
		onclone: (_document, cloned) => {
			cloned.style.opacity = "1";
			cloned.style.visibility = "visible";
			cloned.style.transform = "none";
		}
	});
}
/** Physical tunables, matching FoldParameters in the original iOS demo. */
var FOLD_PARAMS = {
	eyeDistanceMillimeters: 320,
	pointsPerMillimeter: 6,
	blurSpread: .12,
	darkening: .015
};
var EYE_DISTANCE_POINTS = FOLD_PARAMS.eyeDistanceMillimeters * FOLD_PARAMS.pointsPerMillimeter;
var DEG = Math.PI / 180;
var VERT_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;
var FRAG_SRC = `
precision highp float;

uniform sampler2D uLayer;
uniform vec2 uSize;
uniform float uAngle;
uniform float uEyeDistance;
uniform float uBlurSpread;
uniform float uDarkening;

varying vec2 vUv;

const int MAX_TAPS = 16;
const float GOLDEN = 2.39996322972865332;
const float TWO_PI = 6.28318530717958648;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 sampleLayer(vec2 uv) {
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
    return vec3(0.0);
  }
  return texture2D(uLayer, uv).rgb;
}

void main() {
  vec2 p = vUv * uSize;
  float tilt = abs(uAngle);

  if (tilt < 0.00001) {
    gl_FragColor = vec4(sampleLayer(vUv), 1.0);
    return;
  }

  float hingeX = uAngle > 0.0 ? uSize.x : 0.0;
  float side = uAngle > 0.0 ? -1.0 : 1.0;
  float d = abs(p.x - hingeX);

  vec3 glass = vec3(hingeX + side * d * cos(tilt), p.y, d * sin(tilt));
  vec3 eye = vec3(uSize.x * 0.5, uSize.y * 0.5, uEyeDistance);

  float depth = eye.z - glass.z;
  if (depth <= 0.001) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float tHit = eye.z / depth;
  vec2 hit = eye.xy + (glass.xy - eye.xy) * tHit;

  float gap = glass.z;
  float radius = uBlurSpread * gap;

  if (hit.x < -radius || hit.y < -radius || hit.x > uSize.x + radius || hit.y > uSize.y + radius) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float attenuation = max(1.0 - uDarkening * radius, 0.0);

  if (radius < 0.5) {
    gl_FragColor = vec4(sampleLayer(hit / uSize) * attenuation, 1.0);
    return;
  }

  float tapsF = clamp(radius * 1.35, 5.0, 16.0);
  int taps = int(tapsF);
  float rotation = hash21(p) * TWO_PI;
  vec3 sum = vec3(0.0);

  for (int i = 0; i < MAX_TAPS; i++) {
    if (i >= taps) break;
    float r = radius * sqrt((float(i) + 0.5) / tapsF);
    float a = float(i) * GOLDEN + rotation;
    vec2 offset = r * vec2(cos(a), sin(a));
    sum += sampleLayer((hit + offset) / uSize);
  }

  gl_FragColor = vec4(sum / tapsF * attenuation, 1.0);
}
`;
function compile(gl, type, src) {
	const shader = gl.createShader(type);
	if (!shader) throw new Error("No se pudo crear el shader");
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader) ?? "error de compilación";
		gl.deleteShader(shader);
		throw new Error(log);
	}
	return shader;
}
var FoldRenderer = class {
	gl;
	program;
	texture;
	buffer;
	uSize;
	uAngle;
	uEye;
	uBlur;
	uDark;
	angle = 0;
	cssWidth = 1;
	cssHeight = 1;
	hasLayer = false;
	constructor(canvas) {
		const gl = canvas.getContext("webgl", {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false,
			premultipliedAlpha: true,
			powerPreference: "high-performance"
		});
		if (!gl) throw new Error("WebGL no está disponible en este dispositivo");
		this.gl = gl;
		const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
		const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
		const program = gl.createProgram();
		if (!program) throw new Error("No se pudo crear el programa WebGL");
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.bindAttribLocation(program, 0, "aPos");
		gl.linkProgram(program);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "error de link");
		this.program = program;
		const buffer = gl.createBuffer();
		if (!buffer) throw new Error("No se pudo crear el buffer");
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			1,
			-1,
			-1,
			1,
			1,
			1
		]), gl.STATIC_DRAW);
		this.buffer = buffer;
		const texture = gl.createTexture();
		if (!texture) throw new Error("No se pudo crear la textura");
		this.texture = texture;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.useProgram(program);
		const uLayer = gl.getUniformLocation(program, "uLayer");
		const uSize = gl.getUniformLocation(program, "uSize");
		const uAngle = gl.getUniformLocation(program, "uAngle");
		const uEye = gl.getUniformLocation(program, "uEyeDistance");
		const uBlur = gl.getUniformLocation(program, "uBlurSpread");
		const uDark = gl.getUniformLocation(program, "uDarkening");
		if (!uLayer || !uSize || !uAngle || !uEye || !uBlur || !uDark) throw new Error("Uniforms del shader incompletos");
		this.uSize = uSize;
		this.uAngle = uAngle;
		this.uEye = uEye;
		this.uBlur = uBlur;
		this.uDark = uDark;
		gl.uniform1i(uLayer, 0);
		gl.uniform1f(uEye, EYE_DISTANCE_POINTS);
		gl.uniform1f(uBlur, FOLD_PARAMS.blurSpread);
		gl.uniform1f(uDark, FOLD_PARAMS.darkening);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
		gl.disable(gl.BLEND);
		gl.clearColor(0, 0, 0, 1);
	}
	setAngle(radians) {
		this.angle = radians;
	}
	resize(cssWidth, cssHeight, dpr) {
		this.cssWidth = Math.max(1, cssWidth);
		this.cssHeight = Math.max(1, cssHeight);
		const gl = this.gl;
		const canvas = gl.canvas;
		const w = Math.max(1, Math.round(cssWidth * dpr));
		const h = Math.max(1, Math.round(cssHeight * dpr));
		if (canvas.width !== w) canvas.width = w;
		if (canvas.height !== h) canvas.height = h;
		gl.viewport(0, 0, w, h);
	}
	setLayer(source) {
		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
		this.hasLayer = true;
	}
	draw() {
		const gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT);
		if (!this.hasLayer) return;
		gl.useProgram(this.program);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.uniform2f(this.uSize, this.cssWidth, this.cssHeight);
		gl.uniform1f(this.uAngle, this.angle);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
	dispose() {
		const gl = this.gl;
		gl.deleteBuffer(this.buffer);
		gl.deleteTexture(this.texture);
		gl.deleteProgram(this.program);
		gl.getExtension("WEBGL_lose_context")?.loseContext();
	}
};
var SMOOTH = .55;
function clampDegrees(value) {
	return Math.max(-45, Math.min(45, value));
}
function wrapDelta(value) {
	let next = value;
	while (next > 180) next -= 360;
	while (next < -180) next += 360;
	return next;
}
function autoDegrees(now) {
	return Math.sin(now / 1e3 * .55 + 1.05) * 14;
}
function useTilt() {
	const sourceRef = (0, import_react.useRef)("auto");
	const angleRef = (0, import_react.useRef)(autoDegrees(0) * DEG);
	const motionTiltRef = (0, import_react.useRef)(0);
	const manualRef = (0, import_react.useRef)(autoDegrees(0));
	const refGamma = (0, import_react.useRef)(null);
	const [source, setSource] = (0, import_react.useState)("auto");
	const [degrees, setDegrees] = (0, import_react.useState)(autoDegrees(0));
	const [motionStatus, setMotionStatus] = (0, import_react.useState)("idle");
	const [motionSupported, setMotionSupported] = (0, import_react.useState)(false);
	const setSourceBoth = (0, import_react.useCallback)((next) => {
		sourceRef.current = next;
		setSource(next);
	}, []);
	(0, import_react.useEffect)(() => {
		const supported = typeof window !== "undefined" && "DeviceOrientationEvent" in window;
		setMotionSupported(supported);
		if (!supported) return;
		const onOrient = (event) => {
			const raw = window.innerHeight >= window.innerWidth ? event.gamma : event.beta;
			if (raw == null) return;
			setMotionSupported(true);
			if (refGamma.current == null) {
				refGamma.current = raw;
				return;
			}
			const nextRad = clampDegrees(wrapDelta(raw - refGamma.current)) * DEG;
			motionTiltRef.current += (nextRad - motionTiltRef.current) * SMOOTH;
			if (sourceRef.current === "motion") angleRef.current = motionTiltRef.current;
		};
		window.addEventListener("deviceorientation", onOrient, { passive: true });
		return () => window.removeEventListener("deviceorientation", onOrient);
	}, []);
	(0, import_react.useEffect)(() => {
		let frame = 0;
		const tick = (now) => {
			if (sourceRef.current === "auto") {
				const deg = autoDegrees(now);
				angleRef.current = deg * DEG;
				manualRef.current = deg;
			} else if (sourceRef.current === "manual") angleRef.current = manualRef.current * DEG;
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
	const setManualDegrees = (0, import_react.useCallback)((value) => {
		const next = clampDegrees(value);
		manualRef.current = next;
		angleRef.current = next * DEG;
		setSourceBoth("manual");
	}, [setSourceBoth]);
	const nudgeFromDrag = (0, import_react.useCallback)((deltaX, width) => {
		const deltaDeg = deltaX / Math.max(1, width) * 70;
		setManualDegrees(manualRef.current + deltaDeg);
	}, [setManualDegrees]);
	const enableAuto = (0, import_react.useCallback)(() => {
		setSourceBoth("auto");
	}, [setSourceBoth]);
	const recalibrate = (0, import_react.useCallback)(() => {
		refGamma.current = null;
		motionTiltRef.current = 0;
		if (sourceRef.current === "motion") angleRef.current = 0;
	}, []);
	return {
		angleRef,
		degrees,
		source,
		motionStatus,
		motionSupported,
		setManualDegrees,
		nudgeFromDrag,
		enableAuto,
		enableMotion: (0, import_react.useCallback)(async () => {
			const DOE = DeviceOrientationEvent;
			try {
				if (typeof DOE.requestPermission === "function") {
					if (await DOE.requestPermission() !== "granted") {
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
		}, [setSourceBoth]),
		recalibrate
	};
}
var CHIPS = [
	"Todos",
	"Salud",
	"Trabajo",
	"Lectura",
	"Viajes",
	"Música"
];
var BARS = Array.from({ length: 12 }, (_, index) => 18 + index * 37 % 46);
var TILES = [
	{
		title: "Pasos",
		value: "8,412",
		icon: Footprints,
		tint: "#34c759"
	},
	{
		title: "Sueño",
		value: "7h 20m",
		icon: Moon,
		tint: "#5e5ce6"
	},
	{
		title: "Enfoque",
		value: "3h 05m",
		icon: Brain,
		tint: "#ff9f0a"
	},
	{
		title: "Agua",
		value: "1.8 L",
		icon: Droplets,
		tint: "#32ade6"
	}
];
var ROWS = [
	{
		title: "Carrera matutina",
		subtitle: "5.2 km · 27 min",
		icon: Footprints,
		tint: "#34c759"
	},
	{
		title: "Revisión de diseño",
		subtitle: "10:30 · Sala 4B",
		icon: Calendar,
		tint: "#ff3b30"
	},
	{
		title: "Vuelo a Lisboa",
		subtitle: "Vie 18:45 · Puerta 22",
		icon: Plane,
		tint: "#007aff"
	},
	{
		title: "Leer 20 páginas",
		subtitle: "La mano izquierda de la oscuridad",
		icon: BookOpen,
		tint: "#a2845e"
	}
];
function DemoContent() {
	const today = format(/* @__PURE__ */ new Date(), "EEEE, d MMM", { locale: es });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "demo",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "demo-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "demo-kicker",
					suppressHydrationWarning: true,
					children: today
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "demo-title",
					children: "Hoy"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "demo-avatar",
					"aria-hidden": "true",
					children: "FG"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "demo-chips",
				children: CHIPS.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: label === "Todos" ? "demo-chip is-on" : "demo-chip",
					children: label
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "demo-hero",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "demo-hero-top",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								size: 18,
								strokeWidth: 2
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cristal esmerilado" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
								size: 18,
								strokeWidth: 2
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Inclina el teléfono alrededor de su eje vertical. La interfaz se queda fija en el espacio mientras la pantalla se vuelve un cristal esmerilado inclinado." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "demo-bars",
						"aria-hidden": "true",
						children: BARS.map((height, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "demo-bar",
							style: { height }
						}, index))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "demo-grid",
				children: TILES.map((tile) => {
					const Icon = tile.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "demo-tile",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "demo-tile-top",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								color: tile.tint,
								strokeWidth: 2
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tile.title })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: tile.value })]
					}, tile.title);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "demo-section",
				children: "Reciente"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "demo-list",
				children: ROWS.map((row) => {
					const Icon = row.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "demo-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "demo-glyph",
								style: { background: row.tint },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									size: 17,
									strokeWidth: 2.2
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: row.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: row.subtitle })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								className: "chev",
								size: 16,
								strokeWidth: 2.4
							})
						]
					}, row.title);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "demo-fill" })
		]
	});
}
var panelMotion = {
	initial: {
		opacity: 0,
		y: 8,
		filter: "blur(4px)"
	},
	animate: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)"
	},
	exit: {
		opacity: 0,
		y: 8,
		filter: "blur(4px)"
	},
	transition: {
		duration: .2,
		ease: [
			.22,
			1,
			.36,
			1
		]
	}
};
function FoldControls({ open, onToggle, degrees, source, motionStatus, motionSupported, onManual, onAuto, onMotion, onRecalibrate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute top-[max(12px,env(safe-area-inset-top))] left-[max(12px,env(safe-area-inset-left))]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex items-center gap-2 rounded-full border border-fg/12 bg-ink/78 px-3 py-1.5 text-xs font-medium text-frost shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tracking-tight",
						children: "Fold Glass"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-1 rounded-full bg-steel" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums text-frost/70",
						children: [degrees.toFixed(1), "°"]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto absolute right-[max(12px,env(safe-area-inset-right))] bottom-[max(12px,env(safe-area-inset-bottom))] flex w-[min(280px,calc(100vw-24px))] flex-col items-end gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				...panelMotion,
				className: "w-full rounded-[20px] border border-fg/12 bg-ink/88 p-4 text-frost shadow-[0_16px_40px_rgba(0,0,0,0.38)] backdrop-blur-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2 text-sm font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: degrees.toFixed(1)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-frost/55",
								children: "°"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-auto text-xs font-medium capitalize text-steel",
								children: source === "motion" ? "giroscopio" : source === "auto" ? "auto" : "manual"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onRecalibrate,
								disabled: source !== "motion",
								className: "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-frost/80 transition-colors hover:text-frost disabled:text-frost/30",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, {
									className: "size-3.5",
									strokeWidth: 2
								}), "Recalibrar"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
							active: source === "auto",
							onClick: onAuto,
							children: "Auto"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ModeButton, {
							active: source === "motion",
							onClick: onMotion,
							disabled: !motionSupported && motionStatus !== "live",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
								className: "size-3.5",
								strokeWidth: 2
							}), "Giroscopio"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Inclinación"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -45,
								max: 45,
								step: .5,
								value: Math.max(-45, Math.min(45, degrees)),
								onChange: (event) => onManual(Number(event.target.value)),
								className: "fold-slider"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1 flex justify-between text-[10px] text-steel",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "-45°" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "45°" })]
							})
						]
					})
				]
			}, "panel") : null }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onToggle,
				"aria-expanded": open,
				"aria-label": open ? "Cerrar controles" : "Abrir controles",
				className: "grid size-11 place-items-center rounded-full border border-fg/12 bg-ink/82 text-frost shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform duration-150 ease-out active:scale-[0.96]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "relative grid size-5 place-items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
						className: `absolute size-5 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${open ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-none"}`,
						strokeWidth: 2
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: `absolute size-5 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${open ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-[4px]"}`,
						strokeWidth: 2
					})]
				})
			})]
		})]
	});
}
function ModeButton({ active, onClick, disabled, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		disabled,
		className: `inline-flex h-10 items-center justify-center gap-1.5 rounded-[12px] text-xs font-medium transition-colors duration-150 disabled:opacity-40 ${active ? "bg-frost text-ink" : "bg-fg/8 text-frost/85 hover:bg-fg/12"}`,
		children
	});
}
function FoldStage() {
	const sourceRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const rendererRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)(true);
	const tilt = useTilt();
	const recapture = (0, import_react.useCallback)(async () => {
		const node = sourceRef.current;
		const renderer = rendererRef.current;
		if (!node || !renderer) return;
		node.style.visibility = "visible";
		node.style.opacity = "1";
		const shot = await captureLayer(node, Math.min(2, window.devicePixelRatio || 1));
		renderer.setLayer(shot);
		renderer.setAngle(tilt.angleRef.current);
		renderer.draw();
		node.style.visibility = "hidden";
		setReady(true);
	}, [tilt.angleRef]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let renderer;
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
			recapture().catch(() => {
				if (!cancelled) setFailed(true);
			});
		}, 60);
		let resizeTimer = 0;
		const onResize = () => {
			resize();
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				recapture().catch(() => void 0);
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
	const onPointerDown = (event) => {
		if (event.target.closest("button, input, label")) return;
		dragRef.current = {
			x: event.clientX,
			width: event.currentTarget.clientWidth
		};
		event.currentTarget.setPointerCapture(event.pointerId);
		setHint(false);
	};
	const onPointerMove = (event) => {
		const drag = dragRef.current;
		if (!drag) return;
		const dx = event.clientX - drag.x;
		drag.x = event.clientX;
		tilt.nudgeFromDrag(dx, drag.width);
	};
	const onPointerUp = () => {
		dragRef.current = null;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-black select-none",
		"data-fold-ready": ready ? "true" : "false",
		"data-fold-failed": failed ? "true" : "false",
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel: onPointerUp,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: sourceRef,
				className: "absolute inset-0 z-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoContent, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: `absolute inset-0 z-10 h-full w-full touch-none bg-black ${ready && !failed ? "opacity-100" : "opacity-0"}`
			}),
			failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute top-16 left-1/2 z-30 w-[min(320px,calc(100%-24px))] -translate-x-1/2 rounded-2xl border border-fg/12 bg-ink/80 px-4 py-3 text-center text-sm text-frost",
				children: "El plegado WebGL no arrancó. Puedes seguir viendo la interfaz plana."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: !open && tilt.source !== "motion" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: 8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				exit: {
					opacity: 0,
					y: 8
				},
				transition: {
					duration: .25,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				className: "absolute bottom-[max(76px,calc(env(safe-area-inset-bottom)+64px))] left-1/2 z-20 flex w-[min(320px,calc(100%-24px))] -translate-x-1/2 flex-col items-center gap-2",
				children: [hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-full border border-fg/10 bg-ink/72 px-4 py-2 text-center text-xs font-medium text-frost/90 backdrop-blur-md",
					children: "Arrastra o activa el giroscopio"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setHint(false);
						tilt.enableMotion();
					},
					className: "inline-flex h-11 items-center gap-2 rounded-full border border-fg/12 bg-frost px-4 text-sm font-medium text-ink shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform duration-150 ease-out active:scale-[0.96]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
						className: "size-4",
						strokeWidth: 2
					}), "Activar giroscopio"]
				})]
			}) : null }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldControls, {
				open,
				onToggle: () => setOpen((value) => !value),
				degrees: tilt.degrees,
				source: tilt.source,
				motionStatus: tilt.motionStatus,
				motionSupported: tilt.motionSupported,
				onManual: tilt.setManualDegrees,
				onAuto: tilt.enableAuto,
				onMotion: () => {
					tilt.enableMotion();
				},
				onRecalibrate: tilt.recalibrate
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "h-dvh overflow-hidden bg-black",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldStage, {})
	});
}
//#endregion
export { Home as component };

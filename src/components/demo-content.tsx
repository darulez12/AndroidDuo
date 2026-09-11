import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  Droplets,
  Footprints,
  Moon,
  Plane,
  Sparkles,
} from "lucide-react";
import "./demo-content.css";

const CHIPS = ["Todos", "Salud", "Trabajo", "Lectura", "Viajes", "Música"];

const BARS = Array.from({ length: 12 }, (_, index) => 18 + ((index * 37) % 46));

const TILES = [
  { title: "Pasos", value: "8,412", icon: Footprints, tint: "#34c759" },
  { title: "Sueño", value: "7h 20m", icon: Moon, tint: "#5e5ce6" },
  { title: "Enfoque", value: "3h 05m", icon: Brain, tint: "#ff9f0a" },
  { title: "Agua", value: "1.8 L", icon: Droplets, tint: "#32ade6" },
] as const;

const ROWS = [
  { title: "Carrera matutina", subtitle: "5.2 km · 27 min", icon: Footprints, tint: "#34c759" },
  { title: "Revisión de diseño", subtitle: "10:30 · Sala 4B", icon: Calendar, tint: "#ff3b30" },
  { title: "Vuelo a Lisboa", subtitle: "Vie 18:45 · Puerta 22", icon: Plane, tint: "#007aff" },
  { title: "Leer 20 páginas", subtitle: "La mano izquierda de la oscuridad", icon: BookOpen, tint: "#a2845e" },
] as const;

export function DemoContent() {
  const today = format(new Date(), "EEEE, d MMM", { locale: es });

  return (
    <div className="demo">
      <header className="demo-header">
        <div>
          <p className="demo-kicker" suppressHydrationWarning>
            {today}
          </p>
          <h1 className="demo-title">Hoy</h1>
        </div>
        <div className="demo-avatar" aria-hidden="true">
          FG
        </div>
      </header>

      <div className="demo-chips">
        {CHIPS.map((label) => (
          <span key={label} className={label === "Todos" ? "demo-chip is-on" : "demo-chip"}>
            {label}
          </span>
        ))}
      </div>

      <section className="demo-hero">
        <div className="demo-hero-top">
          <Sparkles size={18} strokeWidth={2} />
          <span>Cristal esmerilado</span>
          <ArrowUpRight size={18} strokeWidth={2} />
        </div>
        <p>
          Inclina el teléfono alrededor de su eje vertical. La interfaz se queda
          fija en el espacio mientras la pantalla se vuelve un cristal
          esmerilado inclinado.
        </p>
        <div className="demo-bars" aria-hidden="true">
          {BARS.map((height, index) => (
            <div key={index} className="demo-bar" style={{ height }} />
          ))}
        </div>
      </section>

      <div className="demo-grid">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <article key={tile.title} className="demo-tile">
              <div className="demo-tile-top">
                <Icon color={tile.tint} strokeWidth={2} />
                <span>{tile.title}</span>
              </div>
              <strong>{tile.value}</strong>
            </article>
          );
        })}
      </div>

      <h2 className="demo-section">Reciente</h2>
      <div className="demo-list">
        {ROWS.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.title} className="demo-row">
              <div className="demo-glyph" style={{ background: row.tint }}>
                <Icon size={17} strokeWidth={2.2} />
              </div>
              <div>
                <h3>{row.title}</h3>
                <p>{row.subtitle}</p>
              </div>
              <ChevronRight className="chev" size={16} strokeWidth={2.4} />
            </div>
          );
        })}
      </div>
      <div className="demo-fill" />
    </div>
  );
}

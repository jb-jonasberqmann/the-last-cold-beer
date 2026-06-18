"use client";

/**
 * RoomScene — full-bleed atmospheric header scene for each room.
 * Pure CSS + emoji, no images required. Each room has its own
 * visual identity, ambient animations, and mood.
 */

import type { Room } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  room: Room;
  className?: string;
}

export function RoomScene({ room, className }: Props) {
  const Scene = SCENE_MAP[room.id] ?? DefaultScene;
  return (
    <div className={cn("relative w-full rounded-xl overflow-hidden", className)}>
      <Scene room={room} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KITCHEN
// Warm amber glow, worn counter, fridge on the right, steam
// ─────────────────────────────────────────────────────────────
function KitchenScene({ room }: { room: Room }) {
  return (
    <div className="relative w-full h-52 overflow-hidden">
      {/* Sky / wall */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950" />

      {/* Warm overhead light pool */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-32 rounded-full bg-amber-700/10 blur-2xl pointer-events-none" />

      {/* Window — left wall */}
      <div className="absolute top-4 left-5 w-14 h-16 rounded-sm border border-amber-900/40 bg-amber-950/60 overflow-hidden">
        {/* window panes */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-amber-900/40" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-amber-900/40" />
        {/* outside glow */}
        <div className="absolute inset-0 bg-amber-800/10" />
      </div>

      {/* Fridge — right side */}
      <div className="absolute right-5 bottom-10 w-14 h-28 rounded-t-sm bg-stone-700 border border-stone-600 flex flex-col items-center justify-start pt-2 gap-1">
        {/* handle */}
        <div className="absolute right-1 top-6 w-1.5 h-8 bg-stone-500 rounded-full" />
        {/* magnets */}
        <div className="text-[10px] leading-none mt-1">🍺</div>
        <div className="text-[10px] leading-none">🍍</div>
        <div className="text-[8px] leading-none">🍍</div>
        <div className="text-[8px] leading-none">A</div>
        {/* fridge hum glow */}
        <div className="absolute inset-0 rounded-t-sm bg-amber-400/5 animate-cold-pulse" />
      </div>

      {/* Counter surface */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-stone-800 border-t-2 border-stone-700" />

      {/* Counter items */}
      {/* Coffee mug */}
      <div className="absolute bottom-9 left-6">
        <div className="text-xl">☕</div>
        {/* steam wisps */}
        <div className="absolute -top-5 left-2 w-1 h-5 bg-amber-100/20 rounded-full blur-sm animate-steam" />
        <div className="absolute -top-4 left-4 w-0.5 h-4 bg-amber-100/15 rounded-full blur-sm animate-steam-delay" />
      </div>

      {/* Sticky note on counter */}
      <div
        className="absolute bottom-11 left-20 w-16 h-10 bg-amber-300/80 rounded-sm shadow-md"
        style={{ transform: "rotate(-2deg)", fontFamily: "Georgia, serif" }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-1">
          <p className="text-[6px] text-amber-950/90 leading-tight text-center">
            Count the magnets. Subtract the ones that don&apos;t belong.
          </p>
        </div>
      </div>

      {/* Flour dusting on counter */}
      <div className="absolute bottom-10 right-24 w-12 h-2 bg-stone-300/10 rounded-full blur-sm" />

      {/* Room title overlay — bottom */}
      <RoomTitleOverlay room={room} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FRIDGE
// Arctic cold, frosted glass, lone beer, condensation drips
// ─────────────────────────────────────────────────────────────
function FridgeScene({ room }: { room: Room }) {
  return (
    <div className="relative w-full h-52 overflow-hidden">
      {/* Cold background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-cyan-950 to-stone-950" />

      {/* Cold ambient glow */}
      <div className="absolute inset-0 bg-cyan-500/8 animate-cold-pulse pointer-events-none" />

      {/* Frosted glass panel — the open fridge door */}
      <div className="absolute inset-x-8 top-4 bottom-8 rounded-lg border border-cyan-800/30 bg-cyan-950/40 backdrop-blur-sm overflow-hidden">
        {/* frost texture lines */}
        <div className="absolute inset-0 opacity-20">
          {[15, 28, 42, 58, 72, 86].map((x) => (
            <div
              key={x}
              className="absolute top-0 bottom-0 w-px bg-cyan-300/30"
              style={{ left: `${x}%` }}
            />
          ))}
          {[20, 40, 60, 80].map((y) => (
            <div
              key={y}
              className="absolute left-0 right-0 h-px bg-cyan-300/20"
              style={{ top: `${y}%` }}
            />
          ))}
        </div>

        {/* Shelf lines */}
        <div className="absolute left-0 right-0 h-px bg-cyan-700/40" style={{ top: "33%" }} />
        <div className="absolute left-0 right-0 h-px bg-cyan-700/40" style={{ top: "66%" }} />

        {/* The lone beer — center shelf */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="text-3xl">🍺</div>
          <div className="mt-1 w-px h-3 bg-cyan-300/30" />
          {/* note taped to it */}
          <div
            className="w-12 h-6 bg-stone-200/90 rounded-sm shadow"
            style={{ transform: "rotate(1deg)", fontFamily: "Georgia, serif" }}
          >
            <p className="text-[5px] text-stone-800/90 p-0.5 leading-tight text-center mt-0.5">
              DO NOT OPEN<br />until instructed
            </p>
          </div>
        </div>

        {/* Condensation drips */}
        <div className="absolute top-0 left-[25%] w-px h-3 bg-cyan-300/50 rounded-full animate-drip" />
        <div className="absolute top-0 left-[45%] w-px h-2 bg-cyan-200/40 rounded-full animate-drip-delay" />
        <div className="absolute top-0 left-[65%] w-px h-3 bg-cyan-300/50 rounded-full animate-drip-slow" />
        <div className="absolute top-0 left-[78%] w-px h-2 bg-cyan-200/30 rounded-full animate-drip" style={{ animationDelay: "2.2s" }} />

        {/* Cold mist at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-cyan-900/40 to-transparent pointer-events-none" />
      </div>

      {/* Temperature dial */}
      <div className="absolute bottom-10 right-10 w-5 h-5 rounded-full border-2 border-cyan-700/60 bg-cyan-950 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-red-500 animate-flicker" />
      </div>

      <RoomTitleOverlay room={room} cold />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COFFEE TABLE
// Warm worn wood, ring stains, scattered coasters, candle
// ─────────────────────────────────────────────────────────────
function CoffeeTableScene({ room }: { room: Room }) {
  return (
    <div className="relative w-full h-52 overflow-hidden">
      {/* Wood surface */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-amber-950 to-stone-900" />

      {/* Wood grain lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        {[8, 18, 28, 38, 50, 62, 72, 82, 92].map((y, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${y}%`,
              background: "linear-gradient(90deg, transparent 0%, rgba(200,150,80,0.5) 20%, rgba(200,150,80,0.3) 50%, rgba(200,150,80,0.5) 80%, transparent 100%)",
            }}
          />
        ))}
      </div>

      {/* Ring stains — coffee marks from a hundred cabin trips */}
      <RingStain x={18} y={35} size={28} opacity={0.18} />
      <RingStain x={38} y={52} size={22} opacity={0.14} />
      <RingStain x={58} y={28} size={32} opacity={0.20} />
      <RingStain x={74} y={55} size={18} opacity={0.13} />
      <RingStain x={25} y={65} size={16} opacity={0.12} />
      {/* Overlapping stain — key visual */}
      <RingStain x={44} y={42} size={30} opacity={0.22} color="rgba(180,120,40,0.9)" />
      <RingStain x={52} y={44} size={24} opacity={0.16} color="rgba(180,120,40,0.9)" />

      {/* Coasters */}
      <Coaster x={14} y={20} rotate={-8} />
      <Coaster x={65} y={60} rotate={12} />
      <Coaster x={80} y={18} rotate={3} />

      {/* Third coaster — something underneath */}
      <div
        className="absolute w-10 h-10 rounded-sm border border-amber-700/40 bg-stone-700/80"
        style={{ left: "44%", top: "55%", transform: "rotate(-5deg)" }}
      >
        {/* glow hint of something underneath */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-sm bg-amber-400/20 animate-cold-pulse" />
        </div>
      </div>

      {/* Candle */}
      <div className="absolute right-6 top-4 flex flex-col items-center">
        <div className="text-lg animate-flame leading-none">🕯️</div>
        {/* candle glow */}
        <div className="absolute -top-1 w-6 h-6 rounded-full bg-amber-400/10 blur-md animate-cold-pulse" />
      </div>

      {/* Dust mote particles */}
      <div className="absolute top-8 left-[30%] w-0.5 h-0.5 rounded-full bg-amber-400/30 animate-float" />
      <div className="absolute top-12 left-[55%] w-0.5 h-0.5 rounded-full bg-amber-300/20 animate-float-delay" />
      <div className="absolute top-16 left-[70%] w-0.5 h-0.5 rounded-full bg-amber-400/25 animate-float-slow" />

      <RoomTitleOverlay room={room} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TERRACE
// Night sky, tree silhouettes, cold stars, lone chair
// ─────────────────────────────────────────────────────────────
function TerraceScene({ room }: { room: Room }) {
  return (
    <div className="relative w-full h-52 overflow-hidden">
      {/* Night sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-green-950 to-stone-950" />

      {/* Moon glow */}
      <div className="absolute top-3 right-8 w-8 h-8 rounded-full bg-stone-300/15 blur-sm" />
      <div className="absolute top-4 right-9 w-6 h-6 rounded-full bg-stone-200/20" />

      {/* Stars */}
      {STAR_POSITIONS.map((s, i) => (
        <div
          key={i}
          className={cn(
            "absolute w-0.5 h-0.5 rounded-full bg-stone-300",
            i % 3 === 0 ? "animate-twinkle" : i % 3 === 1 ? "animate-twinkle-slow" : "animate-twinkle-delay"
          )}
          style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: s.o }}
        />
      ))}

      {/* Tree silhouettes — left cluster */}
      <TreeSilhouette x={5} height={100} width={18} />
      <TreeSilhouette x={15} height={85} width={14} />
      <TreeSilhouette x={22} height={110} width={16} />

      {/* Tree silhouettes — right cluster */}
      <TreeSilhouette x={68} height={95} width={15} />
      <TreeSilhouette x={76} height={120} width={20} />
      <TreeSilhouette x={84} height={80} width={12} />
      <TreeSilhouette x={90} height={100} width={16} />

      {/* Wooden railing */}
      <div className="absolute bottom-8 left-0 right-0 h-2 bg-stone-700/60 border-t border-stone-600/40" />
      <div className="absolute bottom-8 left-0 right-0 flex justify-around">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-0.5 h-8 bg-stone-700/50" />
        ))}
      </div>

      {/* Lone chair — pointed exactly at the treeline */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="text-2xl" style={{ transform: "scaleX(-1)" }}>🪑</div>
      </div>

      {/* Cold breath mist */}
      <div className="absolute bottom-12 left-1/2 w-6 h-3 bg-stone-300/8 rounded-full blur-sm animate-steam-slow" style={{ transform: "translateX(-50%)" }} />

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-stone-900/80" />

      <RoomTitleOverlay room={room} cold />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHED
// Dark metal, hanging bulb, tool silhouettes, dust motes
// ─────────────────────────────────────────────────────────────
function ShedScene({ room }: { room: Room }) {
  return (
    <div className="relative w-full h-52 overflow-hidden">
      {/* Dark interior */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950" />

      {/* Rust/moisture stains on walls */}
      <div className="absolute top-4 left-8 w-12 h-16 opacity-10 rounded-full blur-lg bg-amber-700" />
      <div className="absolute top-8 right-12 w-8 h-12 opacity-8 rounded-full blur-lg bg-amber-800" />

      {/* Wall pegboard lines */}
      <div className="absolute top-4 left-0 right-0 h-20 opacity-8">
        {[0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96].map((x) => (
          <div key={x} className="absolute top-0 bottom-0 w-px bg-stone-500/30" style={{ left: `${x}%` }} />
        ))}
        {[0, 25, 50, 75, 100].map((y) => (
          <div key={y} className="absolute left-0 right-0 h-px bg-stone-500/20" style={{ top: `${y}%` }} />
        ))}
      </div>

      {/* Tools on wall */}
      <div className="absolute top-6 left-8 text-2xl opacity-60">🔧</div>
      <div className="absolute top-5 left-20 text-xl opacity-50">⚒️</div>
      <div className="absolute top-7 left-36 text-2xl opacity-40">🪚</div>
      <div className="absolute top-6 right-20 text-2xl opacity-55">🪛</div>
      <div className="absolute top-5 right-8 text-xl opacity-45">🔩</div>

      {/* Laminated sheet on wall */}
      <div
        className="absolute top-8 left-1/2 -translate-x-1/2 w-14 h-16 bg-stone-200/90 rounded-sm shadow-lg border border-stone-400/40"
        style={{ transform: "translateX(-50%) rotate(1deg)" }}
      >
        {/* tacks */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500/80 border border-amber-400/60" />
        <div className="p-1 pt-2">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="h-px bg-stone-400/40 mb-1" />
          ))}
        </div>
        <div className="absolute top-2 left-1 right-1">
          <p className="text-[5px] text-stone-800/80 font-bold text-center leading-tight">INVENTARLISTE</p>
        </div>
      </div>

      {/* Hanging bulb */}
      <div className="absolute top-0 left-[60%] flex flex-col items-center">
        {/* cord */}
        <div className="w-px h-8 bg-stone-600/60" />
        <div className="text-xl animate-flicker">💡</div>
        {/* light cone */}
        <div
          className="absolute top-8 w-0 h-0 pointer-events-none"
          style={{
            borderLeft: "20px solid transparent",
            borderRight: "20px solid transparent",
            borderTop: "40px solid rgba(250,200,80,0.06)",
          }}
        />
      </div>

      {/* Dust motes in bulb beam */}
      <div className="absolute top-14 left-[58%] w-0.5 h-0.5 rounded-full bg-amber-300/40 animate-float" />
      <div className="absolute top-16 left-[62%] w-0.5 h-0.5 rounded-full bg-amber-200/30 animate-float-delay" />
      <div className="absolute top-20 left-[57%] w-0.5 h-0.5 rounded-full bg-amber-300/35 animate-float-slow" />

      {/* Old broken chair in corner */}
      <div className="absolute bottom-8 left-3 text-xl opacity-40">🪑</div>

      {/* Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-stone-900 border-t border-stone-800" />

      {/* Moisture on floor */}
      <div className="absolute bottom-2 right-8 w-8 h-2 rounded-full bg-stone-600/30 blur-sm" />

      <RoomTitleOverlay room={room} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DEFAULT — generic atmospheric scene using room's own colors
// ─────────────────────────────────────────────────────────────
function DefaultScene({ room }: { room: Room }) {
  return (
    <div className="relative w-full h-52 overflow-hidden">
      <div className={cn("absolute inset-0 bg-gradient-to-br", room.look.colorFrom, room.look.colorTo, "opacity-70")} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-950/80" />

      {/* Ambient particles */}
      <div className="absolute top-8  left-[20%] w-0.5 h-0.5 rounded-full bg-amber-400/30 animate-float" />
      <div className="absolute top-14 left-[50%] w-0.5 h-0.5 rounded-full bg-amber-300/20 animate-float-delay" />
      <div className="absolute top-10 left-[75%] w-0.5 h-0.5 rounded-full bg-amber-400/25 animate-float-slow" />

      {/* Large icon centered */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-15 select-none pointer-events-none">
        {room.look.icon}
      </div>

      <RoomTitleOverlay room={room} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARED SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function RoomTitleOverlay({ room, cold }: { room: Room; cold?: boolean }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-stone-950/90 via-stone-950/60 to-transparent">
      <div
        className="text-[10px] uppercase tracking-[0.22em] mb-0.5"
        style={{
          fontFamily: "Georgia, serif",
          color: cold ? "rgb(147,197,253)" : "rgb(180,120,40)",
          opacity: 0.75,
        }}
      >
        {room.type === "mystery_room" ? "~ undersøg rum ~" : room.type}
      </div>
      <h1
        className={cn("text-2xl font-bold leading-tight", cold ? "text-cyan-100" : "text-amber-100")}
        style={{ fontFamily: "Georgia, serif" }}
      >
        {room.look.icon} {room.title}
      </h1>
      <p
        className={cn("text-xs mt-1 italic leading-relaxed", cold ? "text-cyan-300/60" : "text-amber-800/80")}
        style={{ fontFamily: "Georgia, serif" }}
      >
        {room.look.atmosphere}
      </p>
    </div>
  );
}

function RingStain({
  x, y, size, opacity, color = "rgba(140,90,30,0.9)",
}: {
  x: number; y: number; size: number; opacity: number; color?: string;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        border: `1.5px solid ${color}`,
        opacity,
      }}
    />
  );
}

function Coaster({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return (
    <div
      className="absolute w-9 h-9 rounded-sm border border-amber-800/40 bg-stone-700/70"
      style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${rotate}deg)` }}
    >
      <div className="absolute inset-1 rounded-sm border border-amber-900/20" />
    </div>
  );
}

function TreeSilhouette({ x, height, width }: { x: number; height: number; width: number }) {
  return (
    <div
      className="absolute bottom-8 pointer-events-none"
      style={{ left: `${x}%` }}
    >
      {/* Triangle tree top */}
      <div
        className="w-0 h-0"
        style={{
          borderLeft: `${width / 2}px solid transparent`,
          borderRight: `${width / 2}px solid transparent`,
          borderBottom: `${height * 0.65}px solid rgba(15,30,15,0.95)`,
        }}
      />
      {/* Trunk */}
      <div
        className="mx-auto bg-stone-900/90"
        style={{ width: width * 0.2, height: height * 0.2 }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const SCENE_MAP: Record<string, (props: { room: Room }) => JSX.Element> = {
  kitchen: KitchenScene,
  fridge: FridgeScene,
  "coffee-table": CoffeeTableScene,
  terrace: TerraceScene,
  shed: ShedScene,
};

const STAR_POSITIONS = [
  { x: 8,  y: 5,  o: 0.8 },
  { x: 15, y: 12, o: 0.6 },
  { x: 25, y: 4,  o: 0.9 },
  { x: 33, y: 10, o: 0.5 },
  { x: 42, y: 7,  o: 0.7 },
  { x: 50, y: 3,  o: 0.85 },
  { x: 58, y: 9,  o: 0.6 },
  { x: 66, y: 5,  o: 0.75 },
  { x: 74, y: 12, o: 0.55 },
  { x: 82, y: 4,  o: 0.9 },
  { x: 90, y: 8,  o: 0.65 },
  { x: 95, y: 3,  o: 0.8 },
  { x: 20, y: 18, o: 0.4 },
  { x: 48, y: 15, o: 0.5 },
  { x: 72, y: 19, o: 0.45 },
];

"use client";

/**
 * RoomSceneFullscreen — each room is a full-height CSS painting.
 * Designed to sit behind a semi-transparent quest overlay.
 * Pure CSS + emoji, no external images.
 */

import React from "react";
import type { Room } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  room: Room;
  /** "hit" flashes green, "miss" flashes red */
  combatState?: "idle" | "hit" | "miss";
  className?: string;
}

export function RoomSceneFullscreen({ room, combatState = "idle", className }: Props) {
  const NamedScene = SCENE_MAP[room.id];
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {NamedScene ? <NamedScene /> : <DefaultScene room={room} />}
      {/* Combat hit flash */}
      {combatState === "hit" && (
        <div className="absolute inset-0 bg-green-500/25 animate-hit-flash pointer-events-none z-10" />
      )}
      {/* Combat miss flash */}
      {combatState === "miss" && (
        <div className="absolute inset-0 bg-red-500/20 animate-miss-flash pointer-events-none z-10" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KITCHEN
// Warm amber evening. Open door (left), stove (right), table
// center, fridge in background. Floor planks at bottom.
// ─────────────────────────────────────────────────────────────
function KitchenScene() {
  return (
    <div className="absolute inset-0">
      {/* Back wall — warm amber stone */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1c0e05 0%, #2a1808 25%, #201408 65%, #120c06 100%)" }} />

      {/* Overhead light bloom */}
      <div className="absolute top-0 left-0 right-0 h-2/3 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 50% at 50% 0%, rgba(210,140,40,0.16) 0%, transparent 100%)" }} />

      {/* Counter backsplash — horizontal strip across mid-wall */}
      <div className="absolute left-0 right-0" style={{ top: "38%", height: "3%", background: "linear-gradient(180deg, rgba(80,50,20,0.5), rgba(50,30,10,0.3))", borderTop: "1px solid rgba(120,80,30,0.35)" }} />

      {/* ── LEFT: OPEN DOOR ── */}
      {/* Door frame */}
      <div className="absolute" style={{ left: "5%", top: "8%", width: "19%", height: "62%", border: "5px solid rgba(90,55,18,0.85)", borderBottom: "none", borderRadius: "3px 3px 0 0", zIndex: 2 }}>
        {/* Outside — night sky through door */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #060d18 0%, #090f1a 55%, #080e10 85%, #0a1008 100%)" }}>
          {/* Stars outside */}
          {[[18,10],[42,6],[68,15],[30,25],[55,8],[78,22],[15,35],[60,30]].map(([x, y], i) => (
            <div key={i} className={cn("absolute rounded-full", i % 2 === 0 ? "animate-twinkle" : "animate-twinkle-slow")}
              style={{ left: `${x}%`, top: `${y}%`, width: "2px", height: "2px", background: "rgba(220,210,190,0.7)" }} />
          ))}
          {/* Tree silhouette bottom of door */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: "35%", background: "linear-gradient(180deg, transparent 0%, #050a04 100%)" }} />
          <div className="absolute bottom-0 left-[15%]" style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderBottom: "28px solid #050a04" }} />
          <div className="absolute bottom-0 right-[20%]" style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "22px solid #050a04" }} />
        </div>
        {/* Door handle */}
        <div className="absolute right-[-3px] top-[48%] w-2.5 h-4 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, rgba(210,170,60,0.9), rgba(140,100,30,0.8))", border: "1px solid rgba(180,140,40,0.5)" }} />
      </div>
      {/* Door threshold */}
      <div className="absolute" style={{ left: "4%", top: "70%", width: "21%", height: "2%", background: "rgba(70,45,15,0.6)" }} />

      {/* ── RIGHT: STOVE / OVEN ── */}
      <div className="absolute" style={{ right: "4%", top: "12%", width: "21%", height: "60%", zIndex: 2 }}>
        {/* Body */}
        <div className="absolute inset-0 rounded-t-sm" style={{ background: "linear-gradient(180deg, #1c1c1c 0%, #141414 100%)", border: "1px solid rgba(70,70,70,0.5)" }}>
          {/* Burner plate */}
          <div className="absolute top-0 left-0 right-0" style={{ height: "22%", background: "linear-gradient(180deg, #222, #1a1a1a)", borderBottom: "1px solid rgba(80,80,80,0.3)" }}>
            {/* Burner rings */}
            {[[28, 50], [72, 50]].map(([cx], i) => (
              <div key={i} className="absolute rounded-full"
                style={{ left: `${cx}%`, top: "50%", width: "30%", paddingBottom: "30%", transform: "translate(-50%, -50%)", background: "#111", border: "2px solid #2e2e2e" }}>
                <div className="absolute inset-[25%] rounded-full" style={{ background: "#0a0a0a", border: "1px solid #282828" }} />
              </div>
            ))}
          </div>
          {/* Control panel */}
          <div className="absolute flex items-center justify-around" style={{ top: "22%", left: 0, right: 0, height: "12%", background: "#181818", borderBottom: "1px solid #222" }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-full" style={{ width: "18%", paddingBottom: "18%", background: "#222", border: "1px solid #333", position: "relative" }}>
                <div className="absolute inset-[30%] rounded-full" style={{ background: "#2a2a2a" }} />
              </div>
            ))}
          </div>
          {/* Oven window */}
          <div className="absolute" style={{ top: "38%", left: "10%", right: "10%", height: "32%", background: "#0e0e0e", border: "2px solid #2a2a2a", borderRadius: "2px" }}>
            <div className="absolute inset-0 rounded-sm" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(200,80,20,0.22) 0%, transparent 100%)" }} />
            {/* Reflection */}
            <div className="absolute top-1 left-1 right-1 h-1 rounded-sm" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
          {/* Oven handle */}
          <div className="absolute" style={{ top: "72%", left: "12%", right: "12%", height: "5%", background: "#2e2e2e", borderRadius: "2px", border: "1px solid #3a3a3a" }} />
          {/* Bottom strip */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: "8%", background: "#181818", borderTop: "1px solid #1e1e1e" }} />
        </div>
      </div>

      {/* ── BACKGROUND: KITCHEN COUNTER (horizontal) ── */}
      <div className="absolute left-0 right-0" style={{ top: "41%", height: "6%" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #2a1c0e, #1e1408)", borderTop: "1px solid rgba(100,65,20,0.4)" }} />
        {/* Counter items */}
        <div className="absolute text-sm" style={{ left: "30%", top: "-14px" }}>☕</div>
        <div className="absolute text-xs" style={{ left: "40%", top: "-8px", opacity: 0.6 }}>🫙</div>
      </div>

      {/* ── FRIDGE (center-left, partially behind table) ── */}
      <div className="absolute" style={{ left: "27%", top: "15%", width: "13%", height: "42%", zIndex: 1 }}>
        <div className="absolute inset-0 rounded-t-sm" style={{ background: "linear-gradient(180deg, #252525 0%, #1c1c1c 100%)", border: "1px solid rgba(60,60,60,0.5)" }}>
          {/* Handle */}
          <div className="absolute right-1 top-5" style={{ width: "3px", height: "30%", background: "#404040", borderRadius: "1px" }} />
          {/* Magnets */}
          <div className="absolute text-[9px]" style={{ top: "10%", left: "12%" }}>🍺</div>
          <div className="absolute text-[8px]" style={{ top: "20%", left: "45%" }}>🍍</div>
          <div className="absolute text-[7px]" style={{ top: "30%", left: "18%" }}>A</div>
          <div className="absolute text-[8px]" style={{ top: "40%", left: "38%" }}>🍍</div>
          {/* Subtle hum glow */}
          <div className="absolute inset-0 rounded-t-sm animate-cold-pulse" style={{ background: "rgba(120,160,255,0.04)" }} />
        </div>
      </div>

      {/* ── CENTER: KITCHEN TABLE ── */}
      {/* Table top */}
      <div className="absolute" style={{ left: "18%", right: "18%", top: "44%", height: "9%", zIndex: 3 }}>
        <div className="absolute inset-0 rounded-sm" style={{
          background: "linear-gradient(180deg, #3c2510 0%, #2c1a08 60%, #221408 100%)",
          border: "1px solid rgba(100,65,20,0.5)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(160,100,40,0.15)",
        }}>
          {/* Wood grain */}
          {[15, 30, 48, 65, 80].map(x => (
            <div key={x} className="absolute top-0 bottom-0" style={{ left: `${x}%`, width: "1px", background: "rgba(50,28,8,0.3)" }} />
          ))}
          {/* Shadow on table top */}
          <div className="absolute inset-x-0 bottom-0 h-2 rounded-b-sm" style={{ background: "rgba(0,0,0,0.3)" }} />
        </div>
        {/* Items on table */}
        <div className="absolute text-base" style={{ top: "-20px", left: "12%" }}>☕</div>
        {/* Sticky note */}
        <div className="absolute" style={{ top: "-18px", right: "18%", width: "56px", height: "40px", background: "rgba(220,195,115,0.9)", borderRadius: "1px", transform: "rotate(-2.5deg)", boxShadow: "1px 2px 4px rgba(0,0,0,0.4)", zIndex: 4 }}>
          <div style={{ padding: "3px 4px", fontSize: "5px", color: "rgba(30,15,0,0.85)", fontFamily: "Georgia,serif", lineHeight: 1.3 }}>
            Count the magnets.<br />Subtract the ones<br />that don&apos;t belong.
          </div>
        </div>
      </div>
      {/* Table legs */}
      <div className="absolute" style={{ left: "20%", top: "53%", width: "5%", height: "20%", zIndex: 2 }}>
        <div className="absolute inset-x-[30%] top-0 bottom-0 rounded-b-sm" style={{ background: "linear-gradient(180deg, #2c1a08, #1a1008)", border: "1px solid rgba(80,50,15,0.3)" }} />
      </div>
      <div className="absolute" style={{ right: "20%", top: "53%", width: "5%", height: "20%", zIndex: 2 }}>
        <div className="absolute inset-x-[30%] top-0 bottom-0 rounded-b-sm" style={{ background: "linear-gradient(180deg, #2c1a08, #1a1008)", border: "1px solid rgba(80,50,15,0.3)" }} />
      </div>

      {/* ── FLOOR ── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "28%", zIndex: 1 }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1208 0%, #0e0c07 100%)" }}>
          {/* Planks — vertical dividers */}
          {[12, 24, 36, 48, 60, 72, 84].map(x => (
            <div key={x} className="absolute top-0 bottom-0" style={{ left: `${x}%`, width: "1px", background: "rgba(60,40,15,0.18)" }} />
          ))}
          {/* Plank breaks — horizontal */}
          {[33, 66].map(y => (
            <div key={y} className="absolute left-0 right-0" style={{ top: `${y}%`, height: "1px", background: "rgba(50,32,12,0.12)" }} />
          ))}
          {/* Floor shadow from table */}
          <div className="absolute" style={{ left: "20%", right: "20%", top: 0, height: "20%", background: "rgba(0,0,0,0.3)", filter: "blur(8px)" }} />
        </div>
      </div>

      {/* Steam from stove burner */}
      <div className="absolute" style={{ right: "11%", top: "9%" }}>
        <div className="animate-steam w-0.5 h-5 rounded-full" style={{ background: "rgba(180,160,120,0.18)", filter: "blur(2px)" }} />
      </div>
      <div className="absolute" style={{ right: "14%", top: "8%" }}>
        <div className="animate-steam-delay w-0.5 h-4 rounded-full" style={{ background: "rgba(180,160,120,0.14)", filter: "blur(2px)" }} />
      </div>
      {/* Steam from coffee */}
      <div className="absolute" style={{ left: "22%", top: "38%" }}>
        <div className="animate-steam-slow w-0.5 h-3 rounded-full" style={{ background: "rgba(180,160,120,0.15)", filter: "blur(1px)" }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FRIDGE
// The open fridge fills most of the view. Arctic cold.
// The lone beer on the center shelf. Condensation drips.
// ─────────────────────────────────────────────────────────────
function FridgeScene() {
  return (
    <div className="absolute inset-0">
      {/* Dark kitchen surroundings */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #080c10 0%, #0a0e14 100%)" }} />

      {/* Open fridge door — centered, tall */}
      <div className="absolute" style={{ left: "12%", right: "12%", top: "5%", bottom: "8%", zIndex: 2 }}>
        {/* Fridge body */}
        <div className="absolute inset-0 rounded-t-sm" style={{ background: "linear-gradient(180deg, #1a2030 0%, #141824 100%)", border: "2px solid rgba(60,80,100,0.5)", boxShadow: "0 0 40px rgba(80,160,220,0.12)" }}>
          {/* Cold interior glow */}
          <div className="absolute inset-0 rounded-t-sm animate-cold-pulse" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(100,200,240,0.08) 0%, transparent 100%)" }} />

          {/* Frost on walls */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            {[8, 22, 38, 55, 70, 85].map(x => (
              <div key={x} className="absolute top-0 bottom-0" style={{ left: `${x}%`, width: "1px", background: "rgba(180,220,255,0.5)" }} />
            ))}
          </div>

          {/* Shelves */}
          <div className="absolute left-4 right-4" style={{ top: "33%", height: "2px", background: "rgba(80,120,160,0.4)", borderRadius: "1px" }} />
          <div className="absolute left-4 right-4" style={{ top: "66%", height: "2px", background: "rgba(80,120,160,0.4)", borderRadius: "1px" }} />

          {/* THE LONE BEER — center shelf, alone */}
          <div className="absolute" style={{ top: "33%", left: "50%", transform: "translateX(-50%)", zIndex: 5 }}>
            <div className="flex flex-col items-center">
              <div style={{ fontSize: "2.8rem", lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(80,180,240,0.4))" }}>🍺</div>
              {/* Note taped to beer */}
              <div style={{ marginTop: "6px", width: "64px", height: "32px", background: "rgba(240,235,215,0.92)", borderRadius: "1px", transform: "rotate(1deg)", boxShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>
                <div style={{ padding: "3px 5px", fontSize: "5.5px", color: "rgba(20,10,0,0.85)", fontFamily: "Georgia,serif", lineHeight: 1.4, textAlign: "center" }}>
                  DO NOT OPEN<br />until instructed
                </div>
              </div>
            </div>
          </div>

          {/* Other shelf items (faint) */}
          <div className="absolute text-base opacity-20" style={{ top: "68%", left: "20%" }}>🧃</div>
          <div className="absolute text-sm opacity-15" style={{ top: "70%", right: "22%" }}>🥚</div>

          {/* Condensation drips */}
          <div className="absolute" style={{ top: "5%", left: "25%", width: "1px", height: "12px", background: "rgba(150,220,255,0.6)", borderRadius: "1px" }}>
            <div className="animate-drip w-full h-full rounded-full" style={{ background: "rgba(150,220,255,0.5)" }} />
          </div>
          <div className="absolute" style={{ top: "5%", left: "55%", width: "1px", height: "9px", background: "rgba(150,220,255,0.5)", borderRadius: "1px" }}>
            <div className="animate-drip-delay w-full h-full rounded-full" style={{ background: "rgba(150,220,255,0.45)" }} />
          </div>
          <div className="absolute" style={{ top: "5%", right: "25%", width: "1px", height: "11px", background: "rgba(150,220,255,0.55)", borderRadius: "1px" }}>
            <div className="animate-drip-slow w-full h-full rounded-full" style={{ background: "rgba(150,220,255,0.4)" }} />
          </div>

          {/* Cold mist at bottom of fridge */}
          <div className="absolute bottom-0 left-0 right-0" style={{ height: "15%", background: "linear-gradient(180deg, transparent, rgba(80,160,220,0.12))" }} />

          {/* Temperature dial — bottom right */}
          <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full" style={{ background: "#0a1020", border: "1px solid rgba(80,120,180,0.5)" }}>
            <div className="absolute inset-1 rounded-full animate-flicker" style={{ background: "#dc2626" }} />
          </div>
        </div>

        {/* Fridge door seal */}
        <div className="absolute inset-0 rounded-t-sm pointer-events-none" style={{ boxShadow: "inset 0 0 0 4px rgba(50,70,100,0.3), 0 0 60px rgba(80,160,220,0.15)" }} />
      </div>

      {/* Floor in front of fridge */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "8%", background: "linear-gradient(180deg, #080c10, #050810)" }}>
        {/* Fridge shadow on floor */}
        <div className="absolute" style={{ left: "15%", right: "15%", top: 0, height: "100%", background: "rgba(80,160,220,0.04)", filter: "blur(4px)" }} />
      </div>

      {/* Ambient cold glow from fridge sides */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 40%, rgba(80,160,220,0.06) 0%, transparent 70%)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COFFEE TABLE
// Low POV looking at the worn table. Ring stains visible.
// Living room behind: couch silhouette, window light.
// ─────────────────────────────────────────────────────────────
function CoffeeTableScene() {
  return (
    <div className="absolute inset-0">
      {/* Room bg */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0e0c08 0%, #161008 40%, #1a1208 100%)" }} />

      {/* Window — back wall, slight glow */}
      <div className="absolute" style={{ left: "60%", top: "8%", width: "25%", height: "30%" }}>
        <div className="absolute inset-0" style={{ background: "rgba(8,12,20,0.95)", border: "3px solid rgba(70,50,20,0.7)", borderRadius: "1px" }}>
          {/* Moonlight */}
          <div className="absolute inset-0 animate-cold-pulse" style={{ background: "radial-gradient(ellipse 60% 80% at 80% 20%, rgba(200,190,150,0.08), transparent)" }} />
          {/* Panes */}
          <div className="absolute inset-x-0" style={{ top: "50%", height: "1px", background: "rgba(70,50,20,0.6)" }} />
          <div className="absolute inset-y-0" style={{ left: "50%", width: "1px", background: "rgba(70,50,20,0.6)" }} />
        </div>
      </div>

      {/* Couch silhouette — left */}
      <div className="absolute" style={{ left: "0%", top: "30%", width: "45%", height: "30%", zIndex: 1 }}>
        <div className="absolute inset-0 rounded-t-sm" style={{ background: "linear-gradient(180deg, #1c1408 0%, #141008 100%)", border: "1px solid rgba(60,40,15,0.3)" }}>
          <div className="absolute top-0 left-0 bottom-0" style={{ width: "12%", background: "rgba(0,0,0,0.2)", borderRight: "1px solid rgba(60,40,15,0.2)" }} />
          <div className="absolute top-0 right-0 bottom-0" style={{ width: "12%", background: "rgba(0,0,0,0.2)", borderLeft: "1px solid rgba(60,40,15,0.2)" }} />
        </div>
      </div>

      {/* ── THE COFFEE TABLE ── fills center-lower portion */}
      <div className="absolute" style={{ left: "8%", right: "8%", top: "48%", zIndex: 4 }}>
        {/* Table top surface */}
        <div className="absolute inset-x-0" style={{ top: 0, height: "80px", background: "linear-gradient(180deg, #3a2810 0%, #2c1e0a 100%)", border: "1px solid rgba(100,65,20,0.4)", boxShadow: "0 12px 40px rgba(0,0,0,0.8), 0 2px 0 rgba(160,100,30,0.1)", borderRadius: "2px" }}>
          {/* Wood grain */}
          {[10, 22, 35, 48, 62, 75, 88].map(x => (
            <div key={x} className="absolute top-0 bottom-0" style={{ left: `${x}%`, width: "1px", background: "rgba(50,28,8,0.25)" }} />
          ))}

          {/* Ring stains */}
          {[
            { cx: 20, cy: 38, r: 28, op: 0.20 },
            { cx: 42, cy: 22, r: 22, op: 0.16 },
            { cx: 60, cy: 45, r: 32, op: 0.22 },
            { cx: 50, cy: 30, r: 26, op: 0.18 },
            { cx: 75, cy: 20, r: 18, op: 0.14 },
            { cx: 30, cy: 58, r: 20, op: 0.12 },
          ].map((ring, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: `${ring.cx}%`, top: `${ring.cy}px`, width: ring.r, height: ring.r,
              transform: "translate(-50%, -50%)",
              border: `1.5px solid rgba(140,90,25,${ring.op + 0.05})`,
              opacity: ring.op * 5,
            }} />
          ))}

          {/* Coasters scattered */}
          <div className="absolute" style={{ left: "12%", top: "8px", width: "32px", height: "32px", background: "#2a1c0a", border: "1px solid rgba(100,65,20,0.3)", borderRadius: "2px", transform: "rotate(-8deg)" }}>
            <div className="absolute inset-1 rounded-sm" style={{ border: "1px solid rgba(80,50,15,0.2)" }} />
          </div>
          <div className="absolute" style={{ right: "15%", top: "12px", width: "28px", height: "28px", background: "#2a1c0a", border: "1px solid rgba(100,65,20,0.3)", borderRadius: "2px", transform: "rotate(12deg)" }}>
            <div className="absolute inset-1 rounded-sm" style={{ border: "1px solid rgba(80,50,15,0.2)" }} />
          </div>
          {/* THIRD COASTER — something underneath */}
          <div className="absolute" style={{ left: "45%", top: "16px", width: "30px", height: "30px", background: "#241808", border: "1px solid rgba(100,65,20,0.4)", borderRadius: "2px", transform: "rotate(-4deg)", zIndex: 5, boxShadow: "0 0 8px rgba(180,130,50,0.15)" }}>
            <div className="absolute inset-1 rounded-sm animate-cold-pulse" style={{ background: "rgba(180,130,40,0.1)" }} />
          </div>

          {/* Candle */}
          <div className="absolute" style={{ right: "5%", top: "-20px" }}>
            <div className="text-lg animate-flame" style={{ lineHeight: 1 }}>🕯️</div>
            <div className="absolute" style={{ top: "-8px", left: "50%", transform: "translateX(-50%)", width: "24px", height: "24px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,180,60,0.15), transparent)", filter: "blur(4px)" }} />
          </div>
        </div>

        {/* Table legs */}
        <div className="absolute flex justify-between" style={{ top: "78px", left: "5%", right: "5%", height: "60px" }}>
          {[0, 1].map(i => (
            <div key={i} className="w-2 rounded-b-sm" style={{ background: "linear-gradient(180deg, #2c1a08, #1a1008)", border: "1px solid rgba(80,50,15,0.3)" }} />
          ))}
        </div>
      </div>

      {/* Floor rug */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "25%", background: "linear-gradient(180deg, #120e08 0%, #0a0806 100%)", zIndex: 0 }}>
        {/* Rug pattern hint */}
        <div className="absolute inset-x-[15%]" style={{ top: "10%", height: "60%", border: "1px solid rgba(80,50,20,0.12)", borderRadius: "2px" }} />
      </div>

      {/* Dust mote particles */}
      <div className="absolute text-[3px] animate-float" style={{ top: "30%", left: "35%", color: "rgba(200,160,60,0.3)" }}>•</div>
      <div className="absolute text-[3px] animate-float-delay" style={{ top: "40%", left: "55%", color: "rgba(200,160,60,0.25)" }}>•</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TERRACE
// Night exterior. Looking out from the terrace.
// Trees silhouetted, stars, railing in foreground.
// The lone chair pointed at the treeline.
// ─────────────────────────────────────────────────────────────
function TerraceScene() {
  return (
    <div className="absolute inset-0">
      {/* Night sky */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #050810 0%, #070d12 30%, #080e0a 65%, #060908 100%)" }} />

      {/* Moon */}
      <div className="absolute" style={{ right: "12%", top: "8%" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(230,220,180,0.20)", boxShadow: "0 0 20px rgba(200,190,140,0.12)" }} />
        <div style={{ position: "absolute", top: "3px", right: "-2px", width: "22px", height: "22px", borderRadius: "50%", background: "#050810" }} />
      </div>

      {/* Stars */}
      {[[8,6],[18,3],[28,8],[38,4],[50,2],[60,7],[70,4],[80,8],[90,3],[95,6],
        [12,14],[25,12],[45,10],[65,13],[85,11],[15,20],[55,18],[75,16],[92,19]].map(([x, y], i) => (
        <div key={i}
          className={cn("absolute rounded-full", i % 3 === 0 ? "animate-twinkle" : i % 3 === 1 ? "animate-twinkle-slow" : "animate-twinkle-delay")}
          style={{ left: `${x}%`, top: `${y}%`, width: "2px", height: "2px", background: "rgba(220,210,190,0.65)" }}
        />
      ))}

      {/* Tree line — center horizon */}
      <div className="absolute left-0 right-0" style={{ top: "35%", height: "35%", zIndex: 2 }}>
        {/* Tree silhouettes */}
        {[
          { x: 2,  h: 120, w: 22 },
          { x: 12, h: 100, w: 18 },
          { x: 20, h: 130, w: 24 },
          { x: 30, h: 95,  w: 16 },
          { x: 40, h: 115, w: 20 },
          { x: 58, h: 108, w: 19 },
          { x: 66, h: 140, w: 26 },
          { x: 75, h: 95,  w: 15 },
          { x: 83, h: 120, w: 22 },
          { x: 92, h: 100, w: 17 },
        ].map((t, i) => (
          <div key={i} className="absolute bottom-0" style={{ left: `${t.x}%` }}>
            <div style={{ width: 0, height: 0, borderLeft: `${t.w / 2}px solid transparent`, borderRight: `${t.w / 2}px solid transparent`, borderBottom: `${t.h * 0.72}px solid rgba(4,10,5,0.97)` }} />
            <div style={{ width: `${t.w * 0.18}px`, height: `${t.h * 0.28}px`, background: "rgba(4,10,5,0.95)", margin: "0 auto" }} />
          </div>
        ))}
        {/* Ground fill behind trees */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: "25%", background: "rgba(4,10,5,0.95)" }} />
      </div>

      {/* Terrace deck — wooden floor foreground */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "30%", zIndex: 3 }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a1608 0%, #0e0c06 100%)" }}>
          {/* Deck planks */}
          {[0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96].map(x => (
            <div key={x} className="absolute top-0 bottom-0" style={{ left: `${x}%`, width: "1px", background: "rgba(60,45,15,0.2)" }} />
          ))}
          {[33, 66].map(y => (
            <div key={y} className="absolute left-0 right-0" style={{ top: `${y}%`, height: "1px", background: "rgba(50,38,12,0.15)" }} />
          ))}
        </div>
      </div>

      {/* Wooden railing — across the screen */}
      <div className="absolute left-0 right-0" style={{ top: "69%", zIndex: 4 }}>
        {/* Top rail */}
        <div style={{ height: "6px", background: "linear-gradient(180deg, #2a2010, #1e1808)", borderTop: "1px solid rgba(80,60,20,0.5)" }} />
        {/* Balusters */}
        <div className="flex justify-around" style={{ height: "36px", paddingTop: "2px" }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: "3px", height: "100%", background: "rgba(35,26,10,0.8)" }} />
          ))}
        </div>
        {/* Bottom rail */}
        <div style={{ height: "5px", background: "#1c1608", borderBottom: "1px solid rgba(60,45,15,0.3)" }} />
      </div>

      {/* Lone chair — pointing at treeline */}
      <div className="absolute" style={{ left: "42%", bottom: "30%", zIndex: 5, transform: "translateX(-50%)" }}>
        <div className="text-3xl" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.8))", transform: "scaleX(-1)" }}>🪑</div>
      </div>

      {/* Cold mist at ground level */}
      <div className="absolute" style={{ bottom: "28%", left: "30%", width: "50px", height: "12px", background: "rgba(180,200,180,0.06)", borderRadius: "50%", filter: "blur(6px)" }} />

      {/* Horizon ambient glow (moonlight on treetops) */}
      <div className="absolute" style={{ top: "32%", left: 0, right: 0, height: "6%", background: "radial-gradient(ellipse 60% 100% at 50% 50%, rgba(80,100,70,0.06), transparent)", pointerEvents: "none" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHED
// Dark interior. Tools on walls. Hanging bulb. Workbench.
// Laminated inventory sheet nailed to back wall.
// ─────────────────────────────────────────────────────────────
function ShedScene() {
  return (
    <div className="absolute inset-0">
      {/* Dark interior walls */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0e0e0e 50%, #080808 100%)" }} />

      {/* Subtle moisture stains */}
      <div className="absolute" style={{ top: "15%", left: "8%", width: "60px", height: "80px", background: "rgba(100,70,30,0.08)", borderRadius: "50%", filter: "blur(12px)" }} />
      <div className="absolute" style={{ top: "25%", right: "10%", width: "40px", height: "60px", background: "rgba(80,60,20,0.06)", borderRadius: "50%", filter: "blur(8px)" }} />

      {/* Pegboard — back wall */}
      <div className="absolute left-0 right-0" style={{ top: "5%", height: "55%", zIndex: 1 }}>
        <div className="absolute inset-0" style={{ opacity: 0.08 }}>
          {[0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98].map(x => (
            <div key={x} className="absolute top-0 bottom-0" style={{ left: `${x}%`, width: "1px", background: "#666" }} />
          ))}
          {[0, 12, 25, 38, 50, 62, 75, 88, 100].map(y => (
            <div key={y} className="absolute left-0 right-0" style={{ top: `${y}%`, height: "1px", background: "#555" }} />
          ))}
        </div>

        {/* Tools on wall */}
        <div className="absolute text-2xl" style={{ left: "8%", top: "10%", opacity: 0.55, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}>🔧</div>
        <div className="absolute text-xl" style={{ left: "20%", top: "8%", opacity: 0.45, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}>⚒️</div>
        <div className="absolute text-2xl" style={{ left: "35%", top: "12%", opacity: 0.40 }}>🪚</div>
        <div className="absolute text-xl" style={{ right: "20%", top: "10%", opacity: 0.50 }}>🪛</div>
        <div className="absolute text-xl" style={{ right: "8%", top: "8%", opacity: 0.42 }}>🔩</div>

        {/* Laminated inventory sheet — back wall center */}
        <div className="absolute" style={{ left: "50%", top: "20%", transform: "translateX(-50%)", zIndex: 3 }}>
          {/* Tacks */}
          <div className="absolute" style={{ top: "-4px", left: "50%", transform: "translateX(-50%)", width: "8px", height: "8px", borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, rgba(220,180,60,0.9), rgba(160,120,30,0.8))", border: "1px solid rgba(180,140,40,0.5)" }} />
          <div className="absolute w-16 h-20 rounded-sm shadow-lg" style={{ background: "rgba(230,225,210,0.92)", border: "1px solid rgba(180,170,140,0.5)", marginTop: "4px" }}>
            <div style={{ padding: "4px 5px" }}>
              <div style={{ fontSize: "5px", fontFamily: "Georgia,serif", color: "rgba(20,10,0,0.85)", fontWeight: "bold", textAlign: "center", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Inventarliste</div>
              {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} style={{ height: "1px", background: "rgba(80,60,30,0.25)", marginBottom: "6px" }} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Hanging bulb — center */}
      <div className="absolute" style={{ left: "58%", top: 0, zIndex: 4, transform: "translateX(-50%)" }}>
        {/* Cord */}
        <div style={{ width: "1px", height: "60px", background: "rgba(80,80,80,0.7)", margin: "0 auto" }} />
        {/* Bulb */}
        <div className="text-2xl animate-flicker" style={{ lineHeight: 1, filter: "drop-shadow(0 0 8px rgba(240,200,80,0.4))" }}>💡</div>
        {/* Light cone */}
        <div style={{
          margin: "0 auto",
          width: 0,
          height: 0,
          borderLeft: "32px solid transparent",
          borderRight: "32px solid transparent",
          borderTop: "70px solid rgba(240,200,60,0.05)",
          transform: "translateX(-50%) translateX(12px)"
        }} />
      </div>

      {/* Dust motes in bulb beam */}
      <div className="absolute animate-float" style={{ top: "22%", left: "54%", width: "2px", height: "2px", borderRadius: "50%", background: "rgba(220,180,80,0.35)" }} />
      <div className="absolute animate-float-delay" style={{ top: "28%", left: "60%", width: "2px", height: "2px", borderRadius: "50%", background: "rgba(220,180,80,0.28)" }} />
      <div className="absolute animate-float-slow" style={{ top: "35%", left: "57%", width: "2px", height: "2px", borderRadius: "50%", background: "rgba(220,180,80,0.32)" }} />

      {/* Workbench / shelf on right side */}
      <div className="absolute" style={{ right: 0, top: "45%", width: "22%", height: "28%", zIndex: 2 }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1c1408, #141008)", borderLeft: "1px solid rgba(60,40,15,0.4)", borderTop: "2px solid rgba(80,55,20,0.5)" }}>
          <div className="absolute text-sm opacity-30" style={{ top: "20%", left: "15%" }}>🔩</div>
          <div className="absolute text-xs opacity-25" style={{ top: "50%", right: "20%" }}>⚙️</div>
        </div>
      </div>

      {/* Broken chair in left corner */}
      <div className="absolute text-2xl" style={{ bottom: "28%", left: "4%", zIndex: 2, opacity: 0.35, transform: "rotate(-8deg)" }}>🪑</div>

      {/* Floor — dirt/concrete */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "28%", zIndex: 1 }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0e0c08 0%, #090806 100%)" }}>
          {[20, 45, 70].map(x => (
            <div key={x} className="absolute top-0 bottom-0" style={{ left: `${x}%`, width: "1px", background: "rgba(50,35,12,0.12)" }} />
          ))}
        </div>
        {/* Moisture patch */}
        <div className="absolute" style={{ right: "10%", bottom: "10%", width: "40px", height: "12px", background: "rgba(60,50,30,0.25)", borderRadius: "50%", filter: "blur(4px)" }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DEFAULT — strong atmospheric gradient with large room icon
// ─────────────────────────────────────────────────────────────
function DefaultScene({ room }: { room: Room }) {
  return (
    <div className="absolute inset-0">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-70", room.look.colorFrom, room.look.colorTo)} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%)" }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="text-[8rem] opacity-10">{room.look.icon}</div>
      </div>
    </div>
  );
}

// Scene map — keyed by room ID
const SCENE_MAP: Record<string, () => React.ReactElement> = {
  kitchen:        KitchenScene,
  fridge:         FridgeScene,
  "coffee-table": CoffeeTableScene,
  terrace:        TerraceScene,
  shed:           ShedScene,
};

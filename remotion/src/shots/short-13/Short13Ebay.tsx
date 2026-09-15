import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, StatChip, prog } from '../../lib/shorts';
import { MapLabel, WorldLayer, makeMapScale } from '../../lib/map';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short13Ebay',
  durationInSeconds: 42,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e';
const TEAL = '#4db8a8';
const INDIGO = '#6366f1';
const VIOLET = '#9b7cc4';
const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// =============================================================================
// THE MAP — real Mercator (lib/map.tsx) fit to a band that leaves room for the flow/FX/
// icon stages below. Malaysia + three buyer countries, real lat/lon (no invented geography).
// =============================================================================
const SCALE = makeMapScale([-180, 180], [-45, 65], { x: 50, y: 460, w: 980 });
const KUL = SCALE.px(101.7, 3.14); // Kuala Lumpur
const US = SCALE.px(-98, 39); // continental US, generic
const UK = SCALE.px(-0.12, 51.5); // London
const AU = SCALE.px(151.2, -33.9); // Sydney

// A gently-arced connector: control point pulled up (toward smaller y) from the midpoint.
const arcPath = (a: [number, number], b: [number, number], bulge: number) => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2 - bulge;
  return `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
};

// =============================================================================
// CUES (global seconds -> frames). Six hand points, each a hard boundary: the previous stage
// is fully OUT by the time the next is fully IN (a short 0.2s fade each side of the boundary,
// never overlapping) — two different pieces of text crossfading in the same slot reads as a
// smudge, a clean cut reads as a beat. Only the MAP stage (+ title + kicker-less hook look)
// reprises for the loop; flow/FX/no-stock/twist are one-shot and never need to match frame 0.
// =============================================================================
const HOOK_OUT = F(4.0); // title starts clearing
const T1 = F(13.0); // map -> money-flow ("Duit terus masuk...")
const T2 = F(18.0); // money-flow -> FX bars ("Jual dalam Dollar...")
const T3 = F(22.7); // FX -> no-stock chips ("Tak payah laman web...")
const T4 = F(28.2); // no-stock -> twist stat ("Bukan cerita cepat kaya...")
const T5 = F(39.2); // twist -> reset (map + title reprise, no kicker)

const MAP_OUT_START = T1 - 6;
const MAP_OUT_END = T1;
const MAP_BACK_START = T5 + 3;
const MAP_BACK_END = T5 + 21; // ~F(39.9), lands well before the F(42) end

const FLOW_IN_START = T1;
const FLOW_IN_END = T1 + 6;
const FLOW_OUT_START = T2 - 6;
const FLOW_OUT_END = T2;

const FX_IN_START = T2;
const FX_IN_END = T2 + 6;
const FX_OUT_START = T3 - 6;
const FX_OUT_END = T3;

const ICON_IN_START = T3;
const ICON_IN_END = T3 + 6;
const ICON_OUT_START = T4 - 6;
const ICON_OUT_END = T4;

const TWIST_IN_START = T4;
const TWIST_IN_END = T4 + 6;
const TWIST_OUT_START = T5 - 6;
const TWIST_OUT_END = T5;

const TITLE_BACK_IN = MAP_BACK_START;
const LOOP_F = T5;
const END = F(42.0);

// =============================================================================
// SMALL LOCAL PIECES — specific enough to this one explainer that they live in the shot,
// not a shared lib (see script.md's series note).
// =============================================================================
const Chip: React.FC<{ text: string; color: string; x: number; y: number; opacity: number; scale?: number }> = ({
  text,
  color,
  x,
  y,
  opacity,
  scale = 1,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity,
      background: 'rgba(12,14,20,0.9)',
      border: `2px solid ${color}88`,
      borderRadius: 16,
      padding: '18px 28px',
      whiteSpace: 'nowrap',
    }}
  >
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, letterSpacing: 2, color: '#fff' }}>{text}</div>
  </div>
);

const FlowArrow: React.FC<{ x1: number; x2: number; y: number; opacity: number; color: string }> = ({
  x1,
  x2,
  y,
  opacity,
  color,
}) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity }}>
    <line x1={x1} y1={y} x2={x2 - 14} y2={y} stroke={color} strokeWidth={4} />
    <polygon points={`${x2},${y} ${x2 - 16},${y - 9} ${x2 - 16},${y + 9}`} fill={color} />
  </svg>
);

const Bar: React.FC<{ label: string; w: number; y: number; color: string; p: number }> = ({ label, w, y, color, p }) => (
  <div style={{ position: 'absolute', left: 90, top: y, width: 900 }}>
    <div
      style={{
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: 28,
        letterSpacing: 2,
        color: 'rgba(255,255,255,0.75)',
        marginBottom: 10,
      }}
    >
      {label}
    </div>
    <div style={{ height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.08)' }}>
      <div
        style={{
          height: '100%',
          width: `${w * Math.max(0, Math.min(1, p))}%`,
          borderRadius: 12,
          background: color,
        }}
      />
    </div>
  </div>
);

const Short13Ebay: React.FC = () => {
  const f = useCurrentFrame();

  // gentle whole-canvas breathe, same device as short-11: settle in on the hook, reverse
  // out on the loop so the last frame rhymes with the first.
  const punch = f < LOOP_F ? 1.04 - 0.04 * EASE_INOUT(prog(f, 0, 30)) : 1.0 + 0.04 * EASE_INOUT(prog(f, LOOP_F, END));

  const mapOp = Math.max(1 - prog(f, MAP_OUT_START, MAP_OUT_END), prog(f, MAP_BACK_START, MAP_BACK_END));
  const flowOp = prog(f, FLOW_IN_START, FLOW_IN_END) * (1 - prog(f, FLOW_OUT_START, FLOW_OUT_END));
  const fxOp = prog(f, FX_IN_START, FX_IN_END) * (1 - prog(f, FX_OUT_START, FX_OUT_END));
  const iconOp = prog(f, ICON_IN_START, ICON_IN_END) * (1 - prog(f, ICON_OUT_START, ICON_OUT_END));
  const twistOp = prog(f, TWIST_IN_START, TWIST_IN_END) * (1 - prog(f, TWIST_OUT_START, TWIST_OUT_END));
  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT, HOOK_OUT + 10) + prog(f, TITLE_BACK_IN, MAP_BACK_END));

  // traveling "sale" pulse along each arc — pure frame-modulo, so it is already mid-motion at
  // frame 0 (a loop with a visible start/stop would be the opposite of seamless) and repeats
  // identically every time the video replays.
  const dotT = (period: number, phase: number) => ((f + phase) % period) / period;
  const along = (a: [number, number], b: [number, number], bulge: number, t: number): [number, number] => {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2 - bulge;
    const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * mx + t * t * b[0];
    const y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * my + t * t * b[1];
    return [x, y];
  };
  const [usDotX, usDotY] = along(KUL, US, 70, dotT(90, 0));
  const [ukDotX, ukDotY] = along(KUL, UK, 90, dotT(100, 33));
  const [auDotX, auDotY] = along(KUL, AU, 60, dotT(80, 60));

  const pulse = (f % 60) / 60; // KUL origin ring, always animating

  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop base="#0f1216" glow="#182233" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        {/* ============================= MAP STAGE (reprises for the loop) ============================= */}
        <div style={{ opacity: mapOp }}>
          <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
            <WorldLayer scale={SCALE} fill="#1c2734" stroke="#2c3c52" />
            <path d={arcPath(KUL, US, 70)} fill="none" stroke={TEAL} strokeWidth={2.5} opacity={0.55} />
            <path d={arcPath(KUL, UK, 90)} fill="none" stroke={TEAL} strokeWidth={2.5} opacity={0.55} />
            <path d={arcPath(KUL, AU, 60)} fill="none" stroke={TEAL} strokeWidth={2.5} opacity={0.55} />
            <circle cx={usDotX} cy={usDotY} r={6} fill={GOLD} />
            <circle cx={ukDotX} cy={ukDotY} r={6} fill={GOLD} />
            <circle cx={auDotX} cy={auDotY} r={6} fill={GOLD} />
            {/* KUL origin: solid pin + a looping pulse ring */}
            <circle cx={KUL[0]} cy={KUL[1]} r={8} fill={GOLD} />
            <circle
              cx={KUL[0]}
              cy={KUL[1]}
              r={8 + 22 * pulse}
              fill="none"
              stroke={GOLD}
              strokeWidth={2.5}
              opacity={0.6 * (1 - pulse)}
            />
          </svg>
          <MapLabel x={KUL[0]} y={KUL[1] - 46} title="MALAYSIA" color={GOLD} size={28} />
          <MapLabel x={US[0]} y={US[1] - 40} title="AS" color={TEAL} size={26} opacity={0.9} />
          <MapLabel x={UK[0]} y={UK[1] - 40} title="UK" color={TEAL} size={26} opacity={0.9} />
          <MapLabel x={AU[0]} y={AU[1] - 40} title="AUSTRALIA" color={TEAL} size={26} opacity={0.9} anchor="end" />
          <StatChip label="Capaian eBay" value="136 juta pembeli, di 190 negara" color={TEAL} x={320} y={900} w={440} at={-100} />
        </div>

        {/* ============================= MONEY-FLOW STAGE (one-shot; wrapper opacity handles the
            whole fade, children are static — a stray internal cue outliving a 6-frame wrapper
            fade was the short-13 bug that produced double-exposed text) ============================= */}
        <div style={{ opacity: flowOp }}>
          <Chip text="EBAY" color={GOLD} x={230} y={620} opacity={1} />
          <Chip text="PAYONEER" color={TEAL} x={540} y={620} opacity={1} />
          <Chip text="BANK (RM)" color={INDIGO} x={850} y={620} opacity={1} />
          <FlowArrow x1={310} x2={450} y={620} color={GOLD} opacity={1} />
          <FlowArrow x1={630} x2={750} y={620} color={TEAL} opacity={1} />
          <StatChip
            label="Bila duit sampai"
            value="1-2 hari bekerja, lepas dibayar"
            color={GOLD}
            x={320}
            y={760}
            w={440}
            at={-100}
          />
        </div>

        {/* ============================= FX STAGE (one-shot) ============================= */}
        <div style={{ opacity: fxOp }}>
          <Bar label="JUAL DALAM" w={22} y={560} color={INDIGO} p={prog(f, FX_IN_START, FX_IN_START + 15)} />
          <Bar label="TERIMA LEBIH DALAM" w={92} y={700} color={GOLD} p={prog(f, FX_IN_START + 6, FX_IN_START + 21)} />
          <div style={{ position: 'absolute', left: 90, top: 770, fontFamily: FONT_BODY, fontSize: 30, color: '#fff' }}>
            1 USD
          </div>
          <div
            style={{
              position: 'absolute',
              left: 90,
              top: 810,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 30,
              color: GOLD,
            }}
          >
            LEBIH RM 4
          </div>
        </div>

        {/* ============================= NO-STOCK STAGE (one-shot) ============================= */}
        <div style={{ opacity: iconOp }}>
          <Chip text="BARANG LAMA" color={TEAL} x={540} y={560} opacity={1} />
          <Chip text="KOLEKSI" color={INDIGO} x={540} y={670} opacity={1} />
          <Chip text="BUATAN TANGAN" color={VIOLET} x={540} y={780} opacity={1} />
        </div>

        {/* ============================= TWIST STAGE (one-shot) ============================= */}
        <div style={{ opacity: twistOp }}>
          <StatChip
            label="Ramai dah buat"
            value="Lebih 20 juta penjual di seluruh dunia"
            color={GOLD}
            x={320}
            y={620}
            w={440}
            at={-100}
          />
        </div>

        {/* title + kicker painted LAST so they sit above every stage's graphics (map landmasses,
            chips, bars) instead of being occluded by whichever stage is visible underneath */}
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'INCOME SAMPINGAN', color: '#ffffff' },
              { text: 'DARI EBAY', color: GOLD },
            ]}
            subtitle="kenapa orang Malaysia mula jual di sini"
            y={175}
            size={78}
            warm
          />
        </div>

        {/* kicker is absent during the hook (title carries it) and absent again once the loop
            resets to the hook look — matches frame 0 having no kicker either */}
        <Kicker text="PASARAN GLOBAL" color={TEAL} at={HOOK_OUT} until={T1} />
        <Kicker text="DUIT TERUS MASUK" color={GOLD} at={T1} until={T2} />
        <Kicker text="UNTUNG DARI KURS" color={INDIGO} at={T2} until={T3} />
        <Kicker text="TAK PERLU WEBSITE / STOK" color={VIOLET} at={T3} until={T4} />
        <Kicker text="BUKAN JANJI, BUKTI" color={GOLD} at={T4} until={T5} />
      </AbsoluteFill>

      <Captions lines={VO} y={1400} accent={GOLD} plate />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short13Ebay;

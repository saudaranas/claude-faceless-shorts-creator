# short-13 · eBay side income (Bahasa Melayu)

**Title:** "Income Sampingan Dari eBay" — kenapa makin ramai orang Malaysia jual di eBay untuk
tambah pendapatan.

**Niche:** money/reach hybrid — reuses `lib/map.tsx` (real Mercator projection + WorldLayer +
MapLabel) for the "global reach" beat and `lib/shorts.tsx` (BigTitle/Kicker/StatChip/Captions/
ProgressBar) for everything else. No new niche lib (this is a one-off platform explainer, not
a recurring TSX niche from IDEAS.md — see note at the bottom).

**Language:** Bahasa Melayu (casual, Malaysian short-form tone — matches how the audience
actually talks: "kat", "tak payah", "je").

## Facts verified before scripting (2026-09-14, web search)

- eBay: **136 million active buyers**, **190+ markets** (Q2 2026, per chargeflow.io/eBay
  investor data) — [eBay Statistics 2026: $79.6B GMV and 136M Buyers](https://www.chargeflow.io/blog/ebay-statistics).
- **~20 million sellers** worldwide — same source.
- Payout: eBay's Managed Payments settles to a linked bank account **or Payoneer**; Payoneer
  converts to 190+ local currencies and typically lands **1-2 business days** after the buyer's
  payment is confirmed — [Payoneer's Practical Guide to Selling on eBay](https://www.payoneer.com/resources/business/guide-selling-on-ebay/),
  [Get your eBay Payments — Payoneer](https://www.payoneer.com/get-paid-by-ebay/).
- USD/MYR ≈ **4.07** as of Sept 11 2026 (ranged 4.03-4.10 through the month) — a Malaysian
  seller earning in USD and cashing out to Ringgit currently gets more than 4 Ringgit per
  dollar — [USD to MYR — exchange-rates.org 2026 history](https://www.exchange-rates.org/exchange-rate-history/usd-myr-2026).
  Script deliberately says "lebih 4 Ringgit" (no pinned decimal — the rate moves daily).
- eBay's final value fee is **~13.6%** for most categories (+ a small $0.30/$0.40 per-order
  fee) — [eBay Seller Fees 2026 — Taxomate](https://taxomate.com/blog/ebay-selling-fees). Script
  rounds to "~13%", said once, not dwelt on.
- Income claim ("beberapa ratus ke beberapa ribu Ringgit sebulan") is deliberately **vague** —
  there is no verifiable per-seller average, so the script never states a specific number as
  fact; it's framed as a realistic range, not a promise.

## Beat sheet (~40s spoken + ~4s loop tail = 42s)

| Beat | Time | On screen | VO (Bahasa Melayu) |
|---|---|---|---|
| HOOK | 0.0-4.0 | Frame 0 fully composed: world map already lit (KUL→US/UK/AU lines drawn, pulsing origin pin), StatChip "136 JUTA PEMBELI · 190 NEGARA" already up, title "INCOME SAMPINGAN DARI EBAY" warm | "Ini sebab warga Malaysia diam-diam buat duit lebih kat eBay." |
| SETUP | 4.0-13.3 | Map stage stays (kicker "PASARAN GLOBAL") | "Bukan Shopee je, eBay ada 136 juta pembeli, serata dunia." / "Barang lama kat rumah, orang US, UK sanggup bayar mahal untuknya." |
| REVEAL 1 (money in) | 13.3-17.9 | Map dissolves → flow chips EBAY → PAYONEER → BANK (RM), StatChip "1-2 HARI BEKERJA" | "Duit terus masuk akaun bank awak, dalam Ringgit, dalam satu dua hari." |
| REVEAL 2 (fx) | 17.9-22.8 | Two bars: "1 USD" (short) vs "lebih RM 4" (long), arrow between | "Jual dalam Dollar, terima dalam Ringgit, kadar naik, untung awak pun naik." |
| REVEAL 3 (no stock) | 22.8-28.3 | Three chips stagger in: BARANG LAMA / KOLEKSI / BUATAN TANGAN | "Tak payah laman web sendiri atau stok besar, guna barang lama, atau buatan tangan." |
| TWIST | 28.3-38.6 | StatChip "LEBIH 20 JUTA PENJUAL" grows in | "Bukan cerita cepat kaya, tapi extra beberapa ratus, ke beberapa ribu Ringgit sebulan, konsisten." / "Lebih 20 juta penjual dah buktikan, semua bermula dari satu jualan pertama." |
| LOOP | 38.6-42.0 | Everything dissolves back to the map + title + StatChip — last frame ≈ frame 0 | (payoff line lands, no CTA) |

No pause-quiz card (nothing to solve here — this is an explainer, not a puzzle). No old-school
"comment below" outro — it ends on the payoff line and dissolves back into the hook frame.

## Voice generation note

`tools/gen_voice.py` first pass flagged line 2 ("...136 juta pembeli, di 190 negara.") OVERFLOW
at the max 1.3x tempo squeeze: the 2.7 words/sec estimate treated "136" and "190" as single
tokens, but Bahasa Melayu speaks each digit-group out ("seratus tiga puluh enam", "seratus
sembilan puluh") — 17 actual spoken words in a line budgeted for 12. Fixed by dropping the
second number from the VO (the "190 negara" fact stays on screen via the StatChip; the line
only needs to say it once) rather than widening the window and cascading every later line's
timing. Re-ran with the same beats.json — only that one line's cached clip was re-billed.

## Production notes

- Composition: `Short13Ebay` at `remotion/src/shots/short-13/Short13Ebay.tsx`, 1080×1920@30, 42s.
- Persistent canvas = one world-map "stage" region (y≈280-650) whose CONTENT swaps per beat
  (map → money-flow chips → FX bars → no-stock chips) inside a single opacity-gated wrapper per
  beat, plus a Kicker that rotates its label, a BigTitle that appears at the hook and returns at
  the loop, and Captions/ProgressBar mounted at the root on global time — same pattern as
  short-10 (chart) and short-11 (map), no new niche lib.
- The map stage is the ONLY one that reprises for the loop (it's the frame-0 payoff); the
  flow/FX/no-stock stages are one-shot and never need to match frame 0, so they animate freely.
- Voice: ElevenLabs `eleven_multilingual_v2` (already the repo default model) supports Bahasa
  Melayu. See the session's voice-ID decision recorded in beats.json's `voicePlan` /
  `.claude`-adjacent conversation — the repo's default premade voice ("Liam") was evaluated for
  fit before generating.

## Series note

This is a one-off "why this platform" explainer, not a repeatable IDEAS.md niche — but if we do
more of these (Etsy, Fiverr, Upwork...), the map-reach + money-flow + FX-bar beats here are
already generic enough to reuse. Not added to IDEAS.md as a formal niche until a second one gets
made.

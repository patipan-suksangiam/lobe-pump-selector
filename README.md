# Lobe Pump Selector — WFT / Viking Pump Hygienic

Excel-based hygienic pump selector (originally **WFT / Wright Flow Technologies**, now **Viking Pump Hygienic**) with a standalone **HTML version** covering all 6 series.

## Series
| Series | Type | Sizes | Rotor classes |
|---|---|---|---|
| Revolution RLP | Rotary Lobe | 15 | Std 70°C / Hot 150°C |
| Revolution CPP | Circumferential Piston | 16 | Std 93°C / FF 105°C / Hot 150°C / Choc |
| MP-CP | Multi-Purpose CP | 12 | A 70°C / B 100°C / C 150°C |
| Sterilobe | Rotary Lobe | 14 | BiWing / Multilobe |
| RTP | Rotary Lobe | 4 | Standard |
| Acculobe | Rotary Lobe | 2 (Lobe/Wing) | Standard (+dual-port NPSHr) |

## Files
- `wft-selector-lobe-revolution.xlsx` — original Excel selector + auto **Datasheet** sheet (Revolution RLP)
- `lobe-pump-selector.html` — **standalone HTML version** (open in any browser; CDN React/Tailwind on first load)
- `engine.js` — the 6-series calculation engine (ported 1:1 from the Excel formulas, incl. source quirks)
- `build_html.py` + `lobe-pump-selector.template.html` — rebuild the HTML from template + engine
- `build_datasheet.py` — adds the Datasheet sheet to the xlsx via direct OOXML zip surgery

## Why zip surgery / why hand-ported formulas?
- The xlsx contains **1,284 embedded charts + CMYK images** — `openpyxl` cannot save it; edits go through direct OOXML zip surgery.
- The workbook's formulas are **per-column heterogeneous** (slip-polynomial thresholds/orders, viscosity-multiplier formulas, and even the multiplier application differ between sizes/columns — e.g. Sterilobe SLFL double-applies margin×vm in the low-pressure branch). Every engine was therefore **parsed from the actual cell formulas** and **verified against a LibreOffice forced-recalculation** of the workbook (608/610 checks exact-match; the 2 mismatches are stale junk cells in the source workbook).
- MP-CP viscous-power uses `LOG10` (Excel `LOG`) with a per-size coefficient; CPP torque uses the Std-class rpm for every class and `$E$139` absolute refs; Acculobe's margin multiplies only the linear slip term — all source quirks preserved.

## Usage
1. Open `lobe-pump-selector.html` in a browser.
2. Enter duty (flow/pressure/viscosity + units; ISF, Relief Valve, Flushed Seal per series).
3. Pick a series tab + rotor class → table shows RPM/power/torque/NPSHr per size with ★ recommended.
4. Click a row → printable A4 datasheet (customer fields, performance, specs, options, certifications per vikingpump.com/hygienic).
5. Excel version: open `wft-selector-lobe-revolution.xlsx`, enter duty on the selector sheet, use the Datasheet tab.

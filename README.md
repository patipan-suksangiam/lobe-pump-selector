# Lobe Pump Selector — WFT / Viking Pump Hygienic (Revolution RLP)

Excel-based rotary lobe pump selector (originally **WFT / Wright Flow Technologies**, now **Viking Pump Hygienic**) with an added auto **Datasheet** sheet.

## Files

| File | Description |
|---|---|
| `wft-selector-lobe-revolution.xlsx` | The original Excel selector + auto **Datasheet** sheet |
| `lobe-pump-selector.html` | **Standalone HTML version** (React, single file — open in any browser) |
| `engine.js` | The calculation engine (JS port of the Excel logic; shared by the HTML app) |
| `lobe-pump-selector.template.html` + `build_html.py` | Rebuild the HTML app from template + engine |
| `build_datasheet.py` | Rebuilds the `Datasheet` sheet via direct OOXML zip surgery |

### HTML app (`lobe-pump-selector.html`)

Works offline from the file (needs internet once for CDN React/Tailwind). Mirrors the Excel selector 1:1:

- Enter duty: flow / pressure / viscosity (incl. SSU) / improved surface finish, any unit
- Results table for **Standard / 70°C** and **Hot / 150°C** rotor classes: RPM, power, torque, NPSHr, tip speed, validity, ★ recommended (smallest size meeting the duty)
- Click a valid size → printable **datasheet** (A4 landscape, product info from [vikingpump.com/hygienic](https://www.vikingpump.com/hygienic))
- Engine verified against the Excel calc (LibreOffice recalc) for metric + US units, both classes

### Workbook sheets

- **`Revolution RLP`** — duty input (flowrate / pressure / viscosity / improved surface finish) + frame-by-frame results (RPM required, power, torque, NPSHr, slip, flow variation) for 17 pump sizes in two rotor classes.
- **`Datasheet`** — one-page A4 landscape datasheet. Pick a pump size (17 sizes, or **★ Recommended (auto)** = smallest size that meets the duty) and rotor class (**Standard / 70°C** or **Hot / 150°C**). Duty point, performance and specifications pull live from the selector sheet:
  - Performance: pump speed, power, torque, NPSHr, tip speed, flow/speed variation
  - Specifications: displacement, port size (in/mm), rotor diameter, max speed/pressure, max shaft torque
  - Product info per [vikingpump.com/hygienic](https://www.vikingpump.com/hygienic): CIP standard, porting & sealing options, 3-A SSI / CE / ATEX certifications, manufacturer (Viking Pump Hygienic Ltd., formerly Wright Flow Technologies)
- **`Menu`** — cover page with a link to the Datasheet.

## Why zip surgery?

The workbook contains **1,284 embedded charts** and CMYK images. `openpyxl` cannot save this file (it drops the charts and crashes on the CMYK TIFF logo). `build_datasheet.py` therefore edits the OOXML parts **inside the zip in place** — every chart and image is preserved byte-for-byte.

## Usage

1. Open `wft-selector-lobe-revolution.xlsx` (Excel recalculates on open).
2. Enter the duty on the `Revolution RLP` sheet.
3. Open the **`Datasheet`** tab (link also on the Menu and under the frame table of the selector).
4. Choose pump size + rotor class, fill in customer/project fields, print (A4 landscape, fits one page).

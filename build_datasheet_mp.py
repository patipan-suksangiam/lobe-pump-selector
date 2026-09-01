#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add a "Datasheet MP-CP" sheet (12 models x 3 rotor classes + RV) with a live
performance-curve chart and a Siamraj Public Company Limited footer.
Zip-surgery: edits XML parts in place so the 1284 charts/images are untouched."""
import zipfile, re, sys, html as H

SRC = 'wft-selector-lobe-revolution.xlsx'
OUT = SRC

zin = zipfile.ZipFile(SRC)
ORDER = zin.namelist()
parts = {n: zin.read(n) for n in ORDER}
zin.close()

def P(name): return parts[name].decode('utf-8')
def W(name, text): parts[name] = text.encode('utf-8')

def esc(s):
    return H.escape(str(s), quote=True)

# --- next free ids ---------------------------------------------------------
# --- remove any previous "Datasheet MP-CP" (idempotent rebuild) ------------
def rm_part(name):
    if name in parts:
        del parts[name]

def remove_previous():
    global rels_wb, wbx, ct, ORDER, OLD_PARTS
    OLD_PARTS = []
    m = re.search(r'<sheet name="Datasheet MP-CP"[^>]*r:id="(rId\d+)"', wbx)
    if not m:
        return
    rid_old = m.group(1)
    m2 = re.search(r'Id="%s"[^>]*Target="([^"]+)"' % rid_old, rels_wb)
    target = m2.group(1) if m2 else None
    wbx = re.sub(r'<sheet name="Datasheet MP-CP"[^>]*/>', '', wbx)
    rels_wb = re.sub(r'<Relationship Id="%s"[^>]*/>' % rid_old, '', rels_wb)
    if target:
        part = target if target.startswith('xl/') else 'xl/' + target
        OLD_PARTS.append(part)
        rm_part(part)
        relp = part.replace('/worksheets/', '/worksheets/_rels/').replace('.xml', '.xml.rels')
        if relp in parts:
            drm = re.search(r'Target="\.\./drawings/(drawing\d+\.xml)"', parts[relp].decode('utf-8', 'ignore'))
            if drm:
                dpart = 'xl/drawings/' + drm.group(1)
                OLD_PARTS.append(dpart)
                rm_part(dpart)
                drels = dpart.replace('/drawings/', '/drawings/_rels/').replace('.xml', '.xml.rels')
                if drels in parts:
                    chm = re.search(r'Target="\.\./charts/(chart\d+\.xml)"', parts[drels].decode('utf-8', 'ignore'))
                    if chm:
                        cpart = 'xl/charts/' + chm.group(1)
                        OLD_PARTS.append(cpart)
                        rm_part(cpart)
                    OLD_PARTS.append(drels)
                    rm_part(drels)
            OLD_PARTS.append(relp)
            rm_part(relp)
    wbx = re.sub(r'<definedName name="_xlnm.Print_Area" localSheetId="\d+">\'Datasheet MP-CP\'[^<]*</definedName>', '', wbx)
    for p in OLD_PARTS:
        ct = re.sub(r'<Override PartName="/%s"[^>]*/>' % re.escape(p), '', ct)
    ORDER = [n for n in ORDER if n in parts]

rels_wb = P('xl/_rels/workbook.xml.rels')
wbx = P('xl/workbook.xml')
ct = P('[Content_Types].xml')
remove_previous()
used_sheets = {int(m) for m in re.findall(r'worksheets/sheet(\d+)\.xml', rels_wb)}
used_charts = {int(m) for m in re.findall(r'charts/chart(\d+)\.xml', ct)}
used_drawings = {int(m) for m in re.findall(r'drawings/drawing(\d+)\.xml', ct)}
used_rids = {int(m) for m in re.findall(r'Id="rId(\d+)"', rels_wb)}
sheet_no = max(used_sheets) + 1
chart_no = max(used_charts) + 1
drawing_no = max(used_drawings) + 1
rid = max(used_rids) + 1
rid_dr = rid + 1
rid_ch = rid + 2
sheet_ids = {int(m) for m in re.findall(r'<sheet[^>]*sheetId="(\d+)"', wbx)}
sheet_id = max(sheet_ids) + 1
local_idx = len(re.findall(r'<sheet ', wbx))          # appended at the end
print(f'sheet part sheet{sheet_no}.xml, chart{chart_no}, drawing{drawing_no}, rId {rid}, sheetId {sheet_id}, localIdx {local_idx}')

SHEET = 'Datasheet MP-CP'
SIZES = ['10/0005','10/0008','10/0011','20/0020','20/0031','30/0069','30/0113','40/0180','40/0250','50/0351','50/0525','50/0525/12']

# --- sheet XML -------------------------------------------------------------
def cell(ref, s, text=None, formula=None, t=None):
    attrs = ' r="%s" s="%d"' % (ref, s)
    if formula is not None:
        f = '<f>%s</f>' % esc(formula)
        if t == 'str':
            return '<c%s t="str">%s</c>' % (attrs, f)
        return '<c%s>%s</c>' % (attrs, f)
    return '<c%s t="inlineStr"><is><t>%s</t></is></c>' % (attrs, esc(text))

M = "'MP-CP'"
SR = "'MP-CP'!$C$20:$N$20"
COL = 'MATCH($E$13,%s,0)' % SR
CLSROW = 'IF($E$12="Class A",25,IF($E$12="Class B",37,46))'
def idx(row_off, col_expr=COL):
    # INDEX over C25:N49 (all class rows); row offset = classRow-24 + off
    return 'IFERROR(INDEX(%s!$C$25:$N$49,%s-24+%d,%s),"N/A")' % (M, CLSROW, row_off, col_expr)
def phy(row, col_expr=COL):
    return 'IFERROR(INDEX(%s!$C$%d:$N$%d,%s),"N/A")' % (M, row, row, col_expr)

rows = []
rows.append('<row r="1"><c r="A1" s="557" t="inlineStr"><is><t>VIKING PUMP HYGIENIC — CP / MP SELECTOR</t></is></c></row>')
rows.append('<row r="2"><c r="A2" s="558" t="inlineStr"><is><t>Pump Datasheet — MP-CP Series (from WFT CP / MP Selector Issue D. 10/13)</t></is></c></row>')
rows.append('<row r="3"><c r="A3" s="559" t="inlineStr"><is><t>Hygienic circumferential-piston / lobe pumps for the process industries</t></is></c></row>')
rows.append('<row r="5"><c r="A5" s="560" t="inlineStr"><is><t>1 • APPLICATION / DUTY</t></is></c></row>')
rows.append('<row r="6">' + cell('A6',561,'Customer') + cell('B6',571) + cell('D6',561,'Date') + cell('E6',567,formula='TODAY()') + '</row>')
rows.append('<row r="7">' + cell('A7',561,'Project / Ref') + cell('B7',571) + cell('D7',561,'Prepared by') + cell('E7',571) + '</row>')
rows.append('<row r="8">' + cell('A8',561,'Flowrate') + cell('B8',562,formula="%s!C9" % M) + cell('C8',570,formula="%s!D9" % M)
            + cell('D8',561,'Pressure') + cell('E8',562,formula="%s!C10" % M) + cell('F8',570,formula="%s!D10" % M) + '</row>')
rows.append('<row r="9">' + cell('A9',561,'Viscosity') + cell('B9',562,formula="%s!C11" % M) + cell('C9',570,formula="%s!D11" % M)
            + cell('D9',561,'Improved Surface Finish') + cell('E9',562,formula="%s!D12" % M) + '</row>')
rows.append('<row r="10">' + cell('A10',561,'Relief Valve') + cell('B10',562,formula="%s!D13" % M) + '</row>')
rows.append('<row r="11"><c r="A11" s="560" t="inlineStr"><is><t>2 • PUMP SELECTION</t></is></c></row>')
rows.append('<row r="12">' + cell('A12',561,'Series') + cell('B12',562,'MP-CP')
            + cell('D12',561,'Rotor Class') + cell('E12',571,text='Class A') + '</row>')
rows.append('<row r="13">' + cell('A13',561,'Pump Size') + cell('B13',571,text='★ Recommended (auto)')
            + cell('D13',561,'Size used in calc') + cell('E13',562,formula='IF($B$13="★ Recommended (auto)",$B$14,$B$13)')
            + cell('G13',561,'Class row') + cell('H13',562,formula=CLSROW) + '</row>')
rows.append('<row r="14">' + cell('A14',561,'★ Recommended (auto)')
            + cell('B14',562,formula="INDEX(%s,MATCH(TRUE,INDEX(ISNUMBER(%s!$C$25:$N$25),0),0))" % (SR, M)) + '</row>')
rows.append('<row r="16"><c r="A16" s="560" t="inlineStr"><is><t>3 • PERFORMANCE</t></is></c></row>')
rows.append('<row r="17">' + cell('A17',569,'Pump Speed') + cell('B17',563,formula=idx(0)) + cell('C17',570,'rpm')
            + cell('E17',569,'Power Required') + cell('F17',564,formula=idx(1)) + cell('G17',570,'kW') + '</row>')
rows.append('<row r="18">' + cell('A18',569,'Torque Required') + cell('B18',564,formula=idx(2)) + cell('C18',570,'Nm')
            + cell('E18',569,'NPSHr') + cell('F18',565,formula=idx(3)) + cell('G18',570,'m') + '</row>')
rows.append('<row r="19">' + cell('A19',569,'Tip Speed') + cell('B19',565,formula=phy(134)) + cell('C19',570,'m/s')
            + cell('E19',569,'Max Speed') + cell('F19',563,formula=phy(106)) + cell('G19',570,'rpm') + '</row>')
rows.append('<row r="20">' + cell('A20',569,'Possible Flow Variation') + cell('B20',565,formula=phy(139))
            + cell('C20',570,formula="%s!$D$9&\" ±\"" % M)
            + cell('E20',569,'Possible Speed Variation') + cell('F20',563,formula=phy(149)) + cell('G20',570,'rpm ±') + '</row>')
rows.append('<row r="22"><c r="A22" s="560" t="inlineStr"><is><t>4 • PHYSICAL DATA</t></is></c></row>')
rows.append('<row r="23">' + cell('A23',569,'Displacement') + cell('B23',566,formula=phy(22)) + cell('C23',570,'l/rev')
            + cell('E23',569,'Port Size') + cell('F23',565,formula=phy(23)) + cell('G23',570,'in') + '</row>')
rows.append('<row r="24">' + cell('A24',569,'Nominal Rotor Dia') + cell('B24',563,formula=phy(135)) + cell('C24',570,'mm')
            + cell('E24',569,'Port Size (metric)') + cell('F24',563,formula=phy(24)) + cell('G24',570,'mm') + '</row>')
rows.append('<row r="25">' + cell('A25',569,'Max Pressure') + cell('B25',565,formula=phy(107)) + cell('C25',570,'Bar')
            + cell('E25',569,'Max Shaft Torque') + cell('F25',563,formula=phy(103)) + cell('G25',570,'Nm') + '</row>')
rows.append('<row r="27"><c r="A27" s="560" t="inlineStr"><is><t>5 • PERFORMANCE CURVE — Flow vs Pressure (at max speed, from workbook table)</t></is></c></row>')
rows.append('<row r="28">' + cell('H28',561,'Pressure (bar)') + cell('I28',561,'Flow @ Max Speed (l/min)') + '</row>')
for i, p in enumerate(range(0, 13)):
    r = 29 + i
    rows.append('<row r="%d">' % r + cell('H%d' % r, 563, text=str(p)) + cell('I%d' % r, 563, formula="IFERROR(INDEX(%s!$C$194:$N$206,%d,%s),\"N/A\")" % (M, i + 1, COL)) + '</row>')
rows.append('<row r="44"><c r="A44" s="560" t="inlineStr"><is><t>6 • OPTIONS, FEATURES &amp; CERTIFICATIONS</t></is></c></row>')
rows.append('<row r="45"><c r="A45" s="569" t="inlineStr"><is><t>CIP (Clean-In-Place) standard — self-draining head, dynamic seal leak path, no dead zones</t></is></c></row>')
rows.append('<row r="46"><c r="A46" s="569" t="inlineStr"><is><t>Porting — Hygienic: Tri-clamp, DIN 11864, DIN 11851, SMS • Industrial: ASA/ANSI RF, DIN 2633, BSP/NPT • Jackets available</t></is></c></row>')
rows.append('<row r="47"><c r="A47" s="569" t="inlineStr"><is><t>Sealing — single/double mechanical (flush) • 3-A Sanitary Standards • CE • ATEX — Viking Pump Hygienic Ltd. (formerly WFT)</t></is></c></row>')
rows.append('<row r="48"><c r="A48" s="572" t="inlineStr"><is><t>Siamraj Public Company Limited — Authorized distributor of Viking Pump Hygienic (formerly Wright Flow Technologies) · www.siamrajplc.com</t></is></c></row>')

sheet = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
 '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
 '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'
 '<sheetFormatPr defaultRowHeight="15"/>'
 '<cols><col min="1" max="1" width="22"/><col min="2" max="2" width="22"/><col min="4" max="4" width="14"/><col min="5" max="5" width="22"/><col min="6" max="6" width="12"/><col min="8" max="8" width="13"/><col min="9" max="9" width="20"/></cols>'
 '<sheetData>' + ''.join(rows) + '</sheetData>'
 '<dataValidations count="2">'
 '<dataValidation type="list" allowBlank="1" showInputMessage="1" promptTitle="Pump Size" prompt="Pick a size, or ★ Recommended (auto)." sqref="B13"><formula1>"★ Recommended (auto),' + ','.join(SIZES) + '"</formula1></dataValidation>'
 '<dataValidation type="list" allowBlank="1" sqref="E12"><formula1>"Class A,Class B,Class C"</formula1></dataValidation>'
 '</dataValidations>'
 '<pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/>'
 '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="1"/>'
 '<drawing r:id="rId1"/>'
 '</worksheet>')

# --- chart XML (scatter, smooth) ------------------------------------------
chart = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
 '<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" '
 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
 '<c:chart><c:autoTitleDeleted val="0"/><c:plotArea><c:layout/>'
 '<c:scatterChart><c:scatterStyle val="lineMarker"/><c:varyColors val="0"/>'
 '<c:ser><c:idx val="0"/><c:order val="0"/>'
 '<c:tx><c:strRef><c:f>%s!$I$28</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Flow @ Max Speed</c:v></c:pt></c:strCache></c:strRef></c:tx>'
 '<c:spPr><a:ln w="28575"><a:solidFill><a:srgbClr val="1F4E79"/></a:solidFill></a:ln></c:spPr>'
 '<c:marker><c:symbol val="none"/></c:marker>'
 '<c:xVal><c:numRef><c:f>%s!$H$29:$H$41</c:f><c:numCache><c:formatCode>0</c:formatCode><c:ptCount val="0"/></c:numCache></c:numRef></c:xVal>'
 '<c:yVal><c:numRef><c:f>%s!$I$29:$I$41</c:f><c:numCache><c:formatCode>0</c:formatCode><c:ptCount val="0"/></c:numCache></c:numRef></c:yVal>'
 '</c:ser>'
 '<c:axId val="10001"/><c:axId val="10002"/></c:scatterChart>'
 '<c:catAx><c:axId val="10001"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:crossAx val="10002"/></c:catAx>'
 '<c:valAx><c:axId val="10002"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:crossAx val="10001"/></c:valAx>'
 '</c:plotArea><c:legend><c:legendPos val="b"/></c:legend><c:plotVisOnly val="1"/></c:chart></c:chartSpace>') % (SHEET, SHEET, SHEET)

# --- drawing XML -----------------------------------------------------------
drawing = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
 '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" '
 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
 '<xdr:twoCellAnchor editAs="oneCell">'
 '<xdr:from><xdr:col>9</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>28</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>'
 '<xdr:to><xdr:col>17</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>44</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>'
 '<xdr:graphicFrame macro="">'
 '<xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="Performance Curve"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>'
 '<xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>'
 '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">'
 '<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" '
 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/>'
 '</a:graphicData></a:graphic></xdr:graphicFrame>'
 '<xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>')

# --- write parts -----------------------------------------------------------
W('xl/worksheets/sheet%d.xml' % sheet_no, sheet)
W('xl/charts/chart%d.xml' % chart_no, chart)
W('xl/drawings/drawing%d.xml' % drawing_no, drawing)
W('xl/worksheets/_rels/sheet%d.xml.rels' % sheet_no,
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing%d.xml"/></Relationships>' % drawing_no)
W('xl/drawings/_rels/drawing%d.xml.rels' % drawing_no,
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart%d.xml"/></Relationships>' % chart_no)

# workbook.xml — add sheet entry before </sheets>
wbx = wbx.replace('</sheets>', '<sheet name="%s" sheetId="%d" r:id="rId%d"/></sheets>' % (esc(SHEET), sheet_id, rid))
W('xl/workbook.xml', wbx)

# workbook.xml.rels — add sheet rel
rels_wb = rels_wb.replace('</Relationships>',
  '<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet%d.xml"/></Relationships>' % (rid, sheet_no))
W('xl/_rels/workbook.xml.rels', rels_wb)

# definedNames — print area for the new sheet
if '<definedNames>' in wbx:
    wbx = P('xl/workbook.xml')
    wbx = wbx.replace('</definedNames>',
      '<definedName name="_xlnm.Print_Area" localSheetId="%d">%s!$A$1:$W$49</definedName></definedNames>' % (local_idx, "'%s'" % SHEET))
    W('xl/workbook.xml', wbx)

# [Content_Types].xml
ct = ct.replace('</Types>',
  '<Override PartName="/xl/worksheets/sheet%d.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
  '<Override PartName="/xl/drawings/drawing%d.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>'
  '<Override PartName="/xl/charts/chart%d.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>'
  '</Types>' % (sheet_no, drawing_no, chart_no))
W('[Content_Types].xml', ct)

# --- write zip (preserve order; append new parts at the end) ---------------
new_parts = {
  'xl/worksheets/sheet%d.xml' % sheet_no: parts['xl/worksheets/sheet%d.xml' % sheet_no],
  'xl/charts/chart%d.xml' % chart_no: parts['xl/charts/chart%d.xml' % chart_no],
  'xl/drawings/drawing%d.xml' % drawing_no: parts['xl/drawings/drawing%d.xml' % drawing_no],
  'xl/worksheets/_rels/sheet%d.xml.rels' % sheet_no: parts['xl/worksheets/_rels/sheet%d.xml.rels' % sheet_no],
  'xl/drawings/_rels/drawing%d.xml.rels' % drawing_no: parts['xl/drawings/_rels/drawing%d.xml.rels' % drawing_no],
}
names = ORDER + [n for n in new_parts if n not in ORDER]
import io
buf = io.BytesIO()
with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zout:
    for n in names:
        zout.writestr(n, parts[n])
with open(OUT, 'wb') as f:
    f.write(buf.getvalue())
print('OK — wrote', OUT)
print('sheet parts written:', sheet_no, 'chart:', chart_no, 'drawing:', drawing_no)

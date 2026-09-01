#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add a "Datasheet" sheet to the WFT Lobe (Revolution RLP) selector workbook.
Zip-surgery: edits XML parts in place so charts/images (1284 charts) are untouched.
Source of product info: https://www.vikingpump.com/hygienic + /pumps/revolution-series
"""
import zipfile, re, shutil, sys, html, os

SRC = 'wft-selector-lobe-revolution.xlsx'
OUT = 'wft-selector-lobe-revolution.xlsx'

# ----------------------------------------------------------------------------
# 1) Read all parts
# ----------------------------------------------------------------------------
zin = zipfile.ZipFile(SRC)
ORDER = zin.namelist()
parts = {n: zin.read(n) for n in ORDER}
zin.close()

def P(name):  # decode helper
    return parts[name].decode('utf-8')

def W(name, text):
    parts[name] = text.encode('utf-8')

# ----------------------------------------------------------------------------
# 2) styles.xml — append new fonts / fills / borders / cellXfs
# ----------------------------------------------------------------------------
sx = P('xl/styles.xml')

new_fonts = (
    '<font><name val="Arial"/><b/><color rgb="FFFFFFFF"/><sz val="14"/></font>'          # 23 title white bold
    '<font><name val="Arial"/><b/><color rgb="FFFFFFFF"/><sz val="11"/></font>'          # 24 subtitle/section white bold
    '<font><name val="Arial"/><i/><color rgb="FF595959"/><sz val="9"/></font>'           # 25 tagline/unit/note italic gray
    '<font><name val="Arial"/><b/><color rgb="FF1F4E79"/><sz val="10"/></font>'          # 26 label bold dark blue
    '<font><name val="Arial"/><b/><color rgb="FFFFFFFF"/><sz val="10"/></font>'          # 27 table header white bold
    '<font><name val="Arial"/><i/><color rgb="FF808080"/><sz val="8"/></font>'           # 28 footer italic gray
)
new_fills = (
    '<fill><patternFill patternType="solid"><fgColor rgb="FF1F4E79"/><bgColor indexed="64"/></patternFill></fill>'  # 21 dark blue
    '<fill><patternFill patternType="solid"><fgColor rgb="FF2E75B6"/><bgColor indexed="64"/></patternFill></fill>'  # 22 medium blue
    '<fill><patternFill patternType="solid"><fgColor rgb="FFD9D9D9"/><bgColor indexed="64"/></patternFill></fill>'  # 23 light gray
    '<fill><patternFill patternType="solid"><fgColor rgb="FFF2F2F2"/><bgColor indexed="64"/></patternFill></fill>'  # 24 very light gray
    '<fill><patternFill patternType="solid"><fgColor rgb="FF404040"/><bgColor indexed="64"/></patternFill></fill>'  # 25 dark gray
)
new_borders = (
    '<border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right>'
    '<top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom><diagonal/></border>'
)
# cellXfs 557..573  (numFmt built-ins: 0 General,1 0,2 0.00 ; custom 167 0.000, 168 0.0, 169 date)
new_xfs = (
    '<xf numFmtId="0" fontId="23" fillId="21" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'                      # 557 title
    '<xf numFmtId="0" fontId="24" fillId="21" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'                      # 558 subtitle
    '<xf numFmtId="0" fontId="25" fillId="23" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'                      # 559 tagline
    '<xf numFmtId="0" fontId="24" fillId="22" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'                      # 560 section
    '<xf numFmtId="0" fontId="26" fillId="0" borderId="0" xfId="0" applyFont="1"/>'                                     # 561 label
    '<xf numFmtId="0" fontId="0" fillId="24" borderId="65" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>'      # 562 value general
    '<xf numFmtId="1" fontId="0" fillId="24" borderId="65" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyNumberFormat="1"/>'  # 563 int
    '<xf numFmtId="2" fontId="0" fillId="24" borderId="65" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyNumberFormat="1"/>'  # 564 0.00
    '<xf numFmtId="168" fontId="0" fillId="24" borderId="65" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyNumberFormat="1"/>' # 565 0.0
    '<xf numFmtId="167" fontId="0" fillId="24" borderId="65" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyNumberFormat="1"/>' # 566 0.000
    '<xf numFmtId="169" fontId="0" fillId="24" borderId="65" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyNumberFormat="1"/>' # 567 date
    '<xf numFmtId="0" fontId="27" fillId="25" borderId="65" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>'      # 568 table header
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="65" xfId="0" applyFont="1" applyBorder="1"/>'                     # 569 table cell
    '<xf numFmtId="0" fontId="25" fillId="0" borderId="0" xfId="0" applyFont="1"/>'                                     # 570 unit
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="65" xfId="0" applyFont="1" applyBorder="1"/>'                     # 571 input
    '<xf numFmtId="0" fontId="28" fillId="0" borderId="0" xfId="0" applyFont="1"/>'                                     # 572 footer
    '<xf numFmtId="0" fontId="25" fillId="0" borderId="0" xfId="0" applyFont="1"/>'                                     # 573 note
)

def bump_count(xml, tag, delta):
    m = re.search(r'<(%s)[^>]*count="(\d+)"' % tag, xml)
    assert m, tag
    return xml[:m.start(2)] + str(int(m.group(2)) + delta) + xml[m.end(2):]

sx = bump_count(sx, 'fonts', 6)
sx = bump_count(sx, 'fills', 5)
sx = bump_count(sx, 'borders', 1)
sx = bump_count(sx, 'cellXfs', 17)
assert '</fonts>' in sx and '</fills>' in sx and '</borders>' in sx and '</cellXfs>' in sx
sx = sx.replace('</fonts>', new_fonts + '</fonts>', 1)
sx = sx.replace('</fills>', new_fills + '</fills>', 1)
sx = sx.replace('</borders>', new_borders + '</borders>', 1)
sx = sx.replace('</cellXfs>', new_xfs + '</cellXfs>', 1)
W('xl/styles.xml', sx)

# ----------------------------------------------------------------------------
# 3) Build the Datasheet worksheet XML (sheet328.xml)
# ----------------------------------------------------------------------------
SIZES = ['0035X','0065X','0150X','0160L','0180L','0200X','0300X','0400X','0450X','0800X','1300X','1800X','2200X','3000L','3800L','4000L','5000L']
SIZE_LIST = '"★ Recommended (auto),' + ','.join(SIZES) + '"'
CLASS_LIST = '"Standard / 70°C,Hot / 150°C"'

def esc(t):
    return html.escape(t, quote=False)

def cell(ref, s, text=None, formula=None, t=None):
    attrs = ' r="%s" s="%d"' % (ref, s)
    if text is not None:
        return '<c%s t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>' % (attrs, esc(text))
    if formula is not None:
        return '<c%s><f>%s</f></c>' % (attrs, esc(formula))
    if t == 'str':
        return '<c%s t="str"><f>%s</f></c>' % (attrs, esc(formula))
    return '<c%s/>' % attrs

# shared formula parts
RLP = "'Revolution RLP'"
def perf_std(row):
    return "IFERROR(INDEX(%s!$E$%d:$S$%d,MATCH($B$13,%s!$E$20:$S$20,0)),\"N/A\")" % (RLP, row, row, RLP)
def perf_hot(row):
    # hot-class block rows are Std row + 12 (25->37, 26->38, 27->39, 28->40)
    hot = row + 12
    return ("IF(OR($B$13=\"0035X\",$B$13=\"0065X\"),\"N/A\","
            "IFERROR(INDEX(%s!$E$%d:$S$%d,MATCH($B$13,%s!$E$20:$S$20,0)),\"N/A\"))" % (RLP, hot, hot, RLP))
def perf(row):
    return 'IF($E$12="Hot / 150°C",%s,%s)' % (perf_hot(row), perf_std(row))
def phys(row):
    return "IFERROR(INDEX(%s!$E$%d:$S$%d,MATCH($B$13,%s!$E$20:$S$20,0)),\"N/A\")" % (RLP, row, row, RLP)

rows = []
rows.append('<row r="1" ht="22" customHeight="1">' + cell('A1',557,'VIKING PUMP HYGIENIC') + '</row>')
rows.append('<row r="2" ht="17" customHeight="1">' + cell('A2',558,'REVOLUTION® RLP SERIES — HYGIENIC ROTARY LOBE PUMP') + '</row>')
rows.append('<row r="3" ht="15" customHeight="1">' + cell('A3',559,'Formerly Wright Flow Technologies (WFT)   •   Source: vikingpump.com/hygienic') + '</row>')
rows.append('<row r="4"/>')
rows.append('<row r="5" ht="16" customHeight="1">' + cell('A5',560,'1 • APPLICATION / DUTY') + '</row>')
rows.append('<row r="6">' + cell('A6',561,'Customer') + cell('B6',571) + cell('D6',561,'Project / Ref') + cell('E6',571) + '</row>')
rows.append('<row r="7">' + cell('A7',561,'Prepared by') + cell('B7',571) + cell('D7',561,'Date') + cell('E7',567,formula='TODAY()') + '</row>')
rows.append('<row r="8">' + cell('A8',561,'Flowrate') + cell('B8',562,formula="%s!C9" % RLP) + cell('C8',570,formula="%s!D9" % RLP)
            + cell('D8',561,'Pressure') + cell('E8',562,formula="%s!C10" % RLP) + cell('F8',570,formula="%s!D10" % RLP) + '</row>')
rows.append('<row r="9">' + cell('A9',561,'Viscosity') + cell('B9',562,formula="%s!C11" % RLP) + cell('C9',570,formula="%s!D11" % RLP)
            + cell('D9',561,'Improved Surface Finish') + cell('E9',562,formula="%s!D12" % RLP) + '</row>')
rows.append('<row r="10"/>')
rows.append('<row r="11" ht="16" customHeight="1">' + cell('A11',560,'2 • SELECTED PUMP') + '</row>')
rows.append('<row r="12">' + cell('A12',561,'Pump Size') + cell('B12',562,'★ Recommended (auto)') + cell('D12',561,'Rotor Class')
            + cell('E12',562,'Standard / 70°C') + '</row>')
rows.append('<row r="13">' + cell('A13',561,'Size used in calc') + cell('B13',562,formula='IF($B$12="★ Recommended (auto)",$B$14,$B$12)')
            + cell('D13',561,'Rotor / Temp Limit')
            + cell('E13',562,formula='IF($E$12="Hot / 150°C","Hot / 150°C (300°F)","Standard / 70°C (160°F)")') + '</row>')
rows.append('<row r="14">' + cell('A14',561,'Recommended (auto)') + cell('B14',562,
            formula="INDEX(%s!$E$20:$S$20,MATCH(TRUE,INDEX(ISNUMBER(%s!$E$25:$S$25),0),0))" % (RLP, RLP)) + '</row>')
rows.append('<row r="15"/>')
rows.append('<row r="16" ht="16" customHeight="1">' + cell('A16',560,'3 • PERFORMANCE AT DUTY') + '</row>')
rows.append('<row r="17">' + cell('A17',568,'Parameter') + cell('B17',568,'Value') + cell('C17',568,'Unit')
            + cell('D17',568) + cell('E17',568,'Parameter') + cell('F17',568,'Value') + cell('G17',568,'Unit') + '</row>')
rows.append('<row r="18">' + cell('A18',569,'Pump Speed') + cell('B18',563,formula=perf(25)) + cell('C18',570,'rpm')
            + cell('E18',569,'Power Required') + cell('F18',564,formula=perf(26))
            + cell('G18',570,formula='IF(ISNUMBER(SEARCH("kw",%s!$B$26)),"kW","HP")' % RLP) + '</row>')
rows.append('<row r="19">' + cell('A19',569,'Torque Required') + cell('B19',564,formula=perf(27))
            + cell('C19',570,formula='IF(ISNUMBER(SEARCH("Nm",%s!$B$27)),"Nm","lb-ft")' % RLP)
            + cell('E19',569,'NPSHr') + cell('F19',565,formula=perf(28))
            + cell('G19',570,formula='IF(ISNUMBER(SEARCH("ft",%s!$B$28)),"ft","m")' % RLP) + '</row>')
rows.append('<row r="20">' + cell('A20',569,'Tip Speed') + cell('B20',565,formula=phys(151)) + cell('C20',570,'m/s')
            + cell('E20',569,'Max Speed') + cell('F20',563,formula=phys(121)) + cell('G20',570,'rpm') + '</row>')
rows.append('<row r="21">' + cell('A21',569,'Possible Flow Variation') + cell('B21',565,formula=phys(30))
            + cell('C21',570,formula='%s!$D$9&" ±"' % RLP)
            + cell('E21',569,'Possible Speed Variation') + cell('F21',563,formula=phys(31)) + cell('G21',570,'rpm ±') + '</row>')
rows.append('<row r="22"/>')
rows.append('<row r="23" ht="16" customHeight="1">' + cell('A23',560,'4 • PUMP SPECIFICATIONS') + '</row>')
rows.append('<row r="24">' + cell('A24',569,'Displacement') + cell('B24',566,formula=phys(22)) + cell('C24',570,'l/rev')
            + cell('E24',569,'Port Size') + cell('F24',565,formula=phys(23)) + cell('G24',570,'in') + '</row>')
rows.append('<row r="25">' + cell('A25',569,'Nominal Rotor Dia') + cell('B25',563,formula=phys(152)) + cell('C25',570,'mm')
            + cell('E25',569,'Port Size (metric)') + cell('F25',563,formula=phys(24)) + cell('G25',570,'mm') + '</row>')
rows.append('<row r="26">' + cell('A26',569,'Max Pressure') + cell('B26',565,formula=phys(122)) + cell('C26',570,'Bar')
            + cell('E26',569,'Max Shaft Torque') + cell('F26',563,formula=phys(118)) + cell('G26',570,'Nm') + '</row>')
rows.append('<row r="27">' + cell('A27',573,'Series capacity: to 399 GPM (91 m³/h)  •  to 450 PSI (31 Bar)  •  to 300°F (150°C)  •  to 2,000,000 SSU (440,000 cSt)') + '</row>')
rows.append('<row r="28"/>')
rows.append('<row r="29" ht="16" customHeight="1">' + cell('A29',560,'5 • OPTIONS & FEATURES') + '</row>')
rows.append('<row r="30">' + cell('A30',573,'• CIP (Clean-In-Place) standard — self-draining head, cusp reliefs, dynamic seal leak path, no dead zones') + '</row>')
rows.append('<row r="31">' + cell('A31',573,'• Porting — Hygienic: Tri-clamp, DIN 11864, DIN 11851 Male, SMS Male   •   Industrial: ASA/ANSI 150/300 lb RF, DIN 2633, BSP Male, NPT Male   •   Jackets available') + '</row>')
rows.append('<row r="32">' + cell('A32',573,'• Sealing — Single or Double Mechanical (with flush), Single or Double O-ring on replaceable sleeve; complete range of material options') + '</row>')
rows.append('<row r="33">' + cell('A33',573,'• Drives: purchased gear reducer   •   Mounting: foot mount   •   Front-loading seal changes & front access shimming') + '</row>')
rows.append('<row r="34"/>')
rows.append('<row r="35" ht="16" customHeight="1">' + cell('A35',560,'6 • CERTIFICATIONS & MANUFACTURING') + '</row>')
rows.append('<row r="36">' + cell('A36',573,'• 3-A Sanitary Standards (3-A SSI)    •    CE — Machinery Directive 2006/42/EC    •    ATEX (EX)') + '</row>')
rows.append('<row r="37">' + cell('A37',573,'• Manufactured in Cedar Falls, Iowa, USA & Eastbourne, UK — Viking Pump Hygienic Ltd. (formerly Wright Flow Technologies)') + '</row>')
rows.append('<row r="38"/>')
rows.append('<row r="39">' + cell('A39',572,'Generated by the WFT Lobe Pump Selector — values auto-calculated from the duty entered on the “Revolution RLP” sheet. Confirm the final selection with Viking Pump Hygienic Ltd.  •  www.vikingpump.com/hygienic') + '</row>')

sheet_data = ''.join(rows)
merges = ['A1:H1','A2:H2','A3:H3','A5:H5','A11:H11','A16:H16','A23:H23','A27:H27','A29:H29',
          'A30:H30','A31:H31','A32:H32','A33:H33','A35:H35','A36:H36','A37:H37','A39:H39']
merge_xml = '<mergeCells count="%d">%s</mergeCells>' % (len(merges), ''.join('<mergeCell ref="%s"/>' % m for m in merges))

cols = ('<cols>'
        '<col min="1" max="1" width="24" customWidth="1"/>'
        '<col min="2" max="2" width="14" customWidth="1"/>'
        '<col min="3" max="3" width="10" customWidth="1"/>'
        '<col min="4" max="4" width="3" customWidth="1"/>'
        '<col min="5" max="5" width="24" customWidth="1"/>'
        '<col min="6" max="6" width="14" customWidth="1"/>'
        '<col min="7" max="7" width="10" customWidth="1"/>'
        '<col min="8" max="8" width="12" customWidth="1"/>'
        '</cols>')

dvs = ('<dataValidations count="2">'
       '<dataValidation type="list" allowBlank="1" showInputMessage="1" promptTitle="Pump Size" prompt="Pick a size, or ★ Recommended (auto) uses the smallest size that meets the duty." sqref="B12"><formula1>%s</formula1></dataValidation>'
       '<dataValidation type="list" allowBlank="1" sqref="E12"><formula1>%s</formula1></dataValidation>'
       '</dataValidations>') % (SIZE_LIST, CLASS_LIST)

sheet_xml = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
 '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
 'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" '
 'mc:Ignorable="x14ac xr xr2 xr3" '
 'xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" '
 'xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision" '
 'xmlns:xr2="http://schemas.microsoft.com/office/spreadsheetml/2015/revision2" '
 'xmlns:xr3="http://schemas.microsoft.com/office/spreadsheetml/2016/revision3">'
 '<sheetPr><tabColor rgb="FF1F4E79"/><pageSetUpPr fitToPage="1"/></sheetPr>'
 '<dimension ref="A1:H39"/>'
 '<sheetViews><sheetView showGridLines="0" workbookViewId="0"><selection activeCell="B12" sqref="B12"/></sheetView></sheetViews>'
 '<sheetFormatPr defaultRowHeight="13.5" x14ac:dyDescent="0.2"/>'
 + cols +
 '<sheetData>' + sheet_data + '</sheetData>'
 '<pageMargins left="0.39" right="0.39" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>'
 '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="1" horizontalDpi="300" verticalDpi="300"/>'
 + merge_xml + dvs +
 '</worksheet>')

parts['xl/worksheets/sheet328.xml'] = sheet_xml.encode('utf-8')

# ----------------------------------------------------------------------------
# 4) workbook.xml — register sheet + fullCalcOnLoad
# ----------------------------------------------------------------------------
wbx = P('xl/workbook.xml')
assert '<sheet name="Revolution RLP" sheetId="401" r:id="rId6"/>' in wbx
wbx = wbx.replace('<sheet name="Revolution RLP" sheetId="401" r:id="rId6"/>',
                  '<sheet name="Revolution RLP" sheetId="401" r:id="rId6"/>'
                  '<sheet name="Datasheet" sheetId="9000" r:id="rId334"/>', 1)
if 'fullCalcOnLoad' not in wbx:
    wbx = wbx.replace('<calcPr calcId="191029"/>', '<calcPr calcId="191029" fullCalcOnLoad="1"/>', 1)
# print area defined name (Datasheet is 7th sheet -> localSheetId 6).
# Inserting a sheet at position 6 shifts every existing definedName localSheetId >= 6 by +1.
def shift_defined_names(xml):
    def repl(m):
        lid = m.group(1)
        if lid.isdigit() and int(lid) >= 6:
            return m.group(0).replace('localSheetId="%s"' % lid, 'localSheetId="%d"' % (int(lid) + 1))
        return m.group(0)
    return re.sub(r'<definedName[^>]*localSheetId="(\d+)"[^>]*>.*?</definedName>', repl, xml, flags=re.S)

if '<definedName name="_xlnm.Print_Area" localSheetId="6">Datasheet' not in wbx:
    wbx = shift_defined_names(wbx)
    if '<definedNames>' in wbx:
        wbx = wbx.replace('<definedNames>',
            '<definedNames><definedName name="_xlnm.Print_Area" localSheetId="6">Datasheet!$A$1:$H$39</definedName>', 1)
    elif '<definedNames/>' in wbx:
        wbx = wbx.replace('<definedNames/>',
            '<definedNames><definedName name="_xlnm.Print_Area" localSheetId="6">Datasheet!$A$1:$H$39</definedName></definedNames>', 1)
    else:
        wbx = wbx.replace('</workbook>',
            '<definedNames><definedName name="_xlnm.Print_Area" localSheetId="6">Datasheet!$A$1:$H$39</definedName></definedNames></workbook>', 1)
W('xl/workbook.xml', wbx)

# ----------------------------------------------------------------------------
# 5) workbook.xml.rels — add worksheet relationship
# ----------------------------------------------------------------------------
rels = P('xl/_rels/workbook.xml.rels')
assert 'rId334' not in rels
rels = rels.replace('</Relationships>',
    '<Relationship Id="rId334" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet328.xml"/></Relationships>', 1)
W('xl/_rels/workbook.xml.rels', rels)

# ----------------------------------------------------------------------------
# 6) [Content_Types].xml — add override for the new sheet
# ----------------------------------------------------------------------------
ct = P('[Content_Types].xml')
assert '/xl/worksheets/sheet328.xml' not in ct
ct = ct.replace('</Types>',
    '<Override PartName="/xl/worksheets/sheet328.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>', 1)
W('[Content_Types].xml', ct)

# ----------------------------------------------------------------------------
# 7) Menu sheet (sheet1.xml) — add "OPEN DATASHEET" link cell
# ----------------------------------------------------------------------------
s1 = P('xl/worksheets/sheet1.xml')
if '<hyperlink ref="F10"' not in s1:
    # add a styled text cell F10 (inside sheetData) + hyperlink block after mergeCells
    if '<c r="F10"' not in s1:
        s1 = s1.replace('<mergeCells count="2">', '<mergeCells count="3">', 1)
        s1 = s1.replace('</mergeCells>', '<mergeCell ref="F10:H10"/></mergeCells>', 1)
        s1 = s1.replace('</sheetData>',
                        '<row r="10"><c r="F10" s="560" t="inlineStr"><is><t>▶  OPEN DATASHEET  (Revolution RLP)</t></is></c></row>'
                        '</sheetData>', 1)
    s1 = s1.replace('</mergeCells>',
                    '</mergeCells><hyperlinks><hyperlink ref="F10" location="Datasheet!A1" display="▶  OPEN DATASHEET  (Revolution RLP)"/></hyperlinks>', 1)
W('xl/worksheets/sheet1.xml', s1)

# ----------------------------------------------------------------------------
# 8) Revolution RLP sheet (sheet6.xml) — add link under the frame table
# ----------------------------------------------------------------------------
s6 = P('xl/worksheets/sheet6.xml')
if '<c r="B44"' not in s6:
    s6 = s6.replace('</sheetData>',
                    '<row r="44"><c r="B44" s="560" t="inlineStr"><is><t>▶  OPEN DATASHEET</t></is></c></row>'
                    '</sheetData>', 1)
if '<hyperlink ref="B44"' not in s6:
    if '</hyperlinks>' in s6:
        s6 = s6.replace('</hyperlinks>',
                        '<hyperlink ref="B44" location="Datasheet!A1" display="▶  OPEN DATASHEET"/></hyperlinks>', 1)
    else:
        s6 = s6.replace('</sheetData>',
                        '<hyperlinks><hyperlink ref="B44" location="Datasheet!A1" display="▶  OPEN DATASHEET"/></hyperlinks>'
                        '</sheetData>', 1)
W('xl/worksheets/sheet6.xml', s6)

# ----------------------------------------------------------------------------
# 9) Re-zip
# ----------------------------------------------------------------------------
tmp = OUT + '.tmp'
with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
    for name in ORDER:
        zout.writestr(name, parts[name])
    for name in parts:
        if name not in ORDER:  # newly added parts
            zout.writestr(name, parts[name])
shutil.move(tmp, OUT)
print("OK — wrote", OUT)

# quick sanity: well-formedness of every modified part
import xml.etree.ElementTree as ET
for p in ['xl/styles.xml','xl/workbook.xml','xl/_rels/workbook.xml.rels','[Content_Types].xml',
          'xl/worksheets/sheet1.xml','xl/worksheets/sheet6.xml','xl/worksheets/sheet328.xml']:
    ET.fromstring(parts[p])
print("All modified XML parts well-formed ✓")

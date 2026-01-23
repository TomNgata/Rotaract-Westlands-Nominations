
import zipfile
import xml.etree.ElementTree as ET
import sys
import json
import re

def read_xlsx(file_path):
    try:
        with zipfile.ZipFile(file_path, 'r') as z:
            # Load shared strings
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                tree = ET.parse(z.open('xl/sharedStrings.xml'))
                root = tree.getroot()
                # standard namespace
                ns = {'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                for si in root.findall('a:si', ns):
                    t = si.find('a:t', ns)
                    if t is not None:
                        shared_strings.append(t.text)
                    else:
                        # try to find text inside runs
                        text = ""
                        for t_node in si.findall('.//a:t', ns):
                            if t_node.text:
                                text += t_node.text
                        shared_strings.append(text)

            # Load first sheet
            # usually xl/worksheets/sheet1.xml
            sheet_name = 'xl/worksheets/sheet1.xml'
            if sheet_name not in z.namelist():
                return {"error": "Sheet1 not found"}

            tree = ET.parse(z.open(sheet_name))
            root = tree.getroot()
            ns = {'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            
            rows_data = []
            sheet_data = root.find('a:sheetData', ns)
            
            for row in sheet_data.findall('a:row', ns):
                row_idx = int(row.get('r'))
                row_vals = {}
                for cell in row.findall('a:c', ns):
                    r = cell.get('r')
                    t = cell.get('t')
                    v = cell.find('a:v', ns)
                    val = None
                    if v is not None:
                         val = v.text
                    
                    if t == 's' and val is not None:
                        val = shared_strings[int(val)]
                    elif t == 'str' and val is not None:
                         val = val # stored directly
                    
                    # split column from row
                    col_match = re.match(r"([A-Z]+)([0-9]+)", r)
                    if col_match:
                        col_str = col_match.group(1)
                        # primitive column index conversion roughly
                        row_vals[col_str] = val
                
                rows_data.append(row_vals)
                # if len(rows_data) > 10: break # REMOVED LIMIT
            
            return rows_data
    except Exception as e:
        return {"error": str(e)}

files = [
    r"c:\Users\TOM NGATA\Documents\AI Automations\Rotaract_Westlands\Elections_2026\Nominations\excel data\Rotaract Club Membership List Update.xlsx",
    r"c:\Users\TOM NGATA\Documents\AI Automations\Rotaract_Westlands\Elections_2026\Nominations\excel data\Rotaract Club Westlands Office Bearers.xlsx"
]

results = {}
for f in files:
    results[f] = read_xlsx(f)

with open('.tmp/excel_dump.json', 'w') as f:
    f.write(json.dumps(results, indent=2, default=str))

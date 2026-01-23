import sys
import os
sys.path.append(os.path.join(os.getcwd(), '.tmp', 'site-packages'))
import pandas as pd
import json

files = [
    r"c:\Users\TOM NGATA\Documents\AI Automations\Rotaract_Westlands\Elections_2026\Nominations\excel data\Rotaract Club Membership List Update.xlsx",
    r"c:\Users\TOM NGATA\Documents\AI Automations\Rotaract_Westlands\Elections_2026\Nominations\excel data\Rotaract Club Westlands Office Bearers.xlsx"
]

results = {}

for f in files:
    try:
        df = pd.read_excel(f)
        results[f] = {
            "columns": df.columns.tolist(),
            "first_rows": df.head(5).to_dict(orient='records'),
            "count": len(df)
        }
    except Exception as e:
        results[f] = {"error": str(e)}

print(json.dumps(results, indent=2, default=str))


import json
import re

def clean_rotary_id(val):
    if not val: return None
    # Handle "1.2284398E7" format
    try:
        f = float(str(val))
        return str(int(f))
    except:
        return str(val)

def clean_phone(val):
    if not val: return None
    # Remove spaces
    return str(val).replace(" ", "").replace("07", "+2547", 1) if str(val).startswith("07") else str(val).replace(" ", "")

def escape_sql(val):
    if val is None: return "NULL"
    return "'" + str(val).replace("'", "''") + "'"

with open('.tmp/excel_dump.json', 'r') as f:
    data = json.load(f)

members_file = r"c:\Users\TOM NGATA\Documents\AI Automations\Rotaract_Westlands\Elections_2026\Nominations\excel data\Rotaract Club Membership List Update.xlsx"
bearers_file = r"c:\Users\TOM NGATA\Documents\AI Automations\Rotaract_Westlands\Elections_2026\Nominations\excel data\Rotaract Club Westlands Office Bearers.xlsx"

members_data = data.get(members_file, [])
bearers_data = data.get(bearers_file, [])

sql = []

# Schema definition
sql.append("""
-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    rotary_id TEXT,
    role TEXT,
    year_joined INTEGER,
    email TEXT,
    phone_number TEXT
);

-- Create office_bearers table
CREATE TABLE IF NOT EXISTS office_bearers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT,
    full_name TEXT,
    email TEXT,
    phone_number TEXT
);

-- Clear existing data to avoid duplicates on re-run (optional, be careful in prod)
TRUNCATE TABLE members;
TRUNCATE TABLE office_bearers;
""")

# Insert Members
# Header map based on file inspection:
# A: Full Name, B: Rotary ID, C: Role, D: Year Joined, E: Email Address, F: Phone Number
# Skipping header row (row 0 in logic, but let's check content)

# Check if first row is header
if members_data and members_data[0].get('A') == 'Full Name':
    members_rows = members_data[1:]
else:
    members_rows = members_data

for row in members_rows:
    full_name = row.get('A')
    rotary_id = clean_rotary_id(row.get('B'))
    role = row.get('C')
    try:
        year_joined = int(float(row.get('D'))) if row.get('D') else None
    except:
        year_joined = None
    email = row.get('E')
    phone = clean_phone(row.get('F'))
    
    if not full_name: continue # Skip empty rows

    sql.append(f"""
    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ({escape_sql(full_name)}, {escape_sql(rotary_id)}, {escape_sql(role)}, {year_joined if year_joined else 'NULL'}, {escape_sql(email)}, {escape_sql(phone)});
    """)

# Insert Office Bearers
# Header map:
# A: Role, B: Full Name, C: Email Address, D: Phone Number
if bearers_data and bearers_data[0].get('A') == 'Role':
    bearers_rows = bearers_data[1:]
else:
    bearers_rows = bearers_data

for row in bearers_rows:
    role = row.get('A')
    full_name = row.get('B')
    email = row.get('C')
    phone = clean_phone(row.get('D'))

    if not role: continue

    sql.append(f"""
    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ({escape_sql(role)}, {escape_sql(full_name)}, {escape_sql(email)}, {escape_sql(phone)});
    """)

with open('.tmp/migration.sql', 'w') as f:
    f.write("\n".join(sql))

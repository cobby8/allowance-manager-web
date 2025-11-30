import pandas as pd
import requests

url = "https://docs.google.com/spreadsheets/d/1Vzo1a5jwx1Mx0w41fOEJHy-bq2KPj6pLU7ySUbGw29E/export?format=xlsx"
output_file = "user_sheet.xlsx"

try:
    print(f"Downloading from {url}...")
    response = requests.get(url)
    response.raise_for_status()
    with open(output_file, 'wb') as f:
        f.write(response.content)
    print("Download complete.")

    df = pd.read_excel(output_file)
    print("Headers List:")
    for col in df.columns:
        print(f"- {col}")
    # print("First row:", df.iloc[0].tolist() if not df.empty else "Empty")
except Exception as e:
    print("Error:", e)

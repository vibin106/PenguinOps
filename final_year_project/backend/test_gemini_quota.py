import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=API_KEY)

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Hello, testing quota"
    )
    print("✅ SUCCESS")
    print(response.text)
except Exception as e:
    print("❌ ERROR")
    print(e)

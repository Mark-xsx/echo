import os
from dotenv import load_dotenv
from supabase import create_client, Client
import resend
from datetime import datetime, timezone

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

if not all([SUPABASE_URL, SUPABASE_KEY, RESEND_API_KEY]):
    raise ValueError("Missing environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
resend.api_key = RESEND_API_KEY

# 查询所有到达时间小于等于现在、且未发送邮件的回声
now_iso = datetime.now(timezone.utc).isoformat()
response = supabase.table("echoes").select("*") \
    .lte("return_at", now_iso) \
    .eq("email_sent", False) \
    .execute()

echoes = response.data or []

for echo in echoes:
    if not echo.get("email"):
        continue
    
    try:
        resend.Emails.send({
            "from": "Echo <onboarding@resend.dev>",
            "to": echo["email"],
            "subject": "你留给自己的回声，到了",
            "html": f"""
            <p style="font-size:18px;">{echo['content']}</p>
            <p style="color:#666;">这是你在 {echo['created_at'][:10]} 写给未来的话。</p>
            <a href="{FRONTEND_URL}/echo/{echo['id']}">点击查看</a>
            """
        })
        # 标记为已发送
        supabase.table("echoes").update({"email_sent": True}).eq("id", echo["id"]).execute()
        print(f"Sent email for echo {echo['id']} to {echo['email']}")
    except Exception as e:
        print(f"Failed to send echo {echo['id']}: {e}")

print("Job finished.")
<!-- Dowload Ollma 
 In and run ollama run gemma3:4b 

Npm run dev / Start Project  

Ngrok 
 - ngrok http 3000
 Copy ngrok url to linedev - webhook and liff  
 
 เเล้วสนุกกับ AI ได้เลย  -->


🛍️ Fashion Store v0
Fashion Store API + LINE LIFF UI พร้อม AI Assistant ที่ใช้งานผ่าน Gemma 3B ด้วย Ollama และเชื่อมต่อผ่าน Webhook/LIFF ด้วย Ngrok

🚀 Features
RESTful API (Express + Prisma + MySQL)

Authentication with JWT

LINE LIFF Frontend Integration

Webhook รองรับการตอบกลับจาก AI

AI Assistant ผ่าน ollama run gemma3:4b

🛠️ Installation
1. Clone this repo
bash
คัดลอก
แก้ไข
git clone https://github.com/Pongpitchit/fashion-store-v0.git
cd fashion-store-v0
🧠 Run AI Locally with Ollama
2. ติดตั้ง Ollama
bash
คัดลอก
แก้ไข
# สำหรับ macOS
brew install ollama

# สำหรับ Windows ให้โหลดที่ https://ollama.com/download
3. ดึงโมเดล Gemma 3B
bash
คัดลอก
แก้ไข
ollama pull gemma3:4b
4. รันโมเดล
bash
คัดลอก
แก้ไข
ollama run gemma3:4b
🌐 Start Server + Ngrok
5. รันเซิร์ฟเวอร์ Express
bash
คัดลอก
แก้ไข
npm install
npm run dev
# หรือ npm run start ถ้าคุณใช้ build แล้ว
6. ติดตั้ง Ngrok (ถ้ายังไม่มี)
bash
คัดลอก
แก้ไข
npm install ngrok

7. เปิด Tunnel ไปยังพอร์ต 3000
bash
คัดลอก
แก้ไข
ngrok http 3000
📋 คัดลอก URL ที่ได้ (เช่น https://abc123.ngrok.io) แล้ววางใน LINE Developer:

LINE Webhook: https://abc123.ngrok.io/api/webhook

LIFF Endpoint URL: https://abc123.ngrok.io/liff

💬 LINE Developer Setup
สร้าง LINE Channel (Messaging API + LIFF)

ตั้งค่า Webhook URL เป็นของ Ngrok

ตั้งค่า LIFF URL ชี้ไปยังหน้าหลักของคุณ

อย่าลืมเปิด Use Webhook

✅ Enjoy AI + LIFF + API
สนุกกับการช้อป + แชทกับ AI ที่ตอบผ่าน Gemma3 บน LINE ได้เลย 🎉

📂 Folder Structure
bash
คัดลอก
แก้ไข
.
├── app/                  # LIFF frontend (Next.js)
├── prisma/               # Prisma schema and seed
├── routes/               # Express routes
├── utils/                # LINE + AI integration
├── .env                  # Config file
├── server.js             # Main Express app
└── ...
📦 Dependencies
Node.js

Express

Prisma + MySQL

JWT

Ollama

Ngrok

LINE Messaging API

🧪 Testing
ใช้ Postman ทดสอบ /api/chat, /api/products, /api/users

ทดสอบ LINE Messaging ด้วยการส่งข้อความเข้าแชท

📜 License
DIT 
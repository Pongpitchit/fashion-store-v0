import { supabase } from "@/lib/supabase";
import { askProductBot } from "@/utils/ai";
import { replyToLineMessage } from "@/utils/line"; // 👈 import เพิ่ม
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events = body.events || [];

    for (const event of events) {
      const userId = event.source?.userId;
      const replyToken = event.replyToken;
      const userMessage = event.message?.text || "";

      if (!userId || !userMessage || !replyToken) continue;

      // ✅ ดึงสินค้าจาก Supabase
      const { data: products, error: productError } = await supabase
        .from("products")
        .select("name, price, brand:brand_id(name)")
        .limit(100);

      if (productError) {
        console.error("Supabase product fetch error:", productError.message);
        continue;
      }

      // ✅ ส่งให้ AI ตอบ
      const aiReply = await askProductBot(userMessage, products);

      // ✅ ส่งข้อความตอบกลับไปยัง LINE
      await replyToLineMessage(replyToken, aiReply);

      // ✅ บันทึกลงฐานข้อมูล Supabase
      const { error: insertError } = await supabase.from("line_messages").insert([
        {
          user_id: userId,
          message: userMessage,
          ai_reply: aiReply,
        },
      ]);

      if (insertError?.message) {
        console.error("Supabase insert line_messages error:", insertError.message);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

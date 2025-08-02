import { supabase } from "@/lib/supabase";
import { askProductBot } from "@/utils/ai";
import { replyToLineMessage } from "@/utils/line";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // อ่าน raw text ก่อน ป้องกัน json parse error
    const rawText = await req.text();
    if (!rawText) {
      console.error("Empty webhook body");
      return new NextResponse("Empty body", { status: 400 });
    }

    const body = JSON.parse(rawText);
    const events = body.events || [];

    for (const event of events) {
      const userId = event.source?.userId;
      const replyToken = event.replyToken;
      const userMessage = event.message?.text || "";

      if (!userId || !userMessage || !replyToken) {
        console.warn("Missing userId or message or replyToken, skipping event");
        continue;
      }

      // ดึงสินค้าจาก Supabase
      const { data: products, error: productError } = await supabase
        .from("products")
        .select("name, price, brand:brand_id(name)")
        .limit(100);

      if (productError) {
        console.error("Supabase product fetch error:", productError.message);
        continue;
      }

      let aiReply = "ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำตอบ";

      try {
        // ส่งข้อความให้ AI ตอบ
        aiReply = await askProductBot(userMessage, products || []);
        if (typeof aiReply !== "string" || aiReply.trim() === "") {
          aiReply = "ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำตอบ";
        }
      } catch (err) {
        console.error("Error calling askProductBot:", err);
      }

      // ตัดข้อความให้ไม่เกิน 500 ตัวอักษร (LINE limit)
      const replyMessage = aiReply.length > 500 ? aiReply.slice(0, 497) + "..." : aiReply;

      try {
        // ส่งข้อความตอบกลับ LINE
        await replyToLineMessage(replyToken, replyMessage);
      } catch (err) {
        console.error("Error sending reply to LINE:", err);
      }

      try {
        // บันทึกข้อความลงฐานข้อมูล
        const { error: insertError } = await supabase.from("line_messages").insert([
          {
            user_id: userId,
            message: userMessage,
            ai_reply: aiReply,
          },
        ]);

        if (insertError) {
          console.error("Supabase insert line_messages error:", insertError.message);
        }
      } catch (err) {
        console.error("Error inserting line_messages:", err);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

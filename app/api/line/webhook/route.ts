import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const events = body.events

    if (!events || events.length === 0) {
      return NextResponse.json({ message: "No events" })
    }

    const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

    if (!lineAccessToken) {
      console.warn("LINE_CHANNEL_ACCESS_TOKEN not configured")
      return NextResponse.json({ message: "Line not configured" })
    }

    for (const event of events) {
      if (event.type === "postback") {
        await handlePostback(event, lineAccessToken)
      }
    }

    return NextResponse.json({ message: "OK" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}

async function handlePostback(event: any, accessToken: string) {
  const data = new URLSearchParams(event.postback.data)
  const action = data.get("action")
  const replyToken = event.replyToken

  if (action === "confirm_order") {
    const orderId = data.get("order_id")

    if (orderId) {
      // Update order status in database
      const supabase = createServerClient()
      const { error } = await supabase.from("orders").update({ status: "CONFIRMED" }).eq("id", orderId)

      if (error) {
        console.error("Error updating order status:", error)
      }

      // Reply to Line
      await replyToLine(replyToken, accessToken, [
        {
          type: "text",
          text: `✅ ยืนยันคำสั่งซื้อ #${orderId} เรียบร้อยแล้ว\nสถานะ: รอการจัดส่ง`,
        },
      ])
    }
  } else if (action === "contact_customer") {
    const phone = data.get("phone")

    await replyToLine(replyToken, accessToken, [
      {
        type: "text",
        text: `📞 ติดต่อลูกค้า: ${phone}\n\nคุณสามารถโทรหาลูกค้าได้ที่หมายเลขนี้`,
      },
    ])
  }
}

async function replyToLine(replyToken: string, accessToken: string, messages: any[]) {
  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Line reply error: ${response.status} - ${errorText}`)
  }
}

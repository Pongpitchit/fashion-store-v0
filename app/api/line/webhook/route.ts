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
  const supabase = createServerClient()

  if (action === "confirm_order") {
    const orderId = data.get("order_id")

    if (orderId) {
      try {
        // Get order details first
        const { data: order, error: fetchError } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              *,
              products (
                name,
                brands (name)
              )
            )
          `)
          .eq("id", orderId)
          .single()

        if (fetchError) {
          console.error("Error fetching order:", fetchError)
          await replyToLine(replyToken, accessToken, [
            {
              type: "text",
              text: "❌ ไม่สามารถดึงข้อมูลคำสั่งซื้อได้",
            },
          ])
          return
        }

        // Update order status to CONFIRMED
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "CONFIRMED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)

        if (updateError) {
          console.error("Error updating order status:", updateError)
          await replyToLine(replyToken, accessToken, [
            {
              type: "text",
              text: "❌ ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้",
            },
          ])
          return
        }

        // Create confirmation message
        const confirmationMessage = createConfirmationFlexMessage(order)

        // Reply to Line
        await replyToLine(replyToken, accessToken, [confirmationMessage])
      } catch (error) {
        console.error("Error confirming order:", error)
        await replyToLine(replyToken, accessToken, [
          {
            type: "text",
            text: "❌ เกิดข้อผิดพลาดในการยืนยันคำสั่งซื้อ",
          },
        ])
      }
    }
  } else if (action === "cancel_order") {
    const orderId = data.get("order_id")

    if (orderId) {
      try {
        // Get order details first
        const { data: order, error: fetchError } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              *,
              products (
                name,
                brands (name)
              )
            )
          `)
          .eq("id", orderId)
          .single()

        if (fetchError) {
          console.error("Error fetching order:", fetchError)
          await replyToLine(replyToken, accessToken, [
            {
              type: "text",
              text: "❌ ไม่สามารถดึงข้อมูลคำสั่งซื้อได้",
            },
          ])
          return
        }

        // Update order status to CANCELLED
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "CANCELLED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)

        if (updateError) {
          console.error("Error updating order status:", updateError)
          await replyToLine(replyToken, accessToken, [
            {
              type: "text",
              text: "❌ ไม่สามารถยกเลิกคำสั่งซื้อได้",
            },
          ])
          return
        }

        // Create cancellation message
        const cancellationMessage = createCancellationFlexMessage(order)

        // Reply to Line
        await replyToLine(replyToken, accessToken, [cancellationMessage])
      } catch (error) {
        console.error("Error cancelling order:", error)
        await replyToLine(replyToken, accessToken, [
          {
            type: "text",
            text: "❌ เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ",
          },
        ])
      }
    }
  }
}

function createConfirmationFlexMessage(order: any) {
  return {
    type: "flex",
    altText: `✅ ยืนยันคำสั่งซื้อ #${order.order_number}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "✅ ยืนยันคำสั่งซื้อ",
            weight: "bold",
            color: "#ffffff",
            size: "lg",
          },
          {
            type: "text",
            text: `#${order.order_number}`,
            color: "#ffffff",
            size: "md",
            margin: "sm",
          },
        ],
        backgroundColor: "#28a745",
        paddingAll: "20px",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "คำสั่งซื้อได้รับการยืนยันเรียบร้อยแล้ว",
            weight: "bold",
            size: "md",
            color: "#333333",
            wrap: true,
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "📋 รายละเอียดคำสั่งซื้อ",
                weight: "bold",
                size: "sm",
                color: "#333333",
                margin: "lg",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "ลูกค้า:",
                    size: "sm",
                    color: "#666666",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: order.shipping_name,
                    size: "sm",
                    weight: "bold",
                    flex: 2,
                    wrap: true,
                  },
                ],
                margin: "sm",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "เบอร์โทร:",
                    size: "sm",
                    color: "#666666",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: order.shipping_phone,
                    size: "sm",
                    flex: 2,
                  },
                ],
                margin: "sm",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "ยอดรวม:",
                    size: "sm",
                    color: "#666666",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `฿${order.total_amount.toLocaleString()}`,
                    size: "sm",
                    weight: "bold",
                    color: "#28a745",
                    flex: 2,
                  },
                ],
                margin: "sm",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "สถานะ:",
                    size: "sm",
                    color: "#666666",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: "รอการจัดส่ง",
                    size: "sm",
                    weight: "bold",
                    color: "#28a745",
                    flex: 2,
                  },
                ],
                margin: "sm",
              },
            ],
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "text",
            text: "📦 ขั้นตอนต่อไป: จัดเตรียมสินค้าและจัดส่ง",
            size: "sm",
            color: "#666666",
            wrap: true,
            margin: "lg",
          },
          {
            type: "text",
            text: `⏰ ยืนยันเมื่อ: ${new Date().toLocaleString("th-TH")}`,
            size: "xs",
            color: "#999999",
            margin: "md",
          },
        ],
        paddingAll: "20px",
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "postback",
              label: "📦 อัปเดตการจัดส่ง",
              data: `action=update_shipping&order_id=${order.id}`,
            },
            style: "primary",
            color: "#007bff",
          },
        ],
        paddingAll: "20px",
      },
    },
  }
}

function createCancellationFlexMessage(order: any) {
  return {
    type: "flex",
    altText: `❌ ยกเลิกคำสั่งซื้อ #${order.order_number}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "❌ ยกเลิกคำสั่งซื้อ",
            weight: "bold",
            color: "#ffffff",
            size: "lg",
          },
          {
            type: "text",
            text: `#${order.order_number}`,
            color: "#ffffff",
            size: "md",
            margin: "sm",
          },
        ],
        backgroundColor: "#dc3545",
        paddingAll: "20px",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "คำสั่งซื้อได้รับการยกเลิกเรียบร้อยแล้ว",
            weight: "bold",
            size: "md",
            color: "#333333",
            wrap: true,
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "📋 รายละเอียดคำสั่งซื้อที่ยกเลิก",
                weight: "bold",
                size: "sm",
                color: "#333333",
                margin: "lg",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "ลูกค้า:",
                    size: "sm",
                    color: "#666666",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: order.shipping_name,
                    size: "sm",
                    weight: "bold",
                    flex: 2,
                    wrap: true,
                  },
                ],
                margin: "sm",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "เบอร์โทร:",
                    size: "sm",
                    color: "#666666",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: order.shipping_phone,
                    size: "sm",
                    flex: 2,
                  },
                ],
                margin: "sm",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "ยอดเงิน:",
                    size: "sm",
                    color: "#666666",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `฿${order.total_amount.toLocaleString()}`,
                    size: "sm",
                    weight: "bold",
                    color: "#dc3545",
                    flex: 2,
                  },
                ],
                margin: "sm",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "สถานะ:",
                    size: "sm",
                    color: "#666666",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: "ยกเลิกแล้ว",
                    size: "sm",
                    weight: "bold",
                    color: "#dc3545",
                    flex: 2,
                  },
                ],
                margin: "sm",
              },
            ],
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "🛒 รายการสินค้าที่ยกเลิก:",
                weight: "bold",
                size: "sm",
                color: "#333333",
                margin: "lg",
              },
              ...order.order_items.map((item: any, index: number) => ({
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: `${index + 1}. ${item.products.name}`,
                    size: "xs",
                    color: "#666666",
                    flex: 3,
                    wrap: true,
                  },
                  {
                    type: "text",
                    text: `${item.quantity} ชิ้น`,
                    size: "xs",
                    color: "#666666",
                    flex: 1,
                    align: "end",
                  },
                ],
                margin: "sm",
              })),
            ],
          },
          {
            type: "separator",
            margin: "lg",
          },
          {
            type: "text",
            text: "💡 หมายเหตุ: หากลูกค้าได้ชำระเงินแล้ว กรุณาดำเนินการคืนเงิน",
            size: "sm",
            color: "#666666",
            wrap: true,
            margin: "lg",
          },
          {
            type: "text",
            text: `⏰ ยกเลิกเมื่อ: ${new Date().toLocaleString("th-TH")}`,
            size: "xs",
            color: "#999999",
            margin: "md",
          },
        ],
        paddingAll: "20px",
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "postback",
              label: "📞 ติดต่อลูกค้า",
              data: `action=contact_customer&phone=${order.shipping_phone}&order_id=${order.id}`,
            },
            style: "secondary",
          },
        ],
        paddingAll: "20px",
      },
    },
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

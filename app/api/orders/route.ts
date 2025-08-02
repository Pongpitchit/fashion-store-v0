import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId, customerInfo, items, total, itemCount } = await request.json()

    if (!userId || !customerInfo || !items || items.length === 0) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    // Use server client with service role key
    const supabase = createServerClient()

    // Generate order number
    const orderNumber = `ORD${Date.now()}`
    const shippingFee = 50
    const totalAmount = total + shippingFee

    // Get or create user in database
    let { data: user, error: userError } = await supabase.from("users").select("id").eq("line_id", userId).single()

    if (userError && userError.code === "PGRST116") {
      // User doesn't exist, create one
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          line_id: userId,
          display_name: customerInfo.name,
        })
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating user:", createError)

        // Try RPC function as fallback
        try {
          const { data: rpcUser, error: rpcError } = await supabase.rpc("create_user_from_api", {
            p_line_id: userId,
            p_display_name: customerInfo.name,
          })

          if (rpcError) {
            console.error("RPC error:", rpcError)
            return NextResponse.json({ error: "ไม่สามารถสร้างผู้ใช้ได้" }, { status: 500 })
          }

          user = { id: rpcUser.id }
        } catch (rpcErr) {
          console.error("RPC function error:", rpcErr)
          return NextResponse.json({ error: "ไม่สามารถสร้างผู้ใช้ได้" }, { status: 500 })
        }
      } else {
        user = newUser
      }
    } else if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" }, { status: 500 })
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user?.id,
        status: "PENDING",
        total_amount: totalAmount,
        shipping_fee: shippingFee,
        shipping_name: customerInfo.name,
        shipping_phone: customerInfo.phone,
        shipping_address: customerInfo.address,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "ไม่สามารถสร้างคำสั่งซื้อได้" }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.price,
      size: item.size || null,
      color: item.color || null,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      return NextResponse.json({ error: "ไม่สามารถสร้างรายการสินค้าได้" }, { status: 500 })
    }

    // Send order to Line OA
    try {
      await sendOrderToLineOA(order, items, customerInfo, totalAmount, userId)
    } catch (lineError) {
      console.error("Error sending to Line OA:", lineError)
      // Don't fail the order if Line OA fails
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: totalAmount,
      },
    })
  } catch (error) {
    console.error("Error processing order:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสั่งซื้อ" }, { status: 500 })
  }
}

async function sendOrderToLineOA(order: any, items: any[], customerInfo: any, totalAmount: number, userId: any) {
  const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

  if (!lineAccessToken) {
    console.warn("LINE_CHANNEL_ACCESS_TOKEN not configured")
    return
  }

  const targetId = userId

  if (!targetId) {
    console.warn("LINE_OA_TARGET_ID not configured")
    return
  }

  // Create Flex message for order
  const flexMessage = createOrderFlexMessage(order, items, customerInfo, totalAmount)

  // Send to Line OA
  const lineApiUrl = "https://api.line.me/v2/bot/message/push"

  const response = await fetch(lineApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lineAccessToken}`,
    },
    body: JSON.stringify({
      to: targetId,
      messages: [flexMessage],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Line API error: ${response.status} - ${errorText}`)
  }
}

function createOrderFlexMessage(order: any, items: any[], customerInfo: any, totalAmount: number) {
  // Create product items for the flex message
  const productItems = items.map((item, index) => ({
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "image",
            url: item.product.image_url || "https://via.placeholder.com/100x100",
            size: "60px",
            aspectRatio: "1:1",
            aspectMode: "cover",
            flex: 0,
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: item.product.name,
                weight: "bold",
                size: "sm",
                wrap: true,
              },
              {
                type: "text",
                text: item.product.brands?.name || "Unknown Brand",
                size: "xs",
                color: "#666666",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: `จำนวน: ${item.quantity}`,
                    size: "xs",
                    color: "#666666",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `฿${(item.price * item.quantity).toLocaleString()}`,
                    size: "sm",
                    weight: "bold",
                    color: "#FF6B9D",
                    align: "end",
                  },
                ],
                margin: "sm",
              },
              ...(item.size
                ? [
                    {
                      type: "text",
                      text: `ไซส์: ${item.size}`,
                      size: "xs",
                      color: "#666666",
                    },
                  ]
                : []),
              ...(item.color
                ? [
                    {
                      type: "text",
                      text: `สี: ${item.color}`,
                      size: "xs",
                      color: "#666666",
                    },
                  ]
                : []),
            ],
            flex: 1,
            margin: "sm",
          },
        ],
        margin: index > 0 ? "md" : "none",
      },
      {
        type: "separator",
        margin: "md",
      },
    ],
  }))

  return {
    type: "flex",
    altText: `คำสั่งซื้อใหม่ #${order.order_number}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🛍️ คำสั่งซื้อใหม่",
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
        backgroundColor: "#FF6B9D",
        paddingAll: "20px",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          // Customer Information
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "👤 ข้อมูลลูกค้า",
                weight: "bold",
                size: "md",
                color: "#333333",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "ชื่อ:",
                        size: "sm",
                        color: "#666666",
                        flex: 1,
                      },
                      {
                        type: "text",
                        text: customerInfo.name,
                        size: "sm",
                        weight: "bold",
                        flex: 2,
                        wrap: true,
                      },
                    ],
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "เบอร์:",
                        size: "sm",
                        color: "#666666",
                        flex: 1,
                      },
                      {
                        type: "text",
                        text: customerInfo.phone,
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
                        text: "ที่อยู่:",
                        size: "sm",
                        color: "#666666",
                        flex: 1,
                      },
                      {
                        type: "text",
                        text: customerInfo.address,
                        size: "sm",
                        flex: 2,
                        wrap: true,
                      },
                    ],
                    margin: "sm",
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
          // Products
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "🛒 รายการสินค้า",
                weight: "bold",
                size: "md",
                color: "#333333",
              },
              ...productItems,
            ],
            margin: "lg",
          },
          {
            type: "separator",
            margin: "lg",
          },
          // Order Summary
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "💰 สรุปคำสั่งซื้อ",
                weight: "bold",
                size: "md",
                color: "#333333",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "ยอดรวมสินค้า:",
                    size: "sm",
                    color: "#666666",
                  },
                  {
                    type: "text",
                    text: `฿${(totalAmount - 50).toLocaleString()}`,
                    size: "sm",
                    align: "end",
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
                    text: "ค่าจัดส่ง:",
                    size: "sm",
                    color: "#666666",
                  },
                  {
                    type: "text",
                    text: "฿50",
                    size: "sm",
                    align: "end",
                  },
                ],
                margin: "sm",
              },
              {
                type: "separator",
                margin: "sm",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "ยอดรวมทั้งหมด:",
                    size: "md",
                    weight: "bold",
                    color: "#333333",
                  },
                  {
                    type: "text",
                    text: `฿${totalAmount.toLocaleString()}`,
                    size: "md",
                    weight: "bold",
                    color: "#FF6B9D",
                    align: "end",
                  },
                ],
                margin: "sm",
              },
            ],
          },
          // Order Date
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "📅 วันที่สั่งซื้อ:",
                size: "xs",
                color: "#666666",
              },
              {
                type: "text",
                text: new Date().toLocaleString("th-TH"),
                size: "xs",
                color: "#666666",
                align: "end",
              },
            ],
            margin: "lg",
          },
          // Notes if any
          ...(customerInfo.notes
            ? [
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "📝 หมายเหตุ:",
                      size: "sm",
                      weight: "bold",
                      color: "#333333",
                    },
                    {
                      type: "text",
                      text: customerInfo.notes,
                      size: "sm",
                      color: "#666666",
                      wrap: true,
                      margin: "sm",
                    },
                  ],
                  margin: "lg",
                },
              ]
            : []),
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
              label: "✅ ยืนยันคำสั่งซื้อ",
              data: `action=confirm_order&order_id=${order.id}`,
            },
            style: "primary",
            color: "#28a745",
          },
          {
            type: "button",
            action: {
              type: "postback",
              label: "❌ ยกเลิกสินค้า",
              data: `action=cancel_order&order_id=${order.id}`,
            },
            style: "secondary",
            color: "#dc3545",
            margin: "sm",
          },
        ],
        paddingAll: "20px",
      },
    },
  }
}

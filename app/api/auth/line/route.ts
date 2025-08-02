import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { lineId, displayName, pictureUrl, email } = await request.json()

    if (!lineId) {
      return NextResponse.json({ error: "Line ID required" }, { status: 400 })
    }

    // Use server client with service role key to bypass RLS
    const supabase = createServerClient()

    // Use the function we created to handle user creation/update
    const { data: user, error } = await supabase.rpc("create_user_from_api", {
      p_line_id: lineId,
      p_display_name: displayName,
      p_picture_url: pictureUrl,
      p_email: email,
    })

    if (error) {
      console.error("Supabase RPC error:", error)
      return NextResponse.json({ error: "Failed to authenticate user" }, { status: 500 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error handling Line auth:", error)
    return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 })
  }
}

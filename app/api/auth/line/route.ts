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

    // First, try to find existing user
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("line_id", lineId)
      .single()

    if (findError && findError.code !== "PGRST116") {
      console.error("Error finding user:", findError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    let user = existingUser

    if (!existingUser) {
      // Create new user directly
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          line_id: lineId,
          display_name: displayName,
          picture_url: pictureUrl,
          email: email,
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating user:", createError)

        // Try using the RPC function as fallback
        const { data: rpcUser, error: rpcError } = await supabase.rpc("create_user_from_api", {
          p_line_id: lineId,
          p_display_name: displayName,
          p_picture_url: pictureUrl,
          p_email: email,
        })

        if (rpcError) {
          console.error("RPC error:", rpcError)
          return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
        }

        user = rpcUser
      } else {
        user = newUser
      }
    } else {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          display_name: displayName || existingUser.display_name,
          picture_url: pictureUrl || existingUser.picture_url,
          email: email || existingUser.email,
          updated_at: new Date().toISOString(),
        })
        .eq("line_id", lineId)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating user:", updateError)
        // Return existing user if update fails
        user = existingUser
      } else {
        user = updatedUser
      }
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error handling Line auth:", error)
    return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 })
  }
}

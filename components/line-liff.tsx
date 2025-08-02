"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    liff: any
  }
}

export function useLiff() {
  const [liff, setLiff] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initLiff = async () => {
      try {
        if (typeof window !== "undefined" && window.liff) {
          await window.liff.init({
            liffId: process.env.NEXT_PUBLIC_LIFF_ID || "YOUR_LIFF_ID_HERE",
          })

          setLiff(window.liff)
          setIsReady(true)

          if (window.liff.isLoggedIn()) {
            const profile = await window.liff.getProfile()
            setUser(profile)
          }
        }
      } catch (error) {
        console.error("LIFF initialization failed:", error)
        setIsReady(true) // Set ready even on error for demo purposes
      }
    }

    initLiff()
  }, [])

  const login = () => {
    if (liff && !liff.isLoggedIn()) {
      liff.login()
    }
  }

  const logout = () => {
    if (liff) {
      liff.logout()
      setUser(null)
    }
  }

  return {
    liff,
    user,
    isReady,
    login,
    logout,
    isLoggedIn: liff?.isLoggedIn() || false,
  }
}

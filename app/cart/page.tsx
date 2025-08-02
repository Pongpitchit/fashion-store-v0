"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { useLiff } from "@/components/line-liff"

export default function CartPage() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart()
  const { user } = useLiff()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.displayName || "",
    phone: "",
    address: "",
    notes: "",
  })

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }

  const handleCheckout = async () => {
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนสั่งซื้อ")
      return
    }

    if (state.items.length === 0) {
      alert("ไม่มีสินค้าในตะกร้า")
      return
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    setIsCheckingOut(true)

    try {
      const orderData = {
        userId: user.userId,
        customerInfo,
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok) {
        alert("สั่งซื้อสำเร็จ! ข้อมูลคำสั่งซื้อได้ส่งไปยัง Line OA แล้ว")
        clearCart()
        // Redirect to order confirmation or home
        window.location.href = "/"
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ")
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm p-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-xl font-bold">ตะกร้าสินค้า</h1>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">ตะกร้าสินค้าว่าง</h2>
          <p className="text-gray-500 mb-6">เพิ่มสินค้าลงในตะกร้าเพื่อเริ่มสั่งซื้อ</p>
          <Link href="/">
            <Button>เลือกซื้อสินค้า</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold">ตะกร้าสินค้า ({state.itemCount} รายการ)</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Cart Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายการสินค้า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                <Image
                  src={item.product.image_url || "/placeholder.svg"}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.product.name}</h3>
                  <p className="text-xs text-gray-500">{item.product.brands?.name}</p>

                  {item.size && <p className="text-xs text-gray-600">ไซส์: {item.size}</p>}
                  {item.color && <p className="text-xs text-gray-600">สี: {item.color}</p>}

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-pink-600">฿{(item.price * item.quantity).toLocaleString()}</span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-8 text-center text-sm">{item.quantity}</span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลการจัดส่ง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">ชื่อ-นามสกุล</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>

            <div>
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="กรอกเบอร์โทรศัพท์"
              />
            </div>

            <div>
              <Label htmlFor="address">ที่อยู่จัดส่ง</Label>
              <Textarea
                id="address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="กรอกที่อยู่จัดส่งแบบละเอียด"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">หมายเหตุ (ไม่บังคับ)</Label>
              <Textarea
                id="notes"
                value={customerInfo.notes}
                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="หมายเหตุเพิ่มเติม"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สรุปคำสั่งซื้อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า ({state.itemCount} รายการ)</span>
                <span>฿{state.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span>฿50</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-pink-600">฿{(state.total + 50).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Button */}
        <Button onClick={handleCheckout} disabled={isCheckingOut || !user} className="w-full h-12 text-lg" size="lg">
          {isCheckingOut ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
        </Button>

        {!user && <p className="text-center text-sm text-red-500">กรุณาเข้าสู่ระบบก่อนสั่งซื้อ</p>}
      </div>
    </div>
  )
}

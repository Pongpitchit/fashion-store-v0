"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  shipping_fee: number
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  created_at: string
  updated_at: string
  order_items: Array<{
    id: string
    quantity: number
    price: number
    size?: string
    color?: string
    products: {
      name: string
      image_url: string
      brands: {
        name: string
      }
    }
  }>
}

export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        const data = await response.json()

        if (response.ok) {
          setOrder(data.order)
        } else {
          setError(data.error || "ไม่พบคำสั่งซื้อ")
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return { icon: Clock, text: "รอการยืนยัน", color: "bg-yellow-500" }
      case "CONFIRMED":
        return { icon: Package, text: "ยืนยันแล้ว", color: "bg-blue-500" }
      case "PROCESSING":
        return { icon: Package, text: "กำลังจัดเตรียม", color: "bg-blue-500" }
      case "SHIPPED":
        return { icon: Truck, text: "จัดส่งแล้ว", color: "bg-green-500" }
      case "DELIVERED":
        return { icon: CheckCircle, text: "ส่งสำเร็จ", color: "bg-green-600" }
      case "CANCELLED":
        return { icon: XCircle, text: "ยกเลิกแล้ว", color: "bg-red-500" }
      default:
        return { icon: Clock, text: "ไม่ทราบสถานะ", color: "bg-gray-500" }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">ไม่พบคำสั่งซื้อ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/">
            <Button>กลับหน้าหลัก</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold">สถานะคำสั่งซื้อ</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Order Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">#{order.order_number}</CardTitle>
              <Badge className={`${statusInfo.color} text-white`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusInfo.text}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">วันที่สั่งซื้อ:</span>
                <span>{new Date(order.created_at).toLocaleString("th-TH")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">อัปเดตล่าสุด:</span>
                <span>{new Date(order.updated_at).toLocaleString("th-TH")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลการจัดส่ง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ชื่อ:</span>
              <span>{order.shipping_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">เบอร์โทร:</span>
              <span>{order.shipping_phone}</span>
            </div>
            <div>
              <span className="text-gray-600">ที่อยู่:</span>
              <p className="mt-1">{order.shipping_address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายการสินค้า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                <Image
                  src={item.products.image_url || "/placeholder.svg"}
                  alt={item.products.name}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.products.name}</h3>
                  <p className="text-xs text-gray-500">{item.products.brands.name}</p>
                  {item.size && <p className="text-xs text-gray-600">ไซส์: {item.size}</p>}
                  {item.color && <p className="text-xs text-gray-600">สี: {item.color}</p>}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">จำนวน: {item.quantity}</span>
                    <span className="font-bold text-pink-600">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">สรุปคำสั่งซื้อ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า:</span>
                <span>฿{(order.total_amount - order.shipping_fee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง:</span>
                <span>฿{order.shipping_fee.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>ยอดรวมทั้งหมด:</span>
                <span className="text-pink-600">฿{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

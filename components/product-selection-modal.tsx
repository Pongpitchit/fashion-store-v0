"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Minus, Plus, ShoppingCart } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/lib/supabase"
import { useCart } from "@/contexts/cart-context"

interface ProductSelectionModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onToggleFavorite: (productId: string) => void
  isFavorited: boolean
}

export function ProductSelectionModal({
  product,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorited,
}: ProductSelectionModalProps) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      alert("กรุณาเลือกไซส์")
      return
    }
    if (product.colors.length > 0 && !selectedColor) {
      alert("กรุณาเลือกสี")
      return
    }

    addToCart(product, quantity, selectedSize, selectedColor)
    alert(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`)
    onClose()

    // Reset selections
    setSelectedSize("")
    setSelectedColor("")
    setQuantity(1)
  }

  const handleQuickAdd = () => {
    // Quick add without size/color selection
    addToCart(product, 1)
    alert(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            เลือกรายละเอียดสินค้า
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Image */}
          <div className="relative">
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={() => onToggleFavorite(product.id)}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_new && <Badge className="bg-green-500 text-white text-xs">ใหม่</Badge>}
              {product.is_sale && <Badge className="bg-red-500 text-white text-xs">Sale</Badge>}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm text-gray-500 mb-1">{product.brands?.name}</p>
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-xl text-pink-600">฿{product.price.toLocaleString()}</span>
              {product.original_price && (
                <span className="text-sm text-gray-400 line-through">฿{product.original_price.toLocaleString()}</span>
              )}
            </div>

            {product.reviews_count && product.reviews_count > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600 ml-1">
                    {product.avg_rating} ({product.reviews_count} รีวิว)
                  </span>
                </div>
              </div>
            )}

            {product.description && <p className="text-sm text-gray-600 mb-4">{product.description}</p>}
          </div>

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                ไซส์ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="h-10"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                สี <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedColor(color)}
                    className="h-10 justify-start"
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                      style={{
                        backgroundColor: getColorCode(color),
                      }}
                    />
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">จำนวน</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="w-16 text-center font-medium text-lg">{quantity}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="h-10 w-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">สินค้าคงเหลือ: {product.stock} ชิ้น</span>
            {product.stock < 10 && product.stock > 0 && (
              <Badge variant="destructive" className="text-xs">
                เหลือน้อย
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Full Selection Add to Cart */}
            <Button
              onClick={handleAddToCart}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white h-12"
              size="lg"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
            </Button>

            {/* Quick Add Button (if no size/color required) */}
            {product.sizes.length === 0 && product.colors.length === 0 && (
              <Button
                onClick={handleQuickAdd}
                variant="outline"
                className="w-full h-10 bg-transparent"
                size="sm"
                disabled={product.stock === 0}
              >
                เพิ่มด่วน (1 ชิ้น)
              </Button>
            )}
          </div>

          {/* Required Fields Notice */}
          {(product.sizes.length > 0 || product.colors.length > 0) && (
            <p className="text-xs text-gray-500 text-center">
              <span className="text-red-500">*</span> กรุณาเลือกข้อมูลที่จำเป็นก่อนเพิ่มลงตะกร้า
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to get color codes
function getColorCode(colorName: string): string {
  const colorMap: { [key: string]: string } = {
    White: "#FFFFFF",
    Black: "#000000",
    Gray: "#808080",
    Red: "#FF0000",
    Blue: "#0000FF",
    "Light Blue": "#ADD8E6",
    "Dark Blue": "#00008B",
    Pink: "#FFC0CB",
    Yellow: "#FFFF00",
    Green: "#008000",
    Purple: "#800080",
    Orange: "#FFA500",
    Brown: "#A52A2A",
    Navy: "#000080",
    Cream: "#F5F5DC",
    Beige: "#F5F5DC",
  }

  return colorMap[colorName] || "#CCCCCC"
}

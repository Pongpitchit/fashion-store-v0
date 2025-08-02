"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Minus, Plus } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/lib/supabase"
import { useCart } from "@/contexts/cart-context"

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onToggleFavorite: (productId: string) => void
  isFavorited: boolean
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorited,
}: ProductDetailModalProps) {
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
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">{product.name}</DialogTitle>
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
              <label className="block text-sm font-medium mb-2">ไซส์</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
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
              <label className="block text-sm font-medium mb-2">สี</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedColor(color)}
                  >
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
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="w-12 text-center font-medium">{quantity}</span>

              <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)} className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stock Info */}
          <div className="text-sm text-gray-600">สินค้าคงเหลือ: {product.stock} ชิ้น</div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            size="lg"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

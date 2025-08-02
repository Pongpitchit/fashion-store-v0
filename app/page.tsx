"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Heart, Search, ShoppingBag, User, Menu, Filter, Star } from "lucide-react"
import Image from "next/image"
import { useLiff } from "@/components/line-liff"
import type { Product, Category } from "@/lib/supabase"
import { useCart } from "@/contexts/cart-context"
import { ProductSelectionModal } from "@/components/product-selection-modal"
import Link from "next/link"

export default function FashionStore() {
  const { user, login, logout, isReady } = useLiff()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [dbUser, setDbUser] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  const { addToCart, state } = useCart()

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedCategory !== "All") {
          params.append("category", selectedCategory)
        }
        if (searchQuery) {
          params.append("search", searchQuery)
        }

        const response = await fetch(`/api/products?${params}`)
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, searchQuery])

  // Fetch user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (dbUser?.id) {
        try {
          const response = await fetch(`/api/favorites?userId=${dbUser.id}`)
          const data = await response.json()
          setFavorites(data.map((fav: any) => fav.product_id))
        } catch (error) {
          console.error("Error fetching favorites:", error)
        }
      }
    }

    fetchFavorites()
  }, [dbUser])

  const handleLineLogin = async () => {
    try {
      await login()
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  // Sync with database after Line login
  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        try {
          const response = await fetch("/api/auth/line", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lineId: user.userId,
              displayName: user.displayName,
              pictureUrl: user.pictureUrl,
            }),
          })

          const data = await response.json()
          setDbUser(data.user)
        } catch (error) {
          console.error("Error syncing user:", error)
        }
      }
    }

    syncUser()
  }, [user])

  const toggleFavorite = async (productId: string) => {
    if (!dbUser?.id) {
      alert("กรุณาเข้าสู่ระบบก่อน")
      return
    }

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dbUser.id,
          productId,
        }),
      })

      const data = await response.json()

      if (data.favorited) {
        setFavorites((prev) => [...prev, productId])
      } else {
        setFavorites((prev) => prev.filter((id) => id !== productId))
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleAddToCart = (product: Product) => {
    // Check if product has size or color options
    if (product.sizes.length > 0 || product.colors.length > 0) {
      setSelectedProduct(product)
      setIsProductModalOpen(true)
    } else {
      // Quick add for products without options
      addToCart(product, 1)
      alert(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`)
    }
  }

  const categoryOptions = [{ name: "ทั้งหมด", name_en: "All" }, ...categories]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Menu className="h-6 w-6" />
            <h1 className="text-xl font-bold text-pink-600">FashionHub</h1>
          </div>

          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6" />
            {user ? (
              <div className="flex items-center gap-2">
                <Image
                  src={user.pictureUrl || "/placeholder.svg"}
                  alt={user.displayName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <Button variant="ghost" size="sm" onClick={logout}>
                  ออกจากระบบ
                </Button>
              </div>
            ) : (
              <Button onClick={handleLineLogin} className="bg-green-500 hover:bg-green-600 text-white" size="sm">
                <User className="h-4 w-4 mr-1" />
                เข้าสู่ระบบ LINE
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto">
            {categoryOptions.map((category) => (
              <Button
                key={category.name_en}
                variant={selectedCategory === category.name_en ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name_en)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-pink-400 to-purple-500 m-4 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Sale Up to 50%</h2>
            <p className="text-sm opacity-90">คอลเลคชั่นใหม่ล่าสุด</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">สินค้าแนะนำ</h3>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            กรอง
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse" />
                <CardContent className="p-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative">
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    width={250}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                      }`}
                    />
                  </Button>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.is_new && <Badge className="bg-green-500 text-white text-xs">ใหม่</Badge>}
                    {product.is_sale && <Badge className="bg-red-500 text-white text-xs">Sale</Badge>}
                    {(product.sizes.length > 0 || product.colors.length > 0) && (
                      <Badge className="bg-blue-500 text-white text-xs">เลือกได้</Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-3">
                  <p className="text-xs text-gray-500 mb-1">{product.brands?.name}</p>
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h4>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-pink-600">฿{product.price.toLocaleString()}</span>
                    {product.original_price && (
                      <span className="text-xs text-gray-400 line-through">
                        ฿{product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Size and Color indicators */}
                  {(product.sizes.length > 0 || product.colors.length > 0) && (
                    <div className="flex gap-1 mb-2">
                      {product.sizes.length > 0 && (
                        <span className="text-xs text-gray-500">ไซส์: {product.sizes.join(", ")}</span>
                      )}
                      {product.colors.length > 0 && (
                        <span className="text-xs text-gray-500">สี: {product.colors.length} สี</span>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-2 bg-pink-600 hover:bg-pink-700 text-white"
                    size="sm"
                  >
                    {product.sizes.length > 0 || product.colors.length > 0 ? "เลือกซื้อ" : "เพิ่มลงตะกร้า"}
                  </Button>

                  {product.reviews_count && product.reviews_count > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600 ml-1">
                          {product.avg_rating} ({product.reviews_count})
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">ไม่พบสินค้าที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setSelectedProduct(null)
        }}
        onToggleFavorite={toggleFavorite}
        isFavorited={selectedProduct ? favorites.includes(selectedProduct.id) : false}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around">
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <div className="h-6 w-6 bg-pink-600 rounded" />
            <span className="text-xs">หน้าหลัก</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Search className="h-6 w-6" />
            <span className="text-xs">ค้นหา</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Heart className="h-6 w-6" />
            <span className="text-xs">รายการโปรด</span>
          </Button>
          <Link href="/cart">
            <Button variant="ghost" className="flex flex-col items-center gap-1 relative">
              <ShoppingBag className="h-6 w-6" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.itemCount}
                </span>
              )}
              <span className="text-xs">ตะกร้า</span>
            </Button>
          </Link>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <User className="h-6 w-6" />
            <span className="text-xs">โปรไฟล์</span>
          </Button>
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="h-20" />
    </div>
  )
}

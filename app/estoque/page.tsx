"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Package, Edit, Trash2, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Cigar {
  id: string
  name: string
  brand: string
  origin: string
  size: string
  wrapper: string
  strength: number
  price: number
  quantity: number
  purchaseDate: string
  notes?: string
}

export default function EstoquePage() {
  const [cigars, setCigars] = useState<Cigar[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCigar, setEditingCigar] = useState<Cigar | null>(null)
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    origin: "",
    size: "",
    wrapper: "",
    strength: 1,
    price: 0,
    quantity: 1,
    purchaseDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const storedCigars = localStorage.getItem("cigars")
    if (storedCigars) {
      setCigars(JSON.parse(storedCigars))
    }
  }, [mounted])

  const saveCigars = (newCigars: Cigar[]) => {
    if (!mounted) return
    setCigars(newCigars)
    localStorage.setItem("cigars", JSON.stringify(newCigars))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCigar) {
      // Update existing cigar
      const updatedCigars = cigars.map((cigar) =>
        cigar.id === editingCigar.id ? { ...formData, id: editingCigar.id } : cigar,
      )
      saveCigars(updatedCigars)
      toast({
        title: "Charuto atualizado",
        description: "As informações do charuto foram atualizadas com sucesso.",
      })
      setEditingCigar(null)
    } else {
      // Add new cigar
      const newCigar: Cigar = {
        ...formData,
        id: Date.now().toString(),
      }
      saveCigars([...cigars, newCigar])
      toast({
        title: "Charuto adicionado",
        description: "O charuto foi adicionado ao estoque com sucesso.",
      })
    }

    // Reset form
    setFormData({
      name: "",
      brand: "",
      origin: "",
      size: "",
      wrapper: "",
      strength: 1,
      price: 0,
      quantity: 1,
      purchaseDate: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEdit = (cigar: Cigar) => {
    setFormData(cigar)
    setEditingCigar(cigar)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const updatedCigars = cigars.filter((cigar) => cigar.id !== id)
    saveCigars(updatedCigars)
    toast({
      title: "Charuto removido",
      description: "O charuto foi removido do estoque.",
    })
  }

  const filteredCigars = cigars.filter(
    (cigar) =>
      cigar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cigar.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cigar.origin.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalValue = cigars.reduce((sum, cigar) => sum + cigar.price * cigar.quantity, 0)
  const totalQuantity = cigars.reduce((sum, cigar) => sum + cigar.quantity, 0)

  if (!mounted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Estoque de Charutos</h1>
              <p className="mt-2 text-gray-600">Gerencie sua coleção de charutos</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Charutos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalQuantity}</div>
                  <p className="text-xs text-muted-foreground">{cigars.length} tipos diferentes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Valor da coleção</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {cigars.length > 0 ? (totalValue / totalQuantity).toFixed(2) : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">Por charuto</p>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar charutos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Charuto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingCigar ? "Editar Charuto" : "Adicionar Novo Charuto"}</DialogTitle>
                    <DialogDescription>
                      {editingCigar
                        ? "Atualize as informações do charuto."
                        : "Preencha as informações do novo charuto para adicionar ao estoque."}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Charuto</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="origin">País de Origem</Label>
                        <Input
                          id="origin"
                          value={formData.origin}
                          onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="size">Tamanho</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          placeholder="ex: Robusto, Churchill"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wrapper">Wrapper</Label>
                        <Input
                          id="wrapper"
                          value={formData.wrapper}
                          onChange={(e) => setFormData({ ...formData, wrapper: e.target.value })}
                          placeholder="ex: Connecticut, Maduro"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="strength">Força (1-5)</Label>
                        <Select
                          value={formData.strength.toString()}
                          onValueChange={(value) => setFormData({ ...formData, strength: Number.parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Muito Suave</SelectItem>
                            <SelectItem value="2">2 - Suave</SelectItem>
                            <SelectItem value="3">3 - Médio</SelectItem>
                            <SelectItem value="4">4 - Forte</SelectItem>
                            <SelectItem value="5">5 - Muito Forte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Preço (R$)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="purchaseDate">Data de Compra</Label>
                        <Input
                          id="purchaseDate"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Observações sobre o charuto..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false)
                          setEditingCigar(null)
                          setFormData({
                            name: "",
                            brand: "",
                            origin: "",
                            size: "",
                            wrapper: "",
                            strength: 1,
                            price: 0,
                            quantity: 1,
                            purchaseDate: new Date().toISOString().split("T")[0],
                            notes: "",
                          })
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">{editingCigar ? "Atualizar" : "Adicionar"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Cigars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCigars.map((cigar) => (
                <Card key={cigar.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{cigar.name}</CardTitle>
                        <CardDescription>{cigar.brand}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(cigar)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(cigar.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Origem:</span>
                        <span className="text-sm font-medium">{cigar.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tamanho:</span>
                        <span className="text-sm font-medium">{cigar.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Wrapper:</span>
                        <span className="text-sm font-medium">{cigar.wrapper}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Força:</span>
                        <Badge variant="outline">{cigar.strength}/5</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Preço:</span>
                        <span className="text-sm font-medium">R$ {cigar.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Quantidade:</span>
                        <Badge>{cigar.quantity}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Compra:</span>
                        <span className="text-sm font-medium">
                          {new Date(cigar.purchaseDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {cigar.notes && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Observações:</span>
                          <p className="text-sm mt-1 text-gray-800">{cigar.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCigars.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "Nenhum charuto encontrado" : "Nenhum charuto no estoque"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? "Tente ajustar os termos de busca."
                    : "Comece adicionando alguns charutos à sua coleção."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Charuto
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

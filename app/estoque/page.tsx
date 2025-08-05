"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import { AddCigarModal } from "@/components/add-cigar-modal"
import { ProtectedRoute } from "@/components/protected-route"

interface Cigar {
  id: string
  name: string
  brand: string
  origin: string
  size: string
  wrapper: string
  strength: string
  price: number
  quantity: number
  purchaseDate: string
  notes?: string
}

export default function EstoquePage() {
  const [cigars, setCigars] = useState<Cigar[]>([])
  const [filteredCigars, setFilteredCigars] = useState<Cigar[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBrand, setFilterBrand] = useState("all")
  const [filterStrength, setFilterStrength] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCigar, setEditingCigar] = useState<Cigar | null>(null)

  useEffect(() => {
    const storedCigars = localStorage.getItem("cigars")
    if (storedCigars) {
      const parsedCigars = JSON.parse(storedCigars)
      setCigars(parsedCigars)
      setFilteredCigars(parsedCigars)
    }
  }, [])

  useEffect(() => {
    let filtered = cigars

    if (searchTerm) {
      filtered = filtered.filter(
        (cigar) =>
          cigar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cigar.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cigar.origin.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterBrand !== "all") {
      filtered = filtered.filter((cigar) => cigar.brand === filterBrand)
    }

    if (filterStrength !== "all") {
      filtered = filtered.filter((cigar) => cigar.strength === filterStrength)
    }

    setFilteredCigars(filtered)
  }, [cigars, searchTerm, filterBrand, filterStrength])

  const handleAddCigar = (newCigar: Omit<Cigar, "id">) => {
    const cigar: Cigar = {
      ...newCigar,
      id: Date.now().toString(),
    }
    const updatedCigars = [...cigars, cigar]
    setCigars(updatedCigars)
    localStorage.setItem("cigars", JSON.stringify(updatedCigars))
  }

  const handleEditCigar = (updatedCigar: Cigar) => {
    const updatedCigars = cigars.map((cigar) => (cigar.id === updatedCigar.id ? updatedCigar : cigar))
    setCigars(updatedCigars)
    localStorage.setItem("cigars", JSON.stringify(updatedCigars))
    setEditingCigar(null)
  }

  const handleDeleteCigar = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este charuto?")) {
      const updatedCigars = cigars.filter((cigar) => cigar.id !== id)
      setCigars(updatedCigars)
      localStorage.setItem("cigars", JSON.stringify(updatedCigars))
    }
  }

  const uniqueBrands = Array.from(new Set(cigars.map((cigar) => cigar.brand)))
  const strengthOptions = ["Suave", "Médio", "Forte", "Muito Forte"]

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Suave":
        return "bg-green-100 text-green-800"
      case "Médio":
        return "bg-yellow-100 text-yellow-800"
      case "Forte":
        return "bg-orange-100 text-orange-800"
      case "Muito Forte":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Estoque</h1>
            <p className="text-gray-600">Gerencie sua coleção de charutos</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Charuto
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar charutos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {uniqueBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStrength} onValueChange={setFilterStrength}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por força" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as forças</SelectItem>
                  {strengthOptions.map((strength) => (
                    <SelectItem key={strength} value={strength}>
                      {strength}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Charutos */}
        {filteredCigars.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum charuto encontrado</h3>
              <p className="text-gray-600 text-center mb-4">
                {cigars.length === 0
                  ? "Comece adicionando seu primeiro charuto à coleção."
                  : "Tente ajustar os filtros para encontrar o que procura."}
              </p>
              {cigars.length === 0 && (
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Charuto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCigars.map((cigar) => (
              <Card key={cigar.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{cigar.name}</CardTitle>
                      <CardDescription>{cigar.brand}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingCigar(cigar)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCigar(cigar.id)}
                        className="text-red-600 hover:text-red-700"
                      >
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
                      <span className="text-sm text-gray-600">Capa:</span>
                      <span className="text-sm font-medium">{cigar.wrapper}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Força:</span>
                      <Badge className={getStrengthColor(cigar.strength)}>{cigar.strength}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quantidade:</span>
                      <span className="text-sm font-medium">{cigar.quantity} unidades</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Preço unitário:</span>
                      <span className="text-sm font-medium">
                        R$ {cigar.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valor total:</span>
                      <span className="text-sm font-bold text-orange-600">
                        R$ {(cigar.price * cigar.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {cigar.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-gray-600">Notas:</span>
                        <p className="text-sm mt-1">{cigar.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AddCigarModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCigar}
          editingCigar={editingCigar}
          onEdit={handleEditCigar}
        />
      </div>
    </ProtectedRoute>
  )
}

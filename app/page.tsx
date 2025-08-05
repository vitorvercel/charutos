"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Package, Wine, Clock, TrendingUp, Star, Search } from "lucide-react"
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

interface TastingHistory {
  id: string
  cigarId: string
  cigarName: string
  cigarBrand: string
  date: string
  duration: number
  rating: number
  flavors: string[]
  notes: string
  environment: string
  pairing?: string
}

const flavorOptions = [
  "Amadeirado",
  "Terroso",
  "Apimentado",
  "Doce",
  "Cremoso",
  "Frutado",
  "Floral",
  "Herbáceo",
  "Tostado",
  "Chocolate",
  "Café",
  "Baunilha",
  "Cedro",
  "Couro",
  "Mel",
  "Nozes",
]

export default function Dashboard() {
  const [cigars, setCigars] = useState<Cigar[]>([])
  const [tastingHistory, setTastingHistory] = useState<TastingHistory[]>([])
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Cigar[]>([])

  useEffect(() => {
    // Carregar dados do localStorage
    const storedCigars = localStorage.getItem("cigars")
    const storedHistory = localStorage.getItem("tastingHistory")

    if (storedCigars) {
      setCigars(JSON.parse(storedCigars))
    }

    if (storedHistory) {
      setTastingHistory(JSON.parse(storedHistory))
    }
  }, [])

  useEffect(() => {
    // Gerar recomendações baseadas nos sabores selecionados e histórico
    if (selectedFlavors.length > 0) {
      const cigarRecommendations = cigars.filter((cigar) => {
        // Verificar se o charuto tem avaliações positivas com os sabores selecionados
        const cigarTastings = tastingHistory.filter((tasting) => tasting.cigarId === cigar.id && tasting.rating >= 4)

        return cigarTastings.some((tasting) => selectedFlavors.some((flavor) => tasting.flavors.includes(flavor)))
      })

      setRecommendations(cigarRecommendations.slice(0, 3))
    } else {
      // Se não há sabores selecionados, recomendar baseado nas melhores avaliações
      const topRatedCigars = cigars
        .map((cigar) => {
          const cigarTastings = tastingHistory.filter((tasting) => tasting.cigarId === cigar.id)
          const avgRating =
            cigarTastings.length > 0
              ? cigarTastings.reduce((sum, tasting) => sum + tasting.rating, 0) / cigarTastings.length
              : 0
          return { ...cigar, avgRating }
        })
        .filter((cigar) => cigar.avgRating > 0)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 3)

      setRecommendations(topRatedCigars)
    }
  }, [selectedFlavors, cigars, tastingHistory])

  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors((prev) => (prev.includes(flavor) ? prev.filter((f) => f !== flavor) : [...prev, flavor]))
  }

  // Estatísticas
  const totalCigars = cigars.reduce((sum, cigar) => sum + cigar.quantity, 0)
  const totalValue = cigars.reduce((sum, cigar) => sum + cigar.price * cigar.quantity, 0)
  const totalTastings = tastingHistory.length
  const avgRating =
    tastingHistory.length > 0
      ? tastingHistory.reduce((sum, tasting) => sum + tasting.rating, 0) / tastingHistory.length
      : 0

  // Charutos em degustação (simulado - baseado em localStorage)
  const currentTastings = JSON.parse(localStorage.getItem("currentTastings") || "[]")

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral da sua coleção e atividades</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Charutos</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalCigars}</div>
              <p className="text-xs text-gray-600">unidades em estoque</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-600">valor da coleção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Degustações</CardTitle>
              <Wine className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{totalTastings}</div>
              <p className="text-xs text-gray-600">degustações realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{avgRating.toFixed(1)}/5</div>
              <p className="text-xs text-gray-600">média das avaliações</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sistema de Recomendação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-orange-600" />
                Sistema de Recomendação
              </CardTitle>
              <CardDescription>
                Selecione os sabores que você aprecia para receber recomendações personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Sabores Preferidos:</Label>
                <div className="flex flex-wrap gap-2">
                  {flavorOptions.map((flavor) => (
                    <Badge
                      key={flavor}
                      variant={selectedFlavors.includes(flavor) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedFlavors.includes(flavor)
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                      }`}
                      onClick={() => toggleFlavor(flavor)}
                    >
                      {flavor}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Recomendações {selectedFlavors.length > 0 ? "Baseadas nos Seus Gostos" : "Mais Bem Avaliados"}:
                </Label>
                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((cigar) => {
                      const cigarTastings = tastingHistory.filter((t) => t.cigarId === cigar.id)
                      const avgRating =
                        cigarTastings.length > 0
                          ? cigarTastings.reduce((sum, t) => sum + t.rating, 0) / cigarTastings.length
                          : 0

                      return (
                        <div key={cigar.id} className="p-3 border rounded-lg bg-orange-50 border-orange-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{cigar.name}</h4>
                              <p className="text-sm text-gray-600">
                                {cigar.brand} • {cigar.origin}
                              </p>
                              {avgRating > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                                  <span className="text-xs text-gray-600">{avgRating.toFixed(1)}/5</span>
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {cigar.strength}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    {selectedFlavors.length > 0
                      ? "Nenhuma recomendação encontrada para os sabores selecionados. Experimente diferentes combinações!"
                      : "Adicione charutos ao estoque e faça algumas degustações para receber recomendações personalizadas."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Atividade Recente
              </CardTitle>
              <CardDescription>Suas últimas degustações e atividades</CardDescription>
            </CardHeader>
            <CardContent>
              {currentTastings.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2 text-orange-700">Em Degustação:</h4>
                  {currentTastings.map((tasting: any) => (
                    <div key={tasting.id} className="p-2 bg-orange-50 rounded border border-orange-200 mb-2">
                      <p className="font-medium text-sm">{tasting.cigarName}</p>
                      <p className="text-xs text-gray-600">
                        Iniciado em {new Date(tasting.startTime).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  ))}
                  <Separator className="my-4" />
                </div>
              )}

              <div className="space-y-3">
                {tastingHistory.slice(0, 5).map((tasting) => (
                  <div key={tasting.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{tasting.cigarName}</h4>
                      <p className="text-xs text-gray-600 mb-1">{tasting.cigarBrand}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < tasting.rating ? "fill-orange-400 text-orange-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(tasting.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {tastingHistory.length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">
                    Nenhuma degustação registrada ainda. Comece sua primeira degustação!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

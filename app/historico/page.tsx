"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, Clock, Wine } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

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

export default function HistoricoPage() {
  const [tastingHistory, setTastingHistory] = useState<TastingHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<TastingHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRating, setFilterRating] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  useEffect(() => {
    const storedHistory = localStorage.getItem("tastingHistory")
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory)
      setTastingHistory(parsedHistory)
      setFilteredHistory(parsedHistory)
    }
  }, [])

  useEffect(() => {
    let filtered = [...tastingHistory]

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (tasting) =>
          tasting.cigarName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tasting.cigarBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tasting.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tasting.flavors.some((flavor) => flavor.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filtro de avaliação
    if (filterRating !== "all") {
      const rating = Number.parseInt(filterRating)
      filtered = filtered.filter((tasting) => tasting.rating === rating)
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "rating":
          return b.rating - a.rating
        case "duration":
          return b.duration - a.duration
        case "name":
          return a.cigarName.localeCompare(b.cigarName)
        default:
          return 0
      }
    })

    setFilteredHistory(filtered)
  }, [tastingHistory, searchTerm, filterRating, sortBy])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}min`
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getAverageRating = () => {
    if (tastingHistory.length === 0) return 0
    const sum = tastingHistory.reduce((acc, tasting) => acc + tasting.rating, 0)
    return (sum / tastingHistory.length).toFixed(1)
  }

  const getTotalTastings = () => tastingHistory.length

  const getTotalDuration = () => {
    const total = tastingHistory.reduce((acc, tasting) => acc + tasting.duration, 0)
    return formatDuration(total)
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Degustações</h1>
          <p className="text-gray-600">Revise suas experiências passadas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Degustações</CardTitle>
              <Wine className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{getTotalTastings()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{getAverageRating()}/5</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{getTotalDuration()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros e Ordenação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar degustações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por avaliação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as avaliações</SelectItem>
                  <SelectItem value="5">5 estrelas</SelectItem>
                  <SelectItem value="4">4 estrelas</SelectItem>
                  <SelectItem value="3">3 estrelas</SelectItem>
                  <SelectItem value="2">2 estrelas</SelectItem>
                  <SelectItem value="1">1 estrela</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data (mais recente)</SelectItem>
                  <SelectItem value="rating">Avaliação (maior)</SelectItem>
                  <SelectItem value="duration">Duração (maior)</SelectItem>
                  <SelectItem value="name">Nome do charuto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Degustações */}
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wine className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {tastingHistory.length === 0 ? "Nenhuma degustação registrada" : "Nenhuma degustação encontrada"}
              </h3>
              <p className="text-gray-600 text-center">
                {tastingHistory.length === 0
                  ? "Comece sua primeira degustação para ver o histórico aqui."
                  : "Tente ajustar os filtros para encontrar o que procura."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((tasting) => (
              <Card key={tasting.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{tasting.cigarName}</CardTitle>
                      <CardDescription>{tasting.cigarBrand}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < tasting.rating ? "fill-orange-400 text-orange-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className={`ml-2 font-medium ${getRatingColor(tasting.rating)}`}>{tasting.rating}/5</span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(tasting.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Detalhes da Degustação</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Duração:</span>
                            <span className="text-sm font-medium">{formatDuration(tasting.duration)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Ambiente:</span>
                            <span className="text-sm font-medium">{tasting.environment}</span>
                          </div>
                          {tasting.pairing && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Harmonização:</span>
                              <span className="text-sm font-medium">{tasting.pairing}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Sabores Identificados</h4>
                        <div className="flex flex-wrap gap-1">
                          {tasting.flavors.map((flavor, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {flavor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Notas da Degustação</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {tasting.notes || "Nenhuma nota adicional registrada."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

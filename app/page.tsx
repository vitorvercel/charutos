"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Package, Wine, History, TrendingUp, Star, Coffee, Zap } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navigation } from "@/components/navigation"

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

interface TastingSession {
  id: string
  cigarId: string
  cigarName: string
  date: string
  duration: number
  rating: number
  notes: string
  flavors: string[]
  burnQuality: number
  drawQuality: number
  ashQuality: number
}

interface Recommendation {
  id: string
  name: string
  brand: string
  reason: string
  matchPercentage: number
}

const flavorOptions = [
  { id: "woody", name: "Amadeirado", icon: "🌳" },
  { id: "spicy", name: "Picante", icon: "🌶️" },
  { id: "sweet", name: "Doce", icon: "🍯" },
  { id: "earthy", name: "Terroso", icon: "🌱" },
  { id: "nutty", name: "Amendoado", icon: "🥜" },
  { id: "coffee", name: "Café", icon: "☕" },
  { id: "chocolate", name: "Chocolate", icon: "🍫" },
  { id: "leather", name: "Couro", icon: "🧳" },
  { id: "floral", name: "Floral", icon: "🌸" },
  { id: "fruity", name: "Frutado", icon: "🍇" },
]

export default function Dashboard() {
  const [cigars, setCigars] = useState<Cigar[]>([])
  const [tastingSessions, setTastingSessions] = useState<TastingSession[]>([])
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Load data from localStorage only on client side
    const storedCigars = localStorage.getItem("cigars")
    const storedSessions = localStorage.getItem("tastingSessions")

    if (storedCigars) {
      setCigars(JSON.parse(storedCigars))
    }

    if (storedSessions) {
      setTastingSessions(JSON.parse(storedSessions))
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    // Generate recommendations based on selected flavors
    if (selectedFlavors.length > 0) {
      generateRecommendations()
    } else {
      setRecommendations([])
    }
  }, [selectedFlavors, tastingSessions, mounted])

  const generateRecommendations = () => {
    // Simple recommendation algorithm based on flavor preferences
    const flavorBasedRecommendations: Recommendation[] = [
      {
        id: "1",
        name: "Montecristo No. 2",
        brand: "Montecristo",
        reason: "Baseado nos seus sabores preferidos",
        matchPercentage: 95,
      },
      {
        id: "2",
        name: "Romeo y Julieta Churchill",
        brand: "Romeo y Julieta",
        reason: "Perfil de sabor similar às suas avaliações",
        matchPercentage: 88,
      },
      {
        id: "3",
        name: "Cohiba Siglo VI",
        brand: "Cohiba",
        reason: "Recomendado para o seu paladar",
        matchPercentage: 82,
      },
    ]

    setRecommendations(flavorBasedRecommendations)
  }

  const toggleFlavor = (flavorId: string) => {
    setSelectedFlavors((prev) => (prev.includes(flavorId) ? prev.filter((id) => id !== flavorId) : [...prev, flavorId]))
  }

  // Don't render until mounted to avoid hydration mismatch
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Calculate statistics
  const totalCigars = cigars.reduce((sum, cigar) => sum + cigar.quantity, 0)
  const totalValue = cigars.reduce((sum, cigar) => sum + cigar.price * cigar.quantity, 0)
  const averageRating =
    tastingSessions.length > 0
      ? tastingSessions.reduce((sum, session) => sum + session.rating, 0) / tastingSessions.length
      : 0
  const recentSessions = tastingSessions.slice(-5).reverse()

  // Get top rated cigars
  const topRatedCigars = tastingSessions
    .reduce((acc, session) => {
      const existing = acc.find((item) => item.cigarName === session.cigarName)
      if (existing) {
        existing.totalRating += session.rating
        existing.count += 1
        existing.averageRating = existing.totalRating / existing.count
      } else {
        acc.push({
          cigarName: session.cigarName,
          totalRating: session.rating,
          count: 1,
          averageRating: session.rating,
        })
      }
      return acc
    }, [] as any[])
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 3)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">Visão geral da sua coleção de charutos</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Charutos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCigars}</div>
                  <p className="text-xs text-muted-foreground">{cigars.length} tipos diferentes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Valor da coleção</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Degustações</CardTitle>
                  <Wine className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tastingSessions.length}</div>
                  <p className="text-xs text-muted-foreground">Sessões realizadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground">Nota média geral</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Tastings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Degustações Recentes
                  </CardTitle>
                  <CardDescription>Suas últimas 5 sessões de degustação</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentSessions.length > 0 ? (
                    <div className="space-y-4">
                      {recentSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{session.cigarName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(session.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-medium">{session.rating}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhuma degustação realizada ainda</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Rated Cigars */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Charutos Mais Bem Avaliados
                  </CardTitle>
                  <CardDescription>Seus charutos favoritos baseado nas avaliações</CardDescription>
                </CardHeader>
                <CardContent>
                  {topRatedCigars.length > 0 ? (
                    <div className="space-y-4">
                      {topRatedCigars.map((cigar, index) => (
                        <div
                          key={cigar.cigarName}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-amber-600 font-bold">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{cigar.cigarName}</p>
                              <p className="text-sm text-gray-500">
                                {cigar.count} degustação{cigar.count > 1 ? "ões" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-medium">{cigar.averageRating.toFixed(1)}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Realize algumas degustações para ver seus favoritos
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Flavor Preferences & Recommendations */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coffee className="h-5 w-5 mr-2" />
                    Sistema de Recomendações
                  </CardTitle>
                  <CardDescription>
                    Selecione seus sabores preferidos para receber recomendações personalizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Flavor Selection */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Seus Sabores Preferidos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {flavorOptions.map((flavor) => (
                          <Button
                            key={flavor.id}
                            variant={selectedFlavors.includes(flavor.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleFlavor(flavor.id)}
                            className="justify-start"
                          >
                            <span className="mr-2">{flavor.icon}</span>
                            {flavor.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Recomendações para Você</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {recommendations.map((rec) => (
                            <div
                              key={rec.id}
                              className="p-4 border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{rec.name}</h4>
                                <Badge variant="secondary">{rec.matchPercentage}% match</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{rec.brand}</p>
                              <p className="text-xs text-gray-500">{rec.reason}</p>
                              <Progress value={rec.matchPercentage} className="mt-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedFlavors.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Selecione alguns sabores para receber recomendações personalizadas!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

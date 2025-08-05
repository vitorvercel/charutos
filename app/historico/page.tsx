"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Star, Clock, Wine, Filter, Calendar, TrendingUp } from "lucide-react"

interface TastingSession {
  id: string
  cigarId: string
  cigarName: string
  cigarBrand: string
  startTime: string
  endTime?: string
  duration?: number
  rating?: number
  notes?: string
  flavors?: string[]
  burnQuality?: number
  drawQuality?: number
  ashQuality?: number
  environment?: string
  pairing?: string
}

export default function HistoricoPage() {
  const [sessions, setSessions] = useState<TastingSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<TastingSession[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedSession, setSelectedSession] = useState<TastingSession | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const storedSessions = localStorage.getItem("tastingSessions")
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions)
      setSessions(parsedSessions)
      setFilteredSessions(parsedSessions)
    }
  }, [mounted])

  useEffect(() => {
    const filtered = sessions.filter((session) => {
      const matchesSearch =
        session.cigarName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.cigarBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.notes && session.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "5" && session.rating === 5) ||
        (ratingFilter === "4+" && session.rating && session.rating >= 4) ||
        (ratingFilter === "3+" && session.rating && session.rating >= 3) ||
        (ratingFilter === "low" && session.rating && session.rating < 3)

      return matchesSearch && matchesRating
    })

    // Sort sessions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        case "date-asc":
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0)
        case "rating-asc":
          return (a.rating || 0) - (b.rating || 0)
        case "duration-desc":
          return (b.duration || 0) - (a.duration || 0)
        case "duration-asc":
          return (a.duration || 0) - (b.duration || 0)
        default:
          return 0
      }
    })

    setFilteredSessions(filtered)
  }, [sessions, searchTerm, ratingFilter, sortBy])

  const getAverageRating = () => {
    if (sessions.length === 0) return 0
    const totalRating = sessions.reduce((sum, session) => sum + (session.rating || 0), 0)
    return totalRating / sessions.length
  }

  const getTotalDuration = () => {
    return sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
  }

  const getMostCommonFlavors = () => {
    const flavorCount: { [key: string]: number } = {}
    sessions.forEach((session) => {
      session.flavors?.forEach((flavor) => {
        flavorCount[flavor] = (flavorCount[flavor] || 0) + 1
      })
    })

    return Object.entries(flavorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([flavor, count]) => ({ flavor, count }))
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}min`
    }
  }

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

  const averageRating = getAverageRating()
  const totalDuration = getTotalDuration()
  const commonFlavors = getMostCommonFlavors()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Histórico de Degustações</h1>
              <p className="mt-2 text-gray-600">Revise e analise suas experiências passadas</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Degustações</CardTitle>
                  <Wine className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.length}</div>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
                  <p className="text-xs text-muted-foreground">Tempo degustando</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sessions.length > 0 ? formatDuration(Math.round(totalDuration / sessions.length)) : "0 min"}
                  </div>
                  <p className="text-xs text-muted-foreground">Por sessão</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por charuto, marca ou observações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por nota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as notas</SelectItem>
                  <SelectItem value="5">5 estrelas</SelectItem>
                  <SelectItem value="4+">4+ estrelas</SelectItem>
                  <SelectItem value="3+">3+ estrelas</SelectItem>
                  <SelectItem value="low">Menos de 3</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Mais recente</SelectItem>
                  <SelectItem value="date-asc">Mais antigo</SelectItem>
                  <SelectItem value="rating-desc">Maior nota</SelectItem>
                  <SelectItem value="rating-asc">Menor nota</SelectItem>
                  <SelectItem value="duration-desc">Maior duração</SelectItem>
                  <SelectItem value="duration-asc">Menor duração</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Common Flavors */}
            {commonFlavors.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">Sabores Mais Identificados</CardTitle>
                  <CardDescription>Os sabores que você mais identifica em suas degustações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {commonFlavors.map(({ flavor, count }) => (
                      <Badge key={flavor} variant="secondary" className="text-sm">
                        {flavor} ({count}x)
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sessions List */}
            <div className="space-y-4">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{session.cigarName}</h3>
                              <p className="text-sm text-gray-600">{session.cigarBrand}</p>
                            </div>
                            <div className="flex items-center ml-4">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="font-medium">{session.rating}/5</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(session.startTime).toLocaleDateString("pt-BR")}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {session.duration ? formatDuration(session.duration) : "N/A"}
                            </div>
                            {session.environment && (
                              <div className="flex items-center">
                                <span className="mr-1">📍</span>
                                {session.environment}
                              </div>
                            )}
                            {session.pairing && (
                              <div className="flex items-center">
                                <span className="mr-1">🥃</span>
                                {session.pairing}
                              </div>
                            )}
                          </div>

                          {session.flavors && session.flavors.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {session.flavors.slice(0, 4).map((flavor) => (
                                  <Badge key={flavor} variant="outline" className="text-xs">
                                    {flavor}
                                  </Badge>
                                ))}
                                {session.flavors.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{session.flavors.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {session.notes && <p className="text-sm text-gray-700 line-clamp-2 mb-3">{session.notes}</p>}
                        </div>

                        <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0 sm:ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                                Ver Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{session.cigarName}</DialogTitle>
                                <DialogDescription>{session.cigarBrand}</DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-1">Data</h4>
                                    <p className="text-sm">{new Date(session.startTime).toLocaleString("pt-BR")}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-1">Duração</h4>
                                    <p className="text-sm">
                                      {session.duration ? formatDuration(session.duration) : "N/A"}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-1">Avaliação Geral</h4>
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                      <span>{session.rating}/5</span>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-1">Queima</h4>
                                    <p className="text-sm">{session.burnQuality}/5</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-1">Tiragem</h4>
                                    <p className="text-sm">{session.drawQuality}/5</p>
                                  </div>
                                </div>

                                {session.environment && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-1">Ambiente</h4>
                                    <p className="text-sm">{session.environment}</p>
                                  </div>
                                )}

                                {session.pairing && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-1">Harmonização</h4>
                                    <p className="text-sm">{session.pairing}</p>
                                  </div>
                                )}

                                {session.flavors && session.flavors.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Sabores Identificados</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {session.flavors.map((flavor) => (
                                        <Badge key={flavor} variant="secondary" className="text-xs">
                                          {flavor}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {session.notes && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Observações</h4>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{session.notes}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Wine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || ratingFilter !== "all"
                      ? "Nenhuma degustação encontrada"
                      : "Nenhuma degustação realizada"}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || ratingFilter !== "all"
                      ? "Tente ajustar os filtros de busca."
                      : "Inicie sua primeira degustação para começar a construir seu histórico."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Play, Square, Wine, Clock, Star } from "lucide-react"
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

const flavorOptions = [
  "Amadeirado",
  "Terroso",
  "Picante",
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

export default function DegustacaoPage() {
  const [cigars, setCigars] = useState<Cigar[]>([])
  const [currentSessions, setCurrentSessions] = useState<TastingSession[]>([])
  const [completedSessions, setCompletedSessions] = useState<TastingSession[]>([])
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false)
  const [finishingSession, setFinishingSession] = useState<TastingSession | null>(null)
  const [mounted, setMounted] = useState(false)

  const [finishFormData, setFinishFormData] = useState({
    rating: 5,
    notes: "",
    flavors: [] as string[],
    burnQuality: 5,
    drawQuality: 5,
    ashQuality: 5,
    environment: "",
    pairing: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const storedCigars = localStorage.getItem("cigars")
    const storedCurrentSessions = localStorage.getItem("currentTastingSessions")
    const storedCompletedSessions = localStorage.getItem("tastingSessions")

    if (storedCigars) {
      setCigars(JSON.parse(storedCigars))
    }

    if (storedCurrentSessions) {
      setCurrentSessions(JSON.parse(storedCurrentSessions))
    }

    if (storedCompletedSessions) {
      setCompletedSessions(JSON.parse(storedCompletedSessions))
    }
  }, [mounted])

  const saveCurrentSessions = (sessions: TastingSession[]) => {
    if (!mounted) return
    setCurrentSessions(sessions)
    localStorage.setItem("currentTastingSessions", JSON.stringify(sessions))
  }

  const saveCompletedSessions = (sessions: TastingSession[]) => {
    if (!mounted) return
    setCompletedSessions(sessions)
    localStorage.setItem("tastingSessions", JSON.stringify(sessions))
  }

  const startTasting = (cigar: Cigar) => {
    const newSession: TastingSession = {
      id: Date.now().toString(),
      cigarId: cigar.id,
      cigarName: cigar.name,
      cigarBrand: cigar.brand,
      startTime: new Date().toISOString(),
    }

    saveCurrentSessions([...currentSessions, newSession])
    setIsStartDialogOpen(false)

    toast({
      title: "Degustação iniciada",
      description: `Degustação do ${cigar.name} iniciada com sucesso.`,
    })
  }

  const finishTasting = (session: TastingSession) => {
    setFinishingSession(session)
    setFinishFormData({
      rating: 5,
      notes: "",
      flavors: [],
      burnQuality: 5,
      drawQuality: 5,
      ashQuality: 5,
      environment: "",
      pairing: "",
    })
  }

  const handleFinishSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!finishingSession) return

    const endTime = new Date().toISOString()
    const duration = Math.round(
      (new Date(endTime).getTime() - new Date(finishingSession.startTime).getTime()) / (1000 * 60),
    )

    const completedSession: TastingSession = {
      ...finishingSession,
      endTime,
      duration,
      ...finishFormData,
    }

    // Remove from current sessions
    const updatedCurrentSessions = currentSessions.filter((s) => s.id !== finishingSession.id)
    saveCurrentSessions(updatedCurrentSessions)

    // Add to completed sessions
    saveCompletedSessions([...completedSessions, completedSession])

    setFinishingSession(null)

    toast({
      title: "Degustação finalizada",
      description: `Degustação do ${finishingSession.cigarName} finalizada e salva.`,
    })
  }

  const cancelTasting = (sessionId: string) => {
    const updatedSessions = currentSessions.filter((s) => s.id !== sessionId)
    saveCurrentSessions(updatedSessions)

    toast({
      title: "Degustação cancelada",
      description: "A degustação foi cancelada.",
    })
  }

  const formatDuration = (startTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const diffMinutes = Math.round((now.getTime() - start.getTime()) / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} min`
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}min`
    }
  }

  const toggleFlavor = (flavor: string) => {
    setFinishFormData((prev) => ({
      ...prev,
      flavors: prev.flavors.includes(flavor) ? prev.flavors.filter((f) => f !== flavor) : [...prev.flavors, flavor],
    }))
  }

  const availableCigars = cigars.filter((cigar) => cigar.quantity > 0)

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
              <h1 className="text-3xl font-bold text-gray-900">Degustação de Charutos</h1>
              <p className="mt-2 text-gray-600">Inicie e acompanhe suas sessões de degustação</p>
            </div>

            {/* Current Sessions */}
            {currentSessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Degustações em Andamento</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentSessions.map((session) => (
                    <Card key={session.id} className="border-amber-200 bg-amber-50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{session.cigarName}</CardTitle>
                            <CardDescription>{session.cigarBrand}</CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Em andamento</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            Iniciado: {new Date(session.startTime).toLocaleString("pt-BR")}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Wine className="h-4 w-4 mr-2" />
                            Duração: {formatDuration(session.startTime)}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => finishTasting(session)} className="flex-1">
                              <Square className="h-4 w-4 mr-2" />
                              Finalizar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => cancelTasting(session.id)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Start New Tasting */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Iniciar Nova Degustação</h2>
                <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Degustação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Selecionar Charuto</DialogTitle>
                      <DialogDescription>
                        Escolha um charuto do seu estoque para iniciar a degustação.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {availableCigars.length > 0 ? (
                        <div className="grid gap-3 max-h-96 overflow-y-auto">
                          {availableCigars.map((cigar) => (
                            <div
                              key={cigar.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => startTasting(cigar)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{cigar.name}</h4>
                                  <p className="text-sm text-gray-600">{cigar.brand}</p>
                                  <p className="text-xs text-gray-500">
                                    {cigar.origin} • {cigar.size} • Força {cigar.strength}/5
                                  </p>
                                </div>
                                <Badge variant="outline">{cigar.quantity} disponível</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Wine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            Nenhum charuto disponível no estoque. Adicione charutos primeiro.
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Recent Completed Sessions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Degustações Recentes</h2>
              {completedSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedSessions
                    .slice(-6)
                    .reverse()
                    .map((session) => (
                      <Card key={session.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{session.cigarName}</CardTitle>
                              <CardDescription>{session.cigarBrand}</CardDescription>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="font-medium">{session.rating}/5</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Data:</span>
                              <span>{new Date(session.startTime).toLocaleDateString("pt-BR")}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Duração:</span>
                              <span>{session.duration} min</span>
                            </div>
                            {session.flavors && session.flavors.length > 0 && (
                              <div>
                                <span className="text-sm text-gray-600">Sabores:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {session.flavors.slice(0, 3).map((flavor) => (
                                    <Badge key={flavor} variant="secondary" className="text-xs">
                                      {flavor}
                                    </Badge>
                                  ))}
                                  {session.flavors.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{session.flavors.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {session.notes && (
                              <div>
                                <span className="text-sm text-gray-600">Notas:</span>
                                <p className="text-sm mt-1 text-gray-800 line-clamp-2">{session.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma degustação realizada</h3>
                  <p className="text-gray-600 mb-4">
                    Inicie sua primeira degustação para começar a registrar suas experiências.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Finish Tasting Dialog */}
        <Dialog open={!!finishingSession} onOpenChange={() => setFinishingSession(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Finalizar Degustação</DialogTitle>
              <DialogDescription>Avalie sua experiência com {finishingSession?.cigarName}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFinishSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Avaliação Geral</Label>
                  <Select
                    value={finishFormData.rating.toString()}
                    onValueChange={(value) => setFinishFormData({ ...finishFormData, rating: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muito Ruim</SelectItem>
                      <SelectItem value="2">2 - Ruim</SelectItem>
                      <SelectItem value="3">3 - Regular</SelectItem>
                      <SelectItem value="4">4 - Bom</SelectItem>
                      <SelectItem value="5">5 - Excelente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Qualidade da Queima</Label>
                  <Select
                    value={finishFormData.burnQuality.toString()}
                    onValueChange={(value) =>
                      setFinishFormData({ ...finishFormData, burnQuality: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muito Ruim</SelectItem>
                      <SelectItem value="2">2 - Ruim</SelectItem>
                      <SelectItem value="3">3 - Regular</SelectItem>
                      <SelectItem value="4">4 - Boa</SelectItem>
                      <SelectItem value="5">5 - Excelente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Qualidade do Tiragem</Label>
                  <Select
                    value={finishFormData.drawQuality.toString()}
                    onValueChange={(value) =>
                      setFinishFormData({ ...finishFormData, drawQuality: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muito Ruim</SelectItem>
                      <SelectItem value="2">2 - Ruim</SelectItem>
                      <SelectItem value="3">3 - Regular</SelectItem>
                      <SelectItem value="4">4 - Boa</SelectItem>
                      <SelectItem value="5">5 - Excelente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sabores Identificados</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {flavorOptions.map((flavor) => (
                    <div key={flavor} className="flex items-center space-x-2">
                      <Checkbox
                        id={flavor}
                        checked={finishFormData.flavors.includes(flavor)}
                        onCheckedChange={() => toggleFlavor(flavor)}
                      />
                      <Label htmlFor={flavor} className="text-sm">
                        {flavor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Ambiente</Label>
                  <Input
                    id="environment"
                    value={finishFormData.environment}
                    onChange={(e) => setFinishFormData({ ...finishFormData, environment: e.target.value })}
                    placeholder="ex: Terraço, Escritório, Clube"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pairing">Harmonização</Label>
                  <Input
                    id="pairing"
                    value={finishFormData.pairing}
                    onChange={(e) => setFinishFormData({ ...finishFormData, pairing: e.target.value })}
                    placeholder="ex: Whisky, Café, Vinho"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={finishFormData.notes}
                  onChange={(e) => setFinishFormData({ ...finishFormData, notes: e.target.value })}
                  placeholder="Descreva sua experiência, impressões e detalhes da degustação..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setFinishingSession(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Finalizar Degustação</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}

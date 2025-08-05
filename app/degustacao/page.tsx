"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Clock, Wine } from "lucide-react"
import { StartTastingModal } from "@/components/start-tasting-modal"
import { FinishTastingModal } from "@/components/finish-tasting-modal"
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

interface CurrentTasting {
  id: string
  cigarId: string
  cigarName: string
  cigarBrand: string
  startTime: string
}

export default function DegustacaoPage() {
  const [cigars, setCigars] = useState<Cigar[]>([])
  const [currentTastings, setCurrentTastings] = useState<CurrentTasting[]>([])
  const [isStartModalOpen, setIsStartModalOpen] = useState(false)
  const [finishingTasting, setFinishingTasting] = useState<CurrentTasting | null>(null)

  useEffect(() => {
    const storedCigars = localStorage.getItem("cigars")
    const storedCurrentTastings = localStorage.getItem("currentTastings")

    if (storedCigars) {
      setCigars(JSON.parse(storedCigars))
    }

    if (storedCurrentTastings) {
      setCurrentTastings(JSON.parse(storedCurrentTastings))
    }
  }, [])

  const handleStartTasting = (cigarId: string) => {
    const cigar = cigars.find((c) => c.id === cigarId)
    if (!cigar) return

    const newTasting: CurrentTasting = {
      id: Date.now().toString(),
      cigarId: cigar.id,
      cigarName: cigar.name,
      cigarBrand: cigar.brand,
      startTime: new Date().toISOString(),
    }

    const updatedTastings = [...currentTastings, newTasting]
    setCurrentTastings(updatedTastings)
    localStorage.setItem("currentTastings", JSON.stringify(updatedTastings))
  }

  const handleFinishTasting = (tastingId: string, tastingData: any) => {
    // Remover da lista de degustações atuais
    const updatedCurrentTastings = currentTastings.filter((t) => t.id !== tastingId)
    setCurrentTastings(updatedCurrentTastings)
    localStorage.setItem("currentTastings", JSON.stringify(updatedCurrentTastings))

    // Adicionar ao histórico
    const existingHistory = JSON.parse(localStorage.getItem("tastingHistory") || "[]")
    const newHistoryEntry = {
      id: Date.now().toString(),
      ...tastingData,
      date: new Date().toISOString(),
    }
    const updatedHistory = [...existingHistory, newHistoryEntry]
    localStorage.setItem("tastingHistory", JSON.stringify(updatedHistory))

    setFinishingTasting(null)
  }

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`
    } else {
      const hours = Math.floor(diffInMinutes / 60)
      const minutes = diffInMinutes % 60
      return `${hours}h ${minutes}min`
    }
  }

  const availableCigars = cigars.filter(
    (cigar) => cigar.quantity > 0 && !currentTastings.some((tasting) => tasting.cigarId === cigar.id),
  )

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Degustação</h1>
            <p className="text-gray-600">Acompanhe suas degustações em tempo real</p>
          </div>
          <Button
            onClick={() => setIsStartModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
            disabled={availableCigars.length === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            Iniciar Degustação
          </Button>
        </div>

        {/* Degustações em Andamento */}
        {currentTastings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Em Degustação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTastings.map((tasting) => (
                <Card key={tasting.id} className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{tasting.cigarName}</CardTitle>
                        <CardDescription>{tasting.cigarBrand}</CardDescription>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Iniciado:</span>
                        <span className="text-sm font-medium">
                          {new Date(tasting.startTime).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duração:</span>
                        <span className="text-sm font-medium text-orange-600">{formatDuration(tasting.startTime)}</span>
                      </div>
                      <Button
                        onClick={() => setFinishingTasting(tasting)}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Finalizar Degustação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Charutos Disponíveis */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Charutos Disponíveis</h2>
          {availableCigars.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wine className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {cigars.length === 0
                    ? "Nenhum charuto no estoque"
                    : "Todos os charutos estão em degustação ou sem estoque"}
                </h3>
                <p className="text-gray-600 text-center">
                  {cigars.length === 0
                    ? "Adicione charutos ao seu estoque para começar a degustar."
                    : "Finalize as degustações em andamento ou adicione mais charutos ao estoque."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCigars.map((cigar) => (
                <Card key={cigar.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{cigar.name}</CardTitle>
                    <CardDescription>{cigar.brand}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Origem:</span>
                        <span className="text-sm font-medium">{cigar.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tamanho:</span>
                        <span className="text-sm font-medium">{cigar.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Força:</span>
                        <Badge variant="outline">{cigar.strength}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Disponível:</span>
                        <span className="text-sm font-medium">{cigar.quantity} unidades</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartTasting(cigar.id)}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Degustação
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <StartTastingModal
          isOpen={isStartModalOpen}
          onClose={() => setIsStartModalOpen(false)}
          cigars={availableCigars}
          onStart={handleStartTasting}
        />

        {finishingTasting && (
          <FinishTastingModal
            isOpen={true}
            onClose={() => setFinishingTasting(null)}
            tasting={finishingTasting}
            onFinish={handleFinishTasting}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}

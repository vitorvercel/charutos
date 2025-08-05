"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Play, Star, Flame, Plus } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalCharutos: 0,
    totalDegustacoes: 0,
    avaliacaoMedia: "0.0",
    charuteFavorito: "Nenhum",
  })
  const [recommendedCigars, setRecommendedCigars] = useState<any[]>([])

  const flavors = ["Tabaco", "Pimenta", "Terroso", "Flores", "Café", "Frutas", "Chocolate", "Castanhas", "Madeira"]

  useEffect(() => {
    // Carregar estatísticas do localStorage
    const estoque = JSON.parse(localStorage.getItem("charutos-estoque") || "[]")
    const historico = JSON.parse(localStorage.getItem("charutos-historico") || "[]")

    const totalCharutos = estoque.reduce((acc: number, c: any) => acc + c.quantidade, 0)
    const totalDegustacoes = historico.length
    const avaliacaoMedia =
      historico.length > 0
        ? (historico.reduce((acc: number, h: any) => acc + h.avaliacao, 0) / historico.length).toFixed(1)
        : "0.0"

    // Encontrar charuto favorito (mais bem avaliado)
    let charuteFavorito = "Nenhum"
    if (historico.length > 0) {
      const melhorAvaliado = historico.reduce((prev: any, current: any) =>
        prev.avaliacao > current.avaliacao ? prev : current,
      )
      charuteFavorito = melhorAvaliado.nome
    }

    setStats({
      totalCharutos,
      totalDegustacoes,
      avaliacaoMedia,
      charuteFavorito,
    })
  }, [])

  useEffect(() => {
    // Sistema de recomendação baseado nos sabores selecionados e histórico
    if (selectedFlavors.length > 0) {
      const historico = JSON.parse(localStorage.getItem("charutos-historico") || "[]")
      const estoque = JSON.parse(localStorage.getItem("charutos-estoque") || "[]")

      // Filtrar charutos do histórico que têm sabores similares aos selecionados
      const charutosComSaboresSimilares = historico.filter(
        (h: any) => h.sabores && h.sabores.some((sabor: string) => selectedFlavors.includes(sabor)),
      )

      // Recomendar charutos do estoque baseado nos sabores preferidos
      const recomendacoes = estoque
        .filter((c: any) => c.quantidade > 0)
        .map((c: any) => {
          // Calcular score baseado no histórico de sabores similares
          const score = charutosComSaboresSimilares.filter((h: any) => h.nome === c.nome || h.marca === c.marca).length

          // Encontrar sabores correspondentes no histórico
          const saboresCorrespondentes = new Set<string>()
          charutosComSaboresSimilares.forEach((h: any) => {
            if (h.nome === c.nome || h.marca === c.marca) {
              h.sabores?.forEach((sabor: string) => {
                if (selectedFlavors.includes(sabor)) {
                  saboresCorrespondentes.add(sabor)
                }
              })
            }
          })

          return {
            ...c,
            score,
            saboresCorrespondentes: Array.from(saboresCorrespondentes),
          }
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 4)

      setRecommendedCigars(recomendacoes)
    } else {
      setRecommendedCigars([])
    }
  }, [selectedFlavors])

  const toggleFlavor = (flavor: string) => {
    setSelectedFlavors((prev) => (prev.includes(flavor) ? prev.filter((f) => f !== flavor) : [...prev, flavor]))
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas degustações</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Charutos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCharutos}</p>
                  <p className="text-xs text-gray-500">Charutos no estoque</p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Degustações</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalDegustacoes}</p>
                  <p className="text-xs text-gray-500">Total realizadas</p>
                </div>
                <Play className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média de Notas</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.avaliacaoMedia}</p>
                  <p className="text-xs text-gray-500">Avaliação média</p>
                </div>
                <Star className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Charuto Favorito</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.charuteFavorito}</p>
                  <p className="text-xs text-gray-500">Melhor avaliado</p>
                </div>
                <Flame className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            <Card className="bg-white border-0 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Bem-vindo ao Momentos Charutos</CardTitle>
                <CardDescription className="text-gray-600">
                  Seu aplicativo para gerenciar e avaliar degustações de charutos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push("/estoque")}
                    className="flex items-center w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Package className="w-5 h-5 text-orange-500 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Gerencie seu Estoque</p>
                      <p className="text-sm text-gray-500">Adicione e organize seus charutos</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/degustacao")}
                    className="flex items-center w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Play className="w-5 h-5 text-orange-500 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Avalie Degustações</p>
                      <p className="text-sm text-gray-500">Registre suas experiências detalhadamente</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/historico")}
                    className="flex items-center w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Star className="w-5 h-5 text-orange-500 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Acompanhe o Histórico</p>
                      <p className="text-sm text-gray-500">Revise suas avaliações anteriores</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => router.push("/estoque")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar ao Estoque
                  </Button>
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => router.push("/degustacao")}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Degustação
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div>
            <Card className="bg-white border-0 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Sistema de Recomendação</CardTitle>
                <CardDescription className="text-gray-600">
                  Selecione sabores para ver recomendações baseadas no seu histórico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Sabores Desejados</p>
                  <div className="grid grid-cols-3 gap-2">
                    {flavors.map((flavor) => (
                      <button
                        key={flavor}
                        onClick={() => toggleFlavor(flavor)}
                        className={`p-2 text-xs rounded-md border transition-colors ${
                          selectedFlavors.includes(flavor)
                            ? "bg-orange-100 border-orange-300 text-orange-800"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedFlavors.length > 0 ? (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-medium text-gray-700">Recomendações ({recommendedCigars.length})</p>
                    </div>

                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {recommendedCigars.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Nenhuma recomendação encontrada para os sabores selecionados
                        </p>
                      ) : (
                        recommendedCigars.map((cigar, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-md border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{cigar.nome}</p>
                                <p className="text-xs text-gray-500">{cigar.marca}</p>
                              </div>
                              <Badge variant="secondary">{cigar.quantidade} disponível</Badge>
                            </div>

                            {cigar.saboresCorrespondentes && cigar.saboresCorrespondentes.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-600 mb-1">Sabores correspondentes:</p>
                                <div className="flex flex-wrap gap-1">
                                  {cigar.saboresCorrespondentes.map((sabor: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      className="text-xs bg-orange-100 text-orange-800 border-orange-200"
                                    >
                                      {sabor}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      Selecione sabores acima para ver recomendações personalizadas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

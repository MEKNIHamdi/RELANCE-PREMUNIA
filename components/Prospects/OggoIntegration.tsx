"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ExternalLink,
  Search,
  Shield,
  Heart,
  Eye,
  Stethoscope,
  Home,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"
import type { Prospect } from "@/lib/supabase/types"

interface OggoIntegrationProps {
  prospect: Prospect
  onRecommendationSelect?: (recommendation: any) => void
}

export function OggoIntegration({ prospect, onRecommendationSelect }: OggoIntegrationProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    // Simulation du chargement des recommandations Oggo
    const timer = setTimeout(() => {
      setRecommendations([
        {
          id: 1,
          provider: "Harmonie Mutuelle",
          plan: "Senior Confort+",
          monthly_premium: prospect.budget_monthly * 0.95,
          coverage: {
            hospitalization: 200,
            optical: 400,
            dental: 300,
            consultation: 25,
          },
          score: 95,
          advantages: ["Réseau de soins étendu", "Tiers payant généralisé", "Assistance 24h/7j"],
        },
        {
          id: 2,
          provider: "MGEN",
          plan: "Senior Essentiel",
          monthly_premium: prospect.budget_monthly * 0.88,
          coverage: {
            hospitalization: 150,
            optical: 350,
            dental: 250,
            consultation: 23,
          },
          score: 88,
          advantages: ["Tarifs préférentiels seniors", "Prévention santé incluse", "Remboursement rapide"],
        },
        {
          id: 3,
          provider: "Malakoff Humanis",
          plan: "Senior Premium",
          monthly_premium: prospect.budget_monthly * 1.05,
          coverage: {
            hospitalization: 250,
            optical: 500,
            dental: 400,
            consultation: 30,
          },
          score: 92,
          advantages: ["Garanties renforcées", "Médecine douce couverte", "Coaching santé personnalisé"],
        },
      ])
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [prospect])

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100"
    if (score >= 80) return "text-blue-600 bg-blue-100"
    return "text-orange-600 bg-orange-100"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Profil du prospect */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Profil Mutuelle - {prospect.first_name} {prospect.last_name}
          </CardTitle>
          <CardDescription>Critères de recherche personnalisés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Âge</p>
              <p className="text-lg font-bold">{prospect.age} ans</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="w-6 h-6 text-green-500 mx-auto mb-2">€</div>
              <p className="text-sm font-medium">Budget</p>
              <p className="text-lg font-bold">{prospect.budget_monthly}€/mois</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <Stethoscope className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Santé</p>
              <p className="text-sm font-bold capitalize">{prospect.health_status}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <AlertCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Urgence</p>
              <p className="text-sm font-bold capitalize">{prospect.urgency_level}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intégration Oggo Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-indigo-600" />
            Comparateur Oggo Data - Recommandations Personnalisées
          </CardTitle>
          <CardDescription>Meilleures offres mutuelle santé adaptées au profil senior</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Recherche en cours...</h4>
              <p className="text-slate-600 text-sm max-w-md mx-auto mb-4">
                Analyse des meilleures offres mutuelle santé selon les critères de {prospect.first_name}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <Card
                  key={rec.id}
                  className={`border-2 ${index === 0 ? "border-green-200 bg-green-50" : "border-slate-200"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {index === 0 && (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Recommandé
                          </Badge>
                        )}
                        <div>
                          <h4 className="font-bold text-lg text-slate-900">{rec.provider}</h4>
                          <p className="text-slate-600">{rec.plan}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(rec.score)}`}
                        >
                          Score: {rec.score}/100
                        </div>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(rec.monthly_premium)}/mois
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded border">
                        <Home className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Hospitalisation</p>
                        <p className="font-bold">{rec.coverage.hospitalization}%</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <Eye className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Optique</p>
                        <p className="font-bold">{formatCurrency(rec.coverage.optical)}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="w-5 h-5 text-green-500 mx-auto mb-1">🦷</div>
                        <p className="text-xs text-slate-600">Dentaire</p>
                        <p className="font-bold">{formatCurrency(rec.coverage.dental)}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <Stethoscope className="w-5 h-5 text-red-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Consultation</p>
                        <p className="font-bold">{formatCurrency(rec.coverage.consultation)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-semibold text-slate-900 mb-2">Avantages clés :</h5>
                      <ul className="space-y-1">
                        {rec.advantages.map((advantage: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant={index === 0 ? "default" : "outline"}
                        onClick={() => onRecommendationSelect?.(rec)}
                      >
                        {index === 0 ? "Choisir cette offre" : "Sélectionner"}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Info className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions recommandées */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Prochaines étapes recommandées :</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Présenter les 2-3 meilleures offres à {prospect.first_name}</li>
            <li>• Mettre l'accent sur les garanties hospitalisation et optique (priorités seniors)</li>
            <li>• Proposer un rendez-vous téléphonique pour finaliser le choix</li>
            <li>• Préparer les documents de souscription personnalisés</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}

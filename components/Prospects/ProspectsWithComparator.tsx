"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useProspects, useAuth } from "@/hooks/useSupabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Euro,
  User,
  Heart,
  Target,
  ExternalLink,
} from "lucide-react"
import type { Prospect } from "@/lib/supabase/types"

export function ProspectsWithComparator() {
  const { user } = useAuth()
  const { prospects, loading, createProspect, updateProspect } = useProspects(
    user?.role === "commercial" ? user.id : undefined,
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSegment, setSelectedSegment] = useState<string>("all")
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [showNewProspectDialog, setShowNewProspectDialog] = useState(false)
  const [showComparator, setShowComparator] = useState(false)

  const filteredProspects = prospects.filter((prospect) => {
    const matchesSearch =
      prospect.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSegment = selectedSegment === "all" || prospect.segment === selectedSegment

    return matchesSearch && matchesSegment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "qualified":
        return "bg-purple-100 text-purple-800"
      case "proposal":
        return "bg-orange-100 text-orange-800"
      case "closed_won":
        return "bg-green-100 text-green-800"
      case "closed_lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Nouveau"
      case "contacted":
        return "Contacté"
      case "qualified":
        return "Qualifié"
      case "proposal":
        return "Proposition"
      case "closed_won":
        return "Gagné"
      case "closed_lost":
        return "Perdu"
      default:
        return status
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Composant Oggo Data Comparator
  const OggoComparator = ({ prospect }: { prospect: Prospect }) => {
    useEffect(() => {
      // Injection du script Oggo Data
      const script = document.createElement("script")
      script.src = "https://cks.oggo-data.net/icomparator/health.js"
      script.async = true
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }, [])

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Profil Prospect</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Âge:</span>
              <span className="ml-2 font-medium">{prospect.age} ans</span>
            </div>
            <div>
              <span className="text-slate-600">Budget:</span>
              <span className="ml-2 font-medium">{prospect.budget_monthly}€/mois</span>
            </div>
            <div>
              <span className="text-slate-600">État de santé:</span>
              <Badge variant="outline" className="ml-2">
                {prospect.health_status === "excellent"
                  ? "Excellent"
                  : prospect.health_status === "good"
                    ? "Bon"
                    : prospect.health_status === "average"
                      ? "Moyen"
                      : "Fragile"}
              </Badge>
            </div>
            <div>
              <span className="text-slate-600">Urgence:</span>
              <Badge variant="outline" className="ml-2">
                {prospect.urgency_level === "high"
                  ? "Élevée"
                  : prospect.urgency_level === "medium"
                    ? "Moyenne"
                    : "Faible"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Intégration Oggo Data */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              <h3 className="font-semibold">Comparateur Oggo Data - Mutuelle Santé Seniors</h3>
            </div>
            <p className="text-sm opacity-90 mt-1">
              Comparaison personnalisée pour {prospect.first_name} {prospect.last_name}
            </p>
          </div>

          <div
            id="oggodata-icomparator-health"
            style={{ width: "100%", height: "600px", backgroundColor: "#f8fafc" }}
            className="flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Comparateur Oggo Data</h4>
                <p className="text-slate-600 text-sm max-w-md">
                  Le comparateur s'initialise avec les critères du prospect sélectionné. Recherche en cours des
                  meilleures offres mutuelle santé seniors...
                </p>
              </div>
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
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Actions Recommandées</h4>
          </div>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Présenter les 3 meilleures offres adaptées à son profil senior</li>
            <li>• Mettre l'accent sur les garanties hospitalisation et optique</li>
            <li>• Proposer un rendez-vous pour finaliser le devis personnalisé</li>
          </ul>
        </div>
      </div>
    )
  }

  const NewProspectForm = () => {
    const [formData, setFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      age: "",
      budget_monthly: "",
      health_status: "good" as const,
      urgency_level: "medium" as const,
      source: "",
      notes: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      // Calcul automatique du score et segment
      const age = Number.parseInt(formData.age)
      const budget = Number.parseInt(formData.budget_monthly)

      let score = 50 // Score de base

      // Scoring basé sur l'âge (seniors)
      if (age >= 60 && age <= 75) score += 20
      else if (age > 75) score += 15

      // Scoring basé sur le budget
      if (budget >= 100) score += 15
      else if (budget >= 50) score += 10

      // Scoring basé sur l'état de santé
      if (formData.health_status === "excellent") score += 15
      else if (formData.health_status === "good") score += 10
      else if (formData.health_status === "average") score += 5

      // Scoring basé sur l'urgence
      if (formData.urgency_level === "high") score += 10
      else if (formData.urgency_level === "medium") score += 5

      // Détermination du segment
      const segment = budget >= 80 && age >= 60 ? "senior_premium" : "senior_standard"

      try {
        await createProspect({
          ...formData,
          age: Number.parseInt(formData.age),
          budget_monthly: Number.parseInt(formData.budget_monthly),
          score: Math.min(score, 100),
          segment,
          status: "new",
          assigned_to: user?.id || "",
        })
        setShowNewProspectDialog(false)
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          age: "",
          budget_monthly: "",
          health_status: "good",
          urgency_level: "medium",
          source: "",
          notes: "",
        })
      } catch (error) {
        console.error("Erreur lors de la création du prospect:", error)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Prénom</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Nom</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age">Âge</Label>
            <Input
              id="age"
              type="number"
              min="50"
              max="90"
              value={formData.age}
              onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="budget_monthly">Budget mensuel (€)</Label>
            <Input
              id="budget_monthly"
              type="number"
              min="30"
              max="300"
              value={formData.budget_monthly}
              onChange={(e) => setFormData((prev) => ({ ...prev, budget_monthly: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="health_status">État de santé</Label>
            <Select
              value={formData.health_status}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, health_status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Bon</SelectItem>
                <SelectItem value="average">Moyen</SelectItem>
                <SelectItem value="poor">Fragile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="urgency_level">Niveau d'urgence</Label>
            <Select
              value={formData.urgency_level}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, urgency_level: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={formData.source}
            onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
            placeholder="Site web, recommandation, publicité..."
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Informations complémentaires..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowNewProspectDialog(false)}>
            Annuler
          </Button>
          <Button type="submit">Créer le prospect</Button>
        </div>
      </form>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gestion des Prospects Seniors
          </h1>
          <p className="text-slate-600 mt-1">{filteredProspects.length} prospects • Spécialisé mutuelle santé 60+</p>
        </div>
        <Dialog open={showNewProspectDialog} onOpenChange={setShowNewProspectDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Prospect
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau Prospect Senior</DialogTitle>
              <DialogDescription>Ajoutez un nouveau prospect spécialisé mutuelle santé seniors</DialogDescription>
            </DialogHeader>
            <NewProspectForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un prospect..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSegment} onValueChange={setSelectedSegment}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les segments</SelectItem>
            <SelectItem value="senior_premium">Senior Premium</SelectItem>
            <SelectItem value="senior_standard">Senior Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prospects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProspects.map((prospect) => (
          <Card key={prospect.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                      {prospect.first_name[0]}
                      {prospect.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {prospect.first_name} {prospect.last_name}
                    </h3>
                    <p className="text-sm text-slate-600">{prospect.age} ans</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${getScoreColor(prospect.score)}`}>
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">{prospect.score}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(prospect.status)}>{getStatusLabel(prospect.status)}</Badge>
                  <Badge
                    variant="outline"
                    className={
                      prospect.segment === "senior_premium"
                        ? "border-purple-200 text-purple-700 bg-purple-50"
                        : "border-blue-200 text-blue-700 bg-blue-50"
                    }
                  >
                    {prospect.segment === "senior_premium" ? "Premium" : "Standard"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Euro className="w-3 h-3" />
                    <span>{prospect.budget_monthly}€/mois</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Heart className="w-3 h-3" />
                    <span className="capitalize">{prospect.health_status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{prospect.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-3 h-3" />
                  <span>{prospect.phone}</span>
                </div>

                {prospect.urgency_level === "high" && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-3 h-3" />
                    <span>Urgence élevée</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedProspect(prospect)}>
                    <User className="w-3 h-3 mr-1" />
                    Détails
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    onClick={() => {
                      setSelectedProspect(prospect)
                      setShowComparator(true)
                    }}
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Comparer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProspects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun prospect trouvé</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || selectedSegment !== "all"
                ? "Aucun prospect ne correspond à vos critères de recherche."
                : "Commencez par ajouter votre premier prospect senior."}
            </p>
            <Button onClick={() => setShowNewProspectDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un prospect
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Prospect Details Dialog */}
      <Dialog open={!!selectedProspect && !showComparator} onOpenChange={(open) => !open && setSelectedProspect(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProspect && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                      {selectedProspect.first_name[0]}
                      {selectedProspect.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {selectedProspect.first_name} {selectedProspect.last_name}
                  <Badge className={getStatusColor(selectedProspect.status)}>
                    {getStatusLabel(selectedProspect.status)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Prospect {selectedProspect.segment === "senior_premium" ? "Premium" : "Standard"} • Score:{" "}
                  {selectedProspect.score}/100
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="activity">Activité</TabsTrigger>
                  <TabsTrigger value="comparator">Comparateur</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informations Personnelles</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Prénom</Label>
                            <p className="font-medium">{selectedProspect.first_name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Nom</Label>
                            <p className="font-medium">{selectedProspect.last_name}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Email</Label>
                          <p className="font-medium">{selectedProspect.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Téléphone</Label>
                          <p className="font-medium">{selectedProspect.phone}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Âge</Label>
                          <p className="font-medium">{selectedProspect.age} ans</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Profil Mutuelle</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Budget mensuel</Label>
                          <p className="font-medium text-lg text-green-600">{selectedProspect.budget_monthly}€</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600">État de santé</Label>
                          <Badge variant="outline" className="mt-1">
                            {selectedProspect.health_status === "excellent"
                              ? "Excellent"
                              : selectedProspect.health_status === "good"
                                ? "Bon"
                                : selectedProspect.health_status === "average"
                                  ? "Moyen"
                                  : "Fragile"}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Niveau d'urgence</Label>
                          <Badge variant="outline" className="mt-1">
                            {selectedProspect.urgency_level === "high"
                              ? "Élevée"
                              : selectedProspect.urgency_level === "medium"
                                ? "Moyenne"
                                : "Faible"}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600">Segment</Label>
                          <Badge
                            className={
                              selectedProspect.segment === "senior_premium"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {selectedProspect.segment === "senior_premium" ? "Senior Premium" : "Senior Standard"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedProspect.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700">{selectedProspect.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Historique des Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Prospect créé</p>
                            <p className="text-sm text-slate-600">
                              {new Date(selectedProspect.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Score calculé: {selectedProspect.score}/100</p>
                            <p className="text-sm text-slate-600">
                              Qualification automatique basée sur le profil senior
                            </p>
                          </div>
                        </div>

                        <div className="text-center py-8 text-slate-500">
                          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Prochaines actions à planifier</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comparator">
                  <OggoComparator prospect={selectedProspect} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparator Dialog */}
      <Dialog open={showComparator} onOpenChange={setShowComparator}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedProspect && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Search className="w-6 h-6 text-blue-600" />
                  Comparateur Oggo Data - {selectedProspect.first_name} {selectedProspect.last_name}
                </DialogTitle>
                <DialogDescription>Comparaison personnalisée des offres mutuelle santé seniors</DialogDescription>
              </DialogHeader>
              <OggoComparator prospect={selectedProspect} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

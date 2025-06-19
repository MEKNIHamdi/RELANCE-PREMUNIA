"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Mail,
  Plus,
  Play,
  Pause,
  Settings,
  Eye,
  MousePointer,
  UserCheck,
  TrendingUp,
  Target,
  Send,
  Calendar,
  BarChart3,
  Zap,
  Heart,
  Shield,
  Award,
  Phone,
} from "lucide-react"

const campaignTemplates = [
  {
    id: "welcome_senior",
    name: "Bienvenue Senior",
    description: "Séquence d'accueil pour nouveaux prospects 60+",
    type: "email",
    target: "senior_premium",
    steps: 3,
    duration: "7 jours",
    conversion_rate: 12.5,
  },
  {
    id: "health_reminder",
    name: "Rappel Santé",
    description: "Relance pour prospects avec besoins santé urgents",
    type: "email",
    target: "all",
    steps: 2,
    duration: "3 jours",
    conversion_rate: 18.3,
  },
  {
    id: "premium_offer",
    name: "Offre Premium",
    description: "Campagne dédiée aux seniors à budget élevé",
    type: "email",
    target: "senior_premium",
    steps: 4,
    duration: "14 jours",
    conversion_rate: 22.1,
  },
  {
    id: "sms_urgent",
    name: "SMS Urgence",
    description: "Relance SMS pour prospects urgents",
    type: "sms",
    target: "all",
    steps: 1,
    duration: "1 jour",
    conversion_rate: 8.7,
  },
]

const campaignPerformanceData = [
  { month: "Jan", sent: 1200, opened: 840, clicked: 294, converted: 89 },
  { month: "Fév", sent: 1450, opened: 1015, clicked: 365, converted: 112 },
  { month: "Mar", sent: 1320, opened: 924, clicked: 317, converted: 95 },
  { month: "Avr", sent: 1680, opened: 1176, clicked: 428, converted: 134 },
  { month: "Mai", sent: 1550, opened: 1085, clicked: 389, converted: 118 },
  { month: "Jun", sent: 1780, opened: 1246, clicked: 467, converted: 156 },
]

const activeCampaigns = [
  {
    id: "1",
    name: "Campagne Été Seniors",
    type: "email",
    status: "active",
    target_segment: "senior_premium",
    sent_count: 850,
    open_rate: 68.5,
    click_rate: 24.3,
    conversion_rate: 12.8,
    created_at: "2024-06-01",
    next_send: "2024-06-25",
  },
  {
    id: "2",
    name: "Relance Devis Mutuelle",
    type: "email",
    status: "active",
    target_segment: "all",
    sent_count: 420,
    open_rate: 72.1,
    click_rate: 28.6,
    conversion_rate: 15.2,
    created_at: "2024-06-10",
    next_send: "2024-06-26",
  },
  {
    id: "3",
    name: "SMS Rappel Urgent",
    type: "sms",
    status: "paused",
    target_segment: "senior_standard",
    sent_count: 180,
    open_rate: 95.0,
    click_rate: 18.9,
    conversion_rate: 8.3,
    created_at: "2024-06-15",
    next_send: null,
  },
]

export function AutomationEngine() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active"
      case "paused":
        return "En pause"
      case "completed":
        return "Terminée"
      case "draft":
        return "Brouillon"
      default:
        return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail
      case "sms":
        return Phone
      default:
        return Mail
    }
  }

  const NewCampaignForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      template_id: "",
      target_segment: "all",
      send_time: "09:00",
      description: "",
    })

    const selectedTemplateData = campaignTemplates.find((t) => t.id === formData.template_id)

    return (
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Nom de la campagne</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Campagne Automne Seniors 2024"
          />
        </div>

        <div>
          <Label htmlFor="template">Template de campagne</Label>
          <Select
            value={formData.template_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, template_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un template..." />
            </SelectTrigger>
            <SelectContent>
              {campaignTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    {template.type === "email" ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplateData && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">{selectedTemplateData.description}</p>
              <div className="flex items-center gap-4 text-xs text-blue-600">
                <span>• {selectedTemplateData.steps} étapes</span>
                <span>• Durée: {selectedTemplateData.duration}</span>
                <span>• Conversion: {selectedTemplateData.conversion_rate}%</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="target_segment">Segment cible</Label>
          <Select
            value={formData.target_segment}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, target_segment: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les segments</SelectItem>
              <SelectItem value="senior_premium">Senior Premium</SelectItem>
              <SelectItem value="senior_standard">Senior Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="send_time">Heure d'envoi</Label>
            <Input
              id="send_time"
              type="time"
              value={formData.send_time}
              onChange={(e) => setFormData((prev) => ({ ...prev, send_time: e.target.value }))}
            />
          </div>
          <div>
            <Label>Fréquence</Label>
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Quotidienne</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuelle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Objectifs et détails de la campagne..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowNewCampaignDialog(false)}>
            Annuler
          </Button>
          <Button onClick={() => setShowNewCampaignDialog(false)}>Créer la campagne</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Marketing Automation Seniors
          </h1>
          <p className="text-slate-600 mt-1">Campagnes spécialisées mutuelle santé 60+</p>
        </div>
        <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une Campagne Automation</DialogTitle>
              <DialogDescription>Configurez une nouvelle campagne marketing spécialisée seniors</DialogDescription>
            </DialogHeader>
            <NewCampaignForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Emails Envoyés</p>
                <p className="text-2xl font-bold text-blue-900">9,980</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15.2% ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Taux d'Ouverture</p>
                <p className="text-2xl font-bold text-green-900">69.8%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+3.1% ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Taux de Clic</p>
                <p className="text-2xl font-bold text-purple-900">26.4%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+1.8% ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Conversions</p>
                <p className="text-2xl font-bold text-orange-900">704</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.3% ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Performance des Campagnes
          </CardTitle>
          <CardDescription>Évolution mensuelle des métriques d'engagement seniors</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={campaignPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="sent" fill="#3B82F6" name="Envoyés" />
              <Bar dataKey="opened" fill="#10B981" name="Ouverts" />
              <Bar dataKey="clicked" fill="#8B5CF6" name="Cliqués" />
              <Bar dataKey="converted" fill="#F59E0B" name="Convertis" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Templates and Active Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaign Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Templates Spécialisés Seniors
            </CardTitle>
            <CardDescription>Modèles pré-configurés pour prospects 60+</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignTemplates.map((template) => {
                const TypeIcon = getTypeIcon(template.type)
                return (
                  <div
                    key={template.id}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{template.name}</h4>
                          <p className="text-sm text-slate-600">{template.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {template.conversion_rate}% conv.
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center gap-4">
                        <span>• {template.steps} étapes</span>
                        <span>• {template.duration}</span>
                        <Badge
                          variant="outline"
                          className={
                            template.target === "senior_premium"
                              ? "border-purple-200 text-purple-700 bg-purple-50"
                              : "border-blue-200 text-blue-700 bg-blue-50"
                          }
                        >
                          {template.target === "senior_premium"
                            ? "Premium"
                            : template.target === "senior_standard"
                              ? "Standard"
                              : "Tous"}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Utiliser
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Campagnes Actives
            </CardTitle>
            <CardDescription>Campagnes en cours d'exécution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => {
                const TypeIcon = getTypeIcon(campaign.type)
                return (
                  <div key={campaign.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                          <p className="text-sm text-slate-600">
                            {campaign.sent_count} envois • Créée le{" "}
                            {new Date(campaign.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(campaign.status)}>{getStatusLabel(campaign.status)}</Badge>
                        <Button size="sm" variant="ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Ouverture</p>
                        <p className="text-lg font-bold text-green-600">{campaign.open_rate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Clic</p>
                        <p className="text-lg font-bold text-blue-600">{campaign.click_rate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Conversion</p>
                        <p className="text-lg font-bold text-purple-600">{campaign.conversion_rate}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance globale</span>
                        <span className="font-medium">{campaign.conversion_rate}%</span>
                      </div>
                      <Progress value={campaign.conversion_rate} className="h-2" />
                    </div>

                    {campaign.next_send && (
                      <div className="mt-3 flex items-center gap-1 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>Prochain envoi: {new Date(campaign.next_send).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      {campaign.status === "active" ? (
                        <Button size="sm" variant="outline">
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Play className="w-3 h-3 mr-1" />
                          Reprendre
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Détails
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialized Senior Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Fonctionnalités Spécialisées Seniors
          </CardTitle>
          <CardDescription>Outils dédiés au marché de la mutuelle santé 60+</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Segmentation Santé</h3>
              <p className="text-sm text-blue-700 mb-4">
                Ciblage automatique basé sur l'âge, l'état de santé et les besoins spécifiques seniors
              </p>
              <Button size="sm" variant="outline" className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50">
                Configurer
              </Button>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Templates Seniors</h3>
              <p className="text-sm text-green-700 mb-4">
                Contenus adaptés au langage et aux préoccupations des seniors (hospitalisation, optique...)
              </p>
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-green-300 text-green-700 hover:bg-green-50"
              >
                Voir Templates
              </Button>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Analytics Seniors</h3>
              <p className="text-sm text-purple-700 mb-4">
                Métriques spécialisées : taux d'engagement par tranche d'âge, performance par pathologie
              </p>
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Analyser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

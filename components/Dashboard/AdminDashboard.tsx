"use client"

import { useAnalytics } from "@/hooks/useSupabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, Target, Euro, Mail, Eye, MousePointer, UserCheck, Clock, Award } from "lucide-react"

const revenueData = [
  { month: "Jan", revenue: 45000, prospects: 120 },
  { month: "Fév", revenue: 52000, prospects: 145 },
  { month: "Mar", revenue: 48000, prospects: 132 },
  { month: "Avr", revenue: 61000, prospects: 167 },
  { month: "Mai", revenue: 55000, prospects: 154 },
  { month: "Jun", revenue: 67000, prospects: 189 },
]

const segmentData = [
  { name: "Senior Premium", value: 65, color: "#3B82F6" },
  { name: "Senior Standard", value: 35, color: "#8B5CF6" },
]

const campaignData = [
  { name: "Email Seniors Premium", sent: 850, opened: 612, clicked: 234, converted: 67 },
  { name: "SMS Rappel Mutuelle", sent: 420, opened: 378, clicked: 156, converted: 43 },
  { name: "Relance Devis", sent: 320, opened: 245, clicked: 89, converted: 28 },
]

export function AdminDashboard() {
  const { analytics, loading } = useAnalytics()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard Administrateur
          </h1>
          <p className="text-slate-600 mt-1">Vue d'ensemble des performances Premunia CRM</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Temps réel
        </Badge>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(analytics.total_revenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5% ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Taux de Conversion</p>
                <p className="text-2xl font-bold text-green-900">{formatPercentage(analytics.conversion_rate)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.3% ce mois</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Prospects Actifs</p>
                <p className="text-2xl font-bold text-purple-900">{analytics.prospects_count}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+18 cette semaine</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(analytics.pipeline_value)}</p>
                <div className="flex items-center mt-1">
                  <Clock className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">En cours</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Évolution du Chiffre d'Affaires
            </CardTitle>
            <CardDescription>Performance mensuelle des ventes seniors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  formatter={(value: number) => [formatCurrency(value), "CA"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Segment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Répartition Segments Seniors
            </CardTitle>
            <CardDescription>Distribution des prospects par segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, "Part"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Automation Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            Performance Marketing Automation
          </CardTitle>
          <CardDescription>Résultats des campagnes spécialisées seniors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {campaignData.map((campaign, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                  <Badge variant="outline" className="bg-white">
                    {((campaign.converted / campaign.sent) * 100).toFixed(1)}% conversion
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-slate-600">Envoyés</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{campaign.sent}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-slate-600">Ouverts</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{campaign.opened}</p>
                    <p className="text-xs text-green-600">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MousePointer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-slate-600">Cliqués</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{campaign.clicked}</p>
                    <p className="text-xs text-orange-600">
                      {((campaign.clicked / campaign.opened) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <UserCheck className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-600">Convertis</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{campaign.converted}</p>
                    <p className="text-xs text-purple-600">
                      {((campaign.converted / campaign.clicked) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taux d'ouverture</span>
                    <span className="font-medium">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(campaign.opened / campaign.sent) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Nouveaux Prospects</h3>
                <p className="text-sm opacity-90">Ajouter des prospects seniors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Nouvelle Campagne</h3>
                <p className="text-sm opacity-90">Créer une campagne seniors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Rapport Détaillé</h3>
                <p className="text-sm opacity-90">Analyser les performances</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

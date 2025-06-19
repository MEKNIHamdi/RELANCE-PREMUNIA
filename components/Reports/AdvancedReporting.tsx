"use client"

import { useState } from "react"
import { useAnalytics, useAuth } from "@/hooks/useSupabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Line,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Euro,
  Target,
  Award,
  BarChart3,
  PieChartIcon,
  Activity,
} from "lucide-react"

const salesData = [
  { month: "Jan", ca: 45000, prospects: 120, conversions: 34, avg_age: 67 },
  { month: "Fév", ca: 52000, prospects: 145, conversions: 42, avg_age: 68 },
  { month: "Mar", ca: 48000, prospects: 132, conversions: 38, avg_age: 66 },
  { month: "Avr", ca: 61000, prospects: 167, conversions: 48, avg_age: 69 },
  { month: "Mai", ca: 55000, prospects: 154, conversions: 44, avg_age: 67 },
  { month: "Jun", ca: 67000, prospects: 189, conversions: 56, avg_age: 68 },
]

const ageSegmentData = [
  { segment: "60-65 ans", prospects: 145, ca: 89000, conversion: 18.5, color: "#3B82F6" },
  { segment: "66-70 ans", prospects: 234, ca: 156000, conversion: 22.1, color: "#10B981" },
  { segment: "71-75 ans", prospects: 189, ca: 134000, conversion: 19.8, color: "#8B5CF6" },
  { segment: "76+ ans", prospects: 98, ca: 67000, conversion: 15.2, color: "#F59E0B" },
]

const commercialPerformance = [
  { name: "Marie Dubois", prospects: 89, ca: 125000, conversion: 24.7, segment_focus: "Premium" },
  { name: "Jean Martin", prospects: 76, ca: 98000, conversion: 21.1, segment_focus: "Standard" },
  { name: "Sophie Laurent", prospects: 92, ca: 134000, conversion: 26.1, segment_focus: "Premium" },
  { name: "Pierre Moreau", prospects: 67, ca: 87000, conversion: 19.4, segment_focus: "Standard" },
  { name: "Claire Bernard", prospects: 84, ca: 112000, conversion: 22.6, segment_focus: "Premium" },
]

const healthStatusData = [
  { status: "Excellent", count: 156, percentage: 23.4, avg_premium: 89 },
  { status: "Bon", count: 298, percentage: 44.7, avg_premium: 76 },
  { status: "Moyen", count: 167, percentage: 25.0, avg_premium: 68 },
  { status: "Fragile", count: 46, percentage: 6.9, avg_premium: 95 },
]

export function AdvancedReporting() {
  const { user } = useAuth()
  const { analytics, loading } = useAnalytics(user?.role === "commercial" ? user.id : undefined)
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedSegment, setSelectedSegment] = useState("all")

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Rapports Avancés
          </h1>
          <p className="text-slate-600 mt-1">
            Analytics spécialisés mutuelle santé seniors
            {user?.role === "commercial" && " - Vue personnelle"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 mois</SelectItem>
              <SelectItem value="3months">3 mois</SelectItem>
              <SelectItem value="6months">6 mois</SelectItem>
              <SelectItem value="1year">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">CA Total</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(analytics.total_revenue)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+12.5%</span>
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
                  <p className="text-sm font-medium text-green-600">Conversion</p>
                  <p className="text-2xl font-bold text-green-900">{formatPercentage(analytics.conversion_rate)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+2.3%</span>
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
                  <p className="text-sm font-medium text-purple-600">Prospects</p>
                  <p className="text-2xl font-bold text-purple-900">{analytics.prospects_count}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+18</span>
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
                  <p className="text-sm font-medium text-orange-600">Ticket Moyen</p>
                  <p className="text-2xl font-bold text-orange-900">{formatCurrency(analytics.avg_deal_size)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8.7%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Segments
          </TabsTrigger>
          <TabsTrigger value="commercial" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Équipe
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Santé
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Sales Evolution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Évolution des Ventes Seniors
              </CardTitle>
              <CardDescription>Performance mensuelle CA, prospects et conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" />
                  <YAxis yAxisId="left" stroke="#64748B" />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748B" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "ca") return [formatCurrency(value), "CA"]
                      if (name === "avg_age") return [`${value} ans`, "Âge moyen"]
                      return [value, name]
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="ca" fill="#3B82F6" name="Chiffre d'Affaires" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversions"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Conversions"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avg_age"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Âge moyen"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparaison Mensuelle</CardTitle>
                <CardDescription>Évolution des métriques clés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">CA Juin vs Mai</p>
                      <p className="text-sm text-blue-600">67 000€ vs 55 000€</p>
                    </div>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="font-bold">+21.8%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Prospects Juin vs Mai</p>
                      <p className="text-sm text-green-600">189 vs 154</p>
                    </div>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="font-bold">+22.7%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-purple-900">Conversions Juin vs Mai</p>
                      <p className="text-sm text-purple-600">56 vs 44</p>
                    </div>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="font-bold">+27.3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Objectifs vs Réalisé</CardTitle>
                <CardDescription>Performance par rapport aux objectifs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CA Mensuel</span>
                      <span className="font-medium">67 000€ / 60 000€</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: "111.7%" }}></div>
                    </div>
                    <p className="text-xs text-green-600 mt-1">+11.7% au-dessus de l'objectif</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Prospects Mensuels</span>
                      <span className="font-medium">189 / 180</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: "105%" }}></div>
                    </div>
                    <p className="text-xs text-green-600 mt-1">+5% au-dessus de l'objectif</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Taux de Conversion</span>
                      <span className="font-medium">29.6% / 25%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: "118.4%" }}></div>
                    </div>
                    <p className="text-xs text-green-600 mt-1">+18.4% au-dessus de l'objectif</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          {/* Age Segments Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-purple-500" />
                  Répartition par Âge
                </CardTitle>
                <CardDescription>Distribution des prospects seniors par tranche d'âge</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ageSegmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="prospects"
                    >
                      {ageSegmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, "Prospects"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance par Segment</CardTitle>
                <CardDescription>Métriques détaillées par tranche d'âge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ageSegmentData.map((segment, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }}></div>
                          <h4 className="font-semibold">{segment.segment}</h4>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {formatPercentage(segment.conversion)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Prospects</p>
                          <p className="font-bold text-lg">{segment.prospects}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">CA</p>
                          <p className="font-bold text-lg">{formatCurrency(segment.ca)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-6">
          {/* Team Performance */}
          {user?.role !== "commercial" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Performance Équipe Commerciale
                </CardTitle>
                <CardDescription>Classement et métriques par commercial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commercialPerformance.map((commercial, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{commercial.name}</h4>
                            <Badge
                              variant="outline"
                              className={
                                commercial.segment_focus === "Premium"
                                  ? "border-purple-200 text-purple-700 bg-purple-50"
                                  : "border-blue-200 text-blue-700 bg-blue-50"
                              }
                            >
                              Focus {commercial.segment_focus}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(commercial.ca)}</p>
                          <p className="text-sm text-slate-600">{formatPercentage(commercial.conversion)} conversion</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-slate-600">Prospects</p>
                          <p className="text-lg font-bold">{commercial.prospects}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">CA</p>
                          <p className="text-lg font-bold">{formatCurrency(commercial.ca)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Conversion</p>
                          <p className="text-lg font-bold text-green-600">{formatPercentage(commercial.conversion)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {/* Health Status Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                Analyse par État de Santé
              </CardTitle>
              <CardDescription>Répartition des prospects selon leur état de santé</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {healthStatusData.map((status, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border">
                    <div className="text-center">
                      <h4 className="font-semibold text-slate-900 mb-2">{status.status}</h4>
                      <p className="text-3xl font-bold text-blue-600 mb-1">{status.count}</p>
                      <p className="text-sm text-slate-600 mb-3">{formatPercentage(status.percentage)} des prospects</p>
                      <div className="bg-white p-2 rounded border">
                        <p className="text-xs text-slate-600">Prime moyenne</p>
                        <p className="font-bold text-green-600">{status.avg_premium}€/mois</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

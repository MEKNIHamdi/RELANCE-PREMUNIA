"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Calendar, AlertTriangle, Target, Phone, Mail, Clock } from "lucide-react"
import { stats, objectives, type Profile, type CommercialObjective } from "@/lib/supabase"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface DashboardProps {
  user: Profile
}

interface DashboardStats {
  prospects_ce_mois: number
  clients_ce_mois: number
  rdv_a_venir: number
  taches_en_retard: number
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]

export function Dashboard({ user }: DashboardProps) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [currentObjective, setCurrentObjective] = useState<CommercialObjective | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commercialId = user.role === "commercial" ? user.id : undefined
        const [statsData, objectiveData] = await Promise.all([
          stats.getDashboardStats(commercialId),
          user.role === "commercial" ? objectives.getCurrentMonthObjective(user.id) : null,
        ])

        setDashboardStats(statsData)
        setCurrentObjective(objectiveData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Prospects ce mois",
      value: dashboardStats?.prospects_ce_mois || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Clients signés",
      value: dashboardStats?.clients_ce_mois || 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "RDV à venir",
      value: dashboardStats?.rdv_a_venir || 0,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Tâches en retard",
      value: dashboardStats?.taches_en_retard || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  const chartData = [
    { name: "Jan", prospects: 45, conversions: 8 },
    { name: "Fév", prospects: 52, conversions: 12 },
    { name: "Mar", prospects: 48, conversions: 9 },
    { name: "Avr", prospects: 61, conversions: 15 },
    { name: "Mai", prospects: 55, conversions: 11 },
    { name: "Juin", prospects: 67, conversions: 18 },
  ]

  const segmentData = [
    { name: "Senior Premium", value: 35, color: "#3B82F6" },
    { name: "Senior Standard", value: 65, color: "#10B981" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user.first_name} {user.last_name}
          </h1>
          <p className="text-gray-600">Voici un aperçu de votre activité</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
      </div>

      {/* Objectifs du mois (pour les commerciaux) */}
      {user.role === "commercial" && currentObjective && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Objectifs du mois - {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Chiffre d'affaires</span>
                  <span className="text-sm text-gray-500">
                    {((currentObjective.ca_realise / (currentObjective.objectif_ca || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={(currentObjective.ca_realise / (currentObjective.objectif_ca || 1)) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{currentObjective.ca_realise.toLocaleString("fr-FR")} €</span>
                  <span>{currentObjective.objectif_ca?.toLocaleString("fr-FR")} €</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prospects</span>
                  <span className="text-sm text-gray-500">
                    {((currentObjective.prospects_realises / (currentObjective.objectif_prospects || 1)) * 100).toFixed(
                      0,
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={(currentObjective.prospects_realises / (currentObjective.objectif_prospects || 1)) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{currentObjective.prospects_realises}</span>
                  <span>{currentObjective.objectif_prospects}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversions</span>
                  <span className="text-sm text-gray-500">
                    {(
                      (currentObjective.conversions_realisees / (currentObjective.objectif_conversions || 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                </div>
                <Progress
                  value={(currentObjective.conversions_realisees / (currentObjective.objectif_conversions || 1)) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{currentObjective.conversions_realisees}</span>
                  <span>{currentObjective.objectif_conversions}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">RDV</span>
                  <span className="text-sm text-gray-500">
                    {((currentObjective.rdv_realises / (currentObjective.objectif_rdv || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={(currentObjective.rdv_realises / (currentObjective.objectif_rdv || 1)) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{currentObjective.rdv_realises}</span>
                  <span>{currentObjective.objectif_rdv}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des prospects et conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>Prospects et conversions sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="prospects" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par segment */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par segment</CardTitle>
            <CardDescription>Distribution des prospects par segment senior</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activités récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Activités récentes</CardTitle>
          <CardDescription>Dernières actions effectuées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Appel avec Pierre Durand</p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
              <Badge variant="outline">Terminé</Badge>
            </div>

            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Email de bienvenue envoyé à Marie Leroy</p>
                <p className="text-xs text-gray-500">Il y a 4 heures</p>
              </div>
              <Badge variant="outline">Automatique</Badge>
            </div>

            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">RDV planifié avec Jacques Bernard</p>
                <p className="text-xs text-gray-500">Demain à 14h00</p>
              </div>
              <Badge variant="outline">Planifié</Badge>
            </div>

            <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
              <div className="p-2 bg-red-100 rounded-full">
                <Clock className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tâche en retard : Relance Françoise Petit</p>
                <p className="text-xs text-gray-500">Échéance dépassée de 1 jour</p>
              </div>
              <Badge variant="destructive">En retard</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

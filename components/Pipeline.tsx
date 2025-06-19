"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Plus, CheckCircle, AlertTriangle, Users, Phone, Video, MapPin, Building } from "lucide-react"
import { tasks, appointments, prospects, utils } from "@/lib/supabase"
import type { Task, Appointment, Prospect, Profile } from "@/lib/types"

interface PipelineProps {
  currentUser: Profile | null
}

export function Pipeline({ currentUser }: PipelineProps) {
  const [tasksList, setTasksList] = useState<Task[]>([])
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([])
  const [prospectsList, setProspectsList] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    loadData()
  }, [currentUser])

  const loadData = async () => {
    try {
      setLoading(true)
      const userId = currentUser?.role === 'commercial' ? currentUser.id : undefined
      
      const [tasksData, appointmentsData, prospectsData] = await Promise.all([
        tasks.getAll(userId),
        appointments.getAll(userId),
        prospects.getAll(userId)
      ])
      
      setTasksList(tasksData)
      setAppointmentsList(appointmentsData)
      setProspectsList(prospectsData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les tâches et RDV
  const upcomingAppointments = appointmentsList
    .filter(apt => new Date(apt.date_rdv) >= new Date() && ['planifie', 'confirme'].includes(apt.statut))
    .sort((a, b) => new Date(a.date_rdv).getTime() - new Date(b.date_rdv).getTime())
    .slice(0, 5)

  const overdueTasks = tasksList
    .filter(task => 
      task.date_echeance && 
      new Date(task.date_echeance) < new Date() && 
      task.statut !== 'terminee'
    )
    .sort((a, b) => new Date(a.date_echeance!).getTime() - new Date(b.date_echeance!).getTime())

  const todayTasks = tasksList
    .filter(task => {
      if (!task.date_echeance) return false
      const today = new Date().toDateString()
      return new Date(task.date_echeance).toDateString() === today && task.statut !== 'terminee'
    })

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200'
      case 'elevee': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normale': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'faible': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800'
      case 'en_cours': return 'bg-blue-100 text-blue-800'
      case 'terminee': return 'bg-green-100 text-green-800'
      case 'annulee': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'planifie': return 'bg-blue-100 text-blue-800'
      case 'confirme': return 'bg-green-100 text-green-800'
      case 'reporte': return 'bg-yellow-100 text-yellow-800'
      case 'annule': return 'bg-red-100 text-red-800'
      case 'termine': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'telephone': return Phone
      case 'visio': return Video
      case 'domicile': return MapPin
      case 'bureau': return Building
      default: return Calendar
    }
  }

  // Composant formulaire nouvelle tâche
  const NewTaskForm = () => {
    const [formData, setFormData] = useState({
      titre: '',
      description: '',
      priorite: 'normale' as const,
      date_echeance: '',
      prospect_id: '',
      tags: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      try {
        const taskData = {
          ...formData,
          assigned_to: currentUser?.id || '',
          created_by: currentUser?.id || '',
          date_echeance: formData.date_echeance ? new Date(formData.date_echeance).toISOString() : undefined,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined
        }

        await tasks.create(taskData)
        setShowNewTaskDialog(false)
        loadData()
        
        // Reset form
        setFormData({
          titre: '',
          description: '',
          priorite: 'normale',
          date_echeance: '',
          prospect_id: '',
          tags: ''
        })
      } catch (error) {
        console.error('Erreur lors de la création de la tâche:', error)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="titre">Titre *</Label>
          <Input
            id="titre"
            value={formData.titre}
            onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priorite">Priorité</Label>
            <Select 
              value={formData.priorite} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, priorite: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="faible">Faible</SelectItem>
                <SelectItem value="normale">Normale</SelectItem>
                <SelectItem value="elevee">Élevée</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date_echeance">Date d'échéance</Label>
            <Input
              id="date_echeance"
              type="datetime-local"
              value={formData.date_echeance}
              onChange={(e) => setFormData(prev => ({ ...prev, date_echeance: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="prospect_id">Prospect associé</Label>
          <Select 
            value={formData.prospect_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, prospect_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un prospect..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucun prospect</SelectItem>
              {prospectsList.map(prospect => (
                <SelectItem key={prospect.id} value={prospect.id}>
                  {prospect.first_name} {prospect.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="urgent, rappel, devis..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowNewTaskDialog(false)}>
            Annuler
          </Button>
          <Button type="submit">Créer la tâche</Button>
        </div>
      </form>
    )
  }

  // Composant formulaire nouveau RDV
  const NewAppointmentForm = () => {
    const [formData, setFormData] = useState({
      titre: '',
      description: '',
      date_rdv: '',
      duree_minutes: 60,
      lieu: '',
      type_rdv: 'telephone' as const,
      prospect_id: '',
      notes_preparation: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      try {
        const appointmentData = {
          ...formData,
          commercial_id: currentUser?.id || '',
          date_rdv: new Date(formData.date_rdv).toISOString()
        }

        await appointments.create(appointmentData)
        setShowNewAppointmentDialog(false)
        loadData()
        
        // Reset form
        setFormData({
          titre: '',
          description: '',
          date_rdv: '',
          duree_minutes: 60,
          lieu: '',
          type_rdv: 'telephone',
          prospect_id: '',
          notes_preparation: ''
        })
      } catch (error) {
        console.error('Erreur lors de la création du RDV:', error)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="titre">Titre *</Label>
          <Input
            id="titre"
            value={formData.titre}
            onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date_rdv">Date et heure *</Label>
            <Input
              id="date_rdv"
              type="datetime-local"
              value={formData.date_rdv}
              onChange={(e) => setFormData(prev => ({ ...prev, date_rdv: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="duree_minutes">Durée (minutes)</Label>
            <Input
              id="duree_minutes"
              type="number"
              min="15"
              max="240"
              value={formData.duree_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, duree_minutes: Number.parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type_rdv">Type de RDV</Label>
            <Select 
              value={formData.type_rdv} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, type_rdv: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="telephone">Téléphone</SelectItem>
                <SelectItem value="visio">Visioconférence</SelectItem>
                <SelectItem value="domicile">À domicile</SelectItem>
                <SelectItem value="bureau">Au bureau</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lieu">Lieu</Label>
            <Input
              id="lieu"
              value={formData.lieu}
              onChange={(e) => setFormData(prev => ({ ...prev, lieu: e.target.value }))}
              placeholder="Adresse, lien visio..."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="prospect_id">Prospect *</Label>
          <Select 
            value={formData.prospect_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, prospect_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un prospect..." />
            </SelectTrigger>
            <SelectContent>
              {prospectsList.map(prospect => (
                <SelectItem key={prospect.id} value={prospect.id}>
                  {prospect.first_name} {prospect.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes_preparation">Notes de préparation</Label>
          <Textarea
            id="notes_preparation"
            value={formData.notes_preparation}
            onChange={(e) => setFormData(prev => ({ ...prev, notes_preparation: e.target.value }))}
            rows={3}
            placeholder="Points à aborder, documents à préparer..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowNewAppointmentDialog(false)}>
            Annuler
          </Button>
          <Button type="submit">Créer le RDV</Button>
        </div>
      </form>
    )
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Pipeline & Activités
          </h1>
          <p className="text-slate-600 mt-1">
            Gestion des tâches, rendez-vous et suivi des activités
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Tâche
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle Tâche</DialogTitle>
                <DialogDescription>Créer une nouvelle tâche à effectuer</DialogDescription>
              </DialogHeader>
              <NewTaskForm />
            </DialogContent>
          </Dialog>

          <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau RDV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouveau Rendez-vous</DialogTitle>
                <DialogDescription>Planifier un nouveau rendez-vous avec un prospect</DialogDescription>
              </DialogHeader>
              <NewAppointmentForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="tasks">Tâches</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Tâches en retard</p>
                    <p className="text-2xl font-bold text-red-900">{overdueTasks.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Tâches aujourd'hui</p>
                    <p className="text-2xl font-bold text-blue-900">{todayTasks.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">RDV à venir</p>
                    <p className="text-2xl font-bold text-green-900">{upcomingAppointments.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Prospects actifs</p>
                    <p className="text-2xl font-bold text-purple-900">{prospectsList.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertes et priorités */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tâches en retard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Tâches en retard ({overdueTasks.length})
                </CardTitle>
                <CardDescription>Tâches qui nécessitent une attention immédiate</CardDescription>
              </CardHeader>
              <CardContent>
                {overdueTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune tâche en retard</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overdueTasks.slice(0, 5).map(task => {
                      const prospect = prospectsList.find(p => p.id === task.prospect_id)
                      return (
                        <div key={task.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-red-900">{task.titre}</h4>
                              {prospect && (
                                <p className="text-sm text-red-700">
                                  {prospect.first_name} {prospect.last_name}
                                </p>
                              )}
                              <p className="text-xs text-red-600 mt-1">
                                Échéance: {utils.formatDateTime(task.date_echeance!)}
                              </p>
                            </div>
                            <Badge className={getTaskPriorityColor(task.priorite)}>
                              {task.priorite}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prochains RDV */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Calendar className="w-5 h-5" />
                  Prochains rendez-vous ({upcomingAppointments.length})
                </CardTitle>
                <CardDescription>Rendez-vous planifiés dans les prochains jours</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun RDV planifié</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments

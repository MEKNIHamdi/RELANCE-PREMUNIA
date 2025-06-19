"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Search, Upload, RefreshCw, Edit, Phone, Mail, ExternalLink } from "lucide-react"
import { prospects, type Profile, type Prospect } from "@/lib/supabase"
import { toast } from "sonner"

interface ProspectsProps {
  user: Profile
}

export function Prospects({ user }: ProspectsProps) {
  const [prospectsList, setProspectsList] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [segmentFilter, setSegmentFilter] = useState<string>("all")
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showComparator, setShowComparator] = useState(false)
  const [newProspect, setNewProspect] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_naissance: "",
    budget_mensuel: 50,
    etat_sante: "bon" as const,
    niveau_urgence: "moyenne" as const,
    source: "",
    notes: "",
    adresse: "",
    ville: "",
    code_postal: "",
  })

  useEffect(() => {
    fetchProspects()
  }, [user])

  const fetchProspects = async () => {
    try {
      const commercialId = user.role === "commercial" ? user.id : undefined
      const data = await prospects.getAll(commercialId)
      setProspectsList(data)
    } catch (error) {
      console.error("Error fetching prospects:", error)
      toast.error("Erreur lors du chargement des prospects")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProspect = async () => {
    try {
      const prospectData = {
        ...newProspect,
        assigned_to: user.id,
      }
      await prospects.create(prospectData)
      toast.success("Prospect créé avec succès")
      setShowCreateDialog(false)
      setNewProspect({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_naissance: "",
        budget_mensuel: 50,
        etat_sante: "bon",
        niveau_urgence: "moyenne",
        source: "",
        notes: "",
        adresse: "",
        ville: "",
        code_postal: "",
      })
      fetchProspects()
    } catch (error) {
      console.error("Error creating prospect:", error)
      toast.error("Erreur lors de la création du prospect")
    }
  }

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await prospects.importFromExcel(file, user.id)
      toast.success("Import Excel lancé avec succès")
      fetchProspects()
    } catch (error) {
      console.error("Error importing Excel:", error)
      toast.error("Erreur lors de l'import Excel")
    }
  }

  const handleSyncGoogleSheets = async () => {
    const sheetUrl = prompt("Entrez l'URL de votre Google Sheet :")
    if (!sheetUrl) return

    try {
      await prospects.syncWithGoogleSheets(sheetUrl, user.id)
      toast.success("Synchronisation Google Sheets lancée")
      fetchProspects()
    } catch (error) {
      console.error("Error syncing Google Sheets:", error)
      toast.error("Erreur lors de la synchronisation Google Sheets")
    }
  }

  const handleSyncHubSpot = async () => {
    try {
      await prospects.syncWithHubSpot(user.id)
      toast.success("Synchronisation HubSpot lancée")
      fetchProspects()
    } catch (error) {
      console.error("Error syncing HubSpot:", error)
      toast.error("Erreur lors de la synchronisation HubSpot")
    }
  }

  const openComparator = (prospect: Prospect) => {
    setSelectedProspect(prospect)
    setShowComparator(true)
  }

  const filteredProspects = prospectsList.filter((prospect) => {
    const matchesSearch =
      prospect.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || prospect.statut === statusFilter
    const matchesSegment = segmentFilter === "all" || prospect.segment === segmentFilter

    return matchesSearch && matchesStatus && matchesSegment
  })

  const getStatusColor = (status: string) => {
    const colors = {
      nouveau: "bg-blue-100 text-blue-800",
      contacte: "bg-yellow-100 text-yellow-800",
      qualifie: "bg-purple-100 text-purple-800",
      devis: "bg-orange-100 text-orange-800",
      signe: "bg-green-100 text-green-800",
      perdu: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Prospects</h1>
          <p className="text-gray-600">Gérez vos prospects seniors et leurs besoins en mutuelle santé</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImportExcel}
            className="hidden"
            id="excel-upload"
          />
          <Button variant="outline" onClick={() => document.getElementById("excel-upload")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button variant="outline" onClick={handleSyncGoogleSheets}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Google Sheets
          </Button>
          <Button variant="outline" onClick={handleSyncHubSpot}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync HubSpot
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Prospect
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un prospect..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="nouveau">Nouveau</SelectItem>
                <SelectItem value="contacte">Contacté</SelectItem>
                <SelectItem value="qualifie">Qualifié</SelectItem>
                <SelectItem value="devis">Devis</SelectItem>
                <SelectItem value="signe">Signé</SelectItem>
                <SelectItem value="perdu">Perdu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les segments</SelectItem>
                <SelectItem value="senior_premium">Senior Premium</SelectItem>
                <SelectItem value="senior_standard">Senior Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des prospects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Prospects ({filteredProspects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Âge</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProspects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {prospect.first_name} {prospect.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{prospect.source}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{prospect.email}</p>
                      <p className="text-sm text-gray-500">{prospect.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{prospect.age} ans</p>
                      <p className="text-sm text-gray-500">{prospect.date_naissance}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{prospect.budget_mensuel}€/mois</p>
                  </TableCell>
                  <TableCell>
                    <p className={`font-bold ${getScoreColor(prospect.score)}`}>{prospect.score}/100</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {prospect.segment?.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(prospect.statut)}>{prospect.statut}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openComparator(prospect)}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de création de prospect */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau Prospect</DialogTitle>
            <DialogDescription>Créez un nouveau prospect senior pour votre pipeline</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                value={newProspect.first_name}
                onChange={(e) => setNewProspect({ ...newProspect, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                value={newProspect.last_name}
                onChange={(e) => setNewProspect({ ...newProspect, last_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newProspect.email}
                onChange={(e) => setNewProspect({ ...newProspect, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={newProspect.phone}
                onChange={(e) => setNewProspect({ ...newProspect, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date_naissance">Date de naissance (DD/MM/YYYY)</Label>
              <Input
                id="date_naissance"
                placeholder="15/03/1957"
                value={newProspect.date_naissance}
                onChange={(e) => setNewProspect({ ...newProspect, date_naissance: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="budget_mensuel">Budget mensuel (€)</Label>
              <Input
                id="budget_mensuel"
                type="number"
                min="30"
                max="500"
                value={newProspect.budget_mensuel}
                onChange={(e) => setNewProspect({ ...newProspect, budget_mensuel: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="etat_sante">État de santé</Label>
              <Select
                value={newProspect.etat_sante}
                onValueChange={(value) => setNewProspect({ ...newProspect, etat_sante: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="bon">Bon</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="fragile">Fragile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="niveau_urgence">Niveau d'urgence</Label>
              <Select
                value={newProspect.niveau_urgence}
                onValueChange={(value) => setNewProspect({ ...newProspect, niveau_urgence: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faible">Faible</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="elevee">Élevée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="Site web, recommandation, publicité..."
                value={newProspect.source}
                onChange={(e) => setNewProspect({ ...newProspect, source: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Informations complémentaires..."
                value={newProspect.notes}
                onChange={(e) => setNewProspect({ ...newProspect, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateProspect}>Créer le prospect</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog du comparateur Oggo */}
      <Dialog open={showComparator} onOpenChange={setShowComparator}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Comparateur Oggo Data - {selectedProspect?.first_name} {selectedProspect?.last_name}
            </DialogTitle>
            <DialogDescription>Trouvez la meilleure offre mutuelle santé pour votre prospect senior</DialogDescription>
          </DialogHeader>
          <div className="h-[600px] w-full">
            <div id="oggodata-icomparator-health" style={{ width: "100%", height: "100%" }}></div>
            <script
              src="https://cks.oggo-data.net/icomparator/health.js"
              type="text/javascript"
              async
              onLoad={() => {
                // Configuration du comparateur avec les données du prospect
                if (selectedProspect && (window as any).OggoData) {
                  ;(window as any).OggoData.configure({
                    age: selectedProspect.age,
                    budget: selectedProspect.budget_mensuel,
                    location: selectedProspect.code_postal,
                  })
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export interface Profile {
  id: string
  email: string
  role: "admin" | "manager" | "commercial"
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Prospect {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_naissance: string // Format DD/MM/YYYY dans l'interface
  budget_mensuel: number
  etat_sante: "excellent" | "bon" | "moyen" | "fragile"
  niveau_urgence: "faible" | "moyenne" | "elevee"
  score: number
  segment: "senior_premium" | "senior_standard"
  statut: "nouveau" | "contacte" | "qualifie" | "devis_envoye" | "negocie" | "gagne" | "perdu"
  assigned_to?: string
  source?: string
  notes?: string
  adresse?: string
  ville?: string
  code_postal?: string
  profession?: string
  situation_familiale?: string
  nombre_enfants?: number
  mutuelle_actuelle?: string
  date_fin_contrat?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  prospect_id?: string
  numero_contrat: string
  date_souscription: string
  prime_mensuelle: number
  date_debut_contrat: string
  date_fin_contrat?: string
  mutuelle_choisie: string
  formule: string
  commercial_id?: string
  commission_pourcentage?: number
  commission_montant?: number
  statut_contrat: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  titre: string
  description?: string
  statut: "en_attente" | "en_cours" | "terminee" | "annulee"
  priorite: "faible" | "normale" | "elevee" | "urgente"
  date_echeance?: string
  date_completion?: string
  assigned_to?: string
  created_by?: string
  prospect_id?: string
  client_id?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  titre: string
  description?: string
  date_rdv: string
  duree_minutes: number
  lieu?: string
  type_rdv?: string
  statut: "planifie" | "confirme" | "reporte" | "annule" | "termine"
  commercial_id?: string
  prospect_id?: string
  client_id?: string
  notes_preparation?: string
  compte_rendu?: string
  actions_suivre?: string[]
  created_at: string
  updated_at: string
}

export interface AutomationScenario {
  id: string
  nom: string
  description?: string
  type: "email_bienvenue" | "relance_email" | "anniversaire" | "cross_selling" | "personnalise"
  statut: "actif" | "inactif" | "brouillon"
  conditions?: any
  actions?: any
  delai_heures: number
  template_email_id?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  nom: string
  sujet: string
  contenu_html: string
  contenu_text?: string
  variables?: any
  type: "email_bienvenue" | "relance_email" | "anniversaire" | "cross_selling" | "personnalise"
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CommercialObjective {
  id: string
  commercial_id?: string
  periode_type: "mensuel" | "trimestriel" | "annuel"
  periode_valeur: string
  objectif_ca?: number
  objectif_prospects?: number
  objectif_conversions?: number
  objectif_rdv?: number
  ca_realise: number
  prospects_realises: number
  conversions_realisees: number
  rdv_realises: number
  pourcentage_ca?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface PerformanceStats {
  id: string
  commercial_id?: string
  date_stat: string
  prospects_nouveaux: number
  prospects_convertis: number
  ca_genere: number
  appels_effectues: number
  emails_envoyes: number
  rdv_planifies: number
  rdv_honores: number
  taux_conversion?: number
  created_at: string
}

export interface DataImport {
  id: string
  type_import: "excel" | "google_sheets" | "hubspot"
  nom_fichier?: string
  statut: string
  total_lignes?: number
  lignes_traitees: number
  lignes_erreur: number
  erreurs?: any
  created_by?: string
  created_at: string
  completed_at?: string
}

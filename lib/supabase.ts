import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://wkmmnhqudzsswxwqrwhg.supabase.co"
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbW1uaHF1ZHpzc3d4d3Fyd2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mzg1OTMsImV4cCI6MjA2NTMxNDU5M30.YyE8UE41JWDNC_vpayCwNooxrXiF9S9JOLb5KVL8px0"

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

// Types
export interface Profile {
  id: string
  email: string
  role: "admin" | "commercial" | "marketing"
  first_name: string
  last_name: string
  phone?: string
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
  birth_date: string
  age?: number
  address?: string
  city?: string
  postal_code?: string
  status: "nouveau" | "contacte" | "interesse" | "devis_envoye" | "negocie" | "gagne" | "perdu"
  segment: "premium" | "standard"
  score: number
  budget_monthly: number
  current_insurance?: string
  health_issues?: string
  notes?: string
  assigned_to?: string
  source?: string
  last_contact?: string
  next_follow_up?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  prospect_id?: string
  assigned_to?: string
  created_by?: string
  status: "en_attente" | "en_cours" | "termine" | "annule"
  priority: number
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  title: string
  description?: string
  prospect_id?: string
  assigned_to?: string
  created_by?: string
  status: "planifie" | "confirme" | "termine" | "annule" | "reporte"
  scheduled_at: string
  duration_minutes: number
  location?: string
  meeting_type?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  type: string // e.g. "revenue", "prospects", "deals"
  period: string // e.g. "monthly", "quarterly"
  target_value: number
  current_value: number
  start_date: string
  end_date: string
  description?: string
  created_at: string
  updated_at: string
}

// Fonctions d'authentification
export const auth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser(): Promise<Profile | null> {
    // 1 / fetch the raw auth user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    // 2 / try to load the matching profile (may not exist yet)
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

    // ignore “no rows” error, but surface any other DB problem
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error)
      return null
    }

    // 3 / create a profile on-the-fly the first time the user logs in
    if (!profile) {
      const newProfile = {
        id: user.id,
        email: user.email ?? "",
        first_name: (user.user_metadata?.first_name as string) ?? "",
        last_name: (user.user_metadata?.last_name as string) ?? "",
        role: ((user.user_metadata?.role as string) ?? "commercial") as Profile["role"],
        is_active: true,
      }

      const { data: created, error: insertErr } = await supabase.from("profiles").insert([newProfile]).select().single()

      if (insertErr) {
        console.error("Error creating profile:", insertErr)
        return null
      }

      return created
    }

    // 4 / regular path: return existing profile
    return profile
  },

  async signUp(
    email: string,
    password: string,
    userData: {
      first_name: string
      last_name: string
      role?: "admin" | "commercial" | "marketing"
    },
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || "commercial",
        },
      },
    })
    return { data, error }
  },
}

// Fonctions pour les prospects
export const prospects = {
  async getAll(userId?: string): Promise<Prospect[]> {
    let query = supabase.from("prospects").select("*")

    if (userId) {
      query = query.eq("assigned_to", userId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Prospect | null> {
    const { data, error } = await supabase.from("prospects").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async create(
    prospect: Omit<Prospect, "id" | "created_at" | "updated_at" | "score" | "segment" | "age">,
  ): Promise<Prospect> {
    const { data, error } = await supabase.from("prospects").insert([prospect]).select().single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Prospect>): Promise<Prospect> {
    const { data, error } = await supabase.from("prospects").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("prospects").delete().eq("id", id)

    if (error) throw error
  },
}

// Fonctions pour les tâches
export const tasks = {
  async getAll(userId?: string): Promise<Task[]> {
    let query = supabase.from("tasks").select("*")

    if (userId) {
      query = query.eq("assigned_to", userId)
    }

    const { data, error } = await query.order("due_date", { ascending: true })
    if (error) throw error
    return data || []
  },

  async create(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
    const { data, error } = await supabase.from("tasks").insert([task]).select().single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },
}

// Fonctions pour les rendez-vous
export const appointments = {
  async getAll(userId?: string): Promise<Appointment[]> {
    let query = supabase.from("appointments").select("*")

    if (userId) {
      query = query.eq("assigned_to", userId)
    }

    const { data, error } = await query.order("scheduled_at", { ascending: true })
    if (error) throw error
    return data || []
  },

  async getUpcoming(userId?: string): Promise<Appointment[]> {
    let query = supabase
      .from("appointments")
      .select("*")
      .gte("scheduled_at", new Date().toISOString())
      .in("status", ["planifie", "confirme"])

    if (userId) {
      query = query.eq("assigned_to", userId)
    }

    const { data, error } = await query.order("scheduled_at", { ascending: true }).limit(10)

    if (error) throw error
    return data || []
  },

  async create(appointment: Omit<Appointment, "id" | "created_at" | "updated_at">): Promise<Appointment> {
    const { data, error } = await supabase.from("appointments").insert([appointment]).select().single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase.from("appointments").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },
}

// Fonctions pour les objectifs (Goals)
export const objectives = {
  async getByUser(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(goal: Omit<Goal, "id" | "created_at" | "updated_at">): Promise<Goal> {
    const { data, error } = await supabase.from("goals").insert([goal]).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase.from("goals").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  },
}

// Fonctions pour les statistiques
export const stats = {
  async getDashboardStats(userId?: string) {
    const today = new Date().toISOString().split("T")[0]
    const thisMonth = new Date().toISOString().slice(0, 7)

    // Prospects ce mois
    let prospectsQuery = supabase.from("prospects").select("*", { count: "exact" }).gte("created_at", `${thisMonth}-01`)

    if (userId) {
      prospectsQuery = prospectsQuery.eq("assigned_to", userId)
    }

    // Clients ce mois
    const clientsQuery = supabase.from("clients").select("*", { count: "exact" }).gte("start_date", `${thisMonth}-01`)

    // RDV à venir
    let rdvQuery = supabase
      .from("appointments")
      .select("*", { count: "exact" })
      .gte("scheduled_at", new Date().toISOString())
      .in("status", ["planifie", "confirme"])

    if (userId) {
      rdvQuery = rdvQuery.eq("assigned_to", userId)
    }

    // Tâches en retard
    let tasksQuery = supabase
      .from("tasks")
      .select("*", { count: "exact" })
      .lt("due_date", new Date().toISOString())
      .eq("status", "en_attente")

    if (userId) {
      tasksQuery = tasksQuery.eq("assigned_to", userId)
    }

    const [prospects, clients, rdv, tasks] = await Promise.all([prospectsQuery, clientsQuery, rdvQuery, tasksQuery])

    return {
      prospects_ce_mois: prospects.count || 0,
      clients_ce_mois: clients.count || 0,
      rdv_a_venir: rdv.count || 0,
      taches_en_retard: tasks.count || 0,
    }
  },
}

// Fonctions utilitaires
export const utils = {
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString("fr-FR")
  },

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString("fr-FR")
  },

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  },

  calculateAge(birthDate: string): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  },
}

// Test de connexion
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("profiles").select("count", { count: "exact" }).limit(1)

    if (error) {
      console.error("Erreur de connexion Supabase:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Connexion Supabase réussie")
    return { success: true, data }
  } catch (err) {
    console.error("❌ Erreur de connexion:", err)
    return { success: false, error: err }
  }
}

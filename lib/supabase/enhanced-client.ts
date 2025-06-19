import { createClient } from "@supabase/supabase-js"
import type { User, Prospect, Opportunity, Campaign, Analytics } from "./types"

const supabaseUrl = "https://wkmmnhqudzsswxwqrwhg.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbW1uaHF1ZHpzc3d4d3Fyd2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mzg1OTMsImV4cCI6MjA2NTMxNDU5M30.YyE8UE41JWDNC_vpayCwNooxrXiF9S9JOLb5KVL8px0"

export const supabase = createClient(supabaseUrl, supabaseKey)

export class PremuniaSupabaseClient {
  // Authentification
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    return profile
  }

  // Gestion des prospects
  async getProspects(userId?: string): Promise<Prospect[]> {
    let query = supabase.from("prospects").select("*")

    if (userId) {
      query = query.eq("assigned_to", userId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  }

  async createProspect(prospect: Omit<Prospect, "id" | "created_at" | "updated_at">): Promise<Prospect> {
    const { data, error } = await supabase.from("prospects").insert([prospect]).select().single()

    if (error) throw error
    return data
  }

  async updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect> {
    const { data, error } = await supabase
      .from("prospects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Gestion des opportunités
  async getOpportunities(userId?: string): Promise<Opportunity[]> {
    let query = supabase.from("opportunities").select(`
      *,
      prospects (first_name, last_name, email)
    `)

    if (userId) {
      query = query.eq("assigned_to", userId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  }

  async createOpportunity(opportunity: Omit<Opportunity, "id" | "created_at" | "updated_at">): Promise<Opportunity> {
    const { data, error } = await supabase.from("opportunities").insert([opportunity]).select().single()

    if (error) throw error
    return data
  }

  // Analytics
  async getAnalytics(userId?: string): Promise<Analytics> {
    // Simulation des données analytics
    const prospects = await this.getProspects(userId)
    const opportunities = await this.getOpportunities(userId)

    const totalRevenue = opportunities
      .filter((opp) => opp.stage === "closed_won")
      .reduce((sum, opp) => sum + opp.value, 0)

    const conversionRate =
      prospects.length > 0
        ? (opportunities.filter((opp) => opp.stage === "closed_won").length / prospects.length) * 100
        : 0

    return {
      total_revenue: totalRevenue,
      monthly_revenue: totalRevenue * 0.3, // Simulation
      conversion_rate: conversionRate,
      avg_deal_size: totalRevenue / Math.max(opportunities.filter((opp) => opp.stage === "closed_won").length, 1),
      pipeline_value: opportunities
        .filter((opp) => !["closed_won", "closed_lost"].includes(opp.stage))
        .reduce((sum, opp) => sum + (opp.value * opp.probability) / 100, 0),
      prospects_count: prospects.length,
      opportunities_count: opportunities.length,
      campaigns_performance: {
        sent: 1250,
        opened: 875,
        clicked: 312,
        converted: 89,
      },
    }
  }

  // Marketing Automation
  async getCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async createCampaign(campaign: Omit<Campaign, "id" | "created_at">): Promise<Campaign> {
    const { data, error } = await supabase.from("campaigns").insert([campaign]).select().single()

    if (error) throw error
    return data
  }
}

export const premuniaClient = new PremuniaSupabaseClient()

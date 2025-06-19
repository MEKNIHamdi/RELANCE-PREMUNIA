export interface User {
  id: string
  email: string
  role: "admin" | "manager" | "commercial"
  first_name: string
  last_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Prospect {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  age: number
  budget_monthly: number
  health_status: "excellent" | "good" | "average" | "poor"
  urgency_level: "low" | "medium" | "high"
  score: number
  segment: "senior_premium" | "senior_standard"
  status: "new" | "contacted" | "qualified" | "proposal" | "closed_won" | "closed_lost"
  assigned_to: string
  source: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  prospect_id: string
  title: string
  value: number
  stage: "discovery" | "needs_analysis" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
  probability: number
  expected_close_date: string
  assigned_to: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  name: string
  type: "email" | "sms" | "call"
  target_segment: "senior_premium" | "senior_standard" | "all"
  status: "draft" | "active" | "paused" | "completed"
  template_id: string
  sent_count: number
  open_rate: number
  click_rate: number
  conversion_rate: number
  created_by: string
  created_at: string
}

export interface Analytics {
  total_revenue: number
  monthly_revenue: number
  conversion_rate: number
  avg_deal_size: number
  pipeline_value: number
  prospects_count: number
  opportunities_count: number
  campaigns_performance: {
    sent: number
    opened: number
    clicked: number
    converted: number
  }
}

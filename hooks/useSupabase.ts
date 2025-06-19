"use client"

import { useState, useEffect } from "react"
import { premuniaClient } from "@/lib/supabase/enhanced-client"
import type { User, Prospect, Analytics } from "@/lib/supabase/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await premuniaClient.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await premuniaClient.signIn(email, password)
    if (!error && data.user) {
      const userProfile = await premuniaClient.getCurrentUser()
      setUser(userProfile)
    }
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await premuniaClient.signOut()
    if (!error) {
      setUser(null)
    }
    return { error }
  }

  return { user, loading, signIn, signOut }
}

export function useProspects(userId?: string) {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const data = await premuniaClient.getProspects(userId)
        setProspects(data)
      } catch (error) {
        console.error("Error fetching prospects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProspects()
  }, [userId])

  const createProspect = async (prospect: Omit<Prospect, "id" | "created_at" | "updated_at">) => {
    try {
      const newProspect = await premuniaClient.createProspect(prospect)
      setProspects((prev) => [newProspect, ...prev])
      return newProspect
    } catch (error) {
      console.error("Error creating prospect:", error)
      throw error
    }
  }

  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    try {
      const updatedProspect = await premuniaClient.updateProspect(id, updates)
      setProspects((prev) => prev.map((p) => (p.id === id ? updatedProspect : p)))
      return updatedProspect
    } catch (error) {
      console.error("Error updating prospect:", error)
      throw error
    }
  }

  return { prospects, loading, createProspect, updateProspect }
}

export function useAnalytics(userId?: string) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await premuniaClient.getAnalytics(userId)
        setAnalytics(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [userId])

  return { analytics, loading }
}

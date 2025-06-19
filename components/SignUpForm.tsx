"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus } from "lucide-react"
import { auth } from "@/lib/supabase"

interface SignUpFormProps {
  onBack: () => void
}

export function SignUpForm({ onBack }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    role: "commercial" as "admin" | "commercial" | "marketing",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setLoading(false)
      return
    }

    try {
      const { error } = await auth.signUp(formData.email, formData.password, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess("Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.")
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la création du compte")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Créer un compte</CardTitle>
        <CardDescription>Créez votre compte Premunia CRM</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Prénom"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Nom"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "commercial" | "marketing") => setFormData({ ...formData, role: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer le compte
                </>
              )}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={onBack} disabled={loading}>
              Retour à la connexion
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

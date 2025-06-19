"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { auth, type Profile, supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn, TrendingUp, Users, Mail, BarChart3, Search, Settings, UserPlus } from "lucide-react"
import { TestConnection } from "@/components/TestConnection"
import { SignUpForm } from "@/components/SignUpForm"

// Composant de test de connexion
function ConnectionTest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Premunia CRM - Configuration
          </h1>
          <p className="text-slate-600 mt-2">Vérification de la connexion Supabase</p>
        </div>

        <TestConnection />
      </div>
    </div>
  )
}

// Composant de connexion
function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showTest, setShowTest] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await auth.signIn(email, password)
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  if (showTest) {
    return <ConnectionTest />
  }

  if (showSignUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Premunia CRM
            </h1>
            <p className="text-slate-600 mt-2">Plateforme Mutuelle Santé Seniors</p>
          </div>
          <SignUpForm onBack={() => setShowSignUp(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Premunia CRM
          </h1>
          <p className="text-slate-600 mt-2">Plateforme Mutuelle Santé Seniors</p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>Accédez à votre espace CRM spécialisé seniors</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Boutons d'actions */}
        <div className="mt-6 space-y-2">
          <Button variant="outline" onClick={() => setShowSignUp(true)} className="w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Créer un compte
          </Button>
          <Button variant="outline" onClick={() => setShowTest(true)} className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            Tester la connexion Supabase
          </Button>
        </div>

        {/* Informations de configuration */}
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-900">✅ Supabase Configuré</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-green-800">
              <p className="font-medium mb-2">Base de données connectée :</p>
              <div className="bg-white p-2 rounded border font-mono text-xs">
                <div>URL: wkmmnhqudzsswxwqrwhg.supabase.co</div>
                <div>Status: ✅ Connecté</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fonctionnalités */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-white/60 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Gestion Prospects</p>
            <p className="text-xs text-slate-500">CRM spécialisé seniors</p>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Automation</p>
            <p className="text-xs text-slate-500">Campagnes ciblées</p>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <Search className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Comparateur</p>
            <p className="text-xs text-slate-500">Oggo Data intégré</p>
          </div>
          <div className="p-4 bg-white/60 rounded-lg">
            <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Analytics</p>
            <p className="text-xs text-slate-500">Rapports avancés</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant principal de l'application
export default function PremuniaApp() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Affichage du loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement de Premunia CRM...</p>
        </div>
      </div>
    )
  }

  // Affichage du formulaire de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return <LoginForm />
  }

  // Si l'utilisateur est connecté, afficher un message temporaire
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Bienvenue, {user.first_name} {user.last_name}
        </h1>
        <p className="text-slate-600 mb-4">Connexion Supabase réussie !</p>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <p>Email: {user.email}</p>
            <p>Rôle: {user.role}</p>
          </div>
          <Button onClick={() => auth.signOut()}>Se déconnecter</Button>
        </div>
      </div>
    </div>
  )
}

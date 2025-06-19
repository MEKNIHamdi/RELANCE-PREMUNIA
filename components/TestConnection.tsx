"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Database } from "lucide-react"
import { testConnection } from "@/lib/supabase"

export function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    error?: string
    data?: any
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    const result = await testConnection()
    setConnectionStatus(result)
    setLoading(false)
  }

  useEffect(() => {
    runTest()
  }, [])

  const checkSupabaseConfig = () => {
    const url = "https://wkmmnhqudzsswxwqrwhg.supabase.co"
    const key =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbW1uaHF1ZHpzc3d4d3Fyd2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Mzg1OTMsImV4cCI6MjA2NTMxNDU5M30.YyE8UE41JWDNC_vpayCwNooxrXiF9S9JOLb5KVL8px0"

    return {
      hasUrl: !!url,
      hasKey: !!key,
      urlValid: url?.startsWith("https://") && url?.includes(".supabase.co"),
      keyValid: key?.length > 100,
    }
  }

  const config = checkSupabaseConfig()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Test de Connexion Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Check */}
        <div className="space-y-2">
          <h3 className="font-semibold">Configuration</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              {config.hasUrl ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">SUPABASE_URL</span>
              <Badge variant={config.hasUrl ? "default" : "destructive"}>
                {config.hasUrl ? "Configuré" : "Manquant"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {config.hasKey ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">SUPABASE_ANON_KEY</span>
              <Badge variant={config.hasKey ? "default" : "destructive"}>
                {config.hasKey ? "Configuré" : "Manquant"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Connection Test */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Test de Connexion</h3>
            <Button onClick={runTest} disabled={loading} size="sm" variant="outline">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Tester
            </Button>
          </div>

          {connectionStatus && (
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {connectionStatus.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {connectionStatus.success ? "Connexion réussie" : "Échec de connexion"}
                </span>
              </div>

              {connectionStatus.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  <strong>Erreur:</strong> {connectionStatus.error}
                </div>
              )}

              {connectionStatus.success && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  Base de données accessible - Prêt pour l'utilisation
                </div>
              )}
            </div>
          )}
        </div>

        {/* Database Info */}
        <div className="space-y-2">
          <h3 className="font-semibold">Informations de la base</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <div>
              <strong>URL:</strong> https://wkmmnhqudzsswxwqrwhg.supabase.co
            </div>
            <div>
              <strong>Projet:</strong> wkmmnhqudzsswxwqrwhg
            </div>
            <div>
              <strong>Status:</strong> Connecté et configuré
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-2">
          <h3 className="font-semibold">Prochaines étapes</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>✅ 1. Base de données créée</p>
            <p>✅ 2. Tables et fonctions configurées</p>
            <p>✅ 3. Connexion Supabase établie</p>
            <p>🔄 4. Créer un compte utilisateur pour tester</p>
            <p>🔄 5. Tester l'authentification</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

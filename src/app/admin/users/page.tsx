"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { UserPlus, Save, Check, AlertCircle } from "lucide-react"
import { useTheme } from "next-themes"

interface UserPreferences {
  username: string
  email: string
  darkMode: boolean
  showThinking: boolean
  syntaxHighlight: boolean
}

export default function UsersPage() {
  const { setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    username: "admin",
    email: "admin@zacai.local",
    darkMode: true,
    showThinking: true,
    syntaxHighlight: true,
  })

  useEffect(() => {
    loadUserPreferences()
  }, [])

  const loadUserPreferences = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings/users')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // API returns array of users, get the admin user
          const users = Array.isArray(result.data) ? result.data : [result.data]
          const adminUser = users.find(u => u.id === 'admin' || u.role === 'admin')
          
          if (adminUser && adminUser.preferences) {
            setPreferences({
              username: adminUser.name || 'admin',
              email: adminUser.email || 'admin@zacai.local',
              darkMode: adminUser.preferences.darkMode ?? true,
              showThinking: adminUser.preferences.showThinking ?? true,
              syntaxHighlight: adminUser.preferences.syntaxHighlight ?? true,
            })
            setTheme(adminUser.preferences.darkMode ? "dark" : "light")
          }
        }
      }
    } catch (err) {
      console.error('[User Settings] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveUserPreferences = async () => {
    try {
      setSaving(true)
      setError(null)
      setShowSuccess(false)
      
      const response = await fetch('/api/admin/settings/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'admin',
          name: preferences.username,
          email: preferences.email,
          role: 'admin',
          preferences: {
            darkMode: preferences.darkMode,
            showThinking: preferences.showThinking,
            syntaxHighlight: preferences.syntaxHighlight,
          }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        
        // Apply theme change
        setTheme(preferences.darkMode ? "dark" : "light")
      } else {
        setError(result.error || 'Failed to save settings')
      }
    } catch (err) {
      setError('Network error saving settings')
      console.error('[User Settings] Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDarkModeToggle = (checked: boolean) => {
    setPreferences({ ...preferences, darkMode: checked })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading user settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and roles for AI self-awareness features
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {showSuccess && (
        <Card className="p-4 bg-green-500/10 border-green-500">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="h-5 w-5" />
            <p>User settings saved successfully!</p>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">User Preferences</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={preferences.username}
              onChange={(e) => setPreferences({ ...preferences, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={preferences.email}
              onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Enable dark theme</p>
            </div>
            <Switch 
              checked={preferences.darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Thinking Process</Label>
              <p className="text-sm text-muted-foreground">Display AI reasoning steps</p>
            </div>
            <Switch 
              checked={preferences.showThinking}
              onCheckedChange={(checked) => setPreferences({ ...preferences, showThinking: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Code Syntax Highlighting</Label>
              <p className="text-sm text-muted-foreground">Highlight code in responses</p>
            </div>
            <Switch 
              checked={preferences.syntaxHighlight}
              onCheckedChange={(checked) => setPreferences({ ...preferences, syntaxHighlight: checked })}
            />
          </div>
        </div>
      </Card>

      <Button 
        onClick={saveUserPreferences}
        disabled={saving}
        className="flex items-center gap-2"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save User Settings
          </>
        )}
      </Button>
    </div>
  )
}

/**
 * File: app/admin/domains/page.tsx
 * Purpose: Main Knowledge Domains overview and settings page
 */

"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Database, Code, FileCode, Globe, BookOpen, Calculator, TestTube, Shield, GitBranch, Bug, FileText, Microscope, Binary, Layers, Eye, Gauge, CloudCog, ServerCog } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
interface DomainSummary {
  id: string
  name: string
  description: string
  category: keyof typeof DOMAIN_CATEGORY_META | "other"
  enabled: boolean
  path: string
}

const DOMAIN_CATEGORY_META = {
  language: { label: "Language", color: "bg-blue-500" },
  technical: { label: "Technical", color: "bg-purple-500" },
  development: { label: "Development", color: "bg-cyan-500" },
  science: { label: "Science", color: "bg-pink-500" },
  system: { label: "System", color: "bg-orange-500" },
  other: { label: "Other", color: "bg-slate-500" },
}

const categoryFilters = Object.entries(DOMAIN_CATEGORY_META).map(([id, meta]) => ({ id, label: meta.label }))
categoryFilters.unshift({ id: "all", label: "All" })

const domainIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  english: BookOpen,
  grammar: FileText,
  general_knowledge: Globe,
  programming: Code,
  typescript: FileCode,
  react: Layers,
  nextjs: Layers,
  version_control: GitBranch,
  code_review: Eye,
  error_detection: Bug,
  testing: TestTube,
  documentation: FileText,
  mathematics: Calculator,
  science: Microscope,
  algorithms: Binary,
  data_structures: Database,
  security: Shield,
  system: ServerCog,
  environment: Globe,
  repair: CloudCog,
  data_integrity: Shield,
  observability: Gauge,
  internet_search: Globe,
}

export default function DomainsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [domains, setDomains] = useState<DomainSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadDomains() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/admin/domains")
        const result = await response.json()
        if (!response.ok || !result?.success) {
          throw new Error(result?.error || "Unable to load domain registry")
        }
        if (isMounted) {
          setDomains(result.data as DomainSummary[])
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (isMounted) {
          setError(message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDomains()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredDomains = domains.filter((domain) => {
    const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase()) || domain.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || domain.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categoryInfo = Object.entries(DOMAIN_CATEGORY_META).reduce<Record<string, { count: number; color: string; label: string }>>((acc, [id, meta]) => {
    const count = domains.filter((domain) => domain.category === id).length
    acc[id] = { count, color: meta.color, label: meta.label }
    return acc
  }, {})

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Knowledge Domains</h1>
        <p className="text-muted-foreground">Manage all {domains.length} knowledge domains</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(categoryInfo).map(([categoryId, info]) => (
          <Card key={categoryId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm capitalize">{info.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{info.count}</div>
                <div className={`h-3 w-3 rounded-full ${info.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="domains">
        <TabsList>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="global">Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4">
          <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((filter) => (
              <Button
                key={filter.id}
                size="sm"
                variant={selectedCategory === filter.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          
          {loading && <p className="text-muted-foreground">Loading domains...</p>}
          {!loading && error && <p className="text-red-500 text-sm">{error}</p>}

          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDomains.map((domain) => {
                const Icon = domainIcons[domain.id] || Database
                return (
                  <Card key={domain.id} className="cursor-pointer hover:shadow-lg" onClick={() => router.push(domain.path)}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-base">{domain.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription>{domain.description}</CardDescription>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {domain.category}
                        </Badge>
                        <Badge variant={domain.enabled ? "default" : "secondary"}>{domain.enabled ? "Enabled" : "Disabled"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Confidence Threshold</Label>
                <Input type="number" defaultValue="0.7" />
              </div>
              <Button>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

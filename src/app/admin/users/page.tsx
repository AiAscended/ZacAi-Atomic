"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { UserPlus } from "lucide-react"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Settings</h1>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">User Preferences</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue="admin" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="admin@zacai.local" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Thinking Process</Label>
              <p className="text-sm text-muted-foreground">Display AI reasoning steps</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Code Syntax Highlighting</Label>
              <p className="text-sm text-muted-foreground">Highlight code in responses</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      <Button>Save User Settings</Button>
    </div>
  )
}

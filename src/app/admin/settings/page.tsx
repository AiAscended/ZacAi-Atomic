'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Cpu, Brain, Database, Github } from 'lucide-react';

export default function SettingsOverviewPage() {
  const settingsSections = [
    {
      title: 'System Settings',
      description: 'Configure system-wide settings, name, version, timezone and location',
      icon: Settings,
      href: '/admin/system',
      color: 'text-blue-500'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'text-green-500'
    },
    {
      title: 'Model Configuration',
      description: 'Configure AI models, parameters, and inference settings',
      icon: Brain,
      href: '/admin/models',
      color: 'text-purple-500'
    },
    {
      title: 'Domain Settings',
      description: 'Manage domain-specific configurations and vocabularies',
      icon: Cpu,
      href: '/admin/domains/react',
      color: 'text-orange-500'
    },
    {
      title: 'Training Settings',
      description: 'Configure training parameters and schedules',
      icon: Database,
      href: '/admin/training',
      color: 'text-pink-500'
    },
    {
      title: 'GitHub Integration',
      description: 'Configure GitHub App and repository connections',
      icon: Github,
      href: '/admin/integrations/github-app',
      color: 'text-gray-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings Overview</h1>
        <p className="text-muted-foreground mt-2">
          Manage all system settings and configurations from one place
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-6 w-6 ${section.color}`} />
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-muted-foreground hover:text-primary">
                    Configure →
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

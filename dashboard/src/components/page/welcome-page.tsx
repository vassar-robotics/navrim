import React from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import {
  Brain,
  Camera,
  Cog,
  Cpu,
  Database,
  Gamepad2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const WelcomePage: React.FC = () => {
  const features = [
    {
      title: 'Overview',
      description: 'Monitor and control your AI system',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '/dashboard',
          description: 'View system metrics and analytics',
        },
        {
          id: 'control',
          label: 'Control',
          icon: Gamepad2,
          href: '/control',
          description: 'Manage system operations',
        },
      ],
    },
    {
      title: 'AI Capabilities',
      description: 'Train and deploy intelligent models',
      items: [
        {
          id: 'datasets',
          label: 'Datasets',
          icon: Database,
          href: '/datasets',
          description: 'Manage training data and recordings',
        },
        {
          id: 'training',
          label: 'Training',
          icon: Brain,
          href: '/training',
          description: 'Train custom AI models',
        },
        {
          id: 'inference',
          label: 'Inference',
          icon: Cpu,
          href: '/inference',
          description: 'Run predictions and analysis',
        },
        {
          id: 'chat',
          label: 'Chat',
          icon: MessageSquare,
          href: '/chat',
          description: 'Interact with AI assistant',
        },
      ],
    },
    {
      title: 'Configuration',
      description: 'Customize your setup',
      items: [
        {
          id: 'configuration',
          label: 'Settings',
          icon: Settings,
          href: '/configuration',
          description: 'Configure system preferences',
        },
        {
          id: 'cameras',
          label: 'Cameras',
          icon: Camera,
          href: '/cameras',
          description: 'Set up camera inputs',
        },
      ],
    },
  ]

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 space-y-4 text-center">
          <div className="mb-6 flex items-center justify-center space-x-3">
            <Cog className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Welcome to Navrim</h1>
          </div>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Your intelligent AI platform for dataset management, model training, and real-time inference
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/datasets">
                <Database className="mr-2 h-5 w-5" />
                Browse Datasets
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-12">
          {features.map((section) => (
            <div key={section.title} className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold">{section.title}</h2>
                <p className="text-muted-foreground">{section.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="group relative rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="flex items-center font-semibold">
                          {item.label}
                          <ArrowRight className="ml-2 h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Getting Started Section */}
        <div className="mt-16 rounded-lg border bg-card p-8 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="mb-2 text-2xl font-semibold">Ready to get started?</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Begin by uploading your datasets and configuring your cameras. Our AI system will help you train models and
            run real-time inference on your data.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/configuration">
                <Settings className="mr-2 h-4 w-4" />
                Configure System
              </Link>
            </Button>
            <Button asChild>
              <Link to="/training">
                <Brain className="mr-2 h-4 w-4" />
                Start Training
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default WelcomePage

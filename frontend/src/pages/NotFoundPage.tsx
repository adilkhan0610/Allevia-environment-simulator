import React from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/shared/Container'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <Container size="narrow" className="text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white font-mono">404 — ROUTE NOT FOUND</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The requested simulator route does not exist. Please navigate back to the primary evaluation cockpit or landing page.
        </p>
        <div>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Return to Intro
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  )
}

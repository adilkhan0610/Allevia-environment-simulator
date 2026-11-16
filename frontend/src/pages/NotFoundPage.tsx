import React from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/Containers'
import { SecondaryButton } from '@/components/ui/buttons'
import { DisplayHeading, BodyText } from '@/components/ui/typography'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <PageContainer size="narrow" className="text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--status-red)]/30 bg-[var(--status-red-bg)] text-[var(--status-red)]">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <DisplayHeading as="h1" className="text-3xl sm:text-4xl">
          404 — ROUTE NOT FOUND
        </DisplayHeading>
        <BodyText className="max-w-md mx-auto">
          The requested simulator route does not exist. Please navigate back to the primary evaluation cockpit or landing page.
        </BodyText>
        <div>
          <Link to="/">
            <SecondaryButton icon={<ArrowLeft className="h-4 w-4" />}>
              Return to Intro
            </SecondaryButton>
          </Link>
        </div>
      </PageContainer>
    </div>
  )
}

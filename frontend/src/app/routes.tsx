import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { IntroPage } from '@/pages/IntroPage'
import { LabPage } from '@/pages/LabPage'
import { AboutPage } from '@/pages/AboutPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { DesignSystemPreviewPage } from '@/pages/DesignSystemPreviewPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <IntroPage />,
      },
      {
        path: 'lab',
        element: <LabPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'design-system',
        element: <DesignSystemPreviewPage />,
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
])

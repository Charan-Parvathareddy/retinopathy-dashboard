'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Analysis } from '@/components/Analysis/Analysis'

export default function AnalysisPage() {
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/')
    }
  }, [router])

  return <Analysis />
}
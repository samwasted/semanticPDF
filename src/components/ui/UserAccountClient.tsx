'use client'
import dynamic from 'next/dynamic'

// Use ssr: false here, since this file is a Client Component
const UserAccountNav = dynamic(() => import('./UserAccountNav'), { ssr: false })

export default UserAccountNav

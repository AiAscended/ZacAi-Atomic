"use client"

import { useState } from "react"
import { HamburgerMenu } from "./HamburgerMenu"
import { AdminSidebar } from "./AdminSidebar"

export function NavigationWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <>
      <HamburgerMenu isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <AdminSidebar isOpen={isOpen} isExpanded={isExpanded} onExpandToggle={() => setIsExpanded(!isExpanded)} />
    </>
  )
}

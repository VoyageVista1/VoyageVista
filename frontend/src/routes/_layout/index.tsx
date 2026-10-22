import { createFileRoute } from "@tanstack/react-router"

import useAuth from "@/hooks/useAuth"
import EarthGlobe from "@/components/earth-globe"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Dashboard - FastAPI Template",
      },
    ],
  }),
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <div className="voyage-dashboard">
      <header className="voyage-dashboard-header">
        <div>
          <span className="voyage-kicker">VoyageVista / planetary routes</span>
          <h1>Hi, {currentUser?.full_name || currentUser?.email || "traveller"} 👋</h1>
          <p>Explore the world through a cinematic travel atlas.</p>
        </div>
        <span className="voyage-live"><i /> Live discovery</span>
      </header>
      <EarthGlobe />
    </div>
  )
}

import { Outlet } from 'react-router-dom'
import { TabBar } from '@/components/TabBar'

/** Coquille des écrans à onglets : contenu défilant, barre fixée en bas. */
export function Layout() {
  return (
    <div className="flex h-screen flex-col bg-bg text-text">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}

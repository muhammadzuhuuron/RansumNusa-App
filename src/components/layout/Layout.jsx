import Sidebar from './Sidebar'
import Toaster from './Toaster'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 md:p-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}

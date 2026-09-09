import { useState } from 'react'
import { Menu, X, Home, Sheep, Leaf, DollarSign, Heart, Zap } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/sheep', label: 'Manajemen Domba', icon: Sheep },
    { path: '/feed', label: 'Manajemen Pakan', icon: Leaf },
    { path: '/feeding', label: 'Pemberian Pakan', icon: Zap },
    { path: '/health', label: 'Kesehatan Domba', icon: Heart },
    { path: '/finance', label: 'Keuangan', icon: DollarSign },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-primary-700 to-primary-800 text-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary-600">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sheep size={28} />
            RansumNusa
          </h1>
          <p className="text-sm text-primary-200 mt-1">Manajemen Peternakan Domba</p>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-600 shadow-lg'
                    : 'hover:bg-primary-600 text-primary-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-primary-600 rounded-lg text-sm">
          <p className="text-primary-100">
            © 2024 RansumNusa App<br/>
            Manajemen Peternakan Domba
          </p>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

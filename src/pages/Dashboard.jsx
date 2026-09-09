import { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle, Users } from 'lucide-react'
import { useStore } from '@/store'
import { formatCurrency, calculateTotalExpense, calculateTotalIncome } from '@/utils/helpers'

export default function Dashboard() {
  const { sheep, feeds, finances, healthRecords, feedingRecords } = useStore()

  const stats = useMemo(() => {
    const totalSheep = sheep.length
    const activeSheep = sheep.filter(s => s.status === 'available').length
    const totalExpense = calculateTotalExpense(finances)
    const totalIncome = calculateTotalIncome(finances)
    const profit = totalIncome - totalExpense
    const sickSheep = healthRecords.filter(h => h.status === 'sick').length

    return {
      totalSheep,
      activeSheep,
      totalExpense,
      totalIncome,
      profit,
      sickSheep,
    }
  }, [sheep, finances, healthRecords])

  // Monthly Finance Data
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const currentYear = new Date().getFullYear()
    
    return months.map((month, index) => {
      const monthFinances = finances.filter(f => {
        const date = new Date(f.date)
        return date.getMonth() === index && date.getFullYear() === currentYear
      })
      
      const income = monthFinances
        .filter(f => f.type === 'income')
        .reduce((sum, f) => sum + f.amount, 0)
      
      const expense = monthFinances
        .filter(f => f.type === 'expense')
        .reduce((sum, f) => sum + f.amount, 0)

      return {
        month,
        Pemasukan: income,
        Pengeluaran: expense,
      }
    })
  }, [finances])

  // Sheep Status Distribution
  const sheepStatusData = useMemo(() => {
    const statusCounts = {}
    sheep.forEach(s => {
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1
    })
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }, [sheep])

  const COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Selamat datang di RansumNusa App - Manajemen Peternakan Domba</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Domba */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Domba</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalSheep}</p>
              <p className="text-xs text-gray-500 mt-2">{stats.activeSheep} domba aktif</p>
            </div>
            <Users size={32} className="text-blue-600 opacity-20" />
          </div>
        </div>

        {/* Total Pemasukan */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats.totalIncome)}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> Tahun ini
              </p>
            </div>
            <TrendingUp size={32} className="text-green-600 opacity-20" />
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats.totalExpense)}</p>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <TrendingDown size={14} /> Tahun ini
              </p>
            </div>
            <TrendingDown size={32} className="text-red-600 opacity-20" />
          </div>
        </div>

        {/* Profit/Loss */}
        <div className={`card bg-gradient-to-br ${stats.profit >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit/Rugi</p>
              <p className={`text-2xl font-bold mt-2 ${stats.profit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                {formatCurrency(stats.profit)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Pendapatan bersih</p>
            </div>
            <div className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
              {stats.profit >= 0 ? '+' : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.sickSheep > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">Domba Sakit</p>
            <p className="text-sm text-yellow-700">Terdapat {stats.sickSheep} domba yang memerlukan perhatian kesehatan</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance Chart */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Grafik Keuangan Bulanan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="Pemasukan" fill="#16a34a" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sheep Status Chart */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Status Domba</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sheepStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sheepStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Feeding Records */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pemberian Pakan Terbaru</h2>
          {feedingRecords.length > 0 ? (
            <div className="space-y-3">
              {feedingRecords.slice(-5).reverse().map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{record.feedName}</p>
                    <p className="text-sm text-gray-600">{record.quantity} kg</p>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('id-ID')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-6">Belum ada data pemberian pakan</p>
          )}
        </div>

        {/* Inventory Status */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Status Stok Pakan</h2>
          {feeds.length > 0 ? (
            <div className="space-y-3">
              {feeds.slice(0, 5).map((feed) => (
                <div key={feed.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{feed.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${Math.min((feed.quantity / feed.maxStock) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 ml-3">{feed.quantity} kg</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-6">Belum ada data pakan</p>
          )}
        </div>
      </div>
    </div>
  )
}

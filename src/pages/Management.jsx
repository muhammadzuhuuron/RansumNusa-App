import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Eye, AlertCircle, Activity, Users, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useStore } from '@/store'
import toast from 'react-hot-toast'

const TABS = {
  DASHBOARD: 'dashboard',
  SHEEP: 'sheep',
  FEED: 'feed',
  FINANCE: 'finance',
  HEALTH: 'health',
  FEEDING: 'feeding',
}

const SHEEP_STATUS = [
  { value: 'available', label: 'Tersedia', color: 'bg-green-100 text-green-800' },
  { value: 'sold', label: 'Terjual', color: 'bg-red-100 text-red-800' },
  { value: 'sick', label: 'Sakit', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'breeding', label: 'Breeding', color: 'bg-blue-100 text-blue-800' },
]

const HEALTH_STATUS = [
  { value: 'sick', label: 'Sakit', color: 'bg-red-100 text-red-800' },
  { value: 'recovering', label: 'Pulih Sebagian', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'recovered', label: 'Pulih', color: 'bg-green-100 text-green-800' },
  { value: 'dead', label: 'Mati', color: 'bg-gray-100 text-gray-800' },
]

const FEED_TYPE = [
  { value: 'concentrate', label: 'Konsentrat' },
  { value: 'forage', label: 'Hijauan' },
  { value: 'supplement', label: 'Suplemen' },
  { value: 'other', label: 'Lainnya' },
]

const FINANCE_TYPE = [
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
]

const HEALTH_RECORD_TYPE = [
  { value: 'illness', label: 'Penyakit' },
  { value: 'injury', label: 'Cedera' },
  { value: 'vaccination', label: 'Vaksinasi' },
  { value: 'checkup', label: 'Pemeriksaan' },
]

export default function Management() {
  const { 
    sheep, addSheep, updateSheep, deleteSheep,
    feeds, addFeed, updateFeed, deleteFeed,
    finances, addFinance, updateFinance, deleteFinance,
    healthRecords, addHealthRecord, updateHealthRecord, deleteHealthRecord,
    feedingRecords, addFeedingRecord, updateFeedingRecord, deleteFeedingRecord,
  } = useStore()

  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleSave = (data) => {
    switch (activeTab) {
      case TABS.SHEEP:
        if (editingItem) updateSheep(editingItem.id, data)
        else addSheep(data)
        toast.success(editingItem ? 'Domba diperbarui' : 'Domba ditambahkan')
        break
      case TABS.FEED:
        if (editingItem) updateFeed(editingItem.id, data)
        else addFeed(data)
        toast.success(editingItem ? 'Pakan diperbarui' : 'Pakan ditambahkan')
        break
      case TABS.FINANCE:
        if (editingItem) updateFinance(editingItem.id, data)
        else addFinance(data)
        toast.success(editingItem ? 'Transaksi diperbarui' : 'Transaksi ditambahkan')
        break
      case TABS.HEALTH:
        if (editingItem) updateHealthRecord(editingItem.id, data)
        else addHealthRecord(data)
        toast.success(editingItem ? 'Rekam medis diperbarui' : 'Rekam medis ditambahkan')
        break
      case TABS.FEEDING:
        if (editingItem) updateFeedingRecord(editingItem.id, data)
        else addFeedingRecord(data)
        toast.success(editingItem ? 'Rekam pakan diperbarui' : 'Rekam pakan ditambahkan')
        break
    }
    handleCloseModal()
  }

  const handleDelete = (id) => {
    if (!window.confirm('Apakah Anda yakin?')) return
    
    switch (activeTab) {
      case TABS.SHEEP:
        deleteSheep(id)
        break
      case TABS.FEED:
        deleteFeed(id)
        break
      case TABS.FINANCE:
        deleteFinance(id)
        break
      case TABS.HEALTH:
        deleteHealthRecord(id)
        break
      case TABS.FEEDING:
        deleteFeedingRecord(id)
        break
    }
    toast.success('Data dihapus')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // ===== DASHBOARD =====
  const renderDashboard = () => {
    const totalSheep = sheep.length
    const activeSheep = sheep.filter(s => s.status === 'available').length
    const totalExpense = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0)
    const totalIncome = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0)
    const profit = totalIncome - totalExpense
    const sickSheep = healthRecords.filter(h => h.status === 'sick').length

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const currentYear = new Date().getFullYear()
    
    const monthlyData = months.map((month, index) => {
      const monthFinances = finances.filter(f => {
        const date = new Date(f.date)
        return date.getMonth() === index && date.getFullYear() === currentYear
      })
      
      const income = monthFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0)
      const expense = monthFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0)

      return { month, Pemasukan: income, Pengeluaran: expense }
    })

    const sheepStatusData = Object.values(SHEEP_STATUS).map(status => ({
      name: status.label,
      value: sheep.filter(s => s.status === status.value).length,
    }))

    const COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444']

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Domba</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{totalSheep}</p>
                <p className="text-xs text-gray-500 mt-2">{activeSheep} domba aktif</p>
              </div>
              <Users size={32} className="text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalIncome)}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <TrendingUp size={14} /> Tahun ini
                </p>
              </div>
              <TrendingUp size={32} className="text-green-600 opacity-20" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalExpense)}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <TrendingDown size={14} /> Tahun ini
                </p>
              </div>
              <TrendingDown size={32} className="text-red-600 opacity-20" />
            </div>
          </div>

          <div className={`card bg-gradient-to-br ${profit >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit/Rugi</p>
                <p className={`text-2xl font-bold mt-2 ${profit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {formatCurrency(profit)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Pendapatan bersih</p>
              </div>
            </div>
          </div>
        </div>

        {sickSheep > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Domba Sakit</p>
              <p className="text-sm text-yellow-700">Terdapat {sickSheep} domba yang memerlukan perhatian kesehatan</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Grafik Keuangan Bulanan</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                <Legend />
                <Bar dataKey="Pemasukan" fill="#16a34a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

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
      </div>
    )
  }

  // ===== SHEEP =====
  const renderSheep = () => {
    const filtered = sheep.filter(s => {
      const matchesSearch = 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.breed.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !filters.status || s.status === filters.status
      return matchesSearch && matchesStatus
    })

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID atau ras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? null : e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Semua Status</option>
            {SHEEP_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="card overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Ras</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Jenis Kelamin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Umur</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(item => {
                  const statusObj = SHEEP_STATUS.find(s => s.value === item.status)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{item.id}</td>
                      <td className="px-6 py-4">{item.breed}</td>
                      <td className="px-6 py-4">{item.gender === 'male' ? 'Jantan' : 'Betina'}</td>
                      <td className="px-6 py-4">{item.age} bulan</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusObj?.color}`}>
                          {statusObj?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(item); setIsModalOpen(true) }} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">Tidak ada data</div>
          )}
        </div>
      </div>
    )
  }

  // ===== FEED =====
  const renderFeed = () => {
    const filtered = feeds.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = !filters.type || f.type === filters.type
      return matchesSearch && matchesType
    })

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama pakan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={filters.type || 'all'}
            onChange={(e) => setFilters({ ...filters, type: e.target.value === 'all' ? null : e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Semua Jenis</option>
            {FEED_TYPE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="card overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Nama</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Jenis</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Stok</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Harga/kg</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(item => {
                  const typeObj = FEED_TYPE.find(t => t.value === item.type)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4">{typeObj?.label}</td>
                      <td className="px-6 py-4">{item.quantity.toFixed(1)} kg</td>
                      <td className="px-6 py-4">{formatCurrency(item.price)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(item); setIsModalOpen(true) }} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">Tidak ada data</div>
          )}
        </div>
      </div>
    )
  }

  // ===== FINANCE =====
  const renderFinance = () => {
    const filtered = finances.filter(f => {
      const matchesSearch = f.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = !filters.type || f.type === filters.type
      return matchesSearch && matchesType
    })

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={filters.type || 'all'}
            onChange={(e) => setFilters({ ...filters, type: e.target.value === 'all' ? null : e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Semua Jenis</option>
            {FINANCE_TYPE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="card overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tanggal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Jenis</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Kategori</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Jumlah</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => {
                  const typeObj = FINANCE_TYPE.find(t => t.value === item.type)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${item.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {typeObj?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.category}</td>
                      <td className="px-6 py-4 font-bold">{formatCurrency(item.amount)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(item); setIsModalOpen(true) }} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">Tidak ada data</div>
          )}
        </div>
      </div>
    )
  }

  // ===== HEALTH =====
  const renderHealth = () => {
    const filtered = healthRecords.filter(h => {
      const matchesSearch = h.sheepId.toLowerCase().includes(searchTerm.toLowerCase()) || h.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !filters.status || h.status === filters.status
      return matchesSearch && matchesStatus
    })

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID domba atau diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? null : e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Semua Status</option>
            {HEALTH_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="card overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tanggal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">ID Domba</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => {
                  const statusObj = HEALTH_STATUS.find(s => s.value === item.status)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 font-medium">{item.sheepId}</td>
                      <td className="px-6 py-4">{item.diagnosis}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusObj?.color}`}>
                          {statusObj?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(item); setIsModalOpen(true) }} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">Tidak ada data</div>
          )}
        </div>
      </div>
    )
  }

  // ===== FEEDING =====
  const renderFeeding = () => {
    const filtered = feedingRecords.filter(f => {
      const matchesSearch = f.sheepId.toLowerCase().includes(searchTerm.toLowerCase()) || f.feedName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFeed = !filters.feed || f.feedName === filters.feed
      return matchesSearch && matchesFeed
    })

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID domba atau pakan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={filters.feed || 'all'}
            onChange={(e) => setFilters({ ...filters, feed: e.target.value === 'all' ? null : e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Semua Pakan</option>
            {[...new Set(feedingRecords.map(r => r.feedName))].map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="card overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tanggal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">ID Domba</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Pakan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Jumlah</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 font-medium">{item.sheepId}</td>
                    <td className="px-6 py-4">{item.feedName}</td>
                    <td className="px-6 py-4">{item.quantity} kg</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true) }} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">Tidak ada data</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Peternakan</h1>
          <p className="text-gray-600 mt-2">Kelola semua aspek peternakan domba Anda</p>
        </div>
        {activeTab !== TABS.DASHBOARD && (
          <button
            onClick={() => {
              setEditingItem(null)
              setIsModalOpen(true)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Tambah Data
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-8 min-w-max">
          {Object.entries(TABS).map(([key, value]) => (
            <button
              key={value}
              onClick={() => {
                setActiveTab(value)
                setSearchTerm('')
                setFilters({})
              }}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === value
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === TABS.DASHBOARD && renderDashboard()}
        {activeTab === TABS.SHEEP && renderSheep()}
        {activeTab === TABS.FEED && renderFeed()}
        {activeTab === TABS.FINANCE && renderFinance()}
        {activeTab === TABS.HEALTH && renderHealth()}
        {activeTab === TABS.FEEDING && renderFeeding()}
      </div>

      {/* Modal - Implementasi sesuai kebutuhan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Data' : 'Tambah Data'}
            </h2>
            <p className="text-gray-600 mb-4">Form untuk {activeTab} akan ditampilkan di sini</p>
            <div className="flex gap-2">
              <button onClick={handleCloseModal} className="flex-1 btn">Batal</button>
              <button onClick={() => {
                handleSave({})
              }} className="flex-1 btn btn-primary">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

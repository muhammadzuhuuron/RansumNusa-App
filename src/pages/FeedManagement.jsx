import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { useStore } from '@/store'
import toast from 'react-hot-toast'
import FeedModal from '@/components/modals/FeedModal'

export default function FeedManagement() {
  const { feeds, addFeed, updateFeed, deleteFeed } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFeed, setEditingFeed] = useState(null)

  // Filter and search feeds
  const filteredFeeds = useMemo(() => {
    return feeds.filter(f => {
      const matchesSearch = 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.type.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === 'all' || f.type === filterType
      
      return matchesSearch && matchesType
    })
  }, [feeds, searchTerm, filterType])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalQuantity = feeds.reduce((sum, f) => sum + f.quantity, 0)
    const lowStockFeeds = feeds.filter(f => f.quantity <= f.minStock)
    const averagePrice = feeds.length > 0 
      ? feeds.reduce((sum, f) => sum + f.price, 0) / feeds.length 
      : 0

    return {
      totalFeeds: feeds.length,
      totalQuantity,
      lowStockFeeds: lowStockFeeds.length,
      averagePrice,
    }
  }, [feeds])

  const handleAddFeed = (data) => {
    addFeed(data)
    setIsModalOpen(false)
    toast.success('Pakan berhasil ditambahkan')
  }

  const handleUpdateFeed = (data) => {
    updateFeed(editingFeed.id, data)
    setIsModalOpen(false)
    setEditingFeed(null)
    toast.success('Pakan berhasil diperbarui')
  }

  const handleDeleteFeed = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pakan ini?')) {
      deleteFeed(id)
      toast.success('Pakan berhasil dihapus')
    }
  }

  const handleEditClick = (f) => {
    setEditingFeed(f)
    setIsModalOpen(true)
  }

  const getStockStatus = (quantity, minStock, maxStock) => {
    if (quantity <= minStock) {
      return { status: 'low', color: 'bg-red-100 text-red-800', label: 'Stok Rendah' }
    }
    if (quantity >= maxStock) {
      return { status: 'high', color: 'bg-yellow-100 text-yellow-800', label: 'Stok Penuh' }
    }
    return { status: 'normal', color: 'bg-green-100 text-green-800', label: 'Normal' }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pakan</h1>
          <p className="text-gray-600 mt-2">Total: {stats.totalFeeds} jenis pakan</p>
        </div>
        <button
          onClick={() => {
            setEditingFeed(null)
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Tambah Pakan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm font-medium text-gray-600">Total Jenis Pakan</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalFeeds}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm font-medium text-gray-600">Total Stok</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalQuantity.toFixed(1)} kg</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStockFeeds}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-sm font-medium text-gray-600">Harga Rata-rata</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(stats.averagePrice)}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockFeeds > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-600" />
          <div>
            <p className="font-medium text-red-900">Peringatan Stok Rendah</p>
            <p className="text-sm text-red-700">Terdapat {stats.lowStockFeeds} jenis pakan dengan stok rendah</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama pakan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Semua Jenis</option>
              <option value="concentrate">Konsentrat</option>
              <option value="forage">Hijauan</option>
              <option value="supplement">Suplemen</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filteredFeeds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama Pakan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jenis</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stok</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Harga/kg</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Nilai</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFeeds.map((feed) => {
                  const stockStatus = getStockStatus(feed.quantity, feed.minStock, feed.maxStock)
                  const totalValue = feed.quantity * feed.price
                  const stockPercentage = (feed.quantity / feed.maxStock) * 100

                  return (
                    <tr key={feed.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{feed.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {feed.type === 'concentrate' && 'Konsentrat'}
                        {feed.type === 'forage' && 'Hijauan'}
                        {feed.type === 'supplement' && 'Suplemen'}
                        {feed.type === 'other' && 'Lainnya'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{feed.quantity.toFixed(1)} kg</p>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition ${
                                stockStatus.status === 'low' ? 'bg-red-500' :
                                stockStatus.status === 'high' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">Min: {feed.minStock} kg | Max: {feed.maxStock} kg</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(feed.price)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(totalValue)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(feed)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition text-primary-600"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteFeed(feed.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition text-red-600"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Belum ada data pakan</p>
            <button
              onClick={() => {
                setEditingFeed(null)
                setIsModalOpen(true)
              }}
              className="mt-4 btn btn-primary"
            >
              Tambah Pakan Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <FeedModal
          feed={editingFeed}
          onClose={() => {
            setIsModalOpen(false)
            setEditingFeed(null)
          }}
          onSubmit={editingFeed ? handleUpdateFeed : handleAddFeed}
        />
      )}
    </div>
  )
}

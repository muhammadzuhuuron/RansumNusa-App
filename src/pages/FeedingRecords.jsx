import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, TrendingUp } from 'lucide-react'
import { useStore } from '@/store'
import toast from 'react-hot-toast'
import FeedingRecordModal from '@/components/modals/FeedingRecordModal'

export default function FeedingRecords() {
  const { feedingRecords, sheep, feeds, addFeedingRecord, updateFeedingRecord, deleteFeedingRecord } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFeed, setFilterFeed] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('7days')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  // Filter feeding records based on date range
  const getDateRangeFilter = (days) => {
    const now = new Date()
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return past
  }

  const filteredRecords = useMemo(() => {
    const dateLimit = filterDateRange === '7days' ? 7 :
                     filterDateRange === '30days' ? 30 :
                     filterDateRange === '90days' ? 90 : 365
    
    const cutoffDate = getDateRangeFilter(dateLimit)

    return feedingRecords.filter(record => {
      const recordDate = new Date(record.date)
      const matchesDate = recordDate >= cutoffDate
      const matchesSearch = 
        record.sheepId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.feedName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFeed = filterFeed === 'all' || record.feedName === filterFeed
      
      return matchesDate && matchesSearch && matchesFeed
    })
  }, [feedingRecords, searchTerm, filterFeed, filterDateRange])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRecords = filteredRecords.length
    const totalQuantity = filteredRecords.reduce((sum, r) => sum + r.quantity, 0)
    const averageQuantity = totalRecords > 0 ? totalQuantity / totalRecords : 0
    
    // Cost calculation
    const totalCost = filteredRecords.reduce((sum, record) => {
      const feed = feeds.find(f => f.name === record.feedName)
      return sum + (feed ? record.quantity * feed.price : 0)
    }, 0)

    return {
      totalRecords,
      totalQuantity: totalQuantity.toFixed(2),
      averageQuantity: averageQuantity.toFixed(2),
      totalCost: totalCost.toFixed(2),
    }
  }, [filteredRecords, feeds])

  // Feed distribution
  const feedDistribution = useMemo(() => {
    const distribution = {}
    filteredRecords.forEach(record => {
      distribution[record.feedName] = (distribution[record.feedName] || 0) + record.quantity
    })
    return Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [filteredRecords])

  const handleAddRecord = (data) => {
    addFeedingRecord(data)
    setIsModalOpen(false)
    toast.success('Rekam pemberian pakan berhasil ditambahkan')
  }

  const handleUpdateRecord = (data) => {
    updateFeedingRecord(editingRecord.id, data)
    setIsModalOpen(false)
    setEditingRecord(null)
    toast.success('Rekam pemberian pakan berhasil diperbarui')
  }

  const handleDeleteRecord = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus rekam ini?')) {
      deleteFeedingRecord(id)
      toast.success('Rekam pemberian pakan berhasil dihapus')
    }
  }

  const handleEditClick = (record) => {
    setEditingRecord(record)
    setIsModalOpen(true)
  }

  const getSheepInfo = (sheepId) => {
    const s = sheep.find(s => s.id === sheepId)
    return s ? `${s.id} (${s.breed})` : sheepId
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Get all unique feed names for filter
  const uniqueFeeds = useMemo(() => {
    return [...new Set(feedingRecords.map(r => r.feedName))].sort()
  }, [feedingRecords])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rekam Pemberian Pakan</h1>
          <p className="text-gray-600 mt-2">Pantau dan kelola jadwal pemberian pakan domba</p>
        </div>
        <button
          onClick={() => {
            setEditingRecord(null)
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Tambah Rekam Pakan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm font-medium text-gray-600">Total Pemberian</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalRecords}</p>
          <p className="text-xs text-gray-500 mt-2">Dalam periode terpilih</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm font-medium text-gray-600">Total Pakan</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalQuantity} kg</p>
          <p className="text-xs text-gray-500 mt-2">Rata-rata: {stats.averageQuantity} kg</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <p className="text-sm font-medium text-gray-600">Total Biaya Pakan</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(stats.totalCost)}</p>
          <p className="text-xs text-gray-500 mt-2">Periode terpilih</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jenis Pakan</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{uniqueFeeds.length}</p>
            </div>
            <TrendingUp size={32} className="text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Feed Distribution */}
      {feedDistribution.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Distribusi Pakan</h2>
          <div className="space-y-3">
            {feedDistribution.map(([feedName, quantity]) => {
              const percentage = (quantity / parseFloat(stats.totalQuantity)) * 100
              return (
                <div key={feedName} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{feedName}</span>
                    <span className="text-sm text-gray-600">{quantity.toFixed(1)} kg ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
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
              placeholder="Cari ID domba atau nama pakan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="90days">90 Hari Terakhir</option>
              <option value="1year">1 Tahun Terakhir</option>
            </select>
          </div>

          {/* Feed Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterFeed}
              onChange={(e) => setFilterFeed(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Semua Pakan</option>
              {uniqueFeeds.map(feed => (
                <option key={feed} value={feed}>{feed}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card overflow-hidden">
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID Domba</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama Pakan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jumlah</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Harga/kg</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Biaya</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Catatan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record) => {
                    const feed = feeds.find(f => f.name === record.feedName)
                    const pricePerKg = feed ? feed.price : 0
                    const totalCost = record.quantity * pricePerKg

                    return (
                      <tr key={record.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {getSheepInfo(record.sheepId)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.feedName}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.quantity} kg</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(pricePerKg)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {formatCurrency(totalCost)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          {record.notes ? (
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                              {record.notes}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(record)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition text-primary-600"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
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
            <p className="text-gray-600">Belum ada rekam pemberian pakan</p>
            <button
              onClick={() => {
                setEditingRecord(null)
                setIsModalOpen(true)
              }}
              className="mt-4 btn btn-primary"
            >
              Tambah Rekam Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <FeedingRecordModal
          record={editingRecord}
          onClose={() => {
            setIsModalOpen(false)
            setEditingRecord(null)
          }}
          onSubmit={editingRecord ? handleUpdateRecord : handleAddRecord}
        />
      )}
    </div>
  )
}

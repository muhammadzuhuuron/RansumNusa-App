import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react'
import { useStore } from '@/store'
import toast from 'react-hot-toast'
import SheepModal from '@/components/modals/SheepModal'
import SheepDetailModal from '@/components/modals/SheepDetailModal'

export default function SheepManagement() {
  const { sheep, addSheep, updateSheep, deleteSheep } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedSheep, setSelectedSheep] = useState(null)
  const [editingSheep, setEditingSheep] = useState(null)

  // Filter and search sheep
  const filteredSheep = useMemo(() => {
    return sheep.filter(s => {
      const matchesSearch = 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.gender.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
  }, [sheep, searchTerm, filterStatus])

  const handleAddSheep = (data) => {
    addSheep(data)
    setIsModalOpen(false)
    toast.success('Domba berhasil ditambahkan')
  }

  const handleUpdateSheep = (data) => {
    updateSheep(editingSheep.id, data)
    setIsModalOpen(false)
    setEditingSheep(null)
    toast.success('Domba berhasil diperbarui')
  }

  const handleDeleteSheep = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus domba ini?')) {
      deleteSheep(id)
      toast.success('Domba berhasil dihapus')
    }
  }

  const handleEditClick = (s) => {
    setEditingSheep(s)
    setIsModalOpen(true)
  }

  const handleViewDetail = (s) => {
    setSelectedSheep(s)
    setIsDetailModalOpen(true)
  }

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-red-100 text-red-800',
      sick: 'bg-yellow-100 text-yellow-800',
      breeding: 'bg-blue-100 text-blue-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getGenderBadge = (gender) => {
    return gender === 'male' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-pink-100 text-pink-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Domba</h1>
          <p className="text-gray-600 mt-2">Total: {filteredSheep.length} domba</p>
        </div>
        <button
          onClick={() => {
            setEditingSheep(null)
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Tambah Domba
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID, ras, atau jenis kelamin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Semua Status</option>
              <option value="available">Tersedia</option>
              <option value="sold">Terjual</option>
              <option value="sick">Sakit</option>
              <option value="breeding">Breeding</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filteredSheep.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID Domba</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ras</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jenis Kelamin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Umur</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Berat</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal Masuk</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSheep.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.breed}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getGenderBadge(s.gender)}`}>
                        {s.gender === 'male' ? 'Jantan' : 'Betina'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.age} bulan</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.weight} kg</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(s.status)}`}>
                        {s.status === 'available' && 'Tersedia'}
                        {s.status === 'sold' && 'Terjual'}
                        {s.status === 'sick' && 'Sakit'}
                        {s.status === 'breeding' && 'Breeding'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(s.purchaseDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(s)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditClick(s)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition text-primary-600"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSheep(s.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition text-red-600"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Belum ada data domba</p>
            <button
              onClick={() => {
                setEditingSheep(null)
                setIsModalOpen(true)
              }}
              className="mt-4 btn btn-primary"
            >
              Tambah Domba Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <SheepModal
          sheep={editingSheep}
          onClose={() => {
            setIsModalOpen(false)
            setEditingSheep(null)
          }}
          onSubmit={editingSheep ? handleUpdateSheep : handleAddSheep}
        />
      )}

      {isDetailModalOpen && selectedSheep && (
        <SheepDetailModal
          sheep={selectedSheep}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedSheep(null)
          }}
        />
      )}
    </div>
  )
}

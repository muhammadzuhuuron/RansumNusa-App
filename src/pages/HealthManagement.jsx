import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, AlertCircle, Activity } from 'lucide-react'
import { useStore } from '@/store'
import toast from 'react-hot-toast'
import HealthModal from '@/components/modals/HealthModal'

export default function HealthManagement() {
  const { healthRecords, sheep, addHealthRecord, updateHealthRecord, deleteHealthRecord } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  // Filter health records
  const filteredRecords = useMemo(() => {
    return healthRecords.filter(record => {
      const matchesSearch = 
        record.sheepId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.treatment.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus
      const matchesType = filterType === 'all' || record.type === filterType
      
      return matchesSearch && matchesStatus && matchesType
    })
  }, [healthRecords, searchTerm, filterStatus, filterType])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRecords = healthRecords.length
    const sickSheep = healthRecords.filter(r => r.status === 'sick').length
    const recoveredSheep = healthRecords.filter(r => r.status === 'recovered').length
    const deadSheep = healthRecords.filter(r => r.status === 'dead').length
    
    // Get unique sick sheep
    const uniqueSickSheepIds = new Set(
      healthRecords.filter(r => r.status === 'sick').map(r => r.sheepId)
    )

    return {
      totalRecords,
      sickSheep: uniqueSickSheepIds.size,
      recoveredSheep,
      deadSheep,
    }
  }, [healthRecords])

  // Disease frequency
  const diseaseFrequency = useMemo(() => {
    const diseases = {}
    healthRecords.forEach(record => {
      diseases[record.diagnosis] = (diseases[record.diagnosis] || 0) + 1
    })
    return Object.entries(diseases)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [healthRecords])

  const handleAddRecord = (data) => {
    addHealthRecord(data)
    setIsModalOpen(false)
    toast.success('Rekam medis berhasil ditambahkan')
  }

  const handleUpdateRecord = (data) => {
    updateHealthRecord(editingRecord.id, data)
    setIsModalOpen(false)
    setEditingRecord(null)
    toast.success('Rekam medis berhasil diperbarui')
  }

  const handleDeleteRecord = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus rekam medis ini?')) {
      deleteHealthRecord(id)
      toast.success('Rekam medis berhasil dihapus')
    }
  }

  const handleEditClick = (record) => {
    setEditingRecord(record)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status) => {
    const styles = {
      sick: 'bg-red-100 text-red-800',
      recovering: 'bg-yellow-100 text-yellow-800',
      recovered: 'bg-green-100 text-green-800',
      dead: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      sick: 'Sakit',
      recovering: 'Pulih Sebagian',
      recovered: 'Pulih',
      dead: 'Mati',
    }
    return labels[status] || status
  }

  const getSheepName = (sheepId) => {
    const s = sheep.find(s => s.id === sheepId)
    return s ? `${s.id} (${s.breed})` : sheepId
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Kesehatan</h1>
          <p className="text-gray-600 mt-2">Pantau kesehatan dan rekam medis domba</p>
        </div>
        <button
          onClick={() => {
            setEditingRecord(null)
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Tambah Rekam Medis
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rekam Medis</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalRecords}</p>
            </div>
            <Activity size={32} className="text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <p className="text-sm font-medium text-gray-600">Domba Sakit</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.sickSheep}</p>
          <p className="text-xs text-gray-500 mt-2">Membutuhkan perhatian</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm font-medium text-gray-600">Domba Pulih</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.recoveredSheep}</p>
          <p className="text-xs text-gray-500 mt-2">Sudah sembuh</p>
        </div>

        <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <p className="text-sm font-medium text-gray-600">Domba Mati</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{stats.deadSheep}</p>
          <p className="text-xs text-gray-500 mt-2">Catatan penting</p>
        </div>
      </div>

      {/* Health Alert */}
      {stats.sickSheep > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <div>
            <p className="font-medium text-red-900">Peringatan Kesehatan</p>
            <p className="text-sm text-red-700">Terdapat {stats.sickSheep} domba yang sedang sakit dan membutuhkan perhatian medis</p>
          </div>
        </div>
      )}

      {/* Disease Frequency */}
      {diseaseFrequency.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Penyakit yang Paling Sering Terjadi</h2>
          <div className="space-y-3">
            {diseaseFrequency.map(([disease, count]) => (
              <div key={disease} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{disease}</span>
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {count} kasus
                </span>
              </div>
            ))}
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
              placeholder="Cari ID domba, diagnosis, atau treatment..."
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
              <option value="sick">Sakit</option>
              <option value="recovering">Pulih Sebagian</option>
              <option value="recovered">Pulih</option>
              <option value="dead">Mati</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Semua Jenis</option>
              <option value="illness">Penyakit</option>
              <option value="injury">Cedera</option>
              <option value="vaccination">Vaksinasi</option>
              <option value="checkup">Pemeriksaan</option>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID Domba</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jenis</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Treatment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dokter Hewan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {getSheepName(record.sheepId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.type === 'illness' && 'Penyakit'}
                        {record.type === 'injury' && 'Cedera'}
                        {record.type === 'vaccination' && 'Vaksinasi'}
                        {record.type === 'checkup' && 'Pemeriksaan'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.diagnosis}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.treatment}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                          {getStatusLabel(record.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.veterinarian || '-'}</td>
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
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Belum ada rekam medis</p>
            <button
              onClick={() => {
                setEditingRecord(null)
                setIsModalOpen(true)
              }}
              className="mt-4 btn btn-primary"
            >
              Tambah Rekam Medis Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <HealthModal
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

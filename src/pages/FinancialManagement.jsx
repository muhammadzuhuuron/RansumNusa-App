import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useStore } from '@/store'
import toast from 'react-hot-toast'
import FinanceModal from '@/components/modals/FinanceModal'

export default function FinancialManagement() {
  const { finances, addFinance, updateFinance, deleteFinance } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFinance, setEditingFinance] = useState(null)

  // Filter finances
  const filteredFinances = useMemo(() => {
    return finances.filter(f => {
      const matchesSearch = 
        f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === 'all' || f.type === filterType
      
      const financeMonth = f.date.slice(0, 7)
      const matchesMonth = financeMonth === filterMonth

      return matchesSearch && matchesType && matchesMonth
    })
  }, [finances, searchTerm, filterType, filterMonth])

  // Calculate statistics
  const stats = useMemo(() => {
    const income = filteredFinances
      .filter(f => f.type === 'income')
      .reduce((sum, f) => sum + f.amount, 0)
    
    const expense = filteredFinances
      .filter(f => f.type === 'expense')
      .reduce((sum, f) => sum + f.amount, 0)

    const profit = income - expense

    // Year statistics
    const currentYear = new Date().getFullYear()
    const yearFinances = finances.filter(f => new Date(f.date).getFullYear() === currentYear)
    const yearIncome = yearFinances
      .filter(f => f.type === 'income')
      .reduce((sum, f) => sum + f.amount, 0)
    const yearExpense = yearFinances
      .filter(f => f.type === 'expense')
      .reduce((sum, f) => sum + f.amount, 0)

    return {
      income,
      expense,
      profit,
      yearIncome,
      yearExpense,
      yearProfit: yearIncome - yearExpense,
    }
  }, [filteredFinances, finances])

  const handleAddFinance = (data) => {
    addFinance(data)
    setIsModalOpen(false)
    toast.success('Data keuangan berhasil ditambahkan')
  }

  const handleUpdateFinance = (data) => {
    updateFinance(editingFinance.id, data)
    setIsModalOpen(false)
    setEditingFinance(null)
    toast.success('Data keuangan berhasil diperbarui')
  }

  const handleDeleteFinance = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      deleteFinance(id)
      toast.success('Data keuangan berhasil dihapus')
    }
  }

  const handleEditClick = (f) => {
    setEditingFinance(f)
    setIsModalOpen(true)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getMonthName = (dateString) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const date = new Date(dateString)
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // Expense categories summary
  const expensesByCategory = useMemo(() => {
    const categories = {}
    filteredFinances
      .filter(f => f.type === 'expense')
      .forEach(f => {
        categories[f.category] = (categories[f.category] || 0) + f.amount
      })
    return categories
  }, [filteredFinances])

  // Income categories summary
  const incomeByCategory = useMemo(() => {
    const categories = {}
    filteredFinances
      .filter(f => f.type === 'income')
      .forEach(f => {
        categories[f.category] = (categories[f.category] || 0) + f.amount
      })
    return categories
  }, [filteredFinances])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Keuangan</h1>
          <p className="text-gray-600 mt-2">Kelola pemasukan dan pengeluaran peternakan</p>
        </div>
        <button
          onClick={() => {
            setEditingFinance(null)
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Tambah Transaksi
        </button>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pemasukan Bulan Ini</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats.income)}</p>
            </div>
            <TrendingUp size={32} className="text-green-600 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pengeluaran Bulan Ini</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats.expense)}</p>
            </div>
            <TrendingDown size={32} className="text-red-600 opacity-20" />
          </div>
        </div>

        <div className={`card bg-gradient-to-br ${stats.profit >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit/Rugi Bulan Ini</p>
              <p className={`text-2xl font-bold mt-2 ${stats.profit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                {formatCurrency(stats.profit)}
              </p>
            </div>
            <div className={`text-4xl font-bold ${stats.profit >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
              {stats.profit >= 0 ? '+' : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-gray-600">Total Pemasukan Tahun Ini</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(stats.yearIncome)}</p>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-sm font-medium text-gray-600">Total Pengeluaran Tahun Ini</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{formatCurrency(stats.yearExpense)}</p>
        </div>

        <div className={`card bg-purple-50 border-purple-200`}>
          <p className="text-sm font-medium text-gray-600">Total Profit/Rugi Tahun Ini</p>
          <p className={`text-2xl font-bold mt-2 ${stats.yearProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
            {formatCurrency(stats.yearProfit)}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by Category */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pemasukan Berdasarkan Kategori</h2>
          {Object.keys(incomeByCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-6">Belum ada data pemasukan</p>
          )}
        </div>

        {/* Expense by Category */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pengeluaran Berdasarkan Kategori</h2>
          {Object.keys(expensesByCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="font-bold text-red-600">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-6">Belum ada data pengeluaran</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">{getMonthName(filterMonth)}</span>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Semua Jenis</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cari deskripsi atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        {filteredFinances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jenis</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kategori</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jumlah</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFinances
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((finance) => (
                    <tr key={finance.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(finance.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          finance.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {finance.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{finance.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{finance.description}</td>
                      <td className="px-6 py-4 text-sm font-bold">
                        <span className={finance.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {finance.type === 'income' ? '+' : '-'}{formatCurrency(finance.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(finance)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition text-primary-600"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteFinance(finance.id)}
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
            <p className="text-gray-600">Belum ada data transaksi untuk periode ini</p>
            <button
              onClick={() => {
                setEditingFinance(null)
                setIsModalOpen(true)
              }}
              className="mt-4 btn btn-primary"
            >
              Tambah Transaksi Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <FinanceModal
          finance={editingFinance}
          onClose={() => {
            setIsModalOpen(false)
            setEditingFinance(null)
          }}
          onSubmit={editingFinance ? handleUpdateFinance : handleAddFinance}
        />
      )}
    </div>
  )
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const calculateAge = (birthDate) => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export const calculateTotalExpense = (finances) => {
  return finances
    .filter((f) => f.type === 'expense')
    .reduce((total, f) => total + f.amount, 0)
}

export const calculateTotalIncome = (finances) => {
  return finances
    .filter((f) => f.type === 'income')
    .reduce((total, f) => total + f.amount, 0)
}

export const getHealthStatus = (status) => {
  const statuses = {
    healthy: { label: 'Sehat', color: 'success' },
    sick: { label: 'Sakit', color: 'danger' },
    treated: { label: 'Dalam Perawatan', color: 'warning' },
    recovered: { label: 'Pulih', color: 'info' },
  }
  return statuses[status] || statuses.healthy
}

export const getSheepStatus = (status) => {
  const statuses = {
    available: { label: 'Tersedia', color: 'success' },
    sold: { label: 'Terjual', color: 'danger' },
    breeding: { label: 'Breeding', color: 'info' },
    fattening: { label: 'Penggemukan', color: 'warning' },
  }
  return statuses[status] || statuses.available
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^(\+62|0)[0-9]{9,12}$/
  return re.test(phone)
}

export const calculateFeedConsumption = (sheepCount, feedPerDay) => {
  return sheepCount * feedPerDay
}

export const getMonthlyStatistics = (records, month, year) => {
  return records.filter((record) => {
    const date = new Date(record.date)
    return date.getMonth() === month && date.getFullYear() === year
  })
}

export const sortByDate = (array, descending = true) => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt)
    const dateB = new Date(b.date || b.createdAt)
    return descending ? dateB - dateA : dateA - dateB
  })
}

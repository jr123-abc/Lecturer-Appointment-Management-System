import axios from 'axios'
import { initialData } from './data'

const useApi = import.meta.env.VITE_USE_API === 'true'
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use(config => {
  const token = localStorage.getItem('lams_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const read = () => {
  const saved = localStorage.getItem('lams_demo_data')
  if (!saved) {
    localStorage.setItem('lams_demo_data', JSON.stringify(initialData))
    return structuredClone(initialData)
  }
  return JSON.parse(saved)
}
const write = data => localStorage.setItem('lams_demo_data', JSON.stringify(data))

export async function getData() {
  if (useApi) return (await http.get('/dashboard/overview')).data
  return read()
}
export async function login(email, password, role) {
  if (useApi) return (await http.post('/auth/login', { email, password })).data
  const user = read().users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role)
  if (!user || password !== 'demo123') throw new Error('Invalid demo credentials.')
  return { user, token: 'demo-token' }
}
export async function bookAppointment(slotId, studentId, type, reason) {
  if (useApi) return (await http.post('/appointments', { slotId, appointmentType: type, purpose: reason })).data
  const data = read()
  const slot = data.slots.find(s => s.id === Number(slotId))
  if (!slot || !slot.active || slot.booked >= slot.capacity) throw new Error('This slot is no longer available.')
  const appointment = { id: Date.now(), slotId: slot.id, studentId, type, reason, status: 'PENDING', lecturerNote: '', requestedAt: new Date().toISOString(), participants: [studentId] }
  data.appointments.push(appointment)
  slot.booked += 1
  data.notifications.push({ id: Date.now() + 1, userId: slot.lecturerId, message: 'A new appointment request was received.', read: false })
  write(data)
  return appointment
}
export async function updateAppointment(id, status, note = '') {
  if (useApi) return (await http.patch(`/appointments/${id}/status`, { status, lecturerNote: note })).data
  const data = read()
  const appointment = data.appointments.find(a => a.id === Number(id))
  if (!appointment) throw new Error('Appointment not found.')
  if (!['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(status)) throw new Error('Invalid status.')
  const previous = appointment.status
  appointment.status = status
  appointment.lecturerNote = note
  appointment.decidedAt = new Date().toISOString()
  if (['REJECTED', 'CANCELLED'].includes(status) && !['REJECTED', 'CANCELLED'].includes(previous)) {
    const slot = data.slots.find(s => s.id === appointment.slotId)
    if (slot) slot.booked = Math.max(0, slot.booked - 1)
  }
  const slot = data.slots.find(s => s.id === appointment.slotId)
  const recipient = status === 'CANCELLED' ? slot?.lecturerId : appointment.studentId
  data.notifications.push({ id: Date.now(), userId: recipient, message: `Appointment #${id} status changed to ${status}.`, read: false })
  write(data)
  return appointment
}
export async function createSlot(slot) {
  if (useApi) return (await http.post('/availability-slots', slot)).data
  const data = read()
  data.slots.push({ ...slot, id: Date.now(), booked: 0, active: true })
  write(data)
}
export async function markNotificationRead(id) {
  if (useApi) return http.patch(`/notifications/${id}/read`)
  const data = read()
  const n = data.notifications.find(x => x.id === Number(id))
  if (n) n.read = true
  write(data)
}
export async function updateProfile(userId, name) {
  if (useApi) return (await http.patch('/users/me', { name })).data
  const data = read()
  const u = data.users.find(x => x.id === userId)
  if (u) u.name = name
  write(data)
}
export { http }

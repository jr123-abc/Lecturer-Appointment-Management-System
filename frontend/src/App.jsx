import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, Users, Clock3, Bell, LogOut, Search, Check, X, Plus, Menu, GraduationCap, Settings, ClipboardList } from 'lucide-react'
import { getData, login, bookAppointment, updateAppointment, createSlot, markNotificationRead, updateProfile } from './api'

const roleLabel = { STUDENT: 'Student', LECTURER: 'Lecturer', ADMIN: 'Administrator' }
function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('lams_session') || 'null'))
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const refresh = async () => { try { setData(await getData()); setError('') } catch (e) { setError(e.message || 'Could not load data') } }
  useEffect(() => { if (session) refresh() }, [session])
  const signIn = async (email, password, role) => {
    const result = await login(email, password, role)
    const next = { ...result.user, token: result.token }
    localStorage.setItem('lams_session', JSON.stringify(next))
    if (result.token) localStorage.setItem('lams_token', result.token)
    setSession(next); navigate('/')
  }
  const signOut = () => { localStorage.removeItem('lams_session'); localStorage.removeItem('lams_token'); setSession(null); setData(null); navigate('/login') }
  if (!session) return <Routes><Route path="*" element={<Login onLogin={signIn} />}/></Routes>
  if (!data) return <div className="loading">Loading your workspace…</div>
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><GraduationCap size={22}/></div><div><b>CampusConnect</b><small>Appointment Portal</small></div></div>
      <div className="profile-mini"><div className="avatar">{session.name?.[0]}</div><div><b>{session.name}</b><small>{roleLabel[session.role]}</small></div></div>
      <nav>
        <NavLink to="/"><LayoutDashboard size={18}/> Dashboard</NavLink>
        {session.role === 'STUDENT' && <><NavLink to="/lecturers"><Users size={18}/> Find lecturers</NavLink><NavLink to="/appointments"><CalendarDays size={18}/> My appointments</NavLink></>}
        {session.role === 'LECTURER' && <><NavLink to="/availability"><Clock3 size={18}/> Availability</NavLink><NavLink to="/appointments"><CalendarDays size={18}/> Requests</NavLink></>}
        {session.role === 'ADMIN' && <><NavLink to="/users"><Users size={18}/> User management</NavLink><NavLink to="/appointments"><CalendarDays size={18}/> All appointments</NavLink><NavLink to="/audit"><ClipboardList size={18}/> Audit logs</NavLink></>}
        <NavLink to="/notifications"><Bell size={18}/> Notifications</NavLink>
        <NavLink to="/profile"><Settings size={18}/> My profile</NavLink>
      </nav>
      <button className="logout" onClick={signOut}><LogOut size={18}/> Sign out</button>
      <div className="sidebar-foot">Lecturer Appointment Management System</div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><span className="eyebrow">UNIVERSITY PORTAL</span><h1>{session.role === 'STUDENT' ? 'Student workspace' : session.role === 'LECTURER' ? 'Lecturer workspace' : 'Administration'}</h1></div><div className="top-actions"><span className="today">{new Date().toLocaleDateString()}</span><button className="icon-btn" onClick={() => navigate('/notifications')}><Bell size={19}/><i/></button><div className="avatar small">{session.name?.[0]}</div></div></header>
      {error && <div className="alert error">{error}</div>}
      <Routes>
        <Route path="/" element={<Dashboard session={session} data={data} refresh={refresh}/>}/>
        <Route path="/lecturers" element={<Lecturers data={data} session={session} onBook={async (...args)=>{await bookAppointment(...args); await refresh(); alert('Appointment request submitted!')}}/>}/>
        <Route path="/appointments" element={<Appointments data={data} session={session} onUpdate={async (...args)=>{await updateAppointment(...args); await refresh()}}/>}/>
        <Route path="/availability" element={<Availability data={data} session={session} onCreate={async slot=>{await createSlot(slot); await refresh()}}/>}/>
        <Route path="/notifications" element={<Notifications data={data} session={session} onRead={async id=>{await markNotificationRead(id); await refresh()}}/>}/>
        <Route path="/profile" element={<Profile session={session} onSave={async name=>{await updateProfile(session.id,name); const updated={...session,name}; setSession(updated); localStorage.setItem('lams_session',JSON.stringify(updated)); await refresh()}}/>}/>
        <Route path="/users" element={<UsersPage data={data}/>}/>
        <Route path="/audit" element={<AuditPage/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </main>
  </div>
}
function Login({ onLogin }) {
  const [email,setEmail]=useState('student@lams.lk'), [password,setPassword]=useState('demo123'), [role,setRole]=useState('STUDENT'), [error,setError]=useState('')
  const submit=async e=>{e.preventDefault();try{await onLogin(email,password,role)}catch(err){setError(err.message)}}
  return <div className="login-page"><div className="login-art"><div className="art-logo"><GraduationCap size={28}/></div><span className="eyebrow light">CAMPUSCONNECT</span><h1>Make time for<br/>what matters.</h1><p>A simpler way for students and lecturers to connect, plan and meet.</p><div className="art-card"><CalendarDays/><div><b>Appointments, organised.</b><small>Find a time that works for everyone.</small></div></div></div><form className="login-card" onSubmit={submit}><span className="eyebrow">WELCOME BACK</span><h2>Sign in to your account</h2><p className="muted">Use a demo account to explore the interface.</p>{error&&<div className="alert error">{error}</div>}<label>Account role<select value={role} onChange={e=>{setRole(e.target.value);setEmail(e.target.value==='STUDENT'?'student@lams.lk':e.target.value==='LECTURER'?'lecturer@lams.lk':'admin@lams.lk')}}><option value="STUDENT">Student</option><option value="LECTURER">Lecturer</option><option value="ADMIN">Administrator</option></select></label><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="primary full">Sign in <span>→</span></button><div className="demo-hint">Demo password: <b>demo123</b></div></form></div>
}
function PageIntro({eyebrow,title,description,action}) { return <div className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{action}</div> }
function Dashboard({session,data}) {
  const mine = data.appointments.filter(a=>session.role==='ADMIN'||(session.role==='STUDENT'?a.studentId===session.id:data.slots.some(s=>s.id===a.slotId&&s.lecturerId===session.id)))
  const pending=mine.filter(a=>a.status==='PENDING').length
  const upcoming=mine.filter(a=>['PENDING','APPROVED'].includes(a.status)).length
  const cards=session.role==='STUDENT'?[['My appointments',mine.length,'Total requests',CalendarDays],['Awaiting response',pending,'Pending requests',Clock3],['Upcoming',upcoming,'Active appointments',Check]]:session.role==='LECTURER'?[['Requests',mine.length,'Total received',CalendarDays],['Pending review',pending,'Need your attention',Clock3],['Upcoming',upcoming,'Active appointments',Check]]:[['Users',data.users.length,'Registered accounts',Users],['Appointments',data.appointments.length,'All requests',CalendarDays],['Pending',pending,'Awaiting decisions',Clock3]]
  return <><PageIntro eyebrow="OVERVIEW" title={`Good day, ${session.name.split(' ')[0]}`} description="Here is a summary of your appointment activity."/><div className="stats-grid">{cards.map(([title,value,sub,Icon])=><div className="stat-card" key={title}><div className="stat-top"><span>{title}</span><Icon size={19}/></div><strong>{value}</strong><small>{sub}</small></div>)}</div><div className="content-grid"><section className="panel"><div className="panel-head"><div><h3>Recent appointments</h3><p>Your latest appointment activity</p></div><span className="tag">LATEST</span></div><AppointmentTable appointments={mine.slice().reverse().slice(0,5)} data={data}/></section><section className="panel quick-panel"><h3>Quick actions</h3><p>Go directly to a common task.</p>{session.role==='STUDENT'?<><a href="/lecturers" className="quick-link"><Search/> Find a lecturer <span>→</span></a><a href="/appointments" className="quick-link"><CalendarDays/> View my bookings <span>→</span></a></>:session.role==='LECTURER'?<><a href="/availability" className="quick-link"><Plus/> Add availability <span>→</span></a><a href="/appointments" className="quick-link"><ClipboardList/> Review requests <span>→</span></a></>:<><a href="/users" className="quick-link"><Users/> Manage users <span>→</span></a><a href="/appointments" className="quick-link"><CalendarDays/> View appointments <span>→</span></a></>}</section></div></>
}
function Lecturers({data,session,onBook}) {
  const [query,setQuery]=useState(''),[department,setDepartment]=useState('All'),[selected,setSelected]=useState(null),[slot,setSlot]=useState(''),[reason,setReason]=useState(''),[type,setType]=useState('Individual')
  const list=data.lecturers.filter(l=>(l.name.toLowerCase().includes(query.toLowerCase())||l.department.toLowerCase().includes(query.toLowerCase()))&&(department==='All'||l.department===department))
  const slots=data.slots.filter(s=>s.lecturerId===selected?.id&&s.active&&s.booked<s.capacity)
  return <><PageIntro eyebrow="DISCOVER" title="Find your lecturer" description="Browse lecturer profiles and choose an available appointment time."/><div className="filters"><div className="searchbox"><Search size={18}/><input placeholder="Search name or department…" value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={department} onChange={e=>setDepartment(e.target.value)}><option>All</option>{data.departments.map(d=><option key={d}>{d}</option>)}</select></div><div className="lecturer-grid">{list.map(l=><article className="lecturer-card" key={l.id}><div className="lecturer-avatar">{l.name.split(' ').filter(Boolean).slice(-1)[0][0]}</div><span className="tag">{l.department}</span><h3>{l.name}</h3><p className="muted">{l.title}</p><p>{l.bio}</p><small>{l.email}</small><button className="primary full" onClick={()=>{setSelected(l);setSlot('')}}>View available times <span>→</span></button></article>)}</div>{selected&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}><X/></button><span className="eyebrow">BOOK AN APPOINTMENT</span><h2>{selected.name}</h2><p className="muted">{selected.department} · {selected.title}</p><label>Available time slot<select value={slot} onChange={e=>setSlot(e.target.value)}><option value="">Choose a slot</option>{slots.map(s=><option key={s.id} value={s.id}>{s.date} · {s.start}–{s.end} · {s.mode} · {s.capacity-s.booked} spaces</option>)}</select></label><label>Appointment type<select value={type} onChange={e=>setType(e.target.value)}><option>Individual</option><option>Group</option></select></label><label>Reason for meeting<textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Briefly explain what you would like to discuss."/></label><button className="primary full" disabled={!slot||!reason.trim()} onClick={async()=>{await onBook(Number(slot),session.id,type,reason);setSelected(null)}}>Submit appointment request</button></div></div>}</>
}
function AppointmentTable({appointments,data}) {
  if(!appointments.length)return <div className="empty">No appointments to display yet.</div>
  return <div className="table-wrap"><table><thead><tr><th>Appointment</th><th>Date & time</th><th>Status</th></tr></thead><tbody>{appointments.map(a=>{const s=data.slots.find(x=>x.id===a.slotId);return <tr key={a.id}><td><b>#{a.id}</b><small>{a.type} · {a.reason}</small></td><td>{s?`${s.date} · ${s.start}`:'Slot unavailable'}</td><td><Status value={a.status}/></td></tr>})}</tbody></table></div>
}
function Status({value}) { return <span className={`status ${value.toLowerCase()}`}>{value}</span> }
function Appointments({data,session,onUpdate}) {
  const list=data.appointments.filter(a=>session.role==='ADMIN'||(session.role==='STUDENT'?a.studentId===session.id:data.slots.some(s=>s.id===a.slotId&&s.lecturerId===session.id)))
  const [note,setNote]=useState({})
  return <><PageIntro eyebrow="APPOINTMENT MANAGEMENT" title={session.role==='STUDENT'?'My appointments':session.role==='LECTURER'?'Appointment requests':'All appointments'} description="Review appointment details and keep track of request status."/><section className="panel"><AppointmentTable appointments={list} data={data}/>{list.map(a=><div className="request-row" key={a.id}><div><b>Appointment #{a.id}</b><p>{a.reason}</p><small>Requested: {a.requestedAt}</small>{a.lecturerNote&&<p className="note">Lecturer note: {a.lecturerNote}</p>}</div><div className="request-actions"><Status value={a.status}/>{session.role==='LECTURER'&&a.status==='PENDING'&&<><input placeholder="Optional note" value={note[a.id]||''} onChange={e=>setNote({...note,[a.id]:e.target.value})}/><button className="primary" onClick={()=>onUpdate(a.id,'APPROVED',note[a.id]||'')}>Approve</button><button className="danger" onClick={()=>onUpdate(a.id,'REJECTED',note[a.id]||'')}>Reject</button></>}{session.role==='STUDENT'&&['PENDING','APPROVED'].includes(a.status)&&<button className="danger" onClick={()=>onUpdate(a.id,'CANCELLED')}>Cancel</button>}</div></div>)}</section></>
}
function Availability({data,session,onCreate}) {
  const [form,setForm]=useState({date:'2026-11-24',start:'09:00',end:'09:20',mode:'Physical',location:'Room B204',capacity:1})
  const mine=data.slots.filter(s=>s.lecturerId===session.id)
  const change=e=>setForm({...form,[e.target.name]:e.target.value})
  return <><PageIntro eyebrow="SCHEDULE" title="Manage availability" description="Create appointment slots that students can request."/><div className="content-grid"><section className="panel"><h3>Create a time slot</h3><form className="form-grid" onSubmit={async e=>{e.preventDefault();await onCreate({...form,lecturerId:session.id,capacity:Number(form.capacity)});alert('Availability created')}}><label>Date<input type="date" name="date" value={form.date} onChange={change} required/></label><label>Start time<input type="time" name="start" value={form.start} onChange={change} required/></label><label>End time<input type="time" name="end" value={form.end} onChange={change} required/></label><label>Meeting mode<select name="mode" value={form.mode} onChange={change}><option>Physical</option><option>Online</option></select></label><label className="wide">Location / meeting instructions<input name="location" value={form.location} onChange={change} required/></label><label>Capacity<input type="number" min="1" max="20" name="capacity" value={form.capacity} onChange={change}/></label><button className="primary wide">Create availability</button></form></section><section className="panel"><h3>Your published slots</h3>{mine.map(s=><div className="slot-item" key={s.id}><div className="slot-date">{new Date(s.date+'T00:00:00').toLocaleDateString('en',{month:'short',day:'numeric'})}</div><div><b>{s.start} – {s.end}</b><small>{s.mode} · {s.location}</small></div><span className="tag">{s.booked}/{s.capacity} booked</span></div>)}</section></div></>
}
function Notifications({data,session,onRead}) {
  const items=data.notifications.filter(n=>n.userId===session.id).slice().reverse()
  return <><PageIntro eyebrow="UPDATES" title="Notifications" description="Stay informed about appointment activity."/><section className="panel">{items.length?items.map(n=><div className={`notification ${n.read?'':'unread'}`} key={n.id}><div className="notification-dot"/><div><p>{n.message}</p><small>{n.read?'Read':'Unread'}</small></div>{!n.read&&<button className="text-btn" onClick={()=>onRead(n.id)}>Mark as read</button>}</div>):<div className="empty">You have no notifications.</div>}</section></>
}
function Profile({session,onSave}) {
  const [name,setName]=useState(session.name),[saved,setSaved]=useState(false)
  return <><PageIntro eyebrow="ACCOUNT" title="My profile" description="View and update your basic profile information."/><section className="panel profile-form"><div className="avatar large">{name[0]}</div><label>Full name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Email address<input value={session.email} disabled/></label><label>Role<input value={roleLabel[session.role]} disabled/></label><button className="primary" onClick={async()=>{await onSave(name);setSaved(true)}}>Save changes</button>{saved&&<span className="success-text">Profile updated.</span>}</section></>
}
function UsersPage({data}) { return <><PageIntro eyebrow="ADMINISTRATION" title="User management" description="Overview of registered system accounts."/><section className="panel"><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th></tr></thead><tbody>{data.users.map(u=><tr key={u.id}><td><b>{u.name}</b></td><td>{u.email}</td><td><Status value={u.role}/></td><td>{u.department}</td></tr>)}</tbody></table></div><p className="muted small-note">Demo view only. Connect the user-management endpoints to enable account administration.</p></section></> }
function AuditPage() { return <><PageIntro eyebrow="SECURITY" title="Audit logs" description="Administrative activity records."/><section className="panel empty">Audit log records will appear here after the backend audit API is connected.</section></> }
export default App

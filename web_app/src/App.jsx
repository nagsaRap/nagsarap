
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import AdminLayout from './layouts/AdminLayout'
import OrganizerLayout from './layouts/OrganizerLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminEvents from './pages/admin/Events'
import Analytics from './pages/admin/Analytics'
import OrganizerDashboard from './pages/organizer/Dashboard'
import OrganizerStudents from './pages/organizer/Students'
import Kiosk from './pages/organizer/Kiosk'
import OrganizerEvents from './pages/organizer/Events'
import CreateEvent from './pages/organizer/CreateEvent'
import Submitted from './pages/organizer/Submitted'
import Approved from './pages/organizer/Approved'
import Declined from './pages/organizer/Declined'

export default function App(){return <BrowserRouter><Routes>
 <Route path="/" element={<Navigate to="/login" replace/>}/>
 <Route path="/login" element={<Login/>}/>
 <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout/></ProtectedRoute>}>
  <Route path="dashboard" element={<AdminDashboard/>}/><Route path="students" element={<AdminStudents/>}/><Route path="events" element={<AdminEvents/>}/><Route path="analytics" element={<Analytics/>}/>
 </Route>
 <Route path="/organizer" element={<ProtectedRoute role="organizer"><OrganizerLayout/></ProtectedRoute>}>
  <Route path="dashboard" element={<OrganizerDashboard/>}/><Route path="students" element={<OrganizerStudents/>}/><Route path="kiosk" element={<Kiosk/>}/><Route path="events" element={<OrganizerEvents/>}/><Route path="events/new" element={<CreateEvent/>}/><Route path="events/submitted" element={<Submitted/>}/><Route path="events/approved" element={<Approved/>}/><Route path="events/declined" element={<Declined/>}/>
 </Route>
 <Route path="*" element={<Navigate to="/login" replace/>}/>
</Routes></BrowserRouter>}

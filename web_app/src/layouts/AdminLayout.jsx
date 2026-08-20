
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Topbar from '../components/Topbar'
export default function AdminLayout(){return <div className="app-shell"><AdminSidebar/><main className="content"><Topbar/><Outlet/></main></div>}

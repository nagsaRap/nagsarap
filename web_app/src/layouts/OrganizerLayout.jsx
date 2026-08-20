
import { Outlet } from 'react-router-dom'
import OrganizerSidebar from '../components/OrganizerSidebar'
import Topbar from '../components/Topbar'
export default function OrganizerLayout(){return <div className="app-shell"><OrganizerSidebar/><main className="content"><Topbar/><Outlet/></main></div>}

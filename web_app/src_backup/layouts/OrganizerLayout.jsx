import {Outlet} from 'react-router-dom'; import Sidebar from '../components/Sidebar'; import Topbar from '../components/Topbar';
export default function OrganizerLayout(){return <div className="app-shell"><Sidebar/><main className="content"><Topbar/><Outlet/></main></div>}

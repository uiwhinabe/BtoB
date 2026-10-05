import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/login.jsx'
import Dashboard from './pages/dashboard.jsx'
import { Outlet } from 'react-router-dom'
import List from './pages/list.jsx'
import Detail from './pages/detail.jsx'
import Creat from './pages/creat.jsx'
import UserSetting from './pages/usersetting.jsx'
import Workspace from './pages/workspace.jsx'
import Sidebar from './component/sidebar.jsx'
import Header from './component/Header.jsx'
import TaskProvider from './component/TaskProvider.jsx'

function SidebarPreviewLayout() {
  return <div className="app-sidebar-preview">
    <Sidebar />
    <div className="app-sidebar-preview__content"><Outlet /></div>
  </div>
}

function PagePreview({ title, children }) {
  return <><Header title={title} />{children}</>
}

export default function App() {
  return <BrowserRouter><TaskProvider><Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/list" element={<List />} />
    <Route path="/detail" element={<Detail />} />
    <Route path="/detail/:id" element={<Detail />} />
    <Route element={<SidebarPreviewLayout />}>
      <Route path="/creat" element={<PagePreview title="Task"><Creat /></PagePreview>} />
      <Route path="/usersetting" element={<PagePreview title="User Setting"><UserSetting /></PagePreview>} />
      <Route path="/workspace" element={<PagePreview title="Project"><Workspace /></PagePreview>} />
    </Route>
  </Routes></TaskProvider></BrowserRouter>
}

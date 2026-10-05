import { NavLink, useLocation } from 'react-router-dom'
import logoBack from '../assets/login-logo-back.svg'
import { Fragment } from 'react'
import logoMiddle from '../assets/login-logo-middle.svg'
import logoFront from '../assets/login-logo-front.svg'
import home from '../assets/sidebar-home.svg'
import task from '../assets/sidebar-user.svg'
import project from '../assets/sidebar-folder.svg'
import team from '../assets/sidebar-users.svg'
import cog from '../assets/sidebar-cog.svg'
import dots from '../assets/sidebar-dots.svg'
import profile from '../assets/sidebar-profile.png'
import './sidebar.css'

const menus = [
  { label: 'Dashboard', to: '/dashboard', icon: home, kind: 'home' },
  { label: 'Task', to: '/list', icon: task, kind: 'task' },
  { label: 'Project', to: '/workspace', icon: project, kind: 'project' },
  { label: 'Team', icon: team, kind: 'team' },
]

export default function Sidebar({ userName = '山田 大輔', userRole = 'フロントエンドエンジニア', profileSrc = profile, onUserMenuClick, showTaskSubmenu = false, className = '' }) {
  const { pathname } = useLocation()
  const taskPage = ['/list', '/detail', '/creat'].some((path) => pathname === path || pathname.startsWith(`${path}/`))
  const contents = (menu) => <>
    <span className="app-sidebar__icon-slot"><img className={`app-sidebar__icon app-sidebar__icon--${menu.kind}`} src={menu.icon} alt="" /></span>
    <span>{menu.label}</span>
  </>
  return (
    <aside className={`app-sidebar${showTaskSubmenu ? ' app-sidebar--task-submenu' : ''} ${className}`} aria-label="사이드바">
      <NavLink className="app-sidebar__brand" to="/dashboard" aria-label="Flowbite 대시보드">
        <span>Flowbite</span>
        <span className="app-sidebar__logo" aria-hidden="true"><span className="app-sidebar__logo-layers">
          <img className="app-sidebar__logo-back" src={logoBack} alt="" />
          <img className="app-sidebar__logo-middle" src={logoMiddle} alt="" />
          <img className="app-sidebar__logo-front" src={logoFront} alt="" />
        </span></span>
      </NavLink>
      <nav className="app-sidebar__navigation" aria-label="주 메뉴">
        {menus.map((menu) => menu.to ? (
          <Fragment key={menu.label}><NavLink to={menu.to} aria-current={menu.kind === 'task' && taskPage ? 'page' : undefined}
            className={({ isActive }) => `app-sidebar__menu${isActive || (menu.kind === 'task' && taskPage) ? ' app-sidebar__menu--active' : ''}`}>
            {contents(menu)}
          </NavLink>
          {showTaskSubmenu && menu.kind === 'task' && <div className="app-sidebar__task-submenu" aria-label="Task navigation">
            <NavLink to="/list" className={({ isActive }) => isActive ? 'app-sidebar__sub-link app-sidebar__sub-link--active' : 'app-sidebar__sub-link'}>List</NavLink>
            <NavLink to="/detail" className={({ isActive }) => isActive ? 'app-sidebar__sub-link app-sidebar__sub-link--active' : 'app-sidebar__sub-link'}>Detail</NavLink>
          </div>}</Fragment>
        ) : <span key={menu.label} className="app-sidebar__menu app-sidebar__menu--unavailable" aria-disabled="true" title="Team 페이지 준비 중">{contents(menu)}</span>)}
      </nav>
      <nav className="app-sidebar__settings" aria-label="사용자 설정">
        <NavLink to="/usersetting" className={({ isActive }) => `app-sidebar__menu${isActive ? ' app-sidebar__menu--active' : ''}`}>
          {contents({ label: 'User Setting', icon: cog, kind: 'settings' })}
        </NavLink>
      </nav>
      <div className="app-sidebar__user">
        <div className="app-sidebar__avatar"><img src={profileSrc} alt={`${userName} 프로필`} /></div>
        <div className="app-sidebar__user-details">
          <div className="app-sidebar__user-text"><p className="app-sidebar__user-name">{userName}</p><p className="app-sidebar__user-role">{userRole}</p></div>
          {onUserMenuClick ? <button className="app-sidebar__user-menu" type="button" aria-label="사용자 메뉴" onClick={onUserMenuClick}><img src={dots} alt="" /></button>
            : <span className="app-sidebar__user-menu" aria-hidden="true"><img src={dots} alt="" /></span>}
        </div>
      </div>
    </aside>
  )
}

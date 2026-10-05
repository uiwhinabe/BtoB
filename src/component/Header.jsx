import defaultProfile from '../assets/header-profile.png'
import moonIcon from '../assets/header-moon.svg'
import './Header.css'

/** Shared page header. Page layout and theme state belong to the caller. */
export default function Header({
  title = 'Dashboard',
  profileSrc = defaultProfile,
  profileAlt = '사용자 프로필',
  onProfileClick,
  onThemeToggle,
  themeToggleLabel = '테마 전환',
  className = '',
}) {
  const profile = <img className="app-header__profile" src={profileSrc} alt={profileAlt} width="30" height="30" />
  const moon = <img className="app-header__moon" src={moonIcon} alt="" />

  return (
    <header className={`app-header ${className}`}>
      <div className="app-header__inner">
        <h2 className="app-header__title">{title}</h2>
        <div className="app-header__actions">
          {onProfileClick ? (
            <button className="app-header__control app-header__control--profile" type="button"
              aria-label={profileAlt} onClick={onProfileClick}>
              {profile}
            </button>
          ) : profile}
          {onThemeToggle ? (
            <button className="app-header__control app-header__control--theme" type="button"
              aria-label={themeToggleLabel} onClick={onThemeToggle}>
              {moon}
            </button>
          ) : <span className="app-header__theme-icon" aria-hidden="true">{moon}</span>}
        </div>
      </div>
    </header>
  )
}

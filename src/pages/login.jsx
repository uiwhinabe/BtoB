import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import back from '../assets/login-logo-back.svg'
import middle from '../assets/login-logo-middle.svg'
import front from '../assets/login-logo-front.svg'
import styles from './login.module.css'

export default function Login() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    if (id === 'xiaouiw' && password === 'qpalzm857') {
      setError('')
      navigate('/dashboard')
    } else {
      setError('ID 또는 Password가 일치하지 않습니다.')
    }
  }

  function unavailable() { setError('아직 준비 중인 기능입니다.') }

  return (
    <main className={styles.page}>
      <section className={styles.brand} aria-label="Flowbite">
        <div className={styles.brandContent}>
          <span>Flowbite</span>
          <div className={styles.logo} aria-hidden="true">
            <img className={styles.back} src={back} alt="" />
            <img className={styles.middle} src={middle} alt="" />
            <img className={styles.front} src={front} alt="" />
          </div>
        </div>
      </section>
      <section className={styles.signIn} aria-labelledby="welcome-title">
        <h1 id="welcome-title" className={styles.welcome}>Welcome back :)</h1>
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.title}>Sign in to our platform</h2>
          <div className={styles.inputs}>
            <div className={styles.field}>
              <label htmlFor="login-id">Your email</label>
              <input id="login-id" name="username" type="text" autoComplete="username"
                placeholder="name@flowbite.com" value={id}
                aria-invalid={Boolean(error)} aria-describedby={error ? 'login-error' : undefined}
                onChange={(event) => { setId(event.target.value); setError('') }} />
            </div>
            <div className={styles.field}>
              <label htmlFor="login-password">Password</label>
              <input id="login-password" name="password" type="password" autoComplete="current-password"
                placeholder="••••••••••" value={password}
                aria-invalid={Boolean(error)} aria-describedby={error ? 'login-error' : undefined}
                onChange={(event) => { setPassword(event.target.value); setError('') }} />
            </div>
          </div>
          <div className={styles.options}>
            <button type="button" className={styles.link} onClick={unavailable}>Lost Password?</button>
            <label className={styles.remember}>Remember me<input type="checkbox" name="remember" /></label>
          </div>
          <div className={styles.actions}>
            <button className={styles.submit} type="submit">Login</button>
            <p className={styles.register}>Not registered?{' '}
              <button type="button" className={styles.link} onClick={unavailable}>Create account</button>
            </p>
          </div>
          {error && <p id="login-error" className={styles.error} role="alert">{error}</p>}
        </form>
      </section>
    </main>
  )
}

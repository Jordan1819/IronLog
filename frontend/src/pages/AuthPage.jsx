import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error: err } = await signUp(email, password)
        if (err) throw err
        setMessage('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        const { error: err } = await signIn(email, password)
        if (err) throw err
        // Navigation handled by App.jsx
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background accent */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '400px',
        animation: 'fadeUp 0.5s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '52px',
            letterSpacing: '0.16em',
            lineHeight: 1,
          }}>
            <span style={{ color: 'var(--gold)' }}>IRON</span>
            <span style={{ color: 'var(--white)' }}>LOG</span>
          </h1>
          <p style={{
            color: 'var(--white-muted)',
            fontSize: '12px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: '8px',
            fontWeight: 500,
          }}>
            Track Every Rep. Own Every PR.
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          {/* Tab toggle */}
          <div style={{
            position: 'relative',
            display: 'flex',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius)',
            padding: '3px',
            marginBottom: '28px',
          }}>

          {/* Sliding Background */}
          <div
            style={{
              position: 'absolute',
              top: '3px',
              bottom: '3px',
              left: mode === 'signin' ? '3px' : '50%',
              width: 'calc(50% - 3px)',
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px',
              transition: 'all 250ms ease',
            }}
          />

            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '4px',
                  color: mode === m ? 'var(--white)' : 'var(--white-muted)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 150ms ease',
                  position: 'relative',
                  zIndex: 1,
                  background: 'transparent',
                  border: 'none',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {/* Privacy policy acceptance for sign up */}
          {mode === 'signup' && (
            <p
              style={{
                  marginTop: '16px',
                  color: 'var(--white-muted)',
                  fontSize: '12px',
                  lineHeight: '1.5',
              }}
            >
              By creating an account, you agree to our{' '}
              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--gold)', textDecoration: 'none' }}
              >
                Privacy Policy
              </Link>.
            </p>
          )}

          {/* Error / success */}
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'rgba(224,90,90,0.1)',
              border: '1px solid rgba(224,90,90,0.3)',
              borderRadius: 'var(--radius)',
              color: 'var(--error)',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'rgba(76,175,120,0.1)',
              border: '1px solid rgba(76,175,120,0.3)',
              borderRadius: 'var(--radius)',
              color: 'var(--success)',
              fontSize: '13px',
            }}>
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', marginTop: '24px', fontSize: '13px' }}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

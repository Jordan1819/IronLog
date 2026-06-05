import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }

    setSuccess(true)
    setTimeout(() => navigate('/'), 2000)
  }

  if (success) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        animation: 'fadeIn 0.4s ease forwards',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '48px',
          color: 'var(--gold)',
          letterSpacing: '0.08em',
        }}>
          PASSWORD UPDATED
        </div>
        <p style={{ color: 'var(--white-muted)', fontSize: '13px' }}>
          Redirecting to dashboard...
        </p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeUp 0.4s ease forwards' }}>

        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '36px' }}>
            CHANGE <span style={{ color: 'var(--gold)' }}>PASSWORD</span>
          </h1>
          <hr className="gold-rule" style={{ marginTop: '12px', width: '100px' }} />
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label">New Password</label>
              <input
                className="input"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="input-label">Confirm New Password</label>
              <input
                className="input"
                type="password"
                placeholder="Re-enter new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoComplete="new-password"
              />
            </div>
          </div>

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

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/')}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

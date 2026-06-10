import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { deleteAccount, signOut, user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [menuError, setMenuError] = useState('')
  const menuRef = useRef(null)
  const username = user?.email?.split('@')[0]

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const handleDeleteAccount = async () => {
    setMenuError('')
    const confirmed = window.confirm(
      'Delete your IRONLOG account and all workout data? This cannot be undone.'
    )

    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteAccount()
      navigate('/auth', { replace: true })
    } catch (err) {
      setMenuError(err.message || 'Could not delete your account. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(26,26,26,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          letterSpacing: '0.12em',
          color: 'var(--gold)',
        }}>
          IRON<span style={{ color: 'var(--white)' }}>LOG</span>
        </span>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              padding: '7px 16px',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 150ms ease',
              background: isActive ? 'var(--gold-dim)' : 'transparent',
              color: isActive ? 'var(--gold)' : 'var(--white-dim)',
              border: isActive ? '1px solid var(--gold-border)' : '1px solid transparent',
            })}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/log"
            style={({ isActive }) => ({
              padding: '7px 16px',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 150ms ease',
              background: isActive ? 'var(--gold-dim)' : 'transparent',
              color: isActive ? 'var(--gold)' : 'var(--white-dim)',
              border: isActive ? '1px solid var(--gold-border)' : '1px solid transparent',
            })}
          >
            Log Workout
          </NavLink>

          <div style={{
            width: '1px',
            height: '20px',
            background: 'rgba(255,255,255,0.1)',
            margin: '0 8px',
          }} />

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setMenuOpen(open => !open)
                setMenuError('')
              }}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                background: menuOpen ? 'var(--gold-dim)' : 'transparent',
                border: menuOpen ? '1px solid var(--gold-border)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius)',
                color: menuOpen ? 'var(--gold)' : 'var(--white-dim)',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontFamily: 'var(--font-body)',
                maxWidth: '180px',
              }}
            >
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {username}
              </span>
              <span style={{
                fontSize: '10px',
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
              }}>
                v
              </span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  minWidth: '220px',
                  padding: '8px',
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 14px 32px rgba(0,0,0,0.45)',
                  zIndex: 200,
                }}
              >
                <NavLink
                  to="/change-password"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    color: 'var(--white-dim)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 150ms ease',
                  }}
                >
                  Change Password
                </NavLink>

                <button
                  role="menuitem"
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    color: 'var(--white-dim)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Sign Out
                </button>

                <div style={{
                  height: '1px',
                  background: 'rgba(255,255,255,0.08)',
                  margin: '6px 0',
                }} />

                <button
                  role="menuitem"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(224,90,90,0.08)',
                    border: '1px solid rgba(224,90,90,0.2)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--error)',
                    fontSize: '13px',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    opacity: deleting ? 0.6 : 1,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete Account & Data'}
                </button>

                {menuError && (
                  <p style={{
                    marginTop: '8px',
                    color: 'var(--error)',
                    fontSize: '12px',
                    lineHeight: 1.35,
                  }}>
                    {menuError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

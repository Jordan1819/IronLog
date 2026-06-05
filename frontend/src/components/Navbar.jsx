import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
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

          <span style={{
            fontSize: '12px',
            color: 'var(--white-muted)',
            fontFamily: 'var(--font-mono)',
          }}>
            {user?.email?.split('@')[0]}
          </span>

          <button
            onClick={handleSignOut}
            style={{
              padding: '7px 14px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius)',
              color: 'var(--white-dim)',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => {
              e.target.style.color = 'var(--error)'
              e.target.style.borderColor = 'rgba(224,90,90,0.4)'
            }}
            onMouseLeave={e => {
              e.target.style.color = 'var(--white-dim)'
              e.target.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}

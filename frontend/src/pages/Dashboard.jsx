import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

function formatLbs(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--gold-border)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
    }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)' }}>
        {formatLbs(payload[0].value)} lbs
      </p>
      <p style={{ fontSize: '12px', color: 'var(--white-dim)', marginTop: '2px' }}>
        {payload[0].payload.exercise}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentSessions, setRecentSessions] = useState([])

  useEffect(() => {
    fetchStats()
  }, [user])

  async function fetchStats() {
    setLoading(true)
    try {
      // Fetch all sets with exercise names
      const { data: sets, error } = await supabase
        .from('sets')
        .select(`
          reps,
          weight_lbs,
          created_at,
          exercises ( name )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Total volume
      const totalLbs = sets.reduce((sum, s) => sum + (s.reps * s.weight_lbs), 0)

      // Per-exercise volume
      const exerciseMap = {}
      sets.forEach(s => {
        const name = s.exercises?.name || 'Unknown'
        exerciseMap[name] = (exerciseMap[name] || 0) + (s.reps * s.weight_lbs)
      })

      const exerciseData = Object.entries(exerciseMap)
        .map(([exercise, volume]) => ({ exercise, volume: Math.round(volume) }))
        .sort((a, b) => b.volume - a.volume)

      // Recent sets (last 5 unique days)
      const byDay = {}
      sets.forEach(s => {
        const day = s.created_at.split('T')[0]
        if (!byDay[day]) byDay[day] = []
        byDay[day].push(s)
      })
      const recent = Object.entries(byDay)
        .slice(0, 5)
        .map(([date, daySets]) => ({
          date,
          volume: Math.round(daySets.reduce((sum, s) => sum + (s.reps * s.weight_lbs), 0)),
          exercises: [...new Set(daySets.map(s => s.exercises?.name))].filter(Boolean),
        }))

      setStats({ totalLbs: Math.round(totalLbs), exerciseData })
      setRecentSessions(recent)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <p style={{ color: 'var(--white-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          Loading stats...
        </p>
      </div>
    )
  }

  const hasData = stats?.exerciseData?.length > 0

  return (
    <div className="page" style={{ paddingTop: '48px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', animation: 'fadeUp 0.4s ease forwards' }}>
        <h1 style={{ fontSize: '40px', color: 'var(--white)' }}>
          YOUR <span style={{ color: 'var(--gold)' }}>PROGRESS</span>
        </h1>
        <hr className="gold-rule" style={{ marginTop: '12px', width: '120px' }} />
      </div>

      {!hasData ? (
        <EmptyState navigate={navigate} />
      ) : (
        <>
          {/* Total Volume Hero */}
          <div className="card" style={{
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #272727 0%, #2a2820 100%)',
            border: '1px solid var(--gold-border)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeUp 0.4s ease 0.05s both',
          }}>
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--white-muted)',
              marginBottom: '8px',
            }}>
              Total Volume Lifted
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <span className="stat-number" style={{ fontSize: '64px' }}>
                {formatLbs(stats.totalLbs)}
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                color: 'var(--white-dim)',
                letterSpacing: '0.08em',
              }}>
                LBS
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--white-muted)', marginTop: '8px' }}>
              across {stats.exerciseData.length} exercise{stats.exerciseData.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Volume by Exercise Chart */}
          <div className="card" style={{
            marginBottom: '24px',
            animation: 'fadeUp 0.4s ease 0.1s both',
          }}>
            <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>Volume by Exercise</h2>
            <p style={{ fontSize: '12px', color: 'var(--white-muted)', marginBottom: '24px' }}>
              Total lbs lifted (reps × weight)
            </p>
            <div style={{ width: '100%', minWidth: 0, height: '260px' }}>
              <ResponsiveContainer>
                <BarChart
                  data={stats.exerciseData}
                  margin={{ top: 4, right: 4, bottom: 32, left: 8 }}
                  barCategoryGap="28%"
                >
                  <XAxis
                    dataKey="exercise"
                    tick={{ fill: 'rgba(245,245,245,0.45)', fontSize: 11, fontFamily: 'DM Sans' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={formatLbs}
                    tick={{ fill: 'rgba(245,245,245,0.3)', fontSize: 11, fontFamily: 'DM Mono' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.05)' }} />
                  <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                    {stats.exerciseData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={index === 0 ? 'var(--gold)' : `rgba(201,168,76,${0.7 - index * 0.06})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exercise breakdown table */}
          <div className="card" style={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '20px' }}>Exercise Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {stats.exerciseData.map((ex, i) => (
                <div key={ex.exercise} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < stats.exerciseData.length - 1
                    ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: i === 0 ? 'var(--gold)' : 'var(--white-muted)',
                      minWidth: '20px',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      minWidth: 0,
                      overflowWrap: 'anywhere',
                    }}>{ex.exercise}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexShrink: 0, marginLeft: '12px' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      color: i === 0 ? 'var(--gold)' : 'var(--white)',
                    }}>
                      {formatLbs(ex.volume)}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--white-muted)', fontWeight: 500 }}>
                      LBS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          {recentSessions.length > 0 && (
            <div style={{ marginTop: '24px', animation: 'fadeUp 0.4s ease 0.2s both' }}>
              <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Recent Sessions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentSessions.map(session => (
                  <div key={session.date} className="card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          color: 'var(--gold)',
                          marginBottom: '4px',
                        }}>
                          {new Date(session.date + 'T12:00:00').toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--white-dim)', overflowWrap: 'anywhere' }}>
                          {session.exercises.join(' · ')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '24px',
                          color: 'var(--white)',
                        }}>
                          {formatLbs(session.volume)}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--white-muted)', marginLeft: '4px' }}>
                          LBS
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyState({ navigate }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 24px',
      animation: 'fadeUp 0.4s ease forwards',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '80px',
        color: 'rgba(201,168,76,0.12)',
        lineHeight: 1,
        marginBottom: '24px',
      }}>
        0 LBS
      </div>
      <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>No workouts yet</h2>
      <p style={{ color: 'var(--white-dim)', marginBottom: '32px', maxWidth: '320px', margin: '0 auto 32px' }}>
        Log your first workout to start tracking your progress.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/log')}>
        Log First Workout
      </button>
    </div>
  )
}

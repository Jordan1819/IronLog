import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const DEFAULT_SETS = 3
const DEFAULT_REPS = 10
const DEFAULT_WEIGHT = ''

function SetRow({ setNum, reps, weight, onChange, onRemove, canRemove }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr 1fr 36px',
      gap: '10px',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      animation: 'fadeUp 0.25s ease forwards',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--gold)',
        textAlign: 'center',
      }}>
        S{setNum}
      </span>
      <div>
        <input
          className="input"
          type="number"
          min="1"
          placeholder="Reps"
          value={reps}
          onChange={e => onChange('reps', e.target.value)}
          style={{ padding: '10px 12px', fontSize: '14px' }}
        />
      </div>
      <div>
        <input
          className="input"
          type="number"
          min="0"
          step="2.5"
          placeholder="Weight (lbs)"
          value={weight}
          onChange={e => onChange('weight', e.target.value)}
          style={{ padding: '10px 12px', fontSize: '14px' }}
        />
      </div>
      <button
        onClick={onRemove}
        disabled={!canRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: canRemove ? 'pointer' : 'not-allowed',
          color: canRemove ? 'rgba(224,90,90,0.6)' : 'rgba(255,255,255,0.1)',
          fontSize: '18px',
          lineHeight: 1,
          padding: '4px',
          transition: 'color 150ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Remove set"
      >
        ×
      </button>
    </div>
  )
}

function ExerciseBlock({ block, index, onChange, onRemove, canRemove, exerciseSuggestions }) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  const filtered = block.exerciseName
    ? exerciseSuggestions.filter(s =>
        s.toLowerCase().includes(block.exerciseName.toLowerCase()) &&
        s.toLowerCase() !== block.exerciseName.toLowerCase()
      ).slice(0, 5)
    : []

  const addSet = () => {
    const lastSet = block.sets[block.sets.length - 1]
    onChange(index, 'sets', [...block.sets, {
      id: Date.now(),
      reps: lastSet?.reps || DEFAULT_REPS,
      weight: lastSet?.weight || DEFAULT_WEIGHT,
    }])
  }

  const removeSet = (setIdx) => {
    onChange(index, 'sets', block.sets.filter((_, i) => i !== setIdx))
  }

  const updateSet = (setIdx, field, value) => {
    const newSets = [...block.sets]
    newSets[setIdx] = { ...newSets[setIdx], [field]: value }
    onChange(index, 'sets', newSets)
  }

  const setVolume = block.sets.reduce((sum, s) => {
    const r = parseInt(s.reps) || 0
    const w = parseFloat(s.weight) || 0
    return sum + r * w
  }, 0)

  return (
    <div className="card" style={{
      marginBottom: '16px',
      animation: `fadeUp 0.35s ease ${index * 0.05}s both`,
    }}>
      {/* Exercise header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <label className="input-label">Exercise Name</label>
          <input
            ref={inputRef}
            className="input"
            type="text"
            placeholder="e.g. Bench Press"
            value={block.exerciseName}
            onChange={e => {
              onChange(index, 'exerciseName', e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            autoComplete="off"
          />
          {/* Autocomplete dropdown */}
          {showSuggestions && filtered.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--gold-border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {filtered.map(s => (
                <button
                  key={s}
                  onMouseDown={() => {
                    onChange(index, 'exerciseName', s)
                    setShowSuggestions(false)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: 'var(--white)',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'background 100ms ease',
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--gold-dim)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px' }}>
          {setVolume > 0 && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--gold)',
              whiteSpace: 'nowrap',
            }}>
              {setVolume.toLocaleString()} lbs
            </span>
          )}
          {canRemove && (
            <button
              onClick={() => onRemove(index)}
              className="btn btn-danger"
              style={{ padding: '8px 14px', fontSize: '12px' }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Sets header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 1fr 36px',
        gap: '10px',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '2px',
      }}>
        <span />
        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white-muted)' }}>Reps</span>
        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white-muted)' }}>Weight (lbs)</span>
        <span />
      </div>

      {/* Set rows */}
      {block.sets.map((set, setIdx) => (
        <SetRow
          key={set.id}
          setNum={setIdx + 1}
          reps={set.reps}
          weight={set.weight}
          onChange={(field, val) => updateSet(setIdx, field, val)}
          onRemove={() => removeSet(setIdx)}
          canRemove={block.sets.length > 1}
        />
      ))}

      {/* Add set */}
      <button
        onClick={addSet}
        style={{
          marginTop: '12px',
          background: 'none',
          border: '1px dashed rgba(201,168,76,0.3)',
          borderRadius: 'var(--radius)',
          color: 'var(--gold)',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '9px',
          width: '100%',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={e => {
          e.target.style.background = 'var(--gold-dim)'
          e.target.style.borderStyle = 'solid'
        }}
        onMouseLeave={e => {
          e.target.style.background = 'none'
          e.target.style.borderStyle = 'dashed'
        }}
      >
        + Add Set
      </button>
    </div>
  )
}

export default function LogWorkout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([createBlock()])
  const [existingExerciseNames, setExistingExerciseNames] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Load existing exercise names for autocomplete
    supabase
      .from('exercises')
      .select('name')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setExistingExerciseNames([...new Set(data.map(e => e.name))])
      })
  }, [user])

  function createBlock() {
    return {
      id: Date.now() + Math.random(),
      exerciseName: '',
      sets: Array.from({ length: DEFAULT_SETS }, (_, i) => ({
        id: i,
        reps: DEFAULT_REPS,
        weight: DEFAULT_WEIGHT,
      }))
    }
  }

  function updateBlock(idx, field, value) {
    setExercises(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b))
  }

  function removeBlock(idx) {
    setExercises(prev => prev.filter((_, i) => i !== idx))
  }

  function addExercise() {
    setExercises(prev => [...prev, createBlock()])
  }

  const totalVolume = exercises.reduce((sum, block) => {
    return sum + block.sets.reduce((s2, set) => {
      return s2 + (parseInt(set.reps) || 0) * (parseFloat(set.weight) || 0)
    }, 0)
  }, 0)

  async function handleSave() {
    setError('')

    // Validate
    for (const block of exercises) {
      if (!block.exerciseName.trim()) {
        setError('All exercises need a name.')
        return
      }
      for (const set of block.sets) {
        if (!set.reps || parseInt(set.reps) <= 0) {
          setError(`Enter valid reps for all sets in "${block.exerciseName}".`)
          return
        }
        if (set.weight === '' || parseFloat(set.weight) < 0) {
          setError(`Enter a valid weight for all sets in "${block.exerciseName}".`)
          return
        }
      }
    }

    setSaving(true)
    try {
      // Create workout session
      const { data: session, error: sessionErr } = await supabase
        .from('workout_sessions')
        .insert({ user_id: user.id })
        .select()
        .single()
      if (sessionErr) throw sessionErr

      // Upsert exercises and insert sets
      for (const block of exercises) {
        const name = block.exerciseName.trim()

        // Get or create exercise
        let exerciseId
        const { data: existing } = await supabase
          .from('exercises')
          .select('id')
          .eq('user_id', user.id)
          .ilike('name', name)
          .single()

        if (existing) {
          exerciseId = existing.id
        } else {
          const { data: newEx, error: exErr } = await supabase
            .from('exercises')
            .insert({ user_id: user.id, name })
            .select()
            .single()
          if (exErr) throw exErr
          exerciseId = newEx.id
        }

        // Insert sets
        const setsToInsert = block.sets.map((set, i) => ({
          user_id: user.id,
          session_id: session.id,
          exercise_id: exerciseId,
          set_number: i + 1,
          reps: parseInt(set.reps),
          weight_lbs: parseFloat(set.weight),
        }))

        const { error: setsErr } = await supabase.from('sets').insert(setsToInsert)
        if (setsErr) throw setsErr
      }

      setSuccess(true)
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      setError(err.message || 'Failed to save workout.')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        animation: 'fadeIn 0.4s ease forwards',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '64px',
          color: 'var(--gold)',
          letterSpacing: '0.08em',
        }}>
          SAVED
        </div>
        <p style={{ color: 'var(--white-dim)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          {totalVolume > 0 ? `${Math.round(totalVolume).toLocaleString()} lbs logged` : 'Workout logged'}
        </p>
        <p style={{ color: 'var(--white-muted)', fontSize: '13px' }}>Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="page" style={{ paddingTop: '48px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', animation: 'fadeUp 0.4s ease forwards', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '40px' }}>
            LOG <span style={{ color: 'var(--gold)' }}>WORKOUT</span>
          </h1>
          <hr className="gold-rule" style={{ marginTop: '12px', width: '120px' }} />
        </div>
        {totalVolume > 0 && (
          <div style={{ textAlign: 'right', paddingBottom: '4px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--white-muted)', marginBottom: '2px' }}>
              Session Volume
            </p>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              color: 'var(--gold)',
            }}>
              {Math.round(totalVolume).toLocaleString()}
              <span style={{ fontSize: '16px', color: 'var(--white-dim)', marginLeft: '6px' }}>LBS</span>
            </span>
          </div>
        )}
      </div>

      {/* Exercise blocks */}
      {exercises.map((block, idx) => (
        <ExerciseBlock
          key={block.id}
          block={block}
          index={idx}
          onChange={updateBlock}
          onRemove={removeBlock}
          canRemove={exercises.length > 1}
          exerciseSuggestions={existingExerciseNames}
        />
      ))}

      {/* Add exercise */}
      <button
        onClick={addExercise}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '14px',
          background: 'none',
          border: '1px dashed rgba(255,255,255,0.15)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--white-dim)',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          transition: 'all 150ms ease',
          marginBottom: '32px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
          e.currentTarget.style.color = 'var(--white)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'none'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
          e.currentTarget.style.color = 'var(--white-dim)'
        }}
      >
        + Add Another Exercise
      </button>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(224,90,90,0.1)',
          border: '1px solid rgba(224,90,90,0.3)',
          borderRadius: 'var(--radius)',
          color: 'var(--error)',
          fontSize: '13px',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      {/* Save */}
      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ width: '100%', padding: '16px', fontSize: '14px' }}
      >
        {saving ? 'Saving...' : `Save Workout${totalVolume > 0 ? ` · ${Math.round(totalVolume).toLocaleString()} lbs` : ''}`}
      </button>
    </div>
  )
}

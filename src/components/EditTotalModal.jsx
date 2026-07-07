import { useState, useRef } from 'react'

const CORRECT_CODE = '4120'

export default function EditTotalModal({ currentTotal, hasOverride, onSave, onReset, onCancel }) {
  const [step, setStep] = useState('code')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [amount, setAmount] = useState(() => (Number(currentTotal) || 0).toFixed(2))
  const [amountTouched, setAmountTouched] = useState(false)
  const amountRef = useRef(null)

  const submitCode = () => {
    if (code.trim() === CORRECT_CODE) {
      setCodeError('')
      setStep('amount')
    } else {
      setCodeError('Incorrect code — try again')
      setCode('')
    }
  }

  const parsed = parseFloat(amount)
  const amountValid = Number.isFinite(parsed) && parsed >= 0
  const showAmountHint = amountTouched && amount.trim() !== '' && !amountValid

  const submitAmount = () => {
    if (amountValid) onSave(parsed)
  }

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #1a0533, #0d1a33)',
          border: '1px solid rgba(124,58,237,0.5)',
          borderRadius: '24px',
          padding: '28px 24px',
          maxWidth: '380px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        }}
      >
        {step === 'code' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '4px' }}>Enter code to edit</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                A grown-up code is required
              </div>
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              value={code}
              onChange={(e) => { setCode(e.target.value); if (codeError) setCodeError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') submitCode() }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '16px',
                marginBottom: codeError ? '10px' : '20px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(124,58,237,0.5)',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 900,
                textAlign: 'center',
                letterSpacing: '0.6em',
                outline: 'none',
              }}
            />

            {codeError && (
              <div style={{
                color: '#f87171', fontSize: '0.85rem', fontWeight: 600,
                textAlign: 'center', marginBottom: '20px',
              }}>
                {codeError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="tap"
                onClick={onCancel}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                className="tap"
                onClick={submitCode}
                style={{
                  flex: 2, padding: '14px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  border: 'none',
                  color: '#fff', fontSize: '0.95rem', fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                }}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✏️</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '4px' }}>Edit weekly total</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                Set the amount paid for this week
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(124,58,237,0.5)',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: showAmountHint ? '10px' : '20px',
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24', marginRight: '8px' }}>$</span>
              <input
                ref={amountRef}
                type="text"
                inputMode="decimal"
                autoFocus
                value={amount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => { setAmount(e.target.value); setAmountTouched(true) }}
                onKeyDown={(e) => { if (e.key === 'Enter') submitAmount() }}
                style={{
                  flex: 1, width: '100%', minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  outline: 'none',
                }}
              />
            </div>

            {showAmountHint && (
              <div style={{
                color: '#f87171', fontSize: '0.8rem', fontWeight: 600,
                marginBottom: '20px',
              }}>
                Enter a valid amount (0 or more)
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="tap"
                onClick={onCancel}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                className="tap"
                onClick={submitAmount}
                disabled={!amountValid}
                style={{
                  flex: 2, padding: '14px', borderRadius: '12px',
                  background: amountValid
                    ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                    : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: amountValid ? '#fff' : 'rgba(255,255,255,0.35)',
                  fontSize: '0.95rem', fontWeight: 800,
                  cursor: amountValid ? 'pointer' : 'not-allowed',
                  boxShadow: amountValid ? '0 4px 16px rgba(124,58,237,0.4)' : 'none',
                }}
              >
                💾 Save
              </button>
            </div>

            {hasOverride && (
              <button
                className="tap"
                onClick={onReset}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(167,139,250,0.25)',
                  color: '#a78bfa',
                  fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ↩︎ Reset to calculated
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      width: '100%'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        padding: '3rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        border: '1px solid rgba(245, 166, 35, 0.2)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(245, 166, 35, 0.05)'
      }}>
        <div style={{ position: 'relative' }}>
          {/* Outer glowing ring */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3px solid rgba(245, 166, 35, 0.1)',
            borderTopColor: 'var(--brand-color)',
            animation: 'spin 1s linear infinite',
            boxShadow: '0 0 15px rgba(245, 166, 35, 0.3)'
          }}></div>
          {/* Inner pulse */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-color)',
            animation: 'pulse 1.5s ease-in-out infinite alternate',
            boxShadow: '0 0 20px var(--brand-glow)'
          }}></div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            color: 'var(--brand-color)', 
            fontSize: '1.2rem', 
            letterSpacing: '4px', 
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            textShadow: '0 0 10px rgba(245, 166, 35, 0.3)'
          }}>
            Accessing Data
          </h2>
          <p style={{ color: '#888', fontSize: '0.85rem', letterSpacing: '1px' }}>
            ESTABLISHING SECURE CONNECTION...
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }
      `}} />
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center', padding: '1.5rem', background: '#f7fafc', color: '#1e293b' }}>
      <div style={{ maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '280px', height: '200px', marginBottom: '1.5rem' }}>
          <div style={{ position: 'absolute', borderRadius: '50%', width: '35px', height: '35px', background: '#f43f5e', top: '10px', right: '35px' }}></div>
          <div style={{ position: 'absolute', borderRadius: '50%', width: '45px', height: '45px', background: '#fde047', top: '0px', left: '20px' }}></div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '5rem', fontWeight: 900, color: '#94a3b8' }}>
            <span>4</span><span style={{ color: '#38bdf8' }}>0</span><span>4</span>
          </div>
          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', width: '220px', height: '40px', background: '#38bdf8', borderRadius: '50px 50px 30px 30px' }}></div>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Oops!</h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: '0.25rem' }}>Who spilled the paint?</p>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '2rem' }}>The page you are looking for doesn't exist or has been moved.</p>
        <a href="/" style={{ background: '#2563eb', color: '#ffffff', padding: '0.75rem 1.75rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>GO BACK HOME</a>
      </div>
    </div>
  );
}
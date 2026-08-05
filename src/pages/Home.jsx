import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import loadingVideo from '../assets/video.mp4';
import { API_BASE_URL, GLOBAL_LOGO_URL } from '../config/constants';

export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null);
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [fadeVideo, setFadeVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  // Example Live Updates
  const [liveUpdates, setLiveUpdates] = useState([
    { name: "Anand Manikantan", role: "Data Analyst & Python Developer" },
    { name: "Sreejith S", role: "Automation Engineer" }
  ]);
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveUpdates.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [liveUpdates.length]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setStatus({ type: 'error', message: 'Please enter both email and password.' }); return; }
    setStatus({ type: 'info', message: 'Verifying credentials...' });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      if (response.data.success) {
        localStorage.setItem('talentino_student_token', response.data.token);
        localStorage.setItem('talentino_student_user', JSON.stringify(response.data.user));
        
        setIsLoggingIn(true);
        setTimeout(() => setFadeVideo(true), 5500); 
        setTimeout(() => navigate('/dashboard'), 6000);
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Server Error. Is the backend running?' });
    }
  };

  if (isLoggingIn) {
    return (
      <div className={`video-loader-overlay ${fadeVideo ? 'fade-out' : ''}`}>
        <video src={loadingVideo} autoPlay muted playsInline onCanPlayThrough={() => setIsVideoReady(true)} className={isVideoReady ? 'ready' : ''} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-dark)' }}>
      
      {/* 1. FIXED NAVIGATION BAR */}
      <nav className="site-nav">
        <img src={GLOBAL_LOGO_URL} alt="IPCS Global" style={{ height: '35px' }} />
        <div className="nav-links" style={{display: 'flex', gap: '2rem'}}>
          <a href="#home">Home</a>
          <a href="#about">About Cell</a>
          <a href="#recruiters">Top Recruiters</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* 2. HOME / HERO SECTION (Your existing Login layout) */}
      <section id="home" className="landing-wrapper" style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div className="landing-grid">
          <div className="hero-section">
            <div className="hero-badge">
              <i className="ph-fill ph-seal-check"></i>
              <div className="hero-badge-text">
                <span className="hero-badge-title">TALENZO</span>
                <span className="hero-badge-subtitle">Connecting Talent with Opportunity</span>
              </div>
            </div>
            <h1 className="hero-title">Unlock Global Tech<br/><span style={{ color: '#38bdf8' }}>Careers with IPCS</span></h1>
            <p className="hero-desc">IPCS Global connects future-ready talent in Industrial Automation, Embedded Systems, IoT, and Digital Tech with leading blue-chip global firms. Experience zero-barrier career transitions.</p>

            <button className="btn-glow" onClick={() => setShowAuthForm(true)}>
              Login / Signup <i className="ph-bold ph-caret-right"></i>
            </button>

            <div className="ticker-container">
              <div className="ticker-icon"><i className="ph-fill ph-lightning"></i></div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>Live Hiring Updates</div>
                <div key={tickerIndex} className="ticker-animate" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>{liveUpdates[tickerIndex].name} got hired as a {liveUpdates[tickerIndex].role}.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel-wrapper">
            {!showAuthForm ? (
              <div className="hiring-dashboard-card animate-fade-in">
                <div className="hiring-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#0284c7', color: '#ffffff', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><i className="ph-fill ph-lightning"></i></div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff' }}>Hiring Dashboard</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Realtime Campus Intake</span>
                    </div>
                  </div>
                  <div style={{ border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '6px 14px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800 }}>ACTIVE STAGE</div>
                </div>

                <div className="hiring-stat-box"><div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><i className="ph-fill ph-users"></i></div><div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Students Hired</div><div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>1.5 M +</div></div></div>
                <div className="hiring-stat-box"><div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><i className="ph-fill ph-buildings"></i></div><div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Enterprise Recruiters</div><div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>25 K +</div></div></div>
                <div className="hiring-stat-box"><div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><i className="ph-fill ph-medal"></i></div><div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Presence Across Countries</div><div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>50 +</div></div></div>
              </div>
            ) : (
              <div className="auth-card animate-fade-in">
                <div className="brand-logo-container"><img src={GLOBAL_LOGO_URL} alt="IPCS" className="auth-logo-img" /></div>
                <h2 style={{ textAlign: 'center', margin: '0 0 6px 0', color: '#ffffff' }}>Welcome back</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', marginBottom: '1.8rem' }}>Sign in to continue to your student portal</p>
                <form onSubmit={handleLogin}>
                  <div className="form-group"><label>Email ID</label><input type="email" placeholder="student@ipcsglobal.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div className="form-group"><label>Password</label>
                    <div className="pwd-wrapper">
                      <input type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <span className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}><i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'}`}></i></span>
                    </div>
                  </div>
                  <button type="submit" className="btn-action" style={{ width: '100%', marginTop: '0.8rem', padding: '1rem', borderRadius: '10px' }}>Sign in &rarr;</button>
                </form>
                {status && <div className={`alert alert-${status.type}`}>{status.message}</div>}
                <div className="switch-mode">Don't have an account? <span onClick={() => navigate('/signup')}>Create account</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="about" className="section-container">
        <div className="section-heading">
          <h2>Why IPCS Placement Cell?</h2>
          <p>We bridge the gap between academic learning and industry requirements, ensuring our students are day-one ready for top tech enterprises.</p>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon"><i className="ph-fill ph-chalkboard-teacher"></i></div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>Talentino Grooming</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>Exclusive pre-placement training sessions covering technical mock interviews, aptitude, and soft skills.</p>
          </div>
          <div className="about-card">
            <div className="about-icon"><i className="ph-fill ph-briefcase"></i></div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>Direct Enterprise Tie-ups</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>We hold direct MOUs with over 25,000+ companies globally for priority hiring drives.</p>
          </div>
          <div className="about-card">
            <div className="about-icon"><i className="ph-fill ph-rocket-launch"></i></div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>Dedicated TPO Support</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>Every branch is assigned a dedicated Placement Officer to track and mentor your career journey.</p>
          </div>
        </div>
      </section>

      {/* 4. TOP RECRUITERS (Marquee) */}
      <section id="recruiters" className="section-container">
        <div className="section-heading">
          <h2>Our Top Recruiters</h2>
          <p>Our alumni are driving innovation at the world's most prestigious organizations.</p>
        </div>
        
        {/* Infinite Marquee using simple text/icons for now. You can replace src with real company logos */}
        <div className="marquee-wrapper">
          <div className="marquee-content">
            <h2 style={{color: 'var(--text-muted)'}}>TCS</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Infosys</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Wipro</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Siemens</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Schneider Electric</h2>
            <h2 style={{color: 'var(--text-muted)'}}>ABB</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Honeywell</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Bosch</h2>
            {/* Duplicate for infinite effect */}
            <h2 style={{color: 'var(--text-muted)'}}>TCS</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Infosys</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Wipro</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Siemens</h2>
            <h2 style={{color: 'var(--text-muted)'}}>Schneider Electric</h2>
            <h2 style={{color: 'var(--text-muted)'}}>ABB</h2>
          </div>
        </div>
      </section>

      {/* 5. FOOTER / CONTACT */}
      <footer id="contact" className="site-footer">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div>
            <img src={GLOBAL_LOGO_URL} alt="IPCS" style={{ height: '40px', marginBottom: '1.5rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>Empowering students with industry-standard technical skills and placing them in top-tier organizations globally.</p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="#home" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</a>
              <a href="#about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About Us</a>
              <a href="/signup" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Student Registration</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem' }}>Contact Info</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '10px', alignItems: 'center' }}><i className="ph-fill ph-envelope"></i> placement@ipcsglobal.com</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '10px', alignItems: 'center' }}><i className="ph-fill ph-globe"></i> www.ipcsglobal.com</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} IPCS Global Placement Cell. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
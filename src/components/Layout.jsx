import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, X, House, User, Briefcase, Bell } from '@phosphor-icons/react';

export default function Layout({ children, activeTab, setActiveTab, user: dashboardUser, notifications = [], appliedJobs = [] }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('talentino_student_user');
        if (!storedUser) { navigate('/'); return; }
        setUser(dashboardUser?.name ? dashboardUser : JSON.parse(storedUser));
    } catch(e) {
        navigate('/');
    }
  }, [navigate, dashboardUser]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('talentino_student_token');
    localStorage.removeItem('talentino_student_user');
    navigate('/');
  };

  const getNotifications = () => {
    let notifs = [];
    (appliedJobs || []).forEach(job => {
      if (job?.status && job.status !== 'Applied') notifs.push({ title: `Status Update: ${job.company}`, desc: `Your application status changed to ${job.status}.`, tab: 'status' });
    });
    (notifications || []).forEach(ev => {
      if (ev?.title) notifs.push({ title: `New Event: ${ev.title}`, desc: `Scheduled for ${ev.date}.`, tab: 'dashboard' });
    });
    return notifs;
  };

  const liveNotifications = getNotifications();

  if (!user) return null;

  return (
    <div className="app-layout" onClick={() => { if(showNotif) setShowNotif(false); }}>
      <div className="top-header">
        <div className="header-left">
          {activeTab !== 'dashboard' ? (
            <button type="button" onClick={() => setActiveTab('dashboard')} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              &larr; Dashboard
            </button>
          ) : (
            <img src="https://lh3.googleusercontent.com/d/1y36ddjxHfSsu4cINBvUbeTe0OyobG2TP" alt="IPCS Global" className="header-logo-img" style={{ height: '40px' }} />
          )}
        </div>
        <div className="header-right">
          <div style={{ position: 'relative' }}>
            <button className="header-icon-btn" onClick={(e) => { e.stopPropagation(); setShowNotif(!showNotif); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)', position: 'relative' }}>
               <Bell size={24} />
               {liveNotifications.length > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', width: '10px', height: '10px', borderRadius: '50%' }}></span>}
            </button>
            {showNotif && (
              <div className="notif-dropdown" style={{ position: 'absolute', top: '50px', right: 0, width: '320px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1000, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)', fontWeight: 800, background: 'var(--bg-dark)' }}>Notifications</div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                   {liveNotifications.length === 0 ? <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No new notifications</div> : 
                     liveNotifications.map((n, i) => (
                       <div key={i} className="notif-item" style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }} onClick={() => { setActiveTab(n.tab); setShowNotif(false); }}>
                         <strong style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{n.title}</strong>
                         <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.desc}</span>
                       </div>
                     ))
                   }
                </div>
              </div>
            )}
          </div>

          <button className="header-icon-btn" onClick={toggleTheme} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
            {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
          <div className="user-profile-badge" onClick={() => setDrawerOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="avatar-circle" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {String(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="main-body">
        {children}
      </div>

      {/* SIDE DRAWER */}
      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={(e) => { if(e.target.className.includes('drawer-overlay')) setDrawerOpen(false); }}>
        <div className="drawer-card" style={{ width: '300px', background: 'var(--card-bg)', height: '100%', position: 'absolute', right: 0, padding: '20px', transition: 'transform 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{String(user?.name || 'U').charAt(0).toUpperCase()}</div>
              <div><strong style={{ color: 'var(--text-main)' }}>{user?.name || 'Student'}</strong><br/><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.rollNo || ''}</span></div>
            </div>
            <X size={24} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setDrawerOpen(false)} />
          </div>
          
          <div className="drawer-item" onClick={() => { setActiveTab('dashboard'); setDrawerOpen(false); }} style={{ padding: '15px 0', borderBottom: '1px solid var(--card-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><House size={20} /> Dashboard</div>
          <div className="drawer-item" onClick={() => { setActiveTab('talentino'); setDrawerOpen(false); }} style={{ padding: '15px 0', borderBottom: '1px solid var(--card-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><User size={20} /> Talentino</div>
          <div className="drawer-item" onClick={() => { setActiveTab('profile'); setDrawerOpen(false); }} style={{ padding: '15px 0', borderBottom: '1px solid var(--card-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><User size={20} /> Profile</div>
          <div className="drawer-item" onClick={() => { setActiveTab('vacancies'); setDrawerOpen(false); }} style={{ padding: '15px 0', borderBottom: '1px solid var(--card-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><Briefcase size={20} /> Vacancies</div>
          
          <div style={{ position: 'absolute', bottom: '20px', width: 'calc(100% - 40px)' }}>
            <button className="btn-action" style={{ width: '100%', background: '#ef4444' }} onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
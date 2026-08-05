import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
const navigate = useNavigate();

// ==========================================
// 1. GLOBAL STATES
// ==========================================
const [user, setUser] = useState({});
const [data, setData] = useState({ stats: {}, events: [], appliedJobs: [], vacancies: [], attendanceHistory: [], tpoInfo: {} });
const [theme, setTheme] = useState('dark');
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [greeting, setGreeting] = useState('Good Day');

// View States
const [activeTab, setActiveTab] = useState('dashboard');
const [drawerOpen, setDrawerOpen] = useState(false);
const [tpoModal, setTpoModal] = useState(false);
const [helpModal, setHelpModal] = useState(false);

// ==========================================
// 2. TALENTINO STATES
// ==========================================
const [gpsCoords, setGpsCoords] = useState(null);
const [locStatus, setLocStatus] = useState("Capture my location");
const [rating, setRating] = useState(0);
const [feedback, setFeedback] = useState('');
const [attStatus, setAttStatus] = useState(null);

// ==========================================
// 3. VACANCY STATES
// ==========================================
const [jobModal, setJobModal] = useState(null);
const [actionStatus, setActionStatus] = useState(null);
const [showConsent, setShowConsent] = useState(false);
const [q1, setQ1] = useState(false);
const [q2, setQ2] = useState(false);
const [showConfetti, setShowConfetti] = useState(false);

// ==========================================
// 4. PROFILE & VAULT STATES
// ==========================================
const [editProfileModal, setEditProfileModal] = useState(false);
const [editStatus, setEditStatus] = useState(null);
const [docStatus, setDocStatus] = useState(null);
const [editFormData, setEditFormData] = useState({
age: '', gender: 'Male', parentName: '', parentContact: '',
studyStatus: 'Currently Studying', completedDate: '',
stream: '', homeTown: '', fresherStatus: 'Fresher',
qualification: '', linkedin: '', instagram: '', placementReq: ''
});

// ==========================================
// 5. SETTINGS STATES
// ==========================================
const [settingsTab, setSettingsTab] = useState('security');
const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
const [pwdStatus, setPwdStatus] = useState(null);
const [showCurrPwd, setShowCurrPwd] = useState(false);
const [showNewPwd, setShowNewPwd] = useState(false);
const [showConfPwd, setShowConfPwd] = useState(false);

// ==========================================
// 6. LIFECYCLE & FETCH LOGIC
// ==========================================
useEffect(() => {
const hour = new Date().getHours();
if (hour < 12) setGreeting('Good Morning ☕');
else if (hour < 17) setGreeting('Good Afternoon ☀️');
else setGreeting('Good Evening 🌙');
}, []);

const fetchDashboard = useCallback(async (storedUser) => {
try {
const res = await axios.post('http://localhost:5000/api/dashboard/data', {
email: storedUser.email, branch: storedUser.branch, course: storedUser.course
});
if(res.data.success) {
setData(res.data);
if (res.data.userInfo) {
const mergedUser = { ...storedUser, ...res.data.userInfo };
setUser(mergedUser);
localStorage.setItem('talentino_student_user', JSON.stringify(mergedUser));
}
} else {
setError(res.data.message);
}
setLoading(false);
} catch (error) {
console.error("Data error", error);
setError("Failed to connect to the server. Please ensure the backend is running.");
setLoading(false);
}
}, []);

useEffect(() => {
const storedUser = JSON.parse(localStorage.getItem('talentino_student_user') || '{}');
if (!storedUser.email) { navigate('/'); return; }
setUser(storedUser);
fetchDashboard(storedUser);
}, [navigate, fetchDashboard]);

// ==========================================
// 7. UTILITY FUNCTIONS
// ==========================================
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

const getBreadcrumb = () => {
switch(activeTab) {
case 'talentino': return '› Talentino Session';
case 'vacancies': return '› Job Vacancies';
case 'status': return '› Application Status';
case 'profile': return '› Student Details';
case 'guide': return '› Guide & Resume Resources';
case 'settings': return '› Settings';
default: return '';
}
};

// ==========================================
// 8. TALENTINO LOGIC
// ==========================================
const captureGPS = () => {
if(!data.isScheduledToday || data.hasMarkedToday) return;
setLocStatus("Capturing...");
if (!navigator.geolocation) { setLocStatus("GPS Not Supported"); return; }
navigator.geolocation.getCurrentPosition(
pos => {
setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
setLocStatus(${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (GPS Verified));
},
err => { setLocStatus("GPS Permission Denied"); }
);
};

const submitAttendance = async () => {
setAttStatus({ type: 'info', message: 'Verifying location and submitting...' });
try {
const res = await axios.post('http://localhost:5000/api/dashboard/attendance', {
email: user.email, name: user.name, branch: user.branch, course: user.course,
rating, location: locStatus, userLat: gpsCoords.lat, userLng: gpsCoords.lng, feedback
});
if(res.data.success) {
setAttStatus({ type: 'success', message: 'Attendance marked successfully!' });
fetchDashboard(user);
}
} catch(err) {
setAttStatus({ type: 'error', message: err.response?.data?.message || 'Server Error' });
}
};

// ==========================================
// 9. JOB VACANCY LOGIC
// ==========================================
const isPastDate = (dateStr) => {
if (!dateStr || dateStr.toLowerCase() === 'open') return false;
let parts = dateStr.split('-');
if (parts.length === 3) {
let d = new Date(parts[0], parts[1]-1, parts[2]);
let now = new Date(); now.setHours(0,0,0,0);
return d < now;
}
return false;
};

const openApplyConfirm = () => {
if (!user.resume || user.resume === "N/A" || !user.resume.startsWith("http")) {
setActionStatus({ type: 'error', message: 'Resume Required! You have not uploaded a resume to your profile. Please close this window, go to your Profile Menu, and upload your PDF Resume document before applying.' });
setShowConsent(true);
} else {
setShowConsent(true);
setActionStatus(null);
}
};

const handleApply = async () => {
if (!q1 || !q2) {
setActionStatus({ type: 'error', message: 'You must check both consent boxes to apply.' });
return;
}
setActionStatus({ type: 'info', message: 'Submitting application...' });
try {
const res = await axios.post('http://localhost:5000/api/dashboard/apply', {
email: user.email, jobId: jobModal.newsletterId, companyName: jobModal.company,
name: user.name, phone: user.phone, rollNo: user.rollNo, course: user.course,
branch: user.branch, qualification: user.qualification, resume: user.resume
});
if(res.data.success) {
setShowConfetti(true);
fetchDashboard(user);
setTimeout(() => {
setJobModal(null); setActionStatus(null); setShowConsent(false);
setQ1(false); setQ2(false); setShowConfetti(false);
}, 2500);
} else {
setActionStatus({ type: 'error', message: res.data.message });
}
} catch(err) {
setActionStatus({ type: 'error', message: 'Server Error applying for job' });
}
};

// ==========================================
// 10. PROFILE & DOCUMENT LOGIC
// ==========================================
const openEditProfile = () => {
setEditFormData({
age: user.age && user.age !== 'N/A' ? user.age : '',
gender: user.gender && user.gender !== 'N/A' ? user.gender : 'Male',
parentName: user.parentName && user.parentName !== 'N/A' ? user.parentName : '',
parentContact: user.parentContact && user.parentContact !== 'N/A' ? user.parentContact : '',
studyStatus: user.studyStatus || 'Currently Studying',
completedDate: user.completedDate && user.completedDate !== 'N/A' ? user.completedDate : '',
stream: user.stream && user.stream !== 'N/A' ? user.stream : '',
homeTown: user.homeTown && user.homeTown !== 'N/A' ? user.homeTown : '',
fresherStatus: user.fresherStatus && user.fresherStatus !== 'N/A' ? user.fresherStatus : 'Fresher',
qualification: user.qualification && user.qualification !== 'N/A' ? user.qualification : '',
linkedin: user.linkedin && user.linkedin !== 'N/A' ? user.linkedin : '',
instagram: user.instagram && user.instagram !== 'N/A' ? user.instagram : '',
placementReq: user.placementReq && user.placementReq !== 'N/A' ? user.placementReq : ''
});
setEditStatus(null);
setEditProfileModal(true);
};

const handleProfileSubmit = async (e) => {
e.preventDefault();
setEditStatus({ type: 'info', message: 'Saving changes...' });
try {
const res = await axios.post('http://localhost:5000/api/dashboard/profile/update', {
email: user.email,
...editFormData
});
if (res.data.success) {
setEditStatus({ type: 'success', message: 'Profile updated successfully!' });
fetchDashboard(user);
setTimeout(() => setEditProfileModal(false), 1500);
} else {
setEditStatus({ type: 'error', message: res.data.message });
}
} catch (err) {
setEditStatus({ type: 'error', message: 'Server error saving profile.' });
}
};

const handleDocumentUpload = (e, docType) => {
const file = e.target.files[0];
if (!file) return;

if (file.type !== "application/pdf" && docType !== 'Profile Photo') {
  setDocStatus({ type: 'error', message: 'Only PDF files are allowed for Resumes/Certificates!' });
  return;
}
setDocStatus({ type: 'info', message: `Uploading ${docType}... Please wait.` });

const reader = new FileReader();
reader.onload = async (event) => {
  const base64Data = event.target.result;
  try {
    const res = await axios.post('http://localhost:5000/api/dashboard/profile/document', {
      email: user.email, rollNo: user.rollNo, base64: base64Data, docType: docType
    });
    if (res.data.success) {
      setDocStatus({ type: 'success', message: `${docType} uploaded successfully!` });
      fetchDashboard(user); 
      setTimeout(() => setDocStatus(null), 3000);
    } else {
      setDocStatus({ type: 'error', message: res.data.message });
    }
  } catch (err) {
    setDocStatus({ type: 'error', message: 'Upload failed. Check server connection.' });
  }
};
reader.readAsDataURL(file);
e.target.value = ''; 


};

// ==========================================
// 11. SETTINGS LOGIC
// ==========================================
const handlePasswordUpdate = async () => {
if(!passwords.current || !passwords.new || !passwords.confirm) {
setPwdStatus({ type: 'error', message: 'All fields are required.' }); return;
}
if(passwords.new !== passwords.confirm) {
setPwdStatus({ type: 'error', message: 'New passwords do not match.' }); return;
}
if(passwords.new.length < 8) {
setPwdStatus({ type: 'error', message: 'Password must be at least 8 characters.' }); return;
}
setPwdStatus({ type: 'info', message: 'Updating password...' });
try {
const res = await axios.post('http://localhost:5000/api/dashboard/profile/password', {
email: user.email, currentPassword: passwords.current, newPassword: passwords.new
});
if(res.data.success) {
setPwdStatus({ type: 'success', message: 'Password updated successfully!' });
setPasswords({ current: '', new: '', confirm: '' });
setTimeout(() => setPwdStatus(null), 3000);
} else {
setPwdStatus({ type: 'error', message: res.data.message });
}
} catch(err) {
setPwdStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password' });
}
};

// ==========================================
// RENDER UI (NO LAYOUT OR LUCIDE COMPONENTS)
// ==========================================
if (loading) {
return (
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-dark)', color: 'var(--accent-cyan)' }}>
<i className="ph-bold ph-spinner animate-spin" style={{ fontSize: '3rem' }}>
<p style={{ marginTop: '1rem', fontWeight: 600 }}>Syncing your dashboard...

);
}

if (error) {
return (
<div style={{ background: 'var(--bg-dark)', minHeight: '100vh', padding: '2rem' }}>
<div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto' }}>{error}

);
}

const guideResources = [
{ title: "Talentino HandBook", desc: "The official IPCS placement guide", link: "https://drive.google.com/file/d/10IFApxJGwGwRmVFpEtfQxc1RR-IraOq7/view?pli=1", icon: "ph-book-open", bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80" },
{ title: "Canva Templates", desc: "Design highly visual & modern resumes", link: "https://www.canva.com/en_in/login/?redirect=%2Fs%2Ftemplates%3Fquery%3Dprofessional%2Bresume", icon: "ph-palette", bg: "rgba(2, 132, 199, 0.15)", color: "#38bdf8" },
{ title: "Resume Writing Part 1", desc: "Essential basics for beginners", link: "https://www.youtube.com/watch?v=ZMByWenSRdI", icon: "ph-youtube-logo", bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
{ title: "Resume Writing Part 2", desc: "Structuring your skills and experience", link: "https://www.youtube.com/watch?v=gDN7cJ3Rt80", icon: "ph-youtube-logo", bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
{ title: "Interview Prep Guide", desc: "How to confidently answer questions", link: "https://www.youtube.com/watch?v=EW4dEzfBst0", icon: "ph-youtube-logo", bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
{ title: "Body Language Tips", desc: "Master your non-verbal communication", link: "https://www.youtube.com/watch?v=7JRj3r5vunU", icon: "ph-youtube-logo", bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
{ title: "Group Discussion Strategy", desc: "Stand out during group evaluations", link: "https://www.youtube.com/watch?v=k_f4Mb2ARdA", icon: "ph-youtube-logo", bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
{ title: "Resume.io", desc: "Professional builder with ATS templates", link: "https://resume.io/resume-templates", icon: "ph-file-text", bg: "rgba(168, 85, 247, 0.15)", color: "#c084fc" },
{ title: "MyPerfectResume", desc: "Fast and easy online resume creator", link: "https://www.myperfectresume.com/", icon: "ph-file-code", bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e" },
{ title: "MS Word Templates", desc: "Classic and reliable word document formats", link: "https://word.cloud.microsoft/en-us/search/resume/?wdOrigin=SEO-INTENT.WD-SE-L27-1-L27-1.SEARCHTEMPLATES", icon: "ph-microsoft-word-logo", bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" },
{ title: "Zety Builder", desc: "Create a winning resume in minutes", link: "https://zety.com/", icon: "ph-pencil-line", bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
{ title: "ATS Resume Guide", desc: "How to beat Applicant Tracking Systems", link: "https://www.youtube.com/watch?v=VB376MMEq38", icon: "ph-youtube-logo", bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
{ title: "Common Mistakes", desc: "Watch out for these CV errors", link: "https://www.youtube.com/watch?v=UjX_kl5UxPo", icon: "ph-youtube-logo", bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }
];

return (

{/* TOP HEADER */}


{activeTab !== 'dashboard' ? (
<button type="button" onClick={() => setActiveTab('dashboard')} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
 Dashboard

) : (

)}
<span style={{ marginLeft: '10px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{getBreadcrumb()}




<i className={ph-bold ${theme === 'dark' ? 'ph-moon' : 'ph-sun'}}>

<div className="user-profile-badge" onClick={() => setDrawerOpen(true)}>
{user?.name?.charAt(0).toUpperCase() || 'U'}




    <div className="dashboard-content">
      {/* ==========================================
          TAB: DASHBOARD HOME
      ========================================== */}
      {activeTab === 'dashboard' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <div className="dash-top-row">
            <div className="hero-banner">
              <div className="greeting-subtitle">{greeting}</div>
              <h2>Welcome back, <span style={{ color: 'var(--accent-cyan)' }}>{user.name || 'Student'}</span>!</h2>
              <div className="full-date-subtext">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div className="quick-actions-card">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Quick Actions</h3>
              <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                <div className="qa-btn" onClick={() => setActiveTab('talentino')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-dark)', padding: '10px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-main)' }}><div style={{ padding: '8px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '8px' }}><i className="ph-fill ph-check-circle" style={{ fontSize: '1.25rem' }}></i></div> Talentino</div>
                <div className="qa-btn" onClick={() => setTpoModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-dark)', padding: '10px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-main)' }}><div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px' }}><i className="ph-fill ph-address-book" style={{ fontSize: '1.25rem' }}></i></div> Contact TPO</div>
                <div className="qa-btn" onClick={() => setHelpModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-dark)', padding: '10px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-main)' }}><div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px' }}><i className="ph-fill ph-headset" style={{ fontSize: '1.25rem' }}></i></div> Request Help</div>
                <div className="qa-btn" onClick={() => setActiveTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-dark)', padding: '10px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-main)' }}><div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '8px' }}><i className="ph-fill ph-user" style={{ fontSize: '1.25rem' }}></i></div> Profile</div>
              </div>
            </div>
          </div>

          <div className="vacancy-quick-banner" onClick={() => setActiveTab('vacancies')} style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', color: '#a855f7' }}><i className="ph-fill ph-briefcase" style={{ fontSize: '1.75rem' }}></i></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>Latest Placement Vacancies</div>
                <div style={{ fontSize: '0.82rem', color: '#a5b4fc' }}>Explore active job openings for your course</div>
              </div>
            </div>
            <button className="btn-action" style={{ background: '#6366f1' }}>View Openings &rarr;</button>
          </div>

          <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '1.5rem' }}>
            <div className="stat-card-new" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ padding: '15px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '12px' }}><i className="ph-fill ph-check-circle" style={{ fontSize: '1.75rem' }}></i></div>
              <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{data.stats?.attended || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TALENTINO ATTENDED</div></div>
            </div>
            <div className="stat-card-new" onClick={() => setActiveTab('status')} style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', gap: '15px', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ padding: '15px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '12px' }}><i className="ph-fill ph-briefcase" style={{ fontSize: '1.75rem' }}></i></div>
              <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{data.stats?.applied || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>JOBS APPLIED</div></div>
            </div>
            <div className="stat-card-new" onClick={() => setActiveTab('status')} style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', gap: '15px', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ padding: '15px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px' }}><i className="ph-fill ph-calendar-check" style={{ fontSize: '1.75rem' }}></i></div>
              <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{data.stats?.interviews || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>INTERVIEWS SCHEDULED</div></div>
            </div>
            <div className="stat-card-new" onClick={() => setActiveTab('status')} style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)', display: 'flex', gap: '15px', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ padding: '15px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '12px' }}><i className="ph-fill ph-medal" style={{ fontSize: '1.75rem' }}></i></div>
              <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{data.stats?.offers || 0}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OFFERS RECEIVED</div></div>
            </div>
          </div>

          <div className="dash-bottom-row">
            <div className="upcoming-wrapper" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>Upcoming Events</h3>
              </div>
              {(data.events || []).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No upcoming events scheduled for your branch at this time.</div>
              ) : (
                data.events.map((ev, idx) => {
                  let monthStr = "TBA"; let dayStr = "--"; 
                  if (ev.date && ev.date !== "TBA") {
                    const d = new Date(ev.date.replace(/,/g, ''));
                    if(!isNaN(d)) { dayStr = d.getDate(); monthStr = d.toLocaleString('en-US', { month: 'short' }); }
                  }
                  const isInterview = ev.type.toLowerCase().includes('interview');
                  const badgeStyle = isInterview ? { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: '1px solid #0284c7' } : { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: '1px solid #7e22ce' };

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-dark)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem' }}>
                      <div style={{ width: '85px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '2px solid var(--input-border)', paddingRight: '1.2rem', marginRight: '1.2rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>{monthStr}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{dayStr}</div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{ev.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
                           {ev.time && <span>🕒 {ev.time}</span>}
                           {ev.location && <span>📍 {ev.location}</span>}
                        </div>
                      </div>
                      <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: badgeStyle.bg, color: badgeStyle.text, border: badgeStyle.border }}>{ev.type}</div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB: TALENTINO
      ========================================== */}
      {activeTab === 'talentino' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: 800 }}>Talentino Attendance</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Mark your attendance and track your session participation</p>
          </div>
          
          <div className="talentino-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}><i className="ph-fill ph-check-circle" style={{ color: '#10b981' }}></i> Present Check-ins</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: '10px' }}>{data.stats?.attended || 0}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}><span>Progress</span><span>{data.stats?.totalConducted > 0 ? Math.round((data.stats?.attended / data.stats?.totalConducted) * 100) : 0}%</span></div>
              <div style={{ height: '8px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '10px', overflow: 'hidden', marginTop: '6px' }}><div style={{ height: '100%', borderRadius: '10px', background: '#10b981', width: `${data.stats?.totalConducted > 0 ? Math.round((data.stats?.attended / data.stats?.totalConducted) * 100) : 0}%` }}></div></div>
            </div>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}><i className="ph-fill ph-calendar-blank" style={{ color: '#3b82f6' }}></i> Total Conducted</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: '10px' }}>{data.stats?.totalConducted || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sessions in your branch</div>
            </div>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}><i className="ph-fill ph-clock" style={{ color: '#f59e0b' }}></i> On Leave</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: '10px' }}>{data.stats?.onLeave || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved leaves</div>
            </div>
          </div>

          <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>Mark Today's Attendance</h3>
          
          {data.hasMarkedToday ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: 600 }}>
                 <i className="ph-fill ph-check-circle" style={{ fontSize: '1.4rem' }}></i> You have already marked your attendance for today.
              </div>
          ) : (
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: data.isScheduledToday ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${data.isScheduledToday ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <i className="ph-fill ph-calendar-check" style={{ color: data.isScheduledToday ? '#3b82f6' : '#ef4444', fontSize: '1.2rem' }}></i>
                  {data.isScheduledToday ? <span>Session active today <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(09:00:00 - 17:00:00)</span></span> : <span style={{ color: '#ef4444' }}>No Session scheduled for today</span>}
                </div>
                
                <div className="form-group" style={{ opacity: data.isScheduledToday ? 1 : 0.5, pointerEvents: data.isScheduledToday ? 'auto' : 'none' }}>
                  <label>Location Verification</label>
                  <div onClick={captureGPS} style={{ background: gpsCoords ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-dark)', color: gpsCoords ? '#10b981' : 'var(--text-main)', border: `1px solid ${gpsCoords ? '#10b981' : 'var(--card-border)'}`, padding: '1rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                    <i className="ph-fill ph-map-pin" style={{ marginRight: '8px' }}></i> {locStatus}
                  </div>
                </div>
                <div className="form-group" style={{ opacity: data.isScheduledToday ? 1 : 0.5, pointerEvents: data.isScheduledToday ? 'auto' : 'none' }}>
                  <label>Rate this session</label>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '1.8rem', cursor: 'pointer', marginTop: '4px', padding: '10px 0' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: rating >= s ? '#f59e0b' : 'var(--input-border)', transition: 'transform 0.2s' }} onClick={() => setRating(s)}>★</span>
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ opacity: data.isScheduledToday ? 1 : 0.5, pointerEvents: data.isScheduledToday ? 'auto' : 'none' }}>
                  <label>Feedback (optional)</label>
                  <textarea rows="3" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Share your thoughts about today's session..."></textarea>
                </div>

                <button className="btn-action" style={{ width: '100%', opacity: (data.isScheduledToday && gpsCoords && rating > 0) ? 1 : 0.5 }} disabled={!(data.isScheduledToday && gpsCoords && rating > 0)} onClick={submitAttendance}>Mark Attendance</button>
                {attStatus && <div className={`alert alert-${attStatus.type}`} style={{marginTop: '10px'}}>{attStatus.message}</div>}
              </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2rem 0 1rem 0', color: 'var(--text-main)', fontWeight: 800, fontSize: '1.1rem' }}>
            <i className="ph-fill ph-trend-up"></i> Attendance History
          </div>
          
          <div>
             {(data.attendanceHistory || []).length === 0 ? (
               <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>No attendance records yet.</div>
             ) : (
               (data.attendanceHistory || []).map((hist, idx) => {
                  let parsedDate = hist.dateStr || "Unknown"; let parsedTime = "";
                  try {
                    const d = new Date(hist.timestamp);
                    if(!isNaN(d)) {
                       parsedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                       parsedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    } else {
                       parsedDate = hist.timestamp.split(' ')[0] || hist.timestamp;
                       parsedTime = hist.timestamp.split(' ')[1] || "";
                    }
                  } catch(e) {}
                  let statusText = hist.rating >= 4 ? 'Good' : (hist.rating === 3 ? 'Average' : 'Poor');

                  return (
                    <div key={idx} style={{ background: 'var(--bg-dark)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><i className="ph-fill ph-check-circle"></i></div>
                          <div>
                             <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '2px' }}>{parsedDate}</strong>
                             <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{parsedTime} · {statusText}</span>
                          </div>
                       </div>
                       <div style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px' }}>
                         {'★'.repeat(hist.rating)}{'☆'.repeat(5 - hist.rating)}
                       </div>
                    </div>
                  )
               })
             )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB: VACANCIES
      ========================================== */}
      {activeTab === 'vacancies' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', borderRadius: '16px', padding: '3rem 1.5rem 2.5rem 1.5rem', marginBottom: '2rem', textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '2px', color: '#ffffff', margin: '0 0 8px 0', textTransform: 'uppercase' }}>JOB VACANCIES</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Job ID Not Valid After Expiry Date</p>
          </div>
          
          {(!user.vacancyOpen || user.vacancyOpen.toString().trim().toLowerCase() !== 'yes') ? (
             <div className="alert alert-error" style={{ margin: '2rem auto', maxWidth: '600px', padding: '2rem' }}>
                 <i className="ph-fill ph-lock-key" style={{ marginRight: '8px', fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i> 
                 Your access to view Job Vacancies is currently restricted. Please contact your Placement Officer.
             </div>
          ) : (data.vacancies || []).length === 0 ? (
             <div className="alert alert-info" style={{ margin: '2rem auto', maxWidth: '600px' }}><i className="ph-bold ph-spinner animate-spin"></i> Fetching live job vacancies...</div>
          ) : (
             Object.entries(
               [...(data.vacancies || [])].sort((a, b) => (isPastDate(a.lastDate) ? 1 : 0) - (isPastDate(b.lastDate) ? 1 : 0))
               .reduce((acc, vac) => {
                 const loc = (vac.state || 'OTHER STATES').toUpperCase().trim();
                 if(!acc[loc]) acc[loc] = [];
                 acc[loc].push(vac);
                 return acc;
             }, {})).map(([locationName, vacs], index) => (
                 <div key={index} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
                     <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.2rem' }}>{locationName}</h2>
                     <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                         <thead>
                             <tr>
                                 <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Newsletter ID</th>
                                 <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Position</th>
                                 <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Opening At</th>
                                 <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Mode of Work</th>
                                 <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Last Date</th>
                                 <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Action</th>
                             </tr>
                         </thead>
                         <tbody>
                             {vacs.map((vac, vIdx) => {
                                 const isApplied = (data.appliedJobs || []).some(j => j.jobId === vac.newsletterId);
                                 const isExpired = isPastDate(vac.lastDate);
                                 return (
                                     <tr key={vIdx} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.3s', cursor: (!isApplied && !isExpired) ? 'pointer' : 'default', opacity: isExpired ? 0.6 : 1 }} onClick={() => { if(!isApplied && !isExpired) { setJobModal(vac); setActionStatus(null); setShowConsent(false); setQ1(false); setQ2(false); }}}>
                                         <td style={{ padding: '14px 16px', color: 'var(--accent-purple)', fontWeight: 700 }}>{vac.newsletterId}</td>
                                         <td style={{ padding: '14px 16px', color: 'var(--text-main)', fontWeight: 700 }}>{vac.position}</td>
                                         <td style={{ padding: '14px 16px', color: 'var(--accent-cyan)' }}>{vac.location}</td>
                                         <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{vac.modeOfWork}</td>
                                         <td style={{ padding: '14px 16px', color: isExpired ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{vac.lastDate}</td>
                                         <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                             {isApplied ? (
                                                 <button className="btn-action" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid #22c55e', cursor: 'default' }} disabled><i className="ph-fill ph-check-circle" style={{marginRight: '6px'}}></i> Applied</button>
                                             ) : isExpired ? (
                                                 <button className="btn-action" style={{ background: 'var(--input-border)', color: 'var(--text-muted)', padding: '0.45rem 1rem', fontSize: '0.8rem', cursor: 'not-allowed' }} disabled><i className="ph-fill ph-prohibit" style={{marginRight: '6px'}}></i> Expired</button>
                                             ) : (
                                                 <button className="btn-action" style={{ background: 'var(--accent-blue)', padding: '0.45rem 1rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setJobModal(vac); setActionStatus(null); setShowConsent(false); setQ1(false); setQ2(false); }}>Details</button>
                                             )}
                                         </td>
                                     </tr>
                                 )
                             })}
                         </tbody>
                     </table>
                 </div>
             ))
          )}
        </div>
      )}

      {/* ==========================================
          TAB: STATUS
      ========================================== */}
      {activeTab === 'status' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: 800 }}>Application Status</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Track the current status of all your applied job openings</p>
          </div>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px', fontSize: '0.88rem' }}>
              <thead>
                <tr>
                  <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Job ID</th>
                  <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Company</th>
                  <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Applied Date & Time</th>
                  <th style={{ background: 'var(--table-header)', color: 'var(--text-muted)', textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', textTransform: 'uppercase' }}>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.appliedJobs || []).length === 0 ? <tr><td colSpan="4" style={{textAlign:'center', padding: '20px', color: 'var(--text-muted)'}}>No applications yet.</td></tr> : 
                  (data.appliedJobs || []).map((job, idx) => {
                    let statusClass = 'status-applied';
                    let s = job.status.toLowerCase();
                    if (s.includes('interview') || s.includes('schedule')) statusClass = 'status-interview';
                    if (s.includes('offer') || s.includes('selected') || s.includes('hired') || s.includes('join')) statusClass = 'status-offer';
                    if (s.includes('reject') || s.includes('not attended') || s.includes('no response') || s.includes('expired')) statusClass = 'status-rejected';

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <td style={{ padding: '14px 16px', color:'var(--accent-purple)', fontWeight:700 }}>{job.jobId}</td>
                        <td style={{ padding: '14px 16px', fontWeight:600, color: 'var(--text-main)' }}>{job.company}</td>
                        <td style={{ padding: '14px 16px', color:'var(--text-muted)', fontSize:'0.8rem' }}>{job.date}</td>
                        <td style={{ padding: '14px 16px' }}>
                           <span style={{ 
                              padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                              background: statusClass === 'status-applied' ? 'rgba(56, 189, 248, 0.15)' : statusClass === 'status-interview' ? 'rgba(168, 85, 247, 0.15)' : statusClass === 'status-offer' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: statusClass === 'status-applied' ? '#38bdf8' : statusClass === 'status-interview' ? '#a855f7' : statusClass === 'status-offer' ? '#4ade80' : '#f87171',
                              border: `1px solid ${statusClass === 'status-applied' ? '#0284c7' : statusClass === 'status-interview' ? '#7e22ce' : statusClass === 'status-offer' ? '#22c55e' : '#ef4444'}`
                           }}>
                             {job.status}
                           </span>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB: PROFILE (PORTFOLIO DESIGN)
      ========================================== */}
      {activeTab === 'profile' && (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          
          {/* Portfolio Hero / Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', borderRadius: '16px', padding: '2rem', position: 'relative', marginBottom: '4rem', border: '1px solid #6366f1' }}>
             <button className="btn-action" onClick={openEditProfile} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
               <i className="ph-bold ph-pencil-simple" style={{ marginRight: '6px' }}></i> Edit Profile
             </button>
             
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
                <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid var(--bg-dark)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', position: 'absolute', bottom: '-50px', background: 'var(--card-bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('photoUpdateUpload').click()}>
                   {user.photo && user.photo !== "N/A" ? (
                      <img src={user.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-muted)' }}>{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                   <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem', padding: '6px 0', textAlign: 'center', textTransform: 'uppercase', fontWeight: 700 }}>Update</div>
                </div>
             </div>
          </div>

          <input type="file" id="photoUpdateUpload" accept="image/*" className="hidden" onChange={(e) => handleDocumentUpload(e, 'Profile Photo')} />

          {/* Name & Titles */}
          <div style={{ textAlign: 'center', marginTop: '3.5rem', marginBottom: '2.5rem' }}>
             <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0' }}>{user.name}</h1>
             <div style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '12px' }}>{user.course || 'Course N/A'} • {user.branch || 'Branch N/A'}</div>
             <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                {user.linkedin && user.linkedin !== 'N/A' && (
                  <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0A66C2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s' }}><i className="ph-fill ph-linkedin-logo" style={{ fontSize: '1.5rem' }}></i></a>
                )}
                {user.instagram && user.instagram !== 'N/A' && (
                  <a href={user.instagram.startsWith('http') ? user.instagram : `https://instagram.com/${user.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s' }}><i className="ph-fill ph-instagram-logo" style={{ fontSize: '1.5rem' }}></i></a>
                )}
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Contact & Personal Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.8rem', border: '1px solid var(--card-border)' }}>
                 <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <i className="ph-fill ph-identification-card" style={{ color: 'var(--accent-cyan)', fontSize: '1.5rem' }}></i> Personal Details
                 </h3>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><i className="ph-fill ph-envelope"></i></div>
                      <div style={{ overflow: 'hidden' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div><div style={{ color: 'var(--text-main)', fontWeight: 600, wordBreak: 'break-all' }}>{user.email}</div></div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><i className="ph-fill ph-phone"></i></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.phone}</div></div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><i className="ph-fill ph-map-pin"></i></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Home Town</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.homeTown || 'N/A'}</div></div>
                   </div>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Age</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.age || 'N/A'}</div></div>
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gender</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.gender || 'N/A'}</div></div>
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Parent Name</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.parentName || 'N/A'}</div></div>
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Parent Contact</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.parentContact || 'N/A'}</div></div>
                 </div>
               </div>

               {/* Friend Referrals */}
               <div style={{ background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 700, marginBottom: '15px', textTransform: 'uppercase' }}>
                    <i className="ph-fill ph-users" style={{ verticalAlign: 'middle', marginRight: '5px', fontSize: '1.2rem' }}></i> Friend Referrals
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Friend 1</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{user.friend1Name || 'Not Provided'} <br/><span style={{color: 'var(--text-muted)'}}>{user.friend1Phone || ''}</span></div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Friend 2</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{user.friend2Name || 'Not Provided'} <br/><span style={{color: 'var(--text-muted)'}}>{user.friend2Phone || ''}</span></div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Academic & Professional Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.8rem', border: '1px solid var(--card-border)' }}>
                 <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <i className="ph-fill ph-graduation-cap" style={{ color: '#a855f7', fontSize: '1.5rem' }}></i> Academic Profile
                 </h3>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>IPCS Roll Number</div><div style={{ color: 'var(--accent-purple)', fontWeight: 800, fontSize: '1.1rem' }}>{user.rollNo || 'N/A'}</div></div>
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Course Status</div><div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>{user.studyStatus || 'Currently Studying'}</div></div>
                   
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Joining Date</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.joiningDate || 'N/A'}</div></div>
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Completed Date</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.completedDate || 'N/A'}</div></div>
                   
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Qualification</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.qualification || 'N/A'}</div></div>
                   <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Stream</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.stream || 'N/A'}</div></div>
                   
                   <div style={{ gridColumn: '1 / -1' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Experience Level</div><div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.fresherStatus || 'Fresher'}</div></div>
                 </div>
               </div>
               
               {/* Placement Requirements */}
               <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.8rem', border: '1px solid var(--card-border)' }}>
                 <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <i className="ph-fill ph-target" style={{ color: '#f59e0b', fontSize: '1.5rem' }}></i> Placement Requirements
                 </h3>
                 <div style={{ background: 'var(--input-bg)', padding: '15px', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5', border: '1px solid var(--input-border)' }}>
                   {user.placementReq && user.placementReq !== 'N/A' ? user.placementReq : 'No specific requirements mentioned.'}
                 </div>
               </div>
            </div>
          </div>

          {/* Document Vault Section */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1.8rem', border: '1px solid var(--card-border)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ph-fill ph-folder-open" style={{ color: '#22c55e', fontSize: '1.5rem' }}></i> Document Vault
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {/* Resume */}
                <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                       <i className="ph-fill ph-file-pdf"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>Resume.pdf</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Status: {user.resume && user.resume !== "N/A" ? <span style={{ color: '#4ade80', fontWeight: 700 }}>Verified & Synced</span> : <span style={{ color: '#ef4444', fontWeight: 700 }}>Missing (Action Required)</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <input type="file" id="resumeUploadInput" accept=".pdf" className="hidden" onChange={(e) => handleDocumentUpload(e, 'Resume')} />
                    <button className="btn-cancel" style={{ flex: 1, padding: '0.8rem', border: '1px solid var(--input-border)', background: 'transparent' }} onClick={() => document.getElementById('resumeUploadInput').click()}>
                      <i className="ph-bold ph-upload-simple" style={{ marginRight: '6px' }}></i> Upload New
                    </button>
                    {user.resume && user.resume !== "N/A" && (
                      <a href={user.resume} target="_blank" rel="noreferrer" className="btn-action" style={{ flex: 1, padding: '0.8rem', textDecoration: 'none', background: '#ef4444' }}><i className="ph-bold ph-eye"></i> View Resume</a>
                    )}
                  </div>
                </div>

                {/* Certificate */}
                <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                       <i className="ph-fill ph-certificate"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>Course Certificate.pdf</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Status: {user.certificate && user.certificate !== "N/A" ? <span style={{ color: '#4ade80', fontWeight: 700 }}>Verified & Synced</span> : <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Not Uploaded</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <input type="file" id="certUploadInput" accept=".pdf" className="hidden" onChange={(e) => handleDocumentUpload(e, 'Certificate')} />
                    <button className="btn-cancel" style={{ flex: 1, padding: '0.8rem', border: '1px solid var(--input-border)', background: 'transparent' }} onClick={() => document.getElementById('certUploadInput').click()}>
                      <i className="ph-bold ph-upload-simple" style={{ marginRight: '6px' }}></i> Upload New
                    </button>
                    {user.certificate && user.certificate !== "N/A" && (
                      <a href={user.certificate} target="_blank" rel="noreferrer" className="btn-action" style={{ flex: 1, padding: '0.8rem', textDecoration: 'none', background: '#f59e0b' }}><i className="ph-bold ph-eye"></i> View Cert</a>
                    )}
                  </div>
                </div>
              </div>
              {docStatus && <div className={`alert alert-${docStatus.type}`} style={{ marginTop: '1.5rem' }}>{docStatus.message}</div>}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB: GUIDE 
      ========================================== */}
      {activeTab === 'guide' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: 800 }}>Guide & Resume Resources</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Explore top platforms and guides to create a professional resume and prepare for placements.</p>
          </div>

          <div className="resume-grid">
            {guideResources.map((resource, idx) => (
              <div key={idx} className="resume-card" onClick={() => window.open(resource.link, '_blank')}>
                <div className="resume-icon-box" style={{ background: resource.bg, color: resource.color }}>
                  <i className={`ph-fill ${resource.icon}`}></i>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: 'var(--text-main)' }}>{resource.title}</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{resource.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB: SETTINGS
      ========================================== */}
      {activeTab === 'settings' && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: 800 }}>Settings</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Manage your account preferences and configuration</p>
          </div>

          <div className="settings-container">
            <div className="settings-sidebar">
              <div className={`settings-tab ${settingsTab === 'security' ? 'active' : ''}`} onClick={() => setSettingsTab('security')}>
                <i className="ph-fill ph-lock-key"></i> Security
              </div>
              <div className={`settings-tab ${settingsTab === 'appearance' ? 'active' : ''}`} onClick={() => setSettingsTab('appearance')}>
                <i className="ph-fill ph-palette"></i> Appearance
              </div>
            </div>

            <div className="settings-content-area">
              {settingsTab === 'security' && (
                <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', color: 'var(--text-main)' }}>Change Password</h3>
                  
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="pwd-wrapper">
                      <input type={showCurrPwd ? "text" : "password"} placeholder="Enter current password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} style={{ paddingRight: '40px' }}/>
                      <span className="pwd-toggle" onClick={() => setShowCurrPwd(!showCurrPwd)}><i className={`ph ${showCurrPwd ? 'ph-eye-slash' : 'ph-eye'}`}></i></span>
                    </div>
                  </div>
                  
                  <div className="grid-2col">
                    <div className="form-group">
                      <label>New Password</label>
                      <div className="pwd-wrapper">
                        <input type={showNewPwd ? "text" : "password"} placeholder="Enter new password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} style={{ paddingRight: '40px' }}/>
                        <span className="pwd-toggle" onClick={() => setShowNewPwd(!showNewPwd)}><i className={`ph ${showNewPwd ? 'ph-eye-slash' : 'ph-eye'}`}></i></span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="pwd-wrapper">
                        <input type={showConfPwd ? "text" : "password"} placeholder="Re-enter new password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} style={{ paddingRight: '40px' }}/>
                        <span className="pwd-toggle" onClick={() => setShowConfPwd(!showConfPwd)}><i className={`ph ${showConfPwd ? 'ph-eye-slash' : 'ph-eye'}`}></i></span>
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Use at least 8 characters with a mix of letters, numbers & symbols.</p>
                  
                  {pwdStatus && <div className={`alert alert-${pwdStatus.type}`} style={{ marginBottom: '15px' }}>{pwdStatus.message}</div>}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-action" onClick={handlePasswordUpdate}>Update Password</button>
                  </div>
                </div>
              )}

              {settingsTab === 'appearance' && (
                <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Appearance</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>Choose how the dashboard looks. You can also toggle the theme from the top bar.</p>
                  
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>THEME</div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className={`theme-option-box ${theme === 'light' ? 'selected' : ''}`} onClick={() => { setTheme('light'); document.body.setAttribute('data-theme', 'light'); }} style={{ flex: 1 }}>
                      <div className="theme-preview light"></div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Light</div>
                    </div>
                    <div className={`theme-option-box ${theme === 'dark' ? 'selected' : ''}`} onClick={() => { setTheme('dark'); document.body.setAttribute('data-theme', 'dark'); }} style={{ flex: 1 }}>
                      <div className="theme-preview dark"></div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Dark</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

  {/* SIDE DRAWER */}
  <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={(e) => { if(e.target.className.includes('drawer-overlay')) setDrawerOpen(false); }}>
    <div className="drawer-card" style={{ position: 'absolute', right: 0 }}>
      <div className="drawer-header" style={{ background: 'var(--accent-blue)', color: '#ffffff', padding: '2rem 1.5rem 1.5rem 1.5rem', position: 'relative' }}>
        <div className="drawer-close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem', width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setDrawerOpen(false)}><i className="ph-bold ph-x"></i></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ffffff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', border: '2px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
             {user.photo && user.photo !== "N/A" ? <img src={user.photo} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="P" /> : user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style={{ display:'block', fontSize:'1.1rem', fontWeight:700 }}>{user.name}</strong>
            <span style={{ fontSize:'0.8rem', opacity:0.9 }}>{user.rollNo}</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        <div className="drawer-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('dashboard'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph-fill ph-house" style={{ color: 'var(--text-muted)' }}></i> Dashboard</div><span>&rsaquo;</span></div>
        <div className="drawer-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('talentino'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph-fill ph-user-check" style={{ color: 'var(--text-muted)' }}></i> Talentino</div><span>&rsaquo;</span></div>
        <div className="drawer-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('profile'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph-fill ph-user" style={{ color: 'var(--text-muted)' }}></i> Profile</div><span>&rsaquo;</span></div>
        <div className="drawer-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('status'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph-fill ph-list-checks" style={{ color: 'var(--text-muted)' }}></i> Application Status</div><span>&rsaquo;</span></div>
        <div className="drawer-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('vacancies'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph-fill ph-briefcase" style={{ color: 'var(--text-muted)' }}></i> Current Job Vacancies</div><span>&rsaquo;</span></div>
        <div className="drawer-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('guide'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph-fill ph-book-open" style={{ color: 'var(--text-muted)' }}></i> Guide</div><span>&rsaquo;</span></div>
        <div className="drawer-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setTpoModal(true)}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph-fill ph-address-book" style={{ color: 'var(--text-muted)' }}></i> Contact TPO</div><span>&rsaquo;</span></div>
        <div className="drawer-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setHelpModal(true)}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph-fill ph-info" style={{ color: 'var(--text-muted)' }}></i> Request Help</div><span>&rsaquo;</span></div>
        <div className="drawer-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setActiveTab('settings'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph-fill ph-gear" style={{ color: 'var(--text-muted)' }}></i> Settings</div><span>&rsaquo;</span></div>
      </div>
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--card-border)', textAlign: 'center' }}>
        <button className="btn-action" style={{ width: '100%', padding: '0.8rem', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '30px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1rem' }} onClick={handleLogout}>Log Out</button>
        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Copyright &copy; 2026 Talentino IPCS Global</div>
      </div>
    </div>
  </div>

  {/* JOB DETAIL MODAL */}
  {jobModal && (
    <div className="report-modal-overlay">
      <div className="report-card" style={{ maxWidth: '600px', width: '90%', padding: '0', overflow: 'hidden', position: 'relative' }}>
        
        {showConfetti && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(19, 25, 36, 0.95)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '5rem', display: 'block', marginBottom: '10px' }}>🎉</span>
              <h2 style={{ color: 'white', marginBottom: '10px' }}>Application Successful!</h2>
              <p style={{ color: '#a5b4fc', margin: 0 }}>You can track this in Application Status.</p>
            </div>
          </div>
        )}

        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--card-border)', background: 'var(--bg-dark)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>
              {jobModal.position} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({jobModal.newsletterId})</span>
            </h3>
            <i className="ph-bold ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.4rem' }} onClick={() => { setJobModal(null); setShowConsent(false); setQ1(false); setQ2(false); }}></i>
          </div>
          <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.15rem' }}>{jobModal.company}</strong>
        </div>
        
        <div style={{ padding: '2rem', maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ background: 'var(--input-bg)', padding: '18px 24px', borderRadius: '12px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
            <div><strong style={{ color: 'var(--text-muted)' }}>Location:</strong> <span style={{ color: 'var(--text-main)' }}>{jobModal.location}</span></div>
            <div><strong style={{ color: 'var(--text-muted)' }}>Mode of Work:</strong> <span style={{ color: 'var(--text-main)' }}>{jobModal.modeOfWork}</span></div>
            <div><strong style={{ color: 'var(--text-muted)' }}>No. of Openings:</strong> <span style={{ color: 'var(--text-main)' }}>{jobModal.openings}</span></div>
            <div><strong style={{ color: 'var(--text-muted)' }}>Experience:</strong> <span style={{ color: 'var(--text-main)' }}>{jobModal.experience}</span></div>
            <div><strong style={{ color: 'var(--text-muted)' }}>Salary:</strong> <span style={{ color: 'var(--text-main)' }}>{jobModal.salary}</span></div>
            <div><strong style={{ color: 'var(--text-muted)' }}>Interview Date:</strong> <span style={{ color: 'var(--text-main)' }}>{jobModal.interviewDate}</span></div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontSize: '1rem' }}>Qualification Required:</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{jobModal.qualification}</div>
          </div>

          {jobModal.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '8px', fontSize: '1rem' }}>Job Description:</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-line', background: 'var(--hover-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                {jobModal.description}
              </div>
            </div>
          )}

          {showConsent ? (
            <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
              {actionStatus && actionStatus.type === 'error' && actionStatus.message.includes('Resume') ? (
                <div className="alert alert-error" style={{ margin: 0, padding: '1.5rem', textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {actionStatus.message}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <input type="checkbox" checked={q1} onChange={e => setQ1(e.target.checked)} style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }} />
                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>1. As I am applying for this job, I agree that I will attend the interview whenever the company calls me without fail.</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                    <input type="checkbox" checked={q2} onChange={e => setQ2(e.target.checked)} style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }} />
                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>2. I agree as per Placement rule if I fail to attend this company interview, I will be removed from placement support.</p>
                  </div>
                  
                  {actionStatus && <div className={`alert alert-${actionStatus.type}`} style={{ marginBottom: '15px' }}>{actionStatus.message}</div>}
                  
                  <button className="btn-action" style={{ width: '100%', background: (q1 && q2) ? '#22c55e' : 'var(--input-border)', color: (q1 && q2) ? '#fff' : 'var(--text-muted)', padding: '1rem', fontSize: '1rem', cursor: (q1 && q2) ? 'pointer' : 'not-allowed' }} onClick={handleApply}>
                    Confirm Application
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
              <button className="btn-action" style={{ flex: 1, background: '#22c55e', padding: '1rem', fontSize: '1rem' }} onClick={openApplyConfirm}>Apply &rarr;</button>
              <button className="btn-cancel" style={{ flex: 1, padding: '1rem', fontSize: '1rem' }} onClick={() => { setJobModal(null); setShowConsent(false); setQ1(false); setQ2(false); }}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )}

  {/* TPO MODAL */}
  {tpoModal && (
    <div className="report-modal-overlay">
      <div className="report-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className="modal-header-border">
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Contact Placement Officer</h3>
          <i className="ph-bold ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }} onClick={() => setTpoModal(false)}></i>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--hover-bg)', margin: '0 auto 10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-cyan)' }}>
            <i className="ph-fill ph-user-tie" style={{ fontSize: '2.5rem', color: 'var(--accent-cyan)' }}></i>
          </div>
          <h2 style={{ margin: '0 0 5px 0' }}>{data.tpoInfo?.name || "Placement Officer"}</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sitting Branch: <strong style={{ color: 'var(--text-main)' }}>{data.tpoInfo?.sittingBranch || "N/A"}</strong></div>
        </div>
        <div style={{ background: 'var(--input-bg)', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '0.9rem' }}>
          <div style={{ marginBottom: '10px' }}><strong>Email:</strong> <span style={{ color: 'var(--accent-cyan)' }}>{data.tpoInfo?.email || "placement@ipcsglobal.com"}</span></div>
          <div style={{ marginBottom: '10px' }}><strong>Phone:</strong> <span>{data.tpoInfo?.phone || "N/A"}</span></div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <a className="btn-action" style={{ flex: 1, background: '#2563eb', textDecoration: 'none' }}><i className="ph-fill ph-phone"></i> Call</a>
          <a className="btn-action" style={{ flex: 1, background: '#22c55e', textDecoration: 'none' }}><i className="ph-fill ph-whatsapp-logo"></i> WhatsApp</a>
        </div>
      </div>
    </div>
  )}

  {/* HELP MODAL */}
  {helpModal && (
    <div className="report-modal-overlay">
      <div className="report-card">
        <div className="modal-header-border">
          <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="ph-fill ph-headset" style={{ color: 'var(--accent-cyan)' }}></i> Request Help / Inquiry</h3>
          <i className="ph-bold ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }} onClick={() => setHelpModal(false)}></i>
        </div>
        <div className="form-group"><label>Describe Your Issue or Inquiry *</label><textarea rows="5" placeholder="Explain the problem or inquiry in detail..."></textarea></div>
        <button className="btn-action" style={{ width: '100%' }} onClick={() => setHelpModal(false)}>Submit Report &rarr;</button>
      </div>
    </div>
  )}

  {/* EDIT PROFILE MODAL */}
  {editProfileModal && (
    <div className="report-modal-overlay" style={{ zIndex: 1200 }}>
      <div className="report-card" style={{ maxWidth: '700px' }}>
        <div className="modal-header-border">
          <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ph-bold ph-pencil-simple" style={{ color: 'var(--accent-cyan)' }}></i> Edit Profile Details
          </h3>
          <i className="ph-bold ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }} onClick={() => setEditProfileModal(false)}></i>
        </div>
        
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px', background: 'var(--hover-bg)', padding: '10px', borderRadius: '8px' }}>
          <strong>Note:</strong> Core ID details (Name, Roll No, Branch, Email, Course) are strictly uneditable by students to prevent database corruption. Contact Admin for corrections.
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Age</label>
              <input type="number" value={editFormData.age} onChange={e => setEditFormData({...editFormData, age: e.target.value})} placeholder="e.g. 22" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Gender</label>
              <select value={editFormData.gender} onChange={e => setEditFormData({...editFormData, gender: e.target.value})}>
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Parent Name</label>
              <input type="text" value={editFormData.parentName} onChange={e => setEditFormData({...editFormData, parentName: e.target.value})} placeholder="Full Name" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Parent Contact No.</label>
              <input type="tel" value={editFormData.parentContact} onChange={e => setEditFormData({...editFormData, parentContact: e.target.value})} placeholder="+91 XXXXXXXXXX" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Studying Status</label>
              <select value={editFormData.studyStatus} onChange={e => setEditFormData({...editFormData, studyStatus: e.target.value})}>
                <option value="Currently Studying">Currently Studying</option><option value="Completed Course">Completed Course</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Course Completed Date</label>
              <input type="date" value={editFormData.completedDate} onChange={e => setEditFormData({...editFormData, completedDate: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Qualification</label>
              <input type="text" value={editFormData.qualification} onChange={e => setEditFormData({...editFormData, qualification: e.target.value})} placeholder="e.g. B.Tech" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Stream</label>
              <input type="text" value={editFormData.stream} onChange={e => setEditFormData({...editFormData, stream: e.target.value})} placeholder="e.g. IT" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Home Town</label>
              <input type="text" value={editFormData.homeTown} onChange={e => setEditFormData({...editFormData, homeTown: e.target.value})} placeholder="e.g. Kochi" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Fresher Status</label>
              <select value={editFormData.fresherStatus} onChange={e => setEditFormData({...editFormData, fresherStatus: e.target.value})}>
                <option value="Fresher">Fresher</option><option value="Experienced">Experienced</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>LinkedIn Link</label>
              <input type="text" value={editFormData.linkedin} onChange={e => setEditFormData({...editFormData, linkedin: e.target.value})} placeholder="www.linkedin.com/in/..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Instagram Handle</label>
              <input type="text" value={editFormData.instagram} onChange={e => setEditFormData({...editFormData, instagram: e.target.value})} placeholder="@username" />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.2rem', marginBottom: 0 }}>
            <label>Any Specific Requirement For Placement</label>
            <textarea rows="2" value={editFormData.placementReq} onChange={e => setEditFormData({...editFormData, placementReq: e.target.value})} placeholder="Preferred location, salary expectation..."></textarea>
          </div>

          {editStatus && <div className={`alert alert-${editStatus.type}`} style={{ marginTop: '15px' }}>{editStatus.message}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn-cancel" onClick={() => setEditProfileModal(false)}>Cancel</button>
            <button type="submit" className="btn-action">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )}

</div>


);
}
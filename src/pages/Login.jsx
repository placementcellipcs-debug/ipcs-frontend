import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, X } from '@phosphor-icons/react';
import axios from 'axios';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tncAccepted, setTncAccepted] = useState(false);
  const [status, setStatus] = useState(null);


  const [showTncModal, setShowTncModal] = useState(false);
  const [tncScrolled, setTncScrolled] = useState(false);
 
  const navigate = useNavigate();


  const handleTncScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 25;
    if (bottom) setTncScrolled(true);
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setStatus({ type: 'error', message: 'Please enter both email and password.' }); return; }
    if (!tncAccepted) { setStatus({ type: 'error', message: 'You must accept the Terms & Conditions.' }); return; }


    setStatus({ type: 'info', message: 'Verifying credentials...' });


    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('talentino_student_token', response.data.token);
        localStorage.setItem('talentino_student_user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Server Error. Is the backend running?' });
    }
  };


  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="brand-logo-container">
          <img src="https://lh3.googleusercontent.com/d/1y36ddjxHfSsu4cINBvUbeTe0OyobG2TP" alt="IPCS Global Logo" className="auth-logo-img" />
        </div>
        <h2 style={{ textAlign: 'center', margin: '0 0 6px 0' }}>Welcome back</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', marginBottom: '1.8rem' }}>Sign in to continue to your student portal</p>


        <form onSubmit={handleLogin}>
          <div className="form-group"><label>Email ID</label><input type="email" placeholder="student@ipcsglobal.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="form-group"><label>Password</label>
            <div className="pwd-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="Enter password" style={{ paddingRight: '40px' }} value={password} onChange={(e) => setPassword(e.target.value)} />
              <span className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}</span>
            </div>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
            <input type="checkbox" style={{ width: 'auto', cursor: tncAccepted ? 'pointer' : 'not-allowed' }} checked={tncAccepted} disabled={!tncAccepted} onChange={(e) => setTncAccepted(e.target.checked)} />
            <label style={{ margin: 0, fontSize: '0.8rem', textTransform: 'none' }}>I have read and accepted the <span className="tnc-link" onClick={() => setShowTncModal(true)}>Terms & Conditions</span></label>
          </div>
          <button type="submit" className="btn-action" style={{ width: '100%', marginTop: '0.8rem' }}>Sign in &rarr;</button>
        </form>


        {status && <div className={`alert alert-${status.type}`}>{status.message}</div>}


        <div className="switch-mode">Don't have an account? <span onClick={() => navigate('/signup')}>Create account</span></div>
      </div>


      {showTncModal && (
        <div className="report-modal-overlay">
          <div className="report-card" style={{ maxWidth: '650px' }}>
            <div className="modal-header-border">
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>IPCS Placement Rule Set</h3>
              <X size={24} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowTncModal(false)} />
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 0 }}>Below mentioned are the Rules to be followed by students for getting Placement Support from IPCS. Please scroll to the bottom to accept.</p>
            <div className="tnc-content-box" onScroll={handleTncScroll}>
              <h4>ELIGIBILITY CRITERIA FOR ATTENDING THE INTERVIEWS</h4>
              <ul>
                <li>Students who have completed at least 90% of the course (certain companies want candidates immediately in such case you should be in a position to join immediately).</li>
                <li>Students who have paid the full fees.</li>
                <li>Students who have passion for working & take their career seriously.</li>
                <li>Candidates should be ready for any location (exemption only for female students).</li>
              </ul>
              <h4>DOS & DON’TS FOR THE CANDIDATES</h4>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>During Job applications & Interview:</strong>
              <ul>
                <li>Check all criteria mentioned in the employment news, if everything suits to you then only APPLY to the mentioned company.</li>
                <li>Students should attend the interview on the date and time as allotted by the recruiter.</li>
                <li>It is mandatory for Students to update the placement coordinator of their attendance in the interviews. If they are not updating their attendance they will not be allowed for the next interview.</li>
                <li>Students attending the interview and not getting selected is not a problem. Losing in an interview is not a criteria for further interviews.</li>
                <li>Students who are not attending the 3 interviews even after their acceptance to attend the interviews will be barred to attend any further interviews and name will be removed from Placement Support.</li>
                <li>Once enrolled for Placement Support, we expect to student to apply for all companies, if a student not applying to any company for more than 15 days with a valid reason will be removed from Placement Support.</li>
              </ul>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '8px', marginTop: '10px' }}>During Joining:</strong>
              <ul>
                <li>Students can take time to accept or reject the company’s offer but keep the Placement Team and the recruiter updated of their intentions.</li>
                <li>Students after being selected & given a date to join should adhere to that. No excuses will be accepted thereafter.</li>
                <li>Students who are not joining after being selected by a recruiter will have to justify why he/she has not joined. Without an apt reason there won’t be more chances.</li>
                <li>2 times after accepting the offer and not joining will be considered as Black Mark and such student will be barred and name will be removed from Placement Support.</li>
                <li>1 year commitment to the company getting recruited is mandatory.</li>
                <li>If anyone joining and getting absconded from work without informing employer will be removed from our Placement Support.</li>
                <li>There will not be any commitment on Basic Salary /Work Location or other facilities - Candidate has to abide the HR policies set by the hiring company.</li>
              </ul>
              <h4>Promotional Use of Student Media</h4>
              <p style={{ marginTop: 0, marginBottom: '20px' }}>Photos and videos of the student taken by IPCS after successful placement may be used by the organization for promotional purposes. By participating in the placement process, the student gives consent for IPCS to use such media across platforms including social media, websites, brochures, and other official materials.</p>
              <h4>DECLARATION</h4>
              <p style={{ marginTop: 0 }}>I hereby declare that I have read & understood the terms & conditions of IPCS Placement Cell. I adhere to follow the rules & incase of any failure to do so; I understand that I won’t be eligible for Placement Support & it will be completely my sole responsibility.</p>
            </div>
            {!tncScrolled ? (
              <div style={{ textAlign: 'center', color: '#f59e0b', fontSize: '0.88rem', fontWeight: 700, marginTop: '15px' }}>↓ Please scroll to the end of the rules to Accept ↓</div>
            ) : (
              <div style={{ display: 'flex', marginTop: '20px' }}>
                <button type="button" className="btn-action" style={{ width: '100%', background: '#22c55e' }} onClick={() => { setTncAccepted(true); setShowTncModal(false); }}>Accept</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default Login;

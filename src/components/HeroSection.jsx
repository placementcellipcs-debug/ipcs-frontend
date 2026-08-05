import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function HeroSection() {
  const navigate = useNavigate();
  const [showAuthForm, setShowAuthForm] = useState(false);
  
  // Slide Show State
  const [liveUpdates, setLiveUpdates] = useState([
    { name: "Anand Manikantan", role: "Data Analyst & Python Developer" },
    { name: "Sabah Sulfikar", role: "Embedded Systems Engineer" }
  ]);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [triggerAnim, setTriggerAnim] = useState(true);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Fetch from Google Sheet / Backend
  useEffect(() => {
    const fetchPlacedStudents = async () => {
      try {
        // Replace with your actual backend URL that parses "opening_applied"
        const res = await axios.get('http://localhost:5000/api/public/placed-students');
        if (res.data.success && res.data.data.length > 0) {
          setLiveUpdates(res.data.data); // Should return array: [{name, role}]
        }
      } catch (err) {
        console.log("Using fallback live updates");
      }
    };
    fetchPlacedStudents();
  }, []);

  // Ticker Animation Interval
  useEffect(() => {
    if (liveUpdates.length === 0) return;
    const interval = setInterval(() => {
      setTriggerAnim(false); // reset animation
      setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % liveUpdates.length);
        setTriggerAnim(true); // trigger animation
      }, 50);
    }, 4000);
    return () => clearInterval(interval);
  }, [liveUpdates.length]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Insert actual login logic here
    navigate('/dashboard');
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden" id="home">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Info Panel */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-3 bg-cyan-900/20 border border-cyan-500/30 rounded-full py-2 px-5 w-fit">
            <i className="fa-solid fa-seal-check text-cyan-400"></i>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-cyan-400 tracking-widest uppercase">Talenzo</span>
              <span className="text-[0.6rem] text-cyan-400/80 font-bold uppercase tracking-wider">Connecting Talent with Opportunity</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight">
            Unlock Global Tech <br/>
            <span className="text-cyan-400">Careers with IPCS</span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
            IPCS Global connects future-ready talent in Industrial Automation, Embedded Systems, IoT, and Digital Tech with leading blue-chip global firms.
          </p>

          <div className="pt-2">
            <button className="btn-glow" onClick={() => setShowAuthForm(true)}>
              Login / Signup <i className="fa-solid fa-chevron-right ml-2 text-sm"></i>
            </button>
          </div>

          {/* Live Ticker Slide Show */}
          <div className="mt-8 border-t border-slate-800/80 pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-bolt text-lg"></i>
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Live Hiring Updates</div>
              {triggerAnim && (
                <div className="ticker-slide-up text-sm text-slate-300 font-medium">
                  <span className="text-white font-bold">{liveUpdates[tickerIndex]?.name}</span> got hired as a {liveUpdates[tickerIndex]?.role}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Toggle Dashboard Stats or Login */}
        <div className="relative flex justify-center w-full">
          {!showAuthForm ? (
            <div className="glass-panel rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-800 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-500 text-white w-10 h-10 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Hiring Dashboard</h3>
                    <p className="text-xs text-slate-400">Realtime Campus Intake</p>
                  </div>
                </div>
                <span className="text-[0.65rem] font-bold px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full">ACTIVE STAGE</span>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-slate-700/50">
                  <i className="fa-solid fa-users text-cyan-400 bg-cyan-400/10 p-3 rounded-full text-xl"></i>
                  <div>
                    <p className="text-[0.65rem] uppercase text-slate-400 font-bold tracking-wider">Total Students Hired</p>
                    <h4 className="text-2xl font-black text-white mt-1">1.5 M +</h4>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-slate-700/50">
                  <i className="fa-solid fa-building text-indigo-400 bg-indigo-400/10 p-3 rounded-full text-xl"></i>
                  <div>
                    <p className="text-[0.65rem] uppercase text-slate-400 font-bold tracking-wider">Enterprise Recruiters</p>
                    <h4 className="text-2xl font-black text-white mt-1">25 K +</h4>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-slate-700/50">
                  <i className="fa-solid fa-award text-yellow-500 bg-yellow-500/10 p-3 rounded-full text-xl"></i>
                  <div>
                    <p className="text-[0.65rem] uppercase text-slate-400 font-bold tracking-wider">Presence Across Countries</p>
                    <h4 className="text-2xl font-black text-white mt-1">50 +</h4>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
              <div className="flex justify-center mb-6">
                 {/* Replaced with standard text since logo wasn't fully supplied, but you can put <img src={logo}/> here */}
                 <h2 className="text-2xl font-black text-white"><span className="text-cyan-400">IPCS</span> GLOBAL</h2>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Welcome back</h3>
                <p className="text-sm text-slate-400">Sign in to continue to your student portal</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="form-group">
                  <label>Email ID</label>
                  <input type="email" placeholder="student@ipcsglobal.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Enter password" value={password} onChange={e=>setPassword(e.target.value)} required/>
                </div>
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-colors">Sign in &rarr;</button>
              </form>
              <div className="text-center mt-6 text-sm text-slate-400">
                Don't have an account? <span className="text-cyan-400 font-bold cursor-pointer" onClick={() => navigate('/signup')}>Create account</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
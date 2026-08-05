import React, { useEffect } from 'react';

export default function GlobalStyle() {
  useEffect(() => {
    if (!document.getElementById('phosphor-icons')) {
      const script = document.createElement('script');
      script.id = 'phosphor-icons';
      script.src = 'https://unpkg.com/@phosphor-icons/web';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      :root {
        --bg-dark: #0b0f17; --card-bg: #131924; --card-border: #1e293b; --input-bg: #1e293b;
        --input-border: #334155; --accent-cyan: #38bdf8; --accent-blue: #3b82f6; --accent-purple: #a855f7;
        --text-main: #f8fafc; --text-muted: #94a3b8; --hover-bg: #1e293b; --table-header: #1e293b;
      }
      [data-theme="light"] {
        --bg-dark: #f8fafc; --card-bg: #ffffff; --card-border: #e2e8f0; --input-bg: #f1f5f9;
        --input-border: #cbd5e1; --accent-cyan: #0284c7; --accent-blue: #2563eb; --accent-purple: #7e22ce;
        --text-main: #0f172a; --text-muted: #475569; --hover-bg: #f1f5f9; --table-header: #f1f5f9;
      }
      * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; scroll-behavior: smooth; }
      body { background-color: var(--bg-dark); color: var(--text-main); margin: 0; padding: 0; min-height: 100vh; overflow-x: hidden; transition: background-color 0.3s, color 0.3s; }
      
      /* --- LANDING PAGE NEW STYLES (NAV, ABOUT, RECRUITERS, FOOTER) --- */
      .site-nav { position: fixed; top: 0; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 4rem; background: rgba(11, 15, 23, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.05); z-index: 100; transition: all 0.3s; }
      .nav-links { display: flex; gap: 2rem; }
      .nav-links a { color: var(--text-muted); text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: color 0.2s; }
      .nav-links a:hover { color: var(--accent-cyan); }
      
      .section-container { padding: 6rem 4rem; max-width: 1400px; margin: 0 auto; }
      .section-heading { text-align: center; margin-bottom: 3rem; }
      .section-heading h2 { font-size: 2.5rem; color: #fff; margin: 0 0 10px 0; }
      .section-heading p { color: var(--text-muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
      
      .about-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
      .about-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 2.5rem; text-align: center; transition: transform 0.3s; }
      .about-card:hover { transform: translateY(-10px); border-color: var(--accent-cyan); }
      .about-icon { width: 70px; height: 70px; background: rgba(56,189,248,0.1); color: var(--accent-cyan); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem auto; }

      .marquee-wrapper { overflow: hidden; display: flex; white-space: nowrap; padding: 2rem 0; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
      .marquee-content { display: flex; animation: marquee 25s linear infinite; gap: 4rem; padding-left: 4rem; }
      .recruiter-logo { height: 50px; filter: grayscale(100%) brightness(200%); opacity: 0.6; transition: all 0.3s; }
      .recruiter-logo:hover { filter: grayscale(0%) brightness(100%); opacity: 1; }
      @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      
      .site-footer { background: #06090e; padding: 4rem; border-top: 1px solid var(--card-border); margin-top: 4rem; }
      
      /* You can keep ALL your other existing CSS here (buttons, forms, layout, etc.) */
      /* Paste the rest of your original CSS inside this block just like it was before */
    `}</style>
  );
}
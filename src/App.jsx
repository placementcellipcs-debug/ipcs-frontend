import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import loadingVideo from './assets/video.mp4';

// ==========================================
// 1. GLOBAL STYLES & FONT INJECTIONS
// ==========================================
const GlobalStyle = () => {
  useEffect(() => {
    // Inject Phosphor Icons (Dashboard)
    if (!document.getElementById('phosphor-icons')) {
      const script = document.createElement('script');
      script.id = 'phosphor-icons';
      script.src = 'https://unpkg.com/@phosphor-icons/web';
      document.head.appendChild(script);
    }
    // Inject FontAwesome (Marketing Site)
    if (!document.getElementById('font-awesome')) {
      const link = document.createElement('link');
      link.id = 'font-awesome';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');
      
      :root {
        /* Dashboard Variables */
        --bg-dark: #0b0f17; --card-bg: #131924; --card-border: #1e293b; --input-bg: #1e293b;
        --input-border: #334155; --accent-cyan: #38bdf8; --accent-blue: #3b82f6; --accent-purple: #a855f7;
        --text-main: #f8fafc; --text-muted: #94a3b8; --hover-bg: #1e293b; --table-header: #1e293b;
        
        /* Marketing Site Variables */
        --primary-green: #10b981; --dark-green: #059669; --dark-blue: #1e40af;
        --gradient-primary: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
        --gradient-dark: linear-gradient(135deg, #059669 0%, #1e40af 100%);
        --text-primary: #f9fafb; --text-secondary: #d1d5db; --text-light: #9ca3af;
        --bg-primary: #111827; --bg-secondary: #1f2937; --bg-black: #000000; --border-color: #374151;
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5); --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      [data-theme="light"] {
        --bg-dark: #f8fafc; --card-bg: #ffffff; --card-border: #e2e8f0; --input-bg: #f1f5f9;
        --input-border: #cbd5e1; --accent-cyan: #0284c7; --accent-blue: #2563eb; --accent-purple: #7e22ce;
        --text-main: #0f172a; --text-muted: #475569; --hover-bg: #f1f5f9; --table-header: #f1f5f9;
      }
      
      * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
      body { background-color: var(--bg-dark); color: var(--text-main); margin: 0; padding: 0; min-height: 100vh; overflow-x: hidden; transition: background-color 0.3s, color 0.3s; scroll-behavior: smooth;}
      .hidden { display: none !important; }
      
      /* --- GENERAL UI COMPONENTS --- */
      .btn-action { padding: 0.8rem 1.4rem; background: var(--accent-blue); color: #ffffff; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 8px;}
      .btn-action:hover:not(:disabled) { opacity: 0.95; transform: translateY(-1px); }
      .btn-action:disabled { background: var(--input-border); color: var(--text-muted); cursor: not-allowed; }
      .btn-cancel { background: #334155; color: #f8fafc; border: none; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; padding: 0.8rem 1.4rem; transition: all 0.2s; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 8px;}
      .btn-cancel:hover { opacity: 0.95; background: #475569; }

      .form-group { margin-bottom: 1.1rem; text-align: left; width: 100%; }
      label { display: block; margin-bottom: 0.45rem; font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
      input, select, textarea { width: 100%; padding: 0.75rem 1rem; background-color: var(--input-bg); border: 1px solid var(--input-border); border-radius: 10px; font-size: 0.88rem; color: var(--text-main); outline: none; transition: background 0.3s, border-color 0.3s; resize: vertical; }
      input:focus, select:focus, textarea:focus { border-color: var(--accent-cyan); }
      ::placeholder { color: var(--text-muted); opacity: 0.6; }
      optgroup { background: var(--bg-dark); color: var(--accent-cyan); font-weight: 700; font-style: normal; }
      optgroup option { color: var(--text-main); font-weight: 500; }
      .pwd-wrapper { position: relative; display: block; width: 100%; }
      .pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;}

      /* --- AUTH & LOGIN STYLES --- */
      .landing-wrapper { min-height: 100vh; width: 100vw; background: radial-gradient(circle at top left, #0f172a 0%, #0b0f17 100%); display: flex; flex-direction: column; }
      .landing-nav { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 4rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .nav-links { display: flex; gap: 2rem; color: var(--text-muted); font-size: 0.9rem; font-weight: 600; }
      .nav-links span { cursor: pointer; transition: color 0.2s; }
      .nav-links span:hover { color: var(--text-main); }
      .landing-grid { display: grid; grid-template-columns: 1fr 440px; gap: 4rem; padding: 4rem; flex: 1; align-items: center; max-width: 1400px; margin: 0 auto; width: 100%; }
      .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); color: var(--accent-cyan); padding: 6px 16px; border-radius: 30px; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 1.5rem; }
      .hero-title { font-size: 4rem; font-weight: 800; line-height: 1.1; margin: 0 0 1.5rem 0; color: #ffffff; letter-spacing: -1px; }
      .hero-desc { font-size: 1.1rem; color: var(--text-muted); line-height: 1.6; max-width: 500px; margin-bottom: 2.5rem; }
      
      .auth-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; width: 100vw; padding: 20px; }
      .auth-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 2.2rem 1.8rem; width: 100%; max-width: 440px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
      .brand-logo-container { display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; }
      .auth-logo-img { max-width: 220px; height: auto; object-fit: contain; }
      .switch-mode { text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted); }
      .switch-mode span { color: var(--accent-cyan); text-decoration: none; font-weight: 600; cursor: pointer; }
      .tnc-link { color: var(--accent-cyan); text-decoration: underline; cursor: pointer; font-weight: 600; }

      .alert { padding: 0.8rem; margin-top: 1rem; border-radius: 8px; text-align: center; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;}
      .alert-error { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid #ef4444; }
      .alert-info { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #0284c7; }
      .alert-success { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid #22c55e; }

      .video-loader-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--bg-dark); z-index: 9999; display: flex; justify-content: center; align-items: center; transition: opacity 0.5s ease-in-out; }
      .video-loader-overlay.fade-out { opacity: 0; pointer-events: none; }
      .video-loader-overlay video { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.4s ease; }
      .video-loader-overlay video.ready { opacity: 1; }

      /* --- PROFILE REGISTRATION --- */
      .profile-reg-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 2rem 2.2rem; width: 100%; max-width: 880px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6); max-height: 92vh; overflow-y: auto; }
      .reg-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--card-border); padding-bottom: 1rem; margin-bottom: 1.5rem; }
      .section-title { font-size: 0.78rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin: 1.8rem 0 1.1rem 0; padding-bottom: 6px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; gap: 8px; color: var(--text-main); }
      .primary-layout-row { display: grid; grid-template-columns: 140px 1fr; gap: 1.8rem; align-items: start; }
      .avatar-upload-box { display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--input-bg); border: 2px dashed var(--input-border); border-radius: 16px; padding: 1.2rem 0.8rem; text-align: center; cursor: pointer; position: relative; transition: border-color 0.2s; }
      .avatar-preview-circle { width: 70px; height: 70px; border-radius: 50%; background: var(--card-border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 700; margin-bottom: 0.8rem; overflow: hidden; border: 2px solid var(--input-border); }
      .avatar-preview-circle img { width: 100%; height: 100%; object-fit: cover; }
      .grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }
      .grid-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.1rem; }
      .form-footer-bar { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 2rem; padding-top: 1.2rem; border-top: 1px solid var(--card-border); }

      @keyframes fadeInReveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

      .report-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(6px); z-index: 1100; display: flex; justify-content: center; align-items: center; padding: 20px; transition: opacity 0.3s; }
      .report-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 2rem; width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; position: relative; animation: fadeInReveal 0.3s ease;}
      .modal-header-border { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.8rem; }
      .tnc-content-box { height: 350px; overflow-y: auto; font-size: 0.85rem; color: var(--text-main); background: var(--input-bg); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--input-border); line-height: 1.7; position: relative; }

      /* --- DASHBOARD STYLES --- */
      .app-layout { display: flex; flex-direction: column; width: 100vw; min-height: 100vh; }
      .main-body { flex: 1; display: flex; flex-direction: column; width: 100%; }
      .top-header { height: 65px; border-bottom: 1px solid var(--card-border); background: var(--card-bg); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; transition: background 0.3s; z-index: 50; position: relative;}
      .header-left { display: flex; align-items: center; gap: 12px; }
      .header-logo-img { height: 35px; width: auto; object-fit: contain; }
      .header-right { display: flex; align-items: center; gap: 18px; }
      .header-icon-btn { position: relative; color: var(--text-muted); font-size: 1.4rem; cursor: pointer; background: none; border: none; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; }
      .header-icon-btn:hover { color: var(--accent-cyan); background: var(--hover-bg); }
      .user-profile-badge { display: flex; align-items: center; cursor: pointer; }
      .avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; border: 2px solid rgba(56, 189, 248, 0.4); overflow: hidden;}
      .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
      
      .dashboard-content { padding: 2rem; max-width: 1300px; width: 100%; margin: 0 auto; animation: fadeInUp 0.3s ease; }
      .dash-top-row { display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
      
      .hero-banner { position: relative; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 2rem; display: flex; align-items: center; gap: 1.8rem; height: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }
      .hero-banner::after { content: ''; position: absolute; right: -5%; top: 0; height: 100%; width: 50%; background: url('https://lh3.googleusercontent.com/d/1eiP135HOsuG3MEaEplNblmcLewjnKXp6') no-repeat right center; background-size: contain; opacity: 0.1; mask-image: linear-gradient(to right, transparent, black); -webkit-mask-image: linear-gradient(to right, transparent, black); pointer-events: none; z-index: 0; }
      .hero-banner-avatar { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%); padding: 3px; flex-shrink: 0; box-shadow: 0 8px 25px rgba(56,189,248,0.3); position: relative; z-index: 2; }
      .hero-banner-avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: var(--bg-dark); overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 800; color: var(--text-main); }
      .hero-banner-avatar-inner img { width: 100%; height: 100%; object-fit: cover; }
      .greeting-subtitle { color: var(--accent-cyan); font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; position: relative; z-index: 2; }
      .hero-banner h2 { margin: 0 0 6px 0; font-size: 1.7rem; font-weight: 800; letter-spacing: -0.5px; position: relative; z-index: 2;}
      .full-date-subtext { font-size: 0.9rem; color: var(--text-muted); font-weight: 500; margin-top: 4px; position: relative; z-index: 2;}
      
      .vacancy-quick-banner { background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); border: 1px solid #6366f1; border-radius: 16px; padding: 1.2rem 1.8rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;}
      
      .quick-actions-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
      .qa-btn { background: var(--bg-dark); border: 1px solid var(--card-border); padding: 1rem; border-radius: 12px; display: flex; align-items: center; gap: 12px; color: var(--text-main); font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
      .qa-btn:hover { border-color: var(--accent-cyan); transform: translateY(-2px); }
      .qa-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
      
      .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
      .stat-card-new { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.2rem 1.5rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
      .stat-card-new:hover { transform: translateY(-2px); }
      .stat-icon-wrapper { width: 55px; height: 55px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0; }
      .stat-num { font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 2px; line-height: 1.1; }
      .stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

      .upcoming-wrapper { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.8rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      .event-row-card { display: flex; align-items: center; background: var(--bg-dark); border: 1px solid var(--card-border); border-radius: 12px; padding: 1.2rem; margin-bottom: 1rem; transition: border-color 0.2s; }
      .event-row-card:hover { border-color: var(--accent-cyan); }
      .event-date-box { width: 85px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 2px solid var(--input-border); padding-right: 1.2rem; margin-right: 1.2rem; }
      .ev-month { font-size: 0.75rem; font-weight: 800; color: var(--accent-blue); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
      .ev-day { font-size: 1.6rem; font-weight: 800; color: var(--text-main); line-height: 1; margin-bottom: 2px;}
      .ev-year { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); }
      .event-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
      .ev-title { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
      .ev-meta { display: flex; align-items: center; gap: 15px; font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }
      .ev-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
      
      .notif-dropdown { position: absolute; top: 55px; right: 0; width: 340px; background: rgba(19, 25, 36, 0.95); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); z-index: 1000; overflow: hidden; transform-origin: top right; animation: fadeInUp 0.2s ease; }
      .notif-item { padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s; display: flex; flex-direction: column; gap: 4px; }
      .notif-item:hover { background: rgba(255,255,255,0.1); }
      .notif-item:last-child { border-bottom: none; }
      .notif-read { opacity: 0.45; }
      .notif-read strong { text-decoration: line-through; }

      .drawer-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); z-index: 99999; display: flex; justify-content: flex-end; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
      .drawer-overlay.open { opacity: 1; pointer-events: auto; }
      .drawer-card { width: 100%; max-width: 340px; height: 100%; background: var(--card-bg); color: var(--text-main); display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow:-10px 0 40px rgba(0,0,0,0.5); }
      .drawer-overlay.open .drawer-card { transform: translateX(0); }
      
      .drawer-header-cover { position: relative; height: 160px; background-size: cover; background-position: center; display: flex; flex-direction: column; justify-content: flex-end; padding: 1.2rem; }
      .drawer-header-cover::before { content: ''; position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(180deg, rgba(11,15,23,0.2) 0%, rgba(11,15,23,0.95) 100%); }
      .drawer-close-btn { position: absolute; top: 1rem; right: 1rem; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; color: #fff; z-index: 2; }
      .drawer-profile-row { position: relative; z-index: 2; display: flex; align-items: center; gap: 1rem; }
      .drawer-avatar { width: 55px; height: 55px; border-radius: 50%; background: #ffffff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.3rem; overflow: hidden; border: 2px solid #38bdf8; }
      .drawer-avatar img { width: 100%; height: 100%; object-fit: cover; }
      
      .drawer-menu { flex: 1; padding: 1rem 0; overflow-y: auto; }
      .drawer-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--card-border); color: var(--text-main); font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
      .drawer-item:hover { background: var(--hover-bg); color: var(--accent-cyan); }
      .drawer-item i { width: 22px; text-align: center; color: var(--text-muted); font-size: 1.1rem; }
      .drawer-footer { padding: 1.5rem; border-top: 1px solid var(--card-border); text-align: center; }
      .btn-logout-drawer { width: 100%; padding: 0.8rem; background: #3b82f6; color: #ffffff; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: 700; cursor: pointer; margin-bottom: 1rem; transition: background 0.2s; }
      .btn-logout-drawer:hover { background: #2563eb; }

      .talentino-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
      .talentino-stat-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.5rem; box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
      .t-stat-num { font-size: 2.2rem; font-weight: 800; color: var(--text-main); line-height: 1; margin-bottom: 10px; }
      .progress-bar { height: 8px; background: rgba(148, 163, 184, 0.15); border-radius: 10px; overflow: hidden; }
      .progress-fill { height: 100%; border-radius: 10px; transition: width 0.4s ease; background-color: #10b981;}
      .star-rating { display: flex; gap: 10px; font-size: 1.8rem; cursor: pointer; margin-top: 4px; align-items: center; padding: 10px 0; }
      .star-rating .star { color: var(--input-border); transition: transform 0.2s; }
      .star-rating .star:hover { transform: scale(1.5); }
      .star-rating .star.selected { color: #f59e0b; }

      .app-stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 1.5rem; }

      /* --- PROFILE & SETTINGS --- */
      .profile-grid { display: grid; grid-template-columns: 320px 1fr; gap: 1.8rem; align-items: start; }
      .profile-left-col { position: relative; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 2rem 1.5rem; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden; }
      .profile-left-col::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://lh3.googleusercontent.com/d/1eiP135HOsuG3MEaEplNblmcLewjnKXp6') no-repeat center center; background-size: 90%; opacity: 0.05; pointer-events: none; z-index: 0; }
      .profile-large-avatar { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 1rem auto; overflow: hidden; border: 3px solid var(--accent-cyan); background: var(--bg-dark); display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 800; color: var(--text-muted); position: relative; z-index: 2;}
      .profile-large-avatar img { width: 100%; height: 100%; object-fit: cover; }
      .info-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 1.8rem; position: relative; margin-bottom: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2);}
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
      .doc-box { display: flex; align-items: center; justify-content: space-between; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 12px; padding: 1.2rem; margin-bottom: 12px; transition: border-color 0.2s;}
      
      .settings-container { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; align-items: start; }
      .settings-tab { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: var(--text-muted); font-weight: 600; font-size: 0.95rem; border-radius: 10px; cursor: pointer; }
      .settings-tab.active { background: rgba(56, 189, 248, 0.1); color: var(--accent-cyan); }

      /* --- VACANCIES --- */
      .vacancies-hero { text-align: center; padding: 3rem 1.5rem 2.5rem 1.5rem; background: radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%); border-bottom: 1px solid var(--card-border); position: relative; border-radius: 20px; }
      .location-table-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem; overflow-x: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      .vac-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; min-width: 700px; }
      .vac-table th { background: var(--table-header); color: var(--text-muted); text-align: left; padding: 12px 16px; font-size: 0.78rem; text-transform: uppercase; }
      .vac-table td { padding: 14px 16px; border-bottom: 1px solid var(--card-border); color: var(--text-main); }
      .vac-table tr { border-bottom: 1px solid var(--card-border); transition: background 0.3s; }
      .vac-table tr:hover td { background: var(--hover-bg); }
      
      .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; text-align: center; }
      .animate-fade-in { animation: fadeInUp 0.4s ease forwards; }

      .resume-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
      .resume-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 1.2rem; cursor: pointer; transition: transform 0.2s, border-color 0.2s; box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
      .resume-card:hover { transform: translateY(-2px); border-color: var(--accent-cyan); }
      .resume-icon-box { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0; }

      /* --- MEDIA QUERIES FOR MARKETING SITE & DASHBOARD --- */
      @media (max-width: 1200px) {
        .stats-row { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 900px) {
        .landing-grid { grid-template-columns: 1fr; text-align: center; gap: 2rem; padding: 2rem; }
        .hero-desc { margin: 0 auto 2.5rem auto; }
        .profile-grid, .settings-container, .dash-top-row { grid-template-columns: 1fr; }
        .stats-row { grid-template-columns: 1fr; }
        .talentino-summary-grid { grid-template-columns: 1fr; }
        .app-stats-grid { grid-template-columns: repeat(3, 1fr); }
      }
      @media (max-width: 768px) {
        .landing-nav { flex-direction: column; gap: 1rem; padding: 1.5rem; }
        .hero-title { font-size: 2.8rem; }
        .grid-2col, .grid-3col, .info-grid { grid-template-columns: 1fr; }
        .primary-layout-row { grid-template-columns: 1fr; gap: 1rem; }
        .vacancy-quick-banner { flex-direction: column; gap: 15px; text-align: center; }
        .top-header { padding: 0 1rem; }
        .dashboard-content { padding: 1rem; }
        .resume-grid { grid-template-columns: 1fr; }
        .app-stats-grid { grid-template-columns: 1fr 1fr; }
        .notif-dropdown { position: fixed; top: 65px; left: 5%; right: 5%; width: 90%; }
        .doc-box { flex-direction: column; align-items: flex-start; gap: 1rem; }
      }
      @media (min-width: 1800px) {
        .dashboard-content, .landing-grid { max-width: 1600px; }
        body { font-size: 17px; }
      }

      /* --- MARKETING SITE CSS (Converted from style.css) --- */
      .glass-panel { background: rgba(12, 21, 43, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
      .gradient-text { background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-pulse-glow { animation: pulse-glow 3s infinite; }
      .animate-marquee-left { animation: marquee-left 120s linear infinite; }
      .animate-marquee-right { animation: marquee-right 120s linear infinite; }
      
      @keyframes float { 0%, 100% { transform: translateY(0px) } 50% { transform: translateY(-10px) } }
      @keyframes pulse-glow { 0%, 100% { opacity: 0.3; transform: scale(1) } 50% { opacity: 0.6; transform: scale(1.05) } }
      @keyframes marquee-left { 0% { transform: translateX(0%) } 100% { transform: translateX(-50%) } }
      @keyframes marquee-right { 0% { transform: translateX(-50%) } 100% { transform: translateX(0%) } }

      .company-name { flex-shrink: 0; font-size: 1.25rem; font-weight: 600; color: #f8fafc; padding: 0.75rem 1.5rem; border: 1.5px solid #334155; border-radius: 8px; background: #131924; box-shadow: 0 2px 5px rgba(0,0,0,0.02); transition: all 0.3s ease; }
      .company-name:hover { color: #3b82f6; border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
      
      .student-poster-card { flex-shrink: 0; width: 280px; height: 380px; border-radius: 15px; overflow: hidden; background: #131924; border: 2px solid #334155; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); transition: all 0.3s ease; }
      .student-poster-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2); border-color: #10b981; }
      .poster-image-container { width: 100%; height: 100%; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
      .poster-image { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; }
      .poster-icon { font-size: 5rem; color: rgba(255, 255, 255, 0.3); z-index: 1; }
      
      .testimonial-video-wrapper { position: relative; flex: 0 0 260px; width: 260px; border-radius: 20px; overflow: hidden; background: #000; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); transition: all 0.3s ease; cursor: pointer; border: 2px solid #334155; aspect-ratio: 3 / 4; }
      .testimonial-video-wrapper:hover { transform: translateY(-10px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border-color: #10b981; }
      .video-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #059669 0%, #1e40af 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; position: relative; overflow: hidden; }
      .video-preview { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
      .video-overlay { position: absolute; bottom: 0; left: 0; width: 100%; padding: 2rem 1.5rem 1.5rem; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); color: white; z-index: 2; pointer-events: none; }
      .video-overlay h4 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.2rem; }
      .video-overlay p { font-size: 0.85rem; color: #10b981; font-weight: 600; margin-bottom: 0.5rem; }
      .video-overlay span { font-size: 0.8rem; opacity: 0.9; display: block; line-height: 1.4; }

      .zonal-card { display: flex; background: #131924; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border: 2px solid #334155; transition: all 0.3s; margin-bottom: 4rem;}
      .zonal-card:hover { border-color: #10b981; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15); }
      .zonal-image-wrapper { flex: 0 0 40%; min-height: 400px; background: linear-gradient(135deg, #059669 0%, #1e40af 100%); display: flex; align-items: center; justify-content: center; position: relative; }
      .zonal-image { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; }
      .zonal-badge { position: absolute; top: 2rem; left: 2rem; background: #10b981; color: white; padding: 0.5rem 1.2rem; border-radius: 50px; font-weight: 700; font-size: 0.9rem; z-index: 2; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
      .zonal-content { flex: 1; padding: 3rem; display: flex; flex-direction: column; justify-content: center; text-align: left;}
      .zonal-content h3 { font-size: 2.2rem; color: #f8fafc; margin-bottom: 0.5rem; font-weight: 800;}
      .zonal-content .position { color: #3b82f6; font-weight: 700; font-size: 1.2rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px; }
      .zonal-content .bio { color: #d1d5db; font-size: 1.05rem; line-height: 1.7; margin-bottom: 2rem; }

      .tpo-card { width: 100%; background: #131924; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.3s; border: 1px solid #334155; text-align: center; display: flex; flex-direction: column; }
      .tpo-card:hover { transform: translateY(-8px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-color: #3b82f6; }
      .tpo-image-wrapper { height: 220px; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); display: flex; align-items: center; justify-content: center; position: relative; }
      .tpo-image { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; }
      .tpo-info { padding: 1.5rem 1rem; flex: 1; display: flex; flex-direction: column; }
      .tpo-info h4 { font-size: 1.1rem; color: #f8fafc; margin-bottom: 0.25rem; font-weight: 700;}
      .tpo-info .position { color: #10b981; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }
      .tpo-info .bio { color: #d1d5db; font-size: 0.85rem; line-height: 1.5; margin-bottom: 1rem; flex: 1; }

      .footer { background: #000000; color: white; padding: 4rem 0 2rem; border-top: 3px solid #10b981; margin-top: 4rem;}
      .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 3rem; margin-bottom: 3rem; max-width: 1400px; margin-left: auto; margin-right: auto; padding: 0 2rem;}
      .footer-brand .logo { color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 10px;}
      .footer-brand p { color: #9ca3af; font-size: 0.95rem; line-height: 1.6;}
      .footer-links h4, .footer-newsletter h4 { font-size: 1.1rem; margin-bottom: 1.5rem; color: white; font-weight: 700;}
      .footer-links ul { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; padding: 0;}
      .footer-links a { color: #9ca3af; text-decoration: none; transition: all 0.3s; font-size: 0.95rem;}
      .footer-links a:hover { color: #10b981; padding-left: 5px; }
      .footer-bottom { padding-top: 2rem; border-top: 1px solid #374151; text-align: center; color: #6b7280; font-size: 0.9rem;}

      @media (max-width: 992px) {
        .zonal-card { flex-direction: column; }
        .zonal-image-wrapper { min-height: 300px; }
        .footer-grid { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 768px) {
        .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
      }
    `}</style>
  );
};

// ==========================================
// 2. CONSTANTS & DATA
// ==========================================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const GLOBAL_LOGO_URL = 'https://lh3.googleusercontent.com/d/1VqmH9-l2lBHErJPW1tCjtCu-SrTEMPtN';
const COVER_BANNER_URL = 'https://lh3.googleusercontent.com/d/1eiP135HOsuG3MEaEplNblmcLewjnKXp6';

const BRANCH_LOCATIONS = {
  "Kochi": { lat: 9.9816, lng: 76.2999 }, 
  "Calicut": { lat: 11.2588, lng: 75.7804 },
  "Trivandrum": { lat: 8.5241, lng: 76.9366 },
  "Attingal": { lat: 8.6943, lng: 76.8184 },
  "Kollam": { lat: 8.8932, lng: 76.6141 },
  "Kannur": { lat: 11.8745, lng: 75.3704 },
  "Thrissur": { lat: 10.5276, lng: 76.2144 },
  "Perinthalmanna": { lat: 10.9760, lng: 76.2254 },
  "Kottayam": { lat: 9.5916, lng: 76.5222 },
  "Pathanamthitta": { lat: 9.2648, lng: 76.7870 },
  "Palakkad": { lat: 10.7867, lng: 76.6548 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Tambaram": { lat: 12.9249, lng: 80.1000 },
  "Trichy": { lat: 10.7905, lng: 78.7047 },
  "Salem": { lat: 11.6643, lng: 78.1460 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Erode": { lat: 11.3410, lng: 77.7172 },
  "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Mangalore": { lat: 12.9141, lng: 74.8560 },
  "Mysore": { lat: 12.2958, lng: 76.6394 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Nagpur": { lat: 21.1458, lng: 79.0882 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Siliguri": { lat: 26.7271, lng: 88.3953 },
  "Hyderabad (Telangana)": { lat: 17.3850, lng: 78.4867 },
  "Ranchi (Jharkhand)": { lat: 23.3441, lng: 85.3096 },
  "Raipur (Chhattisgarh)": { lat: 21.2514, lng: 81.6296 },
  "Bhopal (Madhya Pradesh)": { lat: 23.2599, lng: 77.4126 },
  "Dubai (UAE)": { lat: 25.2048, lng: 55.2708 },
  "Riyadh (Saudi Arabia)": { lat: 24.7136, lng: 46.6753 }
};

const siteData = {
    statistics: [
        { icon: "fa-briefcase", value: "3000+", label: "Students Placed" },
        { icon: "fa-building", value: "120+", label: "Corporate Partners" },
        { icon: "fa-globe", value: "50+", label: "Global Presence" },
        { icon: "fa-award", value: "17+", label: "Years of Excellence" }
    ],
    companies: [
        { name: "Siemens", desc: "Industrial Automation", icon: "fa-industry", quote: "Recruited over 80+ IPCS specialists", color: "cyan" },
        { name: "Schneider", desc: "Energy & Automation", icon: "fa-bolt", quote: "Superb core hardware knowledge", color: "indigo" },
        { name: "ABB Global", desc: "Robotics & Grid", icon: "fa-network-wired", quote: "Outstanding mechanical synergy", color: "orange" },
        { name: "Cognizant", desc: "Software Consulting", icon: "fa-code", quote: "Top choice for technical logic", color: "purple" },
        { name: "Infosys", desc: "Digital Transformation", icon: "fa-cloud", quote: "Great problem solving skillsets", color: "green" },
        { name: "Wipro", desc: "Technology Services", icon: "fa-database", quote: "Excellent communication and vision", color: "pink" },
        { name: "Intel", desc: "Embedded Circuits", icon: "fa-microchip", quote: "First-grade engineering brains", color: "red" },
        { name: "Yaskawa", desc: "Motion Control", icon: "fa-robot", quote: "Unmatched precision training", color: "teal" },
        { name: "Honeywell", desc: "Process Solutions", icon: "fa-server", quote: "IPCS training has top standards", color: "blue" },
        { name: "L&T Control", desc: "Infrastructure IT", icon: "fa-chart-pie", quote: "Deeply analytical candidates", color: "amber" }
    ],
    placedImages: [
        'Abdullah.png', 'Abhirami.png', 'ABUBACKER SIDDIQ.png', 'ADHITYA.jpg', 'Afnas.png',
        'AJAY KUMAR C.png', 'AKSHAY.jpg', 'amrutha copy.png', 'Amrutha.png', 'anantha krishnan.png'
    ],
    testimonials: [
        { name: 'Student 1', position: 'Placed Student', video: 'assets/videos/Test/Test1.mp4' },
        { name: 'Student 2', position: 'Placed Student', video: 'assets/videos/Test/Test2.mp4' },
        { name: 'Student 3', position: 'Placed Student', video: 'assets/videos/Test/Test3.mp4' },
        { name: 'Student 4', position: 'Placed Student', video: 'assets/videos/Test/Test4.mp4' },
        { name: 'Student 5', position: 'Placed Student', video: 'assets/videos/Test/Test5.mp4' }
    ],
    activities: [
        { title: 'Placement Drive', description: 'Campus placement drive', video: 'assets/videos/Activites/Act1.mp4' },
        { title: 'Mock Interview', description: 'Interview coaching', video: 'assets/videos/Activites/Act2.mp4' },
        { title: 'Skill Workshop', description: 'Skill development', video: 'assets/videos/Activites/Act3.mp4' },
        { title: 'Company Visit', description: 'Corporate interaction', video: 'assets/videos/Activites/Act4.mp4' },
        { title: 'Group Discussion', description: 'GD Strategy session', video: 'assets/videos/Activites/Act5.mp4' }
    ],
    team: {
        zonalOfficer: {
            name: "Ms. Gifty KP",
            position: "Zonal Placement Manager",
            bio: "Ms. Gifty has over 9 years of diverse experience in the EdTech industry. Starting as a JAVA Trainer, she mastered technical expertise and teaching methodologies, eventually advancing to specialize in Training Excellence and Learning Management Systems (LMS).",
            email: "gifty@ipcsglobal.com",
            phone: "+91 9645446664",
            linkedin: "https://www.linkedin.com/in/gifty-kp",
            image: "1eiP135HOsuG3MEaEplNblmcLewjnKXp6" // Using placeholder drive ID as fallback
        },
        tpos: [
            { name: "Ms. Bincy Bindhuraj", position: "Senior Corporate Relation Officer", bio: "North Kerala", email: "tpo1@placement.com" },
            { name: "Mr. Visakh S", position: "Senior Corporate Relation Officer", bio: "South Kerala", email: "tpo2@placement.com" },
            { name: "Ms. Thana Anjana", position: "Corporate Relation Officer", bio: "South & Central Thamil Nadu", email: "tpo3@placement.com" },
            { name: "Mr. Pranav V S", position: "Corporate Relation Officer", bio: "Karnataka", email: "tpo4@placement.com" },
            { name: "Ms. Fathima Rinsa", position: "Senior Corporate Relation Officer", bio: "Central Kerala", email: "tpo5@placement.com" }
        ]
    }
};

// ==========================================
// 3. MARKETING SITE (LANDING PAGE)
// ==========================================
function MarketingSite() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [showPreloader, setShowPreloader] = useState(true);
  const [tickerIndex, setTickerIndex] = useState(0);

  const hiringUpdates = [
    "Arunachalam got hired as a Industrial Automation Engineer",
    "Raiha got Hired as a Digital Marketing Executive",
    "Vishnu R got hired as a BMS Engineer at Schneider Electric.",
    "Arya got hired as a Software Quality Assurance Engineer."
  ];

  useEffect(() => {
    // Preloader
    const timer = setTimeout(() => setShowPreloader(false), 1200);
    
    // Scroll listener for Navbar
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Fade-in Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Ticker
    const tickerTimer = setInterval(() => {
        setTickerIndex(prev => (prev + 1) % hiringUpdates.length);
    }, 3500);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll);
        observer.disconnect();
        clearInterval(tickerTimer);
    };
  }, []);

  const openVideo = (videoUrl) => setActiveVideo(videoUrl);
  const closeVideo = () => setActiveVideo(null);

  if (showPreloader) {
    return (
        <div className="fixed inset-0 z-[10000] flex flex-col justify-center items-center" style={{ backgroundColor: 'var(--bg-dark)' }}>
            <div className="relative flex flex-col items-center">
                <div className="relative p-3 rounded-2xl border overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--card-border)' }}>
                    <img src={GLOBAL_LOGO_URL} alt="IPCS" className="h-16 w-16 object-contain" />
                </div>
                <div className="w-48 h-1.5 rounded-full overflow-hidden mt-5" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <div className="h-full w-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', overflowX: 'hidden' }}>
        
        {/* NAVBAR */}
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 py-4 px-6 md:px-12 ${isScrolled ? 'backdrop-blur-md shadow-lg border-b' : 'bg-transparent'}`} style={{ borderColor: isScrolled ? 'var(--card-border)' : 'transparent', backgroundColor: isScrolled ? 'rgba(11, 15, 23, 0.95)' : 'transparent' }}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <a href="#home" className="flex items-center space-x-3 group cursor-pointer" style={{ textDecoration: 'none' }}>
                    <div className="relative bg-slate-900 p-1 rounded-lg border border-slate-700/50 overflow-hidden">
                        <img src={GLOBAL_LOGO_URL} alt="Logo" className="h-8 w-8 object-contain rounded-md" />
                    </div>
                    <div>
                        <span className="text-lg font-extrabold tracking-wide text-white block">IPCS <span style={{ color: 'var(--accent-cyan)' }}>GLOBAL</span></span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 block -mt-1">Placement</span>
                    </div>
                </a>

                <ul className="hidden lg:flex items-center space-x-8 text-sm font-medium m-0 p-0" style={{ listStyle: 'none' }}>
                    <li><a href="#home" className="text-slate-300 hover:text-cyan-400 transition-colors py-2 relative group" style={{ textDecoration: 'none' }}>Home</a></li>
                    <li><a href="#companies" className="text-slate-300 hover:text-cyan-400 transition-colors py-2 relative group" style={{ textDecoration: 'none' }}>Recruiters</a></li>
                    <li><a href="#placedStudentsMarquee" className="text-slate-300 hover:text-cyan-400 transition-colors py-2 relative group" style={{ textDecoration: 'none' }}>Placements</a></li>
                    <li><a href="#testimonials" className="text-slate-300 hover:text-cyan-400 transition-colors py-2 relative group" style={{ textDecoration: 'none' }}>Testimonials</a></li>
                </ul>

                <div className="flex items-center space-x-4">
                    <button type="button" onClick={() => navigate('/login')} className="hidden md:inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:-translate-y-0.5 transition-all" style={{ border: 'none', cursor: 'pointer' }}>
                        <span>Student Login </span>
                        <i className="fas fa-arrow-right text-[10px]"></i>
                    </button>
                    
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2.5 rounded-lg border border-slate-700/50 text-slate-300 focus:outline-none" style={{ background: 'transparent' }}>
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed top-20 left-4 right-4 bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl z-50">
                    <ul className="flex flex-col space-y-4 text-base font-semibold m-0 p-0" style={{ listStyle: 'none' }}>
                        <li><a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 block py-1.5" style={{ textDecoration: 'none' }}>Home</a></li>
                        <li><a href="#companies" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 block py-1.5" style={{ textDecoration: 'none' }}>Recruiters</a></li>
                        <li><a href="#placedStudentsMarquee" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 block py-1.5" style={{ textDecoration: 'none' }}>Placements</a></li>
                        <li><a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 block py-1.5" style={{ textDecoration: 'none' }}>Testimonials</a></li>
                        <li className="pt-4 border-t border-slate-800">
                            <button onClick={() => navigate('/login')} className="w-full flex justify-center items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold py-3 rounded-xl shadow-lg border-none cursor-pointer">
                                <span>Student Login</span>
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </nav>

        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden" id="home">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 z-0"></div>
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-glow z-0"></div>
            <div class="absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse-glow z-0" style={{animationDelay: '1.5s'}}></div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 mt-6">
                <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-slate-900/65 backdrop-blur border border-slate-700/60 rounded-full py-1.5 px-4 w-fit shadow-md">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                        </span>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                            <i className="fas fa-award text-yellow-500"></i> India's Premier Technical Placement Ecosystem
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white m-0">
                        Unlock Global Tech <br/>
                        <span className="gradient-text leading-normal">Careers with IPCS</span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl leading-relaxed m-0">
                        IPCS Global connects future-ready talent in Industrial Automation, Embedded Systems, IoT, and Digital Tech with leading blue-chip global firms. Experience zero-barrier career transitions.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center pt-2">
                        <button onClick={() => navigate('/signup')} className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-none cursor-pointer hover:-translate-y-1 transition-transform">
                            <span>Student Sign Up</span>
                            <i className="fas fa-chevron-right text-sm"></i>
                        </button>
                    </div>

                    <div className="pt-4 flex items-center space-x-3 border-t border-slate-800/80 max-w-lg">
                        <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg p-2.5 flex items-center justify-center animate-bounce">
                            <i className="fas fa-bolt"></i>
                        </div>
                        <div>
                            <span className="text-xs uppercase font-extrabold text-cyan-400 tracking-wider">Live Hiring Updates</span>
                            <p className="text-xs text-slate-400 mt-0.5 transition-opacity duration-500 font-mono m-0" key={tickerIndex}>{hiringUpdates[tickerIndex]}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 relative flex justify-center items-center">
                    <div className="relative w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl overflow-hidden z-10 animate-float">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-3xl"></div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30 text-blue-500">
                                    <i className="fas fa-bolt text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-md m-0">Hiring Dashboard</h3>
                                    <p className="text-xs text-slate-400 font-medium m-0">Realtime Campus Intake</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2.5 py-1 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full animate-pulse">
                                ACTIVE STAGE
                            </span>
                        </div>

                        <div className="space-y-4">
                            {siteData.statistics.slice(0,3).map((stat, i) => (
                                <div key={i} className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between group transition duration-300">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                                            <i className={`fas ${stat.icon}`}></i>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold m-0">{stat.label}</p>
                                            <h4 className="text-xl font-extrabold text-slate-100 mt-0.5 m-0">{stat.value}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* FEATURES */}
        <section className="py-24 relative overflow-hidden border-t border-slate-900" id="features" style={{ backgroundColor: 'var(--bg-dark)' }}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 fade-in">
                    <span className="inline-block text-cyan-400 text-xs font-extrabold uppercase tracking-widest bg-cyan-400/10 py-1.5 px-4 rounded-full mb-3">Professional training edge</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight m-0">The IPCS Training-to-Hired Ecosystem</h2>
                    <p className="text-slate-400 mt-4 text-sm md:text-base">How we prepare and secure global packages for thousands of learners annually through active technical incubation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="p-8 rounded-3xl bg-slate-900/85 border border-slate-800 hover:border-cyan-400/30 transition-all duration-300 group fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl mb-6 group-hover:scale-110 transition duration-300"><i className="fas fa-laptop-code"></i></div>
                        <h3 className="text-lg font-extrabold text-white mb-3 mt-0">Industry-Grade Labs</h3>
                        <p className="text-xs text-slate-400 leading-relaxed m-0">Students train directly on advanced PLC panels, SCADA software, and IoT developmental sensors mimicking real factory environments.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-900/85 border border-slate-800 hover:border-blue-500/30 transition-all duration-300 group fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-2xl mb-6 group-hover:scale-110 transition duration-300"><i className="fas fa-file-invoice"></i></div>
                        <h3 className="text-lg font-extrabold text-white mb-3 mt-0">Mock Technical Audits</h3>
                        <p className="text-xs text-slate-400 leading-relaxed m-0">We simulate real HR assessment algorithms and core electronics technical panel interview protocols every single week.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-900/85 border border-slate-800 hover:border-yellow-500/30 transition-all duration-300 group fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 text-2xl mb-6 group-hover:scale-110 transition duration-300"><i className="fas fa-globe"></i></div>
                        <h3 className="text-lg font-extrabold text-white mb-3 mt-0">Global Outreach</h3>
                        <p className="text-xs text-slate-400 leading-relaxed m-0">Active tie-ups in Gulf nations, Singapore, Germany, and India help match local and global talent demand scales.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-900/85 border border-slate-800 hover:border-green-500/30 transition-all duration-300 group fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 text-2xl mb-6 group-hover:scale-110 transition duration-300"><i className="fas fa-user-shield"></i></div>
                        <h3 className="text-lg font-extrabold text-white mb-3 mt-0">Corporate Placement</h3>
                        <p className="text-xs text-slate-400 leading-relaxed m-0">Access to exclusive on-campus recruitment cycles,pool drives and fast-track hiring pipelines with premium corporate partners.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* COMPANIES MARQUEE */}
        <section className="py-24 relative border-t border-slate-900" id="companies" style={{ backgroundColor: 'var(--bg-dark)' }}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 mb-12 fade-in">
                <div className="text-center max-w-3xl mx-auto">
                    <span className="inline-block text-cyan-400 text-xs font-extrabold uppercase tracking-widest bg-cyan-400/10 py-1.5 px-4 rounded-full mb-3">IPCS Valued Partners</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight m-0">Trusted By Top Tier Global Brands</h2>
                </div>
            </div>

            <div className="w-full overflow-hidden flex flex-col space-y-6 relative select-none">
                <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#0b0f17] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#0b0f17] to-transparent z-10 pointer-events-none"></div>

                <div className="flex overflow-x-hidden relative">
                    <div className="flex space-x-6 animate-marquee-left py-4">
                        {siteData.companies.slice(0,5).map((c, i) => (
                            <div key={i} className="company-name w-64 p-6 flex flex-col justify-between items-start" style={{ textAlign: 'left' }}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-12 h-12 rounded-xl bg-${c.color}-400/10 flex items-center justify-center text-${c.color}-400`}><i className={`fas ${c.icon} text-xl`}></i></div>
                                    <div><h4 className="font-extrabold text-white m-0">{c.name}</h4><p className="text-[10px] text-slate-500 uppercase tracking-wider m-0">{c.desc}</p></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-4 italic m-0">"{c.quote}"</p>
                            </div>
                        ))}
                        {/* Duplicate for infinite effect */}
                        {siteData.companies.slice(0,5).map((c, i) => (
                            <div key={i+'dup'} className="company-name w-64 p-6 flex flex-col justify-between items-start" style={{ textAlign: 'left' }}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-12 h-12 rounded-xl bg-${c.color}-400/10 flex items-center justify-center text-${c.color}-400`}><i className={`fas ${c.icon} text-xl`}></i></div>
                                    <div><h4 className="font-extrabold text-white m-0">{c.name}</h4><p className="text-[10px] text-slate-500 uppercase tracking-wider m-0">{c.desc}</p></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-4 italic m-0">"{c.quote}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex overflow-x-hidden relative">
                    <div className="flex space-x-6 animate-marquee-right py-4">
                        {siteData.companies.slice(5,10).map((c, i) => (
                            <div key={i} className="company-name w-64 p-6 flex flex-col justify-between items-start" style={{ textAlign: 'left' }}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-12 h-12 rounded-xl bg-${c.color}-400/10 flex items-center justify-center text-${c.color}-400`}><i className={`fas ${c.icon} text-xl`}></i></div>
                                    <div><h4 className="font-extrabold text-white m-0">{c.name}</h4><p className="text-[10px] text-slate-500 uppercase tracking-wider m-0">{c.desc}</p></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-4 italic m-0">"{c.quote}"</p>
                            </div>
                        ))}
                        {/* Duplicate for infinite effect */}
                        {siteData.companies.slice(5,10).map((c, i) => (
                            <div key={i+'dup'} className="company-name w-64 p-6 flex flex-col justify-between items-start" style={{ textAlign: 'left' }}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-12 h-12 rounded-xl bg-${c.color}-400/10 flex items-center justify-center text-${c.color}-400`}><i className={`fas ${c.icon} text-xl`}></i></div>
                                    <div><h4 className="font-extrabold text-white m-0">{c.name}</h4><p className="text-[10px] text-slate-500 uppercase tracking-wider m-0">{c.desc}</p></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-4 italic m-0">"{c.quote}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 relative bg-slate-900 border-t border-slate-800" id="testimonials">
            <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-12 fade-in">
                <span className="inline-block text-cyan-400 text-xs font-extrabold uppercase tracking-widest bg-cyan-400/10 py-1.5 px-4 rounded-full mb-3">Student Stories</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight m-0">Video Testimonials</h2>
            </div>
            
            <div className="w-full overflow-hidden relative pb-10">
                <div className="flex space-x-6 animate-marquee-left px-6">
                    {siteData.testimonials.map((t, i) => (
                        <div key={i} className="testimonial-video-wrapper" onClick={() => openVideo(t.video)}>
                            <div className="video-placeholder">
                                <i className="fas fa-play-circle text-4xl text-cyan-400 absolute z-10" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}></i>
                                {/* Mockup image since videos won't autoplay cleanly in a grid without user interaction */}
                                <div style={{width:'100%', height:'100%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}></div>
                            </div>
                            <div className="video-overlay text-left">
                                <h4 className="m-0 text-white">{t.name}</h4>
                                <p className="m-0 text-cyan-400">{t.position}</p>
                            </div>
                        </div>
                    ))}
                    {siteData.testimonials.map((t, i) => (
                        <div key={i+'dup'} className="testimonial-video-wrapper" onClick={() => openVideo(t.video)}>
                            <div className="video-placeholder">
                                <i className="fas fa-play-circle text-4xl text-cyan-400 absolute z-10" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}></i>
                                <div style={{width:'100%', height:'100%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}></div>
                            </div>
                            <div className="video-overlay text-left">
                                <h4 className="m-0 text-white">{t.name}</h4>
                                <p className="m-0 text-cyan-400">{t.position}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* TEAM SECTION */}
        <section className="py-24 relative border-t border-slate-900" style={{ backgroundColor: 'var(--bg-dark)' }}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16 fade-in">
                <span className="inline-block text-cyan-400 text-xs font-extrabold uppercase tracking-widest bg-cyan-400/10 py-1.5 px-4 rounded-full mb-3">Our Team</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight m-0">Meet Placement Officers</h2>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="zonal-card fade-in">
                    <div className="zonal-image-wrapper">
                        <div className="zonal-badge">Zonal Head</div>
                        <i className="fas fa-user-tie text-[8rem] text-white/20"></i>
                    </div>
                    <div className="zonal-content">
                        <h3>{siteData.team.zonalOfficer.name}</h3>
                        <p className="position">{siteData.team.zonalOfficer.position}</p>
                        <p className="bio">{siteData.team.zonalOfficer.bio}</p>
                        <div className="flex gap-6 mb-6">
                            <div className="flex items-center gap-3"><i className="fas fa-envelope text-blue-500 bg-blue-500/10 p-3 rounded-full"></i> <span className="text-slate-300">{siteData.team.zonalOfficer.email}</span></div>
                            <div className="flex items-center gap-3"><i className="fas fa-phone text-green-500 bg-green-500/10 p-3 rounded-full"></i> <span className="text-slate-300">{siteData.team.zonalOfficer.phone}</span></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 fade-in">
                    {siteData.team.tpos.map((tpo, i) => (
                        <div key={i} className="tpo-card">
                            <div className="tpo-image-wrapper">
                                <i className="fas fa-user-tie text-5xl text-white/30"></i>
                            </div>
                            <div className="tpo-info">
                                <h4>{tpo.name}</h4>
                                <p className="position m-0">{tpo.position}</p>
                                <p className="bio mt-2">{tpo.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
            <div className="footer-grid">
                <div className="footer-brand text-left">
                    <div className="logo footer-logo text-white text-2xl font-bold mb-4">IPCS Global</div>
                    <p className="text-slate-400">Building careers and creating futures for students worldwide.</p>
                </div>
                <div className="footer-links text-left">
                    <h4 className="text-white font-bold mb-4">Quick Links</h4>
                    <ul className="space-y-2 m-0 p-0" style={{listStyle:'none'}}>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#companies">Recruiters</a></li>
                        <li><a href="#testimonials">Testimonials</a></li>
                    </ul>
                </div>
                <div className="footer-links text-left">
                    <h4 className="text-white font-bold mb-4">Portal Actions</h4>
                    <ul className="space-y-2 m-0 p-0" style={{listStyle:'none'}}>
                        <li><span onClick={() => navigate('/login')} className="cursor-pointer hover:text-cyan-400 transition">Student Login</span></li>
                        <li><span onClick={() => navigate('/signup')} className="cursor-pointer hover:text-cyan-400 transition">Create Account</span></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                <p>&copy; 2026 IPCS Placement Cell. All rights reserved.</p>
            </div>
        </footer>

        {/* VIDEO MODAL */}
        {activeVideo && (
            <div className="report-modal-overlay" style={{ zIndex: 99999 }}>
                <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-2">
                    <button onClick={closeVideo} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center text-white border-none cursor-pointer transition">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                    <video src={activeVideo} controls autoPlay className="w-full h-auto max-h-[80vh] rounded-xl"></video>
                </div>
            </div>
        )}

    </div>
  );
}

// ==========================================
// 4. MAIN DASHBOARD ECOSYSTEM
// ==========================================
/* STREAMING_CHUNK:Configuring robust dashboard logic and APIs... */
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});
  const [data, setData] = useState({ stats: {}, events: [], appliedJobs: [], vacancies: [], attendanceHistory: [], tpoInfo: {} });
  const [theme, setTheme] = useState('dark');
  
  // Safe Tab State via Hash Routing (Fixes Mobile Back Button bug)
  const [activeTab, setActiveTab] = useState(() => {
     const hash = window.location.hash.replace('#', '');
     return hash || 'dashboard';
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tpoModal, setTpoModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  
  const [showNotif, setShowNotif] = useState(false);
  const [readNotifs, setReadNotifs] = useState(() => JSON.parse(localStorage.getItem('talentino_read_notifs') || '[]'));

  const [gpsCoords, setGpsCoords] = useState(null);
  const [locStatus, setLocStatus] = useState("Capture my location");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [attStatus, setAttStatus] = useState(null);

  const [jobModal, setJobModal] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [q1, setQ1] = useState(false); 
  const [q2, setQ2] = useState(false); 
  const [showConfetti, setShowConfetti] = useState(false);

  const [editProfileModal, setEditProfileModal] = useState(false);
  const [epData, setEpData] = useState({});
  const [epStatus, setEpStatus] = useState(null);
  const [docStatus, setDocStatus] = useState({ type: '', msg: '' });
  const [settingsTab, setSettingsTab] = useState('security');
  const [pwdData, setPwdData] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdStatus, setPwdStatus] = useState(null);
  const [issueText, setIssueText] = useState('');
  const [issueStatus, setIssueStatus] = useState(null);

  // Sync hash changes (Mobile back button listener)
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeTab = (tab) => {
    window.location.hash = tab;
    setActiveTab(tab);
    setDrawerOpen(false);
  };

  const getDriveImageUrl = (url) => {
    if (!url || url === "N/A" || typeof url !== 'string') return null;
    const match = url.match(/(?:id=|\/d\/)([\w-]+)/);
    return match ? `https://lh3.googleusercontent.com/d/${match[1]}` : url;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return { text: "Good Morning", emoji: "🌅" };
    if (hour >= 12 && hour < 17) return { text: "Good Afternoon", emoji: "☀️" };
    return { text: "Good Evening", emoji: "🌙" };
  };
  const greeting = getGreeting();

  const fetchDashboard = useCallback(async (storedUser) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/dashboard/data`, { 
        email: storedUser.email, branch: storedUser.branch, course: storedUser.course, joiningDate: storedUser.joiningDate 
      });
      if(res.data.success) {
        setData(res.data);
        if (res.data.userInfo) {
            const mergedUser = { ...storedUser, ...res.data.userInfo };
            setUser(mergedUser);
            localStorage.setItem('talentino_student_user', JSON.stringify(mergedUser));
        }
      }
    } catch (error) { console.error("Data error", error); }
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('talentino_student_user') || '{}');
    if (!storedUser.email) { navigate('/login'); return; }
    setUser(storedUser);
    fetchDashboard(storedUser);
    const interval = setInterval(() => { fetchDashboard(storedUser); }, 15000);
    return () => clearInterval(interval);
  }, [navigate, fetchDashboard]);

  useEffect(() => {
    if (showNotif) {
      const timer = setTimeout(() => setShowNotif(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotif]);

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

  const getNotifications = () => {
    let notifs = [];
    (data.appliedJobs || []).forEach(job => {
      notifs.push({ id: `job-${job.jobId}-${job.status}`, title: `Status Update: ${job.company}`, desc: `Your application status: ${job.status}.`, tab: 'status' });
    });
    const today = new Date();
    today.setHours(0,0,0,0);
    (data.events || []).forEach((ev, idx) => {
      const ed = new Date(ev.date);
      if(!isNaN(ed) && ed >= today) {
        notifs.push({ id: `ev-${idx}-${ev.title}`, title: `Event: ${ev.title}`, desc: `Scheduled for ${ev.date}.`, tab: 'dashboard' });
      }
    });

    return notifs.sort((a, b) => {
      const aRead = readNotifs.includes(a.id);
      const bRead = readNotifs.includes(b.id);
      if (aRead && !bRead) return 1;
      if (!aRead && bRead) return -1;
      return 0;
    });
  };
  const notifications = getNotifications();

  const handleNotifClick = (n) => {
    const updated = [...new Set([...readNotifs, n.id])];
    setReadNotifs(updated);
    localStorage.setItem('talentino_read_notifs', JSON.stringify(updated));
    changeTab(n.tab);
    setShowNotif(false);
  };

  const openEditProfileModal = () => {
    setEpData({
        age: user.age || '', gender: user.gender || 'Male',
        parentName: user.parentName || '', parentContact: user.parentContact || '',
        studyStatus: user.studyStatus || 'Currently Studying',
        completedDate: user.completedDate && user.completedDate !== 'N/A' ? user.completedDate : '',
        stream: user.stream || '', homeTown: user.homeTown || '',
        fresherStatus: user.fresherStatus || 'Fresher', qualification: user.qualification || '',
        linkedin: user.linkedin || '', instagram: user.instagram || '', placementReq: user.placementReq || ''
    });
    setEditProfileModal(true);
  };

  const handleProfileUpdate = async () => {
    setEpStatus({ type: 'info', message: 'Saving changes...' });
    try {
        const res = await axios.post(`${API_BASE_URL}/api/dashboard/profile/update`, { email: user.email, ...epData });
        if(res.data.success) {
            setEpStatus({ type: 'success', message: 'Profile updated!' });
            const updatedUser = { ...user, ...res.data.user };
            setUser(updatedUser);
            localStorage.setItem('talentino_student_user', JSON.stringify(updatedUser));
            setTimeout(() => { setEditProfileModal(false); setEpStatus(null); }, 1500);
        }
    } catch(err) { setEpStatus({ type: 'error', message: 'Server Error updating profile' }); }
  };

  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setDocStatus({ type: 'error', msg: 'Only PDF allowed' }); return; }
    
    setDocStatus({ type: 'info', msg: `Uploading ${docType}...` });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/dashboard/profile/document`, { email: user.email, rollNo: user.rollNo, base64: reader.result, docType });
            if (res.data.success) {
                setDocStatus({ type: 'success', msg: `${docType} uploaded successfully!` });
                const updatedUser = { ...user, [docType === 'Resume' ? 'resume' : 'certificate']: res.data.url };
                setUser(updatedUser);
                localStorage.setItem('talentino_student_user', JSON.stringify(updatedUser));
                setTimeout(() => setDocStatus({ type: '', msg: '' }), 3000);
            }
        } catch(err) { setDocStatus({ type: 'error', msg: 'Upload failed securely' }); }
    };
  };

  const handlePasswordUpdate = async () => {
    if(!pwdData.current || !pwdData.newPwd || !pwdData.confirm) { setPwdStatus({ type: 'error', message: 'All fields are required' }); return; }
    if(pwdData.newPwd !== pwdData.confirm) { setPwdStatus({ type: 'error', message: 'Passwords mismatch' }); return; }
    if(pwdData.newPwd.length < 8) { setPwdStatus({ type: 'error', message: 'Password must be at least 8 characters' }); return; }
    setPwdStatus({ type: 'info', message: 'Updating password...' });
    try {
        const res = await axios.post(`${API_BASE_URL}/api/dashboard/profile/password`, { email: user.email, currentPassword: pwdData.current, newPassword: pwdData.newPwd });
        if(res.data.success) {
            setPwdStatus({ type: 'success', message: 'Password Updated Successfully!' });
            setPwdData({ current: '', newPwd: '', confirm: '' });
            setTimeout(() => setPwdStatus(null), 3000);
        }
    } catch(err) { setPwdStatus({ type: 'error', message: err.response?.data?.message || 'Error updating password' }); }
  };

  const handleIssueSubmit = async () => {
    if(!issueText.trim()) return;
    setIssueStatus({ type: 'info', message: 'Submitting...' });
    try {
        const res = await axios.post(`${API_BASE_URL}/api/dashboard/support/issue`, { email: user.email, name: user.name, branch: user.branch, course: user.course, issueDetails: issueText });
        if(res.data.success) {
            setIssueStatus({ type: 'success', message: 'Report submitted successfully.' });
            setTimeout(() => { setHelpModal(false); setIssueText(''); setIssueStatus(null); }, 2500);
        }
    } catch(err) { setIssueStatus({ type: 'error', message: 'Submission failed' }); }
  };

  // --------------------------------------------------------
  // GPS & GEOFENCING LOGIC (With exact math)
  // --------------------------------------------------------
  const captureGPS = () => {
    if(!data.isScheduledToday || data.hasMarkedToday) return; 
    setLocStatus("Capturing...");
    if (!navigator.geolocation) { setLocStatus("GPS Not Supported"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (GPS Verified)`);
      },
      err => { setLocStatus("GPS Permission Denied"); }
    );
  };

  const submitAttendance = async () => {
    if (gpsCoords && user.branch) {
      const branchCoords = BRANCH_LOCATIONS[user.branch];
      if (branchCoords) {
        const R = 6371e3; 
        const dLat = (branchCoords.lat - gpsCoords.lat) * Math.PI / 180;
        const dLon = (branchCoords.lng - gpsCoords.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(gpsCoords.lat * Math.PI / 180) * Math.cos(branchCoords.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        if (distance > 150) {
           setAttStatus({ 
             type: 'error', 
             message: `You are ${Math.round(distance)} meters away from the ${user.branch} branch. You must be within 150 meters to mark attendance. (Ensure exact branch coordinates are set in App.jsx)` 
           });
           return;
        }
      }
    }

    setAttStatus({ type: 'info', message: 'Verifying location and submitting...' });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/dashboard/attendance`, { email: user.email, name: user.name, branch: user.branch, course: user.course, rating, location: locStatus, userLat: gpsCoords.lat, userLng: gpsCoords.lng, feedback });
      if(res.data.success) { setAttStatus({ type: 'success', message: 'Attendance marked successfully!' }); fetchDashboard(user); }
    } catch(err) { setAttStatus({ type: 'error', message: err.response?.data?.message || 'Server Error' }); }
  };

  // Improved Date Parsers for robust filtering
  const isPastDate = (dateStr) => {
    if (!dateStr || dateStr.toLowerCase() === 'open') return false;
    let parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
        // Assume DD/MM/YYYY or DD-MM-YYYY format from the sheet
        let d = new Date(parts[2], parts[1] - 1, parts[0]);
        let now = new Date(); now.setHours(0,0,0,0);
        return d < now;
    }
    return false;
  };

  const parseSafeDate = (dateStr) => {
    if (!dateStr || dateStr === "N/A" || dateStr === "undefined") return null;
    let parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
       // If year is first (YYYY-MM-DD)
       if (parts[0].length === 4) return new Date(parts[0], parts[1]-1, parts[2]);
       // If year is last (DD-MM-YYYY)
       return new Date(parts[2], parts[1]-1, parts[0]);
    }
    let d = new Date(dateStr);
    return isNaN(d) ? null : d;
  }

  const openApplyConfirm = () => {
    if (!user.resume || user.resume === "N/A" || !user.resume.startsWith("http")) {
      setActionStatus({ type: 'error', message: 'Resume Required! Please upload your PDF Resume document in your Profile before applying.' });
      setShowConsent(true);
    } else { setShowConsent(true); setActionStatus(null); }
  };

  const handleApply = async () => {
    if (!q1 || !q2) { setActionStatus({ type: 'error', message: 'You must check both consent boxes to apply.' }); return; }
    setActionStatus({ type: 'info', message: 'Submitting application...' });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/dashboard/apply`, { email: user.email, jobId: jobModal.newsletterId, companyName: jobModal.company, name: user.name, phone: user.phone, rollNo: user.rollNo, course: user.course, branch: user.branch, qualification: user.qualification, resume: user.resume });
      if(res.data.success) {
        setShowConfetti(true); fetchDashboard(user); 
        setTimeout(() => { setJobModal(null); setActionStatus(null); setShowConsent(false); setQ1(false); setQ2(false); setShowConfetti(false); }, 2500);
      } else { setActionStatus({ type: 'error', message: res.data.message }); }
    } catch(err) { setActionStatus({ type: 'error', message: 'Server Error applying for job' }); }
  };

  // --------------------------------------------------------
  // SMART FILTERING LOGIC
  // --------------------------------------------------------
  
  const studentJoinDate = parseSafeDate(user.joiningDate);

  // Events: Today & Future only
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  const filteredEvents = (data.events || []).filter(ev => {
    const d = new Date(ev.date);
    if(isNaN(d)) return true;
    d.setHours(0,0,0,0);
    return d >= todayDate;
  });

  // Vacancies: After student joining date + Expired at Bottom
  const processedVacancies = (data.vacancies || []).filter(vac => {
    if (!studentJoinDate) return true;
    // Check if the vacancy lastDate or open date is after student joined
    const vacLastDate = parseSafeDate(vac.lastDate);
    if (!vacLastDate) return true;
    return vacLastDate >= studentJoinDate;
  }).sort((a, b) => {
    const aExp = isPastDate(a.lastDate);
    const bExp = isPastDate(b.lastDate);
    if (aExp && !bExp) return 1;
    if (!aExp && bExp) return -1;
    return 0; // Both expired or both active
  });

  // --------------------------------------------------------
  // STATUS TAB ANALYTICS LOGIC
  // --------------------------------------------------------
  const appStats = { applied: (data.appliedJobs || []).length, attended: 0, notAttended: 0, offers: 0, rejected: 0 };
  (data.appliedJobs || []).forEach(job => {
    const s = (job.status || job.Status || '').toLowerCase();
    if (s.includes('offer') || s.includes('placed') || s.includes('selected') || s.includes('joined')) { appStats.offers++; appStats.attended++; }
    else if (s.includes('not attended')) { appStats.notAttended++; }
    else if (s.includes('attended') || s.includes('completed')) { appStats.attended++; }
    else if (s.includes('reject')) { appStats.rejected++; appStats.attended++; }
  });

  let journeyText = "Keep applying! Your placement journey is just beginning.";
  if (appStats.offers > 0) journeyText = `Outstanding progress! You have secured ${appStats.offers} placement offer(s).`;
  else if (appStats.attended > 0) journeyText = "You are successfully getting interviews. Keep refining your skills, the right offer is near!";
  else if (appStats.applied >= 5) journeyText = "You have been actively applying. Stay patient and continue preparing, interviews will follow soon.";

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('placed') || s.includes('offer') || s.includes('selected') || s.includes('joined')) return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid #22c55e' };
    if (s.includes('not attended') || s.includes('reject')) return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #ef4444' };
    if (s.includes('schedule')) return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid #f59e0b' };
    if (s.includes('no response')) return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid #64748b' };
    return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #0284c7' };
  };

  // TPO Data Fallbacks (Fixes missing Assigned Branches & Photos)
  const tpo = data.tpoInfo || {};
  const tpoPhoto = tpo.profilePhoto || tpo.photo || tpo['Profile Photo'];
  const tpoName = tpo.name || tpo['TPO Name'] || "Placement Officer";
  const tpoSitting = tpo.sittingBranch || tpo['Sitting Branch'] || "N/A";
  const tpoEmail = tpo.email || tpo.mailId || tpo['Mail ID'] || "placement@ipcsglobal.com";
  const tpoPhone = tpo.phone || tpo.contactNumber || tpo['Contact Number'] || "N/A";
  const tpoAssigned = tpo.assignedBranches || tpo.assignedRegions || tpo['Assigned Branches'] || "N/A";

  /* STREAMING_CHUNK:Rendering Dashboard structure and Navbar... */
  return (
    <div className="app-layout">
      <div className="top-header">
        <div className="header-left">
          {activeTab !== 'dashboard' ? (
            <button type="button" onClick={() => changeTab('dashboard')} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ph ph-arrow-left"></i> Dashboard
            </button>
          ) : (
            <img src={GLOBAL_LOGO_URL} alt="IPCS Global" className="header-logo-img" />
          )}
          <span style={{ marginLeft: '10px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{getBreadcrumb()}</span>
        </div>
        <div className="header-right">
          <div style={{ position: 'relative' }}>
            <button className="header-icon-btn" onClick={() => setShowNotif(!showNotif)}>
               <i className="ph ph-bell"></i>
               {notifications.filter(n => !readNotifs.includes(n.id)).length > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', width: '10px', height: '10px', borderRadius: '50%' }}></span>}
            </button>
            {showNotif && (
              <div className="notif-dropdown">
                <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, background: 'rgba(0,0,0,0.5)' }}>Notifications</div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                   {notifications.length === 0 ? <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No new notifications</div> : 
                     notifications.map((n, i) => {
                       const isRead = readNotifs.includes(n.id);
                       return (
                         <div key={i} className={`notif-item ${isRead ? 'notif-read' : ''}`} onClick={() => handleNotifClick(n)}>
                           <strong style={{ fontSize: '0.85rem', color: isRead ? 'var(--text-muted)' : 'var(--accent-cyan)' }}>{n.title}</strong>
                           <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.desc}</span>
                         </div>
                       );
                     })
                   }
                </div>
              </div>
            )}
          </div>
          <button className="header-icon-btn" onClick={toggleTheme}>
            <i className={`ph ${theme === 'dark' ? 'ph-moon' : 'ph-sun'}`}></i>
          </button>
          <div className="user-profile-badge" onClick={() => setDrawerOpen(true)}>
            <div className="avatar-circle">
               {user?.photo && user.photo !== "N/A" ? <img src={getDriveImageUrl(user.photo)} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} alt="Profile" /> : null}
               <span style={{ display: (!user?.photo || user.photo === "N/A") ? 'block' : 'none' }}>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-body">
        <div className="dashboard-content">
        
          {activeTab === 'dashboard' && (
            <>
              <div className="dash-top-row">
                <div className="hero-banner">
                  <div className="hero-banner-avatar">
                    <div className="hero-banner-avatar-inner">
                      {user?.photo && user.photo !== "N/A" ? <img src={getDriveImageUrl(user.photo)} alt="Profile" /> : (user?.name?.charAt(0).toUpperCase() || 'U')}
                    </div>
                  </div>
                  <div>
                    <div className="greeting-subtitle">{greeting.text} {greeting.emoji}</div>
                    <h2>Welcome back, <span style={{ color: 'var(--accent-cyan)' }}>{user.name?.split(' ')[0]}</span>!</h2>
                    <div className="full-date-subtext">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                <div className="quick-actions-card">
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Quick Actions</h3>
                  <div className="quick-actions-grid">
                    <div className="qa-btn" onClick={() => changeTab('talentino')}><div className="qa-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><i className="ph-fill ph-user-check"></i></div><div>Talentino</div></div>
                    <div className="qa-btn" onClick={() => setTpoModal(true)}><div className="qa-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><i className="ph-fill ph-address-book"></i></div><div>Contact TPO</div></div>
                    <div className="qa-btn" onClick={() => setHelpModal(true)}><div className="qa-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><i className="ph-fill ph-headset"></i></div><div>Request Help</div></div>
                    <div className="qa-btn" onClick={() => changeTab('profile')}><div className="qa-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}><i className="ph-fill ph-user"></i></div><div>Profile</div></div>
                  </div>
                </div>
              </div>
              
              <div className="vacancy-quick-banner" onClick={() => changeTab('vacancies')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', color: '#a855f7' }}><i className="ph ph-briefcase" style={{ fontSize: '1.5rem' }}></i></div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>Latest Placement Vacancies</div>
                    <div style={{ fontSize: '0.82rem', color: '#a5b4fc' }}>Explore active job openings for your course</div>
                  </div>
                </div>
                <button className="btn-action" style={{ background: '#6366f1', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>View Openings &rarr;</button>
              </div>

              <div className="stats-row">
                <div className="stat-card-new">
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><i className="ph-fill ph-check-circle"></i></div>
                  <div><div className="stat-num">{data.stats?.attended || 0}</div><div className="stat-label">Talentino Attended</div></div>
                </div>
                <div className="stat-card-new" onClick={() => changeTab('status')} style={{cursor:'pointer'}}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}><i className="ph-fill ph-briefcase"></i></div>
                  <div><div className="stat-num">{data.stats?.applied || 0}</div><div className="stat-label">Jobs Applied</div></div>
                </div>
                <div className="stat-card-new" onClick={() => changeTab('status')} style={{cursor:'pointer'}}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><i className="ph-fill ph-calendar-check"></i></div>
                  <div><div className="stat-num">{data.stats?.interviews || 0}</div><div className="stat-label">Interviews Scheduled</div></div>
                </div>
                <div className="stat-card-new" onClick={() => changeTab('status')} style={{cursor:'pointer'}}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><i className="ph-fill ph-certificate"></i></div>
                  <div><div className="stat-num">{data.stats?.offers || 0}</div><div className="stat-label">Offers Received</div></div>
                </div>
              </div>

              <div className="dash-bottom-row">
                <div className="upcoming-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="ph-fill ph-calendar-star" style={{ color: 'var(--accent-cyan)' }}></i> Upcoming Events</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '5px 10px', borderRadius: '8px' }}><i className="ph ph-trend-up"></i></div>
                  </div>
                  
                  {filteredEvents.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming events scheduled for today or later.</div>
                  ) : (
                    filteredEvents.map((ev, index) => {
                       let monthStr = "TBA"; let dayStr = "-";
                       let d = new Date(ev.date);
                       if(!isNaN(d)) { dayStr = d.getDate(); monthStr = d.toLocaleString('en-US', { month: 'short' }); }
                       return (
                          <div className="event-row-card" key={index}>
                            <div className="event-date-box">
                              <div className="ev-month">{monthStr}</div>
                              <div className="ev-day">{dayStr}</div>
                            </div>
                            <div className="event-body">
                              <div className="ev-title">{ev.title}</div>
                              <div className="ev-meta"><i className="ph ph-clock"></i> {ev.time || 'TBA'}</div>
                            </div>
                            <div className="ev-badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid #7e22ce' }}>{ev.type}</div>
                          </div>
                       )
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {/* STREAMING_CHUNK:Rendering polished Profile layout... */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Student Details</h2>
                <button className="btn-action" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={openEditProfileModal}><i className="ph ph-pencil-simple"></i> Edit Profile</button>
              </div>
              
              <div className="profile-grid">
                <div className="profile-left-col">
                  <div className="profile-large-avatar">
                     {user?.photo && user.photo !== "N/A" ? <img src={getDriveImageUrl(user.photo)} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} alt="Profile" /> : null}
                     <span style={{ display: (!user?.photo || user.photo === "N/A") ? 'flex' : 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <h2 style={{ margin: '10px 0 5px 0', fontSize: '1.4rem', position: 'relative', zIndex: 2 }}>{user.name}</h2>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '15px', position: 'relative', zIndex: 2 }}>{user.course}</div>
                  <div style={{ display: 'inline-block', position: 'relative', zIndex: 2, background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #22c55e' }}>{user.studyStatus || 'Active'}</div>
                  
                  <div style={{ position: 'relative', zIndex: 2, background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '1.2rem', marginTop: '1.5rem', textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Contact Info</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '0.88rem' }}><i className="ph ph-envelope" style={{ color: 'var(--text-muted)' }}></i> <div style={{ wordBreak: 'break-all' }}>{user.email}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '0.88rem' }}><i className="ph ph-phone" style={{ color: 'var(--text-muted)' }}></i> <div>{user.phone}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '0.88rem' }}><i className="ph ph-map-pin" style={{ color: 'var(--text-muted)' }}></i> <div>{user.homeTown && user.homeTown !== 'N/A' ? user.homeTown : 'Not Provided'}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}><i className="ph ph-buildings" style={{ color: 'var(--text-muted)' }}></i> <div>{user.branch}</div></div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="info-card">
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem' }}>Personal Information</div>
                    <div className="info-grid">
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👤 Full Name</div><div style={{ fontWeight: 600 }}>{user.name}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔢 IPCS Roll Number</div><div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{user.rollNo}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 Phone Number</div><div style={{ fontWeight: 600 }}>{user.phone}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📧 Mail ID</div><div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{user.email}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🎂 Age</div><div style={{ fontWeight: 600 }}>{user.age && user.age !== 'N/A' ? user.age : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⚧ Gender</div><div style={{ fontWeight: 600 }}>{user.gender && user.gender !== 'N/A' ? user.gender : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👨‍👩‍👧 Parent Name</div><div style={{ fontWeight: 600 }}>{user.parentName && user.parentName !== 'N/A' ? user.parentName : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📱 Parent Contact</div><div style={{ fontWeight: 600 }}>{user.parentContact && user.parentContact !== 'N/A' ? user.parentContact : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🏠 Home Town</div><div style={{ fontWeight: 600 }}>{user.homeTown && user.homeTown !== 'N/A' ? user.homeTown : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔗 LinkedIn Profile</div><div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{user.linkedin && user.linkedin !== 'N/A' ? <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noreferrer" style={{color: 'var(--accent-blue)'}}>View Profile</a> : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📸 Instagram ID</div><div style={{ fontWeight: 600 }}>{user.instagram && user.instagram !== 'N/A' ? user.instagram : 'Not Provided'}</div></div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem' }}>Academic & Course Information</div>
                    <div className="info-grid">
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📚 Course Category</div><div style={{ fontWeight: 600 }}>{user.course || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🏢 Branch</div><div style={{ fontWeight: 600 }}>{user.branch || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 Joining Date</div><div style={{ fontWeight: 600 }}>{user.joiningDate && user.joiningDate !== 'N/A' && user.joiningDate !== 'undefined' ? user.joiningDate : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📊 Study Status</div><div style={{ color: '#f59e0b', fontWeight: 600 }}>{user.studyStatus && user.studyStatus !== 'N/A' ? user.studyStatus : 'Currently Studying'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🎓 Completed Date</div><div style={{ fontWeight: 600 }}>{user.completedDate && user.completedDate !== 'N/A' && !user.completedDate.includes('google') ? user.completedDate : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📜 Qualification</div><div style={{ fontWeight: 600 }}>{user.qualification && user.qualification !== 'N/A' ? user.qualification : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🛤️ Stream / Branch</div><div style={{ fontWeight: 600 }}>{user.stream && user.stream !== 'N/A' ? user.stream : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>💼 Experience Status</div><div style={{ fontWeight: 600 }}>{user.fresherStatus && user.fresherStatus !== 'N/A' ? user.fresherStatus : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🎯 Placement Requirement</div><div style={{ fontWeight: 600 }}>{user.placementReq && user.placementReq !== 'N/A' ? user.placementReq : 'None'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔓 Vacancy Open</div><div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{user.vacancyOpen || 'Yes'}</div></div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem' }}>Referrals & Credentials</div>
                    <div className="info-grid">
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🤝 Friend 1 Name</div><div style={{ fontWeight: 600 }}>{user.friend1Name && user.friend1Name !== 'N/A' ? user.friend1Name : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 Friend 1 Contact</div><div style={{ fontWeight: 600 }}>{user.friend1Phone && user.friend1Phone !== 'N/A' ? user.friend1Phone : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🤝 Friend 2 Name</div><div style={{ fontWeight: 600 }}>{user.friend2Name && user.friend2Name !== 'N/A' ? user.friend2Name : 'Not Provided'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 Friend 2 Contact</div><div style={{ fontWeight: 600 }}>{user.friend2Phone && user.friend2Phone !== 'N/A' ? user.friend2Phone : 'Not Provided'}</div></div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem' }}>Documents (Resume & Certificate)</div>
                    
                    <div className="doc-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <i className="ph-fill ph-file-pdf" style={{ fontSize: '1.8rem', color: '#ef4444' }}></i>
                        <div>
                          <div style={{ fontWeight: 700 }}>📄 Resume.pdf</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {user.resume && user.resume !== 'N/A' && user.resume.includes('http') ? <span style={{color: '#4ade80'}}>Uploaded</span> : 'Not Uploaded'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="file" id="resumeUploadInput" accept=".pdf" className="hidden" onChange={(e) => handleDocumentUpload(e, 'Resume')} />
                        <button className="btn-cancel" style={{ padding: '0.5rem 1rem' }} onClick={() => document.getElementById('resumeUploadInput').click()}><i className="ph ph-upload-simple"></i> Upload</button>
                        {user.resume && user.resume !== 'N/A' && user.resume.includes('http') && <a href={user.resume} target="_blank" rel="noreferrer" className="btn-action" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}><i className="ph ph-download-simple"></i> View</a>}
                      </div>
                    </div>
                    
                    <div className="doc-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <i className="ph-fill ph-certificate" style={{ fontSize: '1.8rem', color: '#f59e0b' }}></i>
                        <div>
                          <div style={{ fontWeight: 700 }}>🏅 Course Certificate.pdf</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {user.certificate && user.certificate !== 'N/A' && user.certificate.includes('http') ? <span style={{color: '#4ade80'}}>Uploaded</span> : 'Not Uploaded'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="file" id="certUploadInput" accept=".pdf" className="hidden" onChange={(e) => handleDocumentUpload(e, 'Certificate')} />
                        <button className="btn-cancel" style={{ padding: '0.5rem 1rem' }} onClick={() => document.getElementById('certUploadInput').click()}><i className="ph ph-upload-simple"></i> Upload</button>
                        {user.certificate && user.certificate !== 'N/A' && user.certificate.includes('http') && <a href={user.certificate} target="_blank" rel="noreferrer" className="btn-action" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}><i className="ph ph-download-simple"></i> View</a>}
                      </div>
                    </div>
                    {docStatus.msg && <div className={`alert alert-${docStatus.type}`} style={{marginTop: '10px'}}>{docStatus.msg}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STREAMING_CHUNK:Rendering Settings and Guide tab layouts... */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '2rem' }}>Settings</h2>
              <div className="settings-container">
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <div className={`settings-tab ${settingsTab === 'security' ? 'active' : ''}`} onClick={() => setSettingsTab('security')}><i className="ph ph-lock-key"></i> Security</div>
                    <div className={`settings-tab ${settingsTab === 'appearance' ? 'active' : ''}`} onClick={() => setSettingsTab('appearance')}><i className="ph ph-palette"></i> Appearance</div>
                 </div>
                 <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '2rem', minHeight: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    {settingsTab === 'security' && (
                       <div>
                          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>Change Password</h3>
                          <div className="form-group"><label>Current Password</label><input type="password" value={pwdData.current} onChange={(e) => setPwdData({...pwdData, current: e.target.value})} placeholder="Enter current password" /></div>
                          <div className="grid-2col">
                             <div className="form-group"><label>New Password</label><input type="password" value={pwdData.newPwd} onChange={(e) => setPwdData({...pwdData, newPwd: e.target.value})} placeholder="Enter new password" /></div>
                             <div className="form-group"><label>Confirm New Password</label><input type="password" value={pwdData.confirm} onChange={(e) => setPwdData({...pwdData, confirm: e.target.value})} placeholder="Re-enter new password" /></div>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Use at least 8 characters with a mix of letters, numbers & symbols.</p>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn-action" onClick={handlePasswordUpdate}>Update Password</button></div>
                          {pwdStatus && <div className={`alert alert-${pwdStatus.type}`} style={{marginTop: '10px'}}>{pwdStatus.message}</div>}
                       </div>
                    )}
                    {settingsTab === 'appearance' && (
                       <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Appearance</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>Choose how the dashboard looks. You can also toggle the theme from the top bar.</p>
                          <div style={{ display: 'flex', gap: '15px' }}>
                             <div onClick={() => toggleTheme()} style={{ flex: 1, border: `2px solid ${theme === 'light' ? 'var(--accent-cyan)' : 'var(--input-border)'}`, borderRadius: '12px', padding: '1rem', textAlign: 'center', cursor: 'pointer' }}>
                                <div style={{ height: '60px', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--input-border)', background: '#ffffff' }}></div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Light</div>
                             </div>
                             <div onClick={() => toggleTheme()} style={{ flex: 1, border: `2px solid ${theme === 'dark' ? 'var(--accent-cyan)' : 'var(--input-border)'}`, borderRadius: '12px', padding: '1rem', textAlign: 'center', cursor: 'pointer' }}>
                                <div style={{ height: '60px', borderRadius: '8px', marginBottom: '10px', border: '1px solid var(--input-border)', background: '#0f172a' }}></div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Dark</div>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: 800 }}>Guide & Resume Resources</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Explore top platforms and guides to create a professional resume and prepare for placements.</p>
              </div>
              <div className="resume-grid">
                 <div className="resume-card" onClick={() => window.open('https://drive.google.com/file/d/10IFApxJGwGwRmVFpEtfQxc1RR-IraOq7/view?pli=1', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}><i className="ph-fill ph-book-open"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Talentino HandBook</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The official IPCS placement guide</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.canva.com/en_in/login/?redirect=%2Fs%2Ftemplates%3Fquery%3Dprofessional%2Bresume', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8' }}><i className="ph-fill ph-palette"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Canva Templates</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Design highly visual & modern resumes</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.youtube.com/watch?v=ZMByWenSRdI', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><i className="ph-fill ph-youtube-logo"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Resume Writing Part 1</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Essential basics for beginners</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.youtube.com/watch?v=VB376MMEq38', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><i className="ph-fill ph-youtube-logo"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Resume Writing Part 2</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Structuring your skills and experience</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.youtube.com/watch?v=gDN7cJ3Rt80', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><i className="ph-fill ph-youtube-logo"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Interview Prep Guide</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>How to confidently answer questions</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.youtube.com/watch?v=7JRj3r5vunU', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><i className="ph-fill ph-youtube-logo"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>ATS Resume Guide</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>How to beat Applicant Tracking Systems</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.youtube.com/watch?v=EW4dEzfBst0', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><i className="ph-fill ph-youtube-logo"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Body Language Tips</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Master your non-verbal communication</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.youtube.com/watch?v=k_f4Mb2ARdA', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><i className="ph-fill ph-youtube-logo"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Group Discussion Strategy</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stand out during group evaluations</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.youtube.com/watch?v=UjX_kl5UxPo', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><i className="ph-fill ph-youtube-logo"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Common Mistakes</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Watch out for these CV errors</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://resume.io/resume-templates', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}><i className="ph-fill ph-file-text"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Resume.io</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Professional builder with ATS templates</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.myperfectresume.com/', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}><i className="ph-fill ph-check-square"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>MyPerfectResume</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fast and easy online resume creator</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://zety.com/', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}><i className="ph-fill ph-pen-nib"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Zety Builder</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create a winning resume in minutes</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://word.cloud.microsoft/en-us/search/resume/?wdOrigin=SEO-INTENT.WD-SE-L27-1-L27-1.SEARCHTEMPLATES', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}><i className="ph-fill ph-file-doc"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>MS Word Templates</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Classic and reliable word document formats</span></div>
                 </div>
              </div>
            </div>
          )}

          {/* STREAMING_CHUNK:Rendering Talentino attendance module... */}
          {activeTab === 'talentino' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: 800 }}>Talentino Attendance</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Mark your attendance and track your session participation (Calculated post-joining date)</p>
              </div>
              
              <div className="talentino-summary-grid">
                <div className="talentino-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}><i className="ph ph-check-circle" style={{ color: '#10b981' }}></i> Present Check-ins</div>
                  <div className="t-stat-num">{data.stats?.attended || 0}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}><span>Progress</span><span>{data.stats?.totalConducted > 0 ? Math.round((data.stats?.attended / data.stats?.totalConducted) * 100) : 0}%</span></div>
                  <div className="progress-bar" style={{ marginTop: '6px' }}><div className="progress-fill" style={{ width: `${data.stats?.totalConducted > 0 ? Math.round((data.stats?.attended / data.stats?.totalConducted) * 100) : 0}%` }}></div></div>
                </div>
                <div className="talentino-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}><i className="ph ph-calendar-blank" style={{ color: '#3b82f6' }}></i> Total Conducted</div>
                  <div className="t-stat-num">{data.stats?.totalConducted || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sessions in your branch since joining</div>
                </div>
                <div className="talentino-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}><i className="ph ph-clock" style={{ color: '#f59e0b' }}></i> On Leave</div>
                  <div className="t-stat-num">{data.stats?.onLeave || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved leaves</div>
                </div>
              </div>

              <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>Mark Today's Attendance</h3>
              
              {data.hasMarkedToday ? (
                  <div style={{ background: 'rgba(10, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: 600 }}>
                     <i className="ph-fill ph-check-circle" style={{ fontSize: '1.4rem' }}></i> You have already marked your attendance for today.
                  </div>
              ) : (
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '1.8rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <div style={{ background: data.isScheduledToday ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${data.isScheduledToday ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      <i className="ph ph-calendar-check" style={{ color: data.isScheduledToday ? '#3b82f6' : '#ef4444', fontSize: '1.2rem' }}></i>
                      {data.isScheduledToday ? <span>Session active today <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(09:30 AM - 07:00 PM)</span></span> : <span style={{ color: '#ef4444' }}>No Session scheduled for today</span>}
                    </div>
                    
                    <div className="form-group" style={{ opacity: data.isScheduledToday ? 1 : 0.5, pointerEvents: data.isScheduledToday ? 'auto' : 'none' }}>
                      <label>Location Verification</label>
                      <div onClick={captureGPS} style={{ background: gpsCoords ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-dark)', color: gpsCoords ? '#10b981' : 'var(--text-main)', border: `1px solid ${gpsCoords ? '#10b981' : 'var(--card-border)'}`, padding: '1rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                        <i className="ph ph-map-pin" style={{ marginRight: '8px' }}></i> {locStatus}
                      </div>
                    </div>
                    <div className="form-group" style={{ opacity: data.isScheduledToday ? 1 : 0.5, pointerEvents: data.isScheduledToday ? 'auto' : 'none' }}>
                      <label>Rate this session</label>
                      <div className="star-rating">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`star ${rating >= s ? 'selected' : ''}`} onClick={() => setRating(s)}>★</span>
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
                <i className="ph ph-trend-up"></i> Attendance History
              </div>
              
              <div id="attendanceHistoryContainer">
                 {(data.attendanceHistory || []).length === 0 ? (
                   <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>No attendance records yet.</div>
                 ) : (
                   (data.attendanceHistory || []).map((hist, idx) => {
                      let parsedDate = hist.dateStr || "Unknown";
                      let parsedTime = "";
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
                        <div key={idx} style={{ background: 'var(--bg-dark)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
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

          {/* STREAMING_CHUNK:Rendering Vacancies grid and Job Details Modals... */}
          {activeTab === 'vacancies' && (
            <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
              <div className="vacancies-hero" style={{ background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', borderRadius: '20px', padding: '3rem 1.5rem 2.5rem 1.5rem', marginBottom: '2rem', textAlign: 'center', borderBottom: '1px solid var(--card-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '2px', color: '#ffffff', margin: '0 0 8px 0', textTransform: 'uppercase' }}>JOB VACANCIES</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>NewsLetter ID Not Valid After Expiry Date</p>
              </div>
              
              {(!user.vacancyOpen || user.vacancyOpen.toString().trim().toLowerCase() !== 'yes') ? (
                 <div className="alert alert-error" style={{ margin: '2rem auto', maxWidth: '600px', padding: '2rem' }}>
                     <i className="ph-fill ph-lock-key" style={{ marginRight: '8px', fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i> 
                     Your access to view Job Vacancies is currently restricted. Please contact your Placement Officer.
                 </div>
              ) : processedVacancies.length === 0 ? (
                 <div className="alert alert-info" style={{ margin: '2rem auto', maxWidth: '600px' }}><i className="ph-fill ph-info"></i> No active vacancies found after your joining date. Check back later!</div>
              ) : (
                 Object.entries(
                   processedVacancies.reduce((acc, vac) => {
                     const loc = (vac.state || 'OTHER STATES').toUpperCase().trim();
                     if(!acc[loc]) acc[loc] = [];
                     acc[loc].push(vac);
                     return acc;
                 }, {})).map(([locationName, vacs], index) => (
                     <div key={index} className="location-table-card">
                         <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.2rem' }}>{locationName}</h2>
                         <table className="vac-table">
                             <thead>
                                 <tr>
                                     <th>NewsLetter ID</th>
                                     <th>Position</th>
                                     <th>Opening At</th>
                                     <th>Mode of Work</th>
                                     <th>Last Date</th>
                                     <th style={{ textAlign: 'center' }}>Action</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {vacs.map((vac, vIdx) => {
                                     const isApplied = (data.appliedJobs || []).some(j => j.jobId === vac.newsletterId);
                                     const isExpired = isPastDate(vac.lastDate);
                                     return (
                                         <tr key={vIdx} style={{ cursor: (!isApplied && !isExpired) ? 'pointer' : 'default', opacity: isExpired ? 0.4 : 1 }} onClick={() => { if(!isApplied && !isExpired) { setJobModal(vac); setActionStatus(null); setShowConsent(false); setQ1(false); setQ2(false); }}}>
                                             <td style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{vac.newsletterId}</td>
                                             <td style={{ color: 'var(--text-main)', fontWeight: 700 }}>{vac.position}</td>
                                             <td style={{ color: 'var(--accent-cyan)' }}>{vac.location}</td>
                                             <td style={{ color: 'var(--text-muted)' }}>{vac.modeOfWork}</td>
                                             <td style={{ color: isExpired ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{vac.lastDate} {isExpired && '(Expired)'}</td>
                                             <td style={{ textAlign: 'center' }}>
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

          {/* STREAMING_CHUNK:Rendering Application Status Analytics... */}
          {activeTab === 'status' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: 800 }}>Application Status</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Track the current status of all your applied job openings</p>
              </div>

              <div className="app-stats-grid">
                 <div className="talentino-stat-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Jobs Applied</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{appStats.applied}</div>
                 </div>
                 <div className="talentino-stat-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Attended</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{appStats.attended}</div>
                 </div>
                 <div className="talentino-stat-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Offers Got</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{appStats.offers}</div>
                 </div>
                 <div className="talentino-stat-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Not Attended</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{appStats.notAttended}</div>
                 </div>
                 <div className="talentino-stat-card" style={{ padding: '1.2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Rejected</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#94a3b8' }}>{appStats.rejected}</div>
                 </div>
              </div>

              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <i className="ph-fill ph-chart-line-up" style={{ fontSize: '2rem', color: 'var(--accent-purple)' }}></i>
                <div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Journey Analysis</div>
                   <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem' }}>{journeyText}</div>
                </div>
              </div>

              <div className="location-table-card">
                <table className="vac-table">
                  <thead><tr><th>NewsLetter ID</th><th>Company & Position</th><th>Applied Date & Time</th><th>Current Status</th><th>Remarks</th></tr></thead>
                  <tbody>
                    {(data.appliedJobs || []).length === 0 ? <tr><td colSpan="5" style={{textAlign:'center'}}>No applications yet.</td></tr> : 
                      (data.appliedJobs || []).map((job, idx) => {
                        const statusVal = job.status || job.Status || 'Applied';
                        const style = getStatusStyle(statusVal);
                        const jobIdVal = job.jobId || job['Job ID'] || job.id;
                        const companyVal = job.company || job.companyName || job['Company Name'] || 'Company N/A';
                        const positionVal = job.position || job.Position || 'Position N/A';
                        const dateVal = job.date || job.TimeStamp || job.Timestamp || job.time || 'N/A';
                        const remarksVal = job.remarks || job.Remarks || '-';

                        return(
                        <tr key={idx}>
                          <td style={{color:'var(--accent-purple)', fontWeight:700}}>{jobIdVal}</td>
                          <td>
                             <div style={{fontWeight:600}}>{companyVal}</div>
                             <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px'}}>{positionVal}</div>
                          </td>
                          <td style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>{dateVal}</td>
                          <td><span className="status-badge" style={{ background: style.bg, color: style.color, border: style.border }}>{statusVal}</span></td>
                          <td style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>{remarksVal}</td>
                        </tr>
                      )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* STREAMING_CHUNK:Rendering Sidebar and Navigation Drawer... */}
      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={(e) => { if(e.target.className.includes('drawer-overlay')) setDrawerOpen(false); }}>
        <div className="drawer-card" style={{ position: 'absolute', right: 0 }}>
          <div className="drawer-header-cover" style={{ backgroundImage: `url(${COVER_BANNER_URL})` }}>
            <div className="drawer-close-btn" onClick={() => setDrawerOpen(false)}><i className="ph ph-x"></i></div>
            <div className="drawer-profile-row">
              <div className="drawer-avatar">
                 {user?.photo && user.photo.includes('http') ? <img src={getDriveImageUrl(user.photo)} alt="Profile" /> : user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style={{ display:'block', fontSize:'1.1rem', fontWeight:700, color: '#fff' }}>{user?.name}</strong>
                <span style={{ fontSize:'0.8rem', color: '#38bdf8', fontWeight: 600 }}>{user?.rollNo}</span>
              </div>
            </div>
          </div>
          <div className="drawer-menu">
            <div className="drawer-item" onClick={() => changeTab('dashboard')}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-house"></i> Dashboard</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => changeTab('talentino')}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-user-check"></i> Talentino</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => changeTab('profile')}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-user"></i> Profile</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => changeTab('status')}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-list-checks"></i> Application Status</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => changeTab('vacancies')}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-briefcase"></i> Current Job Vacancies</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => changeTab('guide')}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-book-open"></i> Guide</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setTpoModal(true); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-address-book"></i> Contact TPO</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setHelpModal(true); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-info"></i> Request Help</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => changeTab('settings')}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-gear"></i> Settings</div><span>&rsaquo;</span></div>
          </div>
          <div className="drawer-footer">
            <button className="btn-logout-drawer" onClick={handleLogout}>Log Out</button>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Copyright &copy; 2026 Talentino IPCS Global</div>
          </div>
        </div>
      </div>
      
      {/* STREAMING_CHUNK:Rendering closing Modals (Profile, Modals, Support)... */}
      {editProfileModal && (
        <div className="report-modal-overlay" style={{ zIndex: 1200 }}>
          <div className="report-card" style={{ maxWidth: '700px' }}>
            <div className="modal-header-border">
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}><i className="ph ph-pencil-simple" style={{ color: 'var(--accent-cyan)' }}></i> Edit Profile Details</h3>
              <i className="ph ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setEditProfileModal(false)}></i>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px', background: 'var(--hover-bg)', padding: '10px', borderRadius: '8px' }}><strong>Note:</strong> Core ID details (Name, Roll No, Branch, Email, Course) are strictly uneditable by students. Contact admin for corrections.</div>
            <div className="grid-2col">
               <div className="form-group"><label>Age</label><input type="number" value={epData.age} onChange={(e) => setEpData({...epData, age: e.target.value})} /></div>
               <div className="form-group"><label>Gender</label><select value={epData.gender} onChange={(e) => setEpData({...epData, gender: e.target.value})}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
               <div className="form-group"><label>Parent Name</label><input type="text" value={epData.parentName} onChange={(e) => setEpData({...epData, parentName: e.target.value})} /></div>
               <div className="form-group"><label>Parent Contact</label><input type="tel" value={epData.parentContact} onChange={(e) => setEpData({...epData, parentContact: e.target.value})} /></div>
               <div className="form-group"><label>Studying Status</label><select value={epData.studyStatus} onChange={(e) => setEpData({...epData, studyStatus: e.target.value})}><option value="Currently Studying">Currently Studying</option><option value="Completed Course">Completed Course</option></select></div>
               <div className="form-group"><label>Course Completed Date</label><input type="date" value={epData.completedDate} onChange={(e) => setEpData({...epData, completedDate: e.target.value})} /></div>
               <div className="form-group"><label>Stream</label><input type="text" value={epData.stream} onChange={(e) => setEpData({...epData, stream: e.target.value})} /></div>
               <div className="form-group"><label>Home Town</label><input type="text" value={epData.homeTown} onChange={(e) => setEpData({...epData, homeTown: e.target.value})} /></div>
               <div className="form-group"><label>Fresher Status</label><select value={epData.fresherStatus} onChange={(e) => setEpData({...epData, fresherStatus: e.target.value})}><option value="Fresher">Fresher</option><option value="Experienced">Experienced</option></select></div>
               <div className="form-group"><label>Qualification</label><input type="text" value={epData.qualification} onChange={(e) => setEpData({...epData, qualification: e.target.value})} /></div>
            </div>
            <div className="grid-2col" style={{ marginTop: '1rem' }}>
               <div className="form-group"><label>LinkedIn</label><input type="text" value={epData.linkedin} onChange={(e) => setEpData({...epData, linkedin: e.target.value})} /></div>
               <div className="form-group"><label>Instagram Handle</label><input type="text" value={epData.instagram} onChange={(e) => setEpData({...epData, instagram: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Placement Requirements</label><textarea rows="2" value={epData.placementReq} onChange={(e) => setEpData({...epData, placementReq: e.target.value})}></textarea></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
               <button className="btn-cancel" onClick={() => setEditProfileModal(false)}>Cancel</button>
               <button className="btn-action" onClick={handleProfileUpdate}>Save Changes</button>
            </div>
            {epStatus && <div className={`alert alert-${epStatus.type}`} style={{marginTop: '10px'}}>{epStatus.message}</div>}
          </div>
        </div>
      )}

      {jobModal && (
        <div className="report-modal-overlay">
          <div className="report-card" style={{ maxWidth: '600px', width: '90%', padding: '0', overflow: 'hidden', position: 'relative' }}>
            
            {showConfetti && (
              <div className="celebration-overlay">
                <div className="celebration-content">
                  <span className="party-emoji">🎉</span>
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
                <i className="ph ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.4rem' }} onClick={() => { setJobModal(null); setShowConsent(false); setQ1(false); setQ2(false); setShowConfetti(false); }}></i>
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
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-line', background: 'var(--hover-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
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
                        <input type="checkbox" checked={q1} onChange={e => setQ1(e.target.checked)} style={{ width: '22px', height: '22px', flexShrink: 0, marginTop: '3px', cursor: 'pointer' }} />
                        <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: 0, fontWeight: 400, lineHeight: 1.4 }}>
                          1. As I am applying for this job, I agree that I will attend the interview whenever the company calls me without fail.
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                        <input type="checkbox" checked={q2} onChange={e => setQ2(e.target.checked)} style={{ width: '22px', height: '22px', flexShrink: 0, marginTop: '3px', cursor: 'pointer' }} />
                        <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: 0, fontWeight: 400, lineHeight: 1.4 }}>
                          2. I agree as per Placement rule if I fail to attend this company interview, I will be removed from placement support.
                        </p>
                      </div>
                      
                      {actionStatus && <div className={`alert alert-${actionStatus.type}`} style={{ marginBottom: '15px' }}>{actionStatus.message}</div>}
                      
                      <button 
                        className="btn-action" 
                        style={{ width: '100%', background: (q1 && q2) ? '#22c55e' : 'var(--input-border)', color: (q1 && q2) ? '#fff' : 'var(--text-muted)', padding: '1rem', fontSize: '1rem', cursor: (q1 && q2) ? 'pointer' : 'not-allowed', transition: 'background 0.3s' }} 
                        onClick={handleApply}
                      >
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

      {tpoModal && (
        <div className="report-modal-overlay">
          <div className="report-card" style={{ maxWidth: '420px', padding: 0, overflow: 'hidden' }}>
            <div style={{ background: `url(${COVER_BANNER_URL}) center/cover`, position: 'relative', padding: '2.5rem 1.5rem 3.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(11,15,23,0.85)' }}></div>
              <i className="ph ph-x" style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.4rem', zIndex: 10 }} onClick={() => setTpoModal(false)}></i>
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--bg-dark)', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justify-content: 'center', border: '3px solid var(--accent-cyan)', overflow: 'hidden' }}>
                  {tpoPhoto && tpoPhoto !== "N/A" ? <img src={getDriveImageUrl(tpoPhoto)} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="TPO" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} /> : null}
                  <i className="ph ph-user-tie" style={{ fontSize: '2.5rem', color: 'var(--accent-cyan)', display: (!tpoPhoto || tpoPhoto === "N/A") ? 'block' : 'none' }}></i>
                </div>
                <h2 style={{ margin: '0 0 5px 0', color: '#fff' }}>{tpoName}</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sitting Branch: <strong style={{ color: 'var(--accent-cyan)' }}>{tpoSitting}</strong></div>
              </div>
            </div>
            
            <div style={{ padding: '0 2rem 2rem 2rem', marginTop: '-20px', position: 'relative', zIndex: 3 }}>
              <div style={{ background: 'var(--input-bg)', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '0.9rem', border: '1px solid var(--card-border)' }}>
                <div style={{ marginBottom: '10px' }}><strong>Email:</strong> <span style={{ color: 'var(--accent-cyan)' }}>{tpoEmail}</span></div>
                <div style={{ marginBottom: '10px' }}><strong>Phone:</strong> <span>{tpoPhone}</span></div>
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--card-border)' }}><strong>Assigned Regions:</strong> <span style={{ color: 'var(--text-muted)' }}>{tpoAssigned}</span></div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <a href={`tel:${tpoPhone}`} className="btn-action" style={{ flex: 1, background: '#2563eb', textDecoration: 'none' }}><i className="ph-fill ph-phone"></i> Call</a>
                <a href={`https://wa.me/${tpoPhone.toString().replace(/\D/g,'')}`} className="btn-action" style={{ flex: 1, background: '#22c55e', textDecoration: 'none' }}><i className="ph-fill ph-whatsapp-logo"></i> WhatsApp</a>
                <a href={`mailto:${tpoEmail}?cc=placementcell.ipcs@gmail.com&subject=Student Inquiry: ${user?.name} (${user?.rollNo})`} className="btn-action" style={{ flex: 1, background: '#ef4444', textDecoration: 'none' }}><i className="ph-fill ph-envelope"></i> Mail</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {helpModal && (
        <div className="report-modal-overlay">
          <div className="report-card">
            <div className="modal-header-border">
              <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="ph ph-headset" style={{ color: 'var(--accent-cyan)' }}></i> Request Help / Inquiry</h3>
              <i className="ph ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }} onClick={() => { setHelpModal(false); setIssueText(''); setIssueStatus(null); }}></i>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '15px' }}>Your issue will be forwarded directly to your TPO and the Master Placement Cell.</p>
            <div className="form-group"><label>Describe Your Issue or Inquiry *</label><textarea rows="5" value={issueText} onChange={(e) => setIssueText(e.target.value)} placeholder="Explain the problem or inquiry in detail..."></textarea></div>
            <button className="btn-action" style={{ width: '100%' }} onClick={handleIssueSubmit}>Submit Report &rarr;</button>
            {issueStatus && <div className={`alert alert-${issueStatus.type}`} style={{marginTop: '10px'}}>{issueStatus.message}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center', padding: '1.5rem', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>
      <div style={{ maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--card-bg)', padding: '3rem 2rem', borderRadius: '20px', border: '1px solid var(--card-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px', height: '180px', marginBottom: '1.5rem' }}>
          <div style={{ position: 'absolute', borderRadius: '50%', width: '35px', height: '35px', background: '#ef4444', top: '10px', right: '15%' }}></div>
          <div style={{ position: 'absolute', borderRadius: '50%', width: '45px', height: '45px', background: '#f59e0b', top: '0px', left: '10%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '5rem', fontWeight: 900, color: 'var(--text-muted)', height: '100%' }}>
            <span>4</span><span style={{ color: 'var(--accent-cyan)' }}>0</span><span>4</span>
          </div>
          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '20px', background: 'var(--accent-blue)', borderRadius: '50px' }}></div>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Oops!</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--accent-cyan)', marginBottom: '0.25rem', fontWeight: 600 }}>Who spilled the paint?</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>The page you are looking for doesn't exist or has been moved.</p>
        <a href="/" style={{ background: 'var(--accent-blue)', color: '#ffffff', padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s', display: 'inline-block' }}>Go Back Home &rarr;</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MarketingSite />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cropper from 'react-easy-crop';
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const GlobalStyle = () => {
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
      * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
      body { background-color: var(--bg-dark); color: var(--text-main); margin: 0; padding: 0; min-height: 100vh; overflow-x: hidden; transition: background-color 0.3s, color 0.3s; }
      .hidden { display: none !important; }
      
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
      .pwd-wrapper { position: relative; display: block; width: 100%; }
      .pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;}

      .auth-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; width: 100vw; padding: 20px; }
      .auth-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 2.2rem 1.8rem; width: 100%; max-width: 440px; }
      .brand-logo-container { display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; }
      .auth-logo-img { max-width: 220px; height: auto; object-fit: contain; }
      .switch-mode { text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted); }
      .switch-mode span { color: var(--accent-cyan); text-decoration: none; font-weight: 600; cursor: pointer; }
      .tnc-link { color: var(--accent-cyan); text-decoration: underline; cursor: pointer; font-weight: 600; }

      .alert { padding: 0.8rem; margin-top: 1rem; border-radius: 8px; text-align: center; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;}
      .alert-error { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid #ef4444; }
      .alert-info { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #0284c7; }
      .alert-success { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid #22c55e; }

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
      .report-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 2rem; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; position: relative; animation: fadeInReveal 0.3s ease;}
      .modal-header-border { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.8rem; }
      .tnc-content-box { height: 350px; overflow-y: auto; font-size: 0.85rem; color: var(--text-main); background: var(--input-bg); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--input-border); line-height: 1.7; position: relative; }
      .tnc-content-box h4 { color: var(--text-main); font-size: 0.9rem; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; }
      .tnc-content-box ul { margin-top: 0; padding-left: 20px; margin-bottom: 20px; }

      /* Animation/Confetti classes */
      .celebration-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(11, 15, 23, 0.85); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); border-radius: 20px; }
      .celebration-content { text-align: center; animation: fadeInUp 0.4s ease; }
      .party-emoji { font-size: 4rem; display: block; margin-bottom: 10px; animation: pulse 1s infinite; }
      @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1) rotate(5deg); } 100% { transform: scale(1); } }

      /* --- DASHBOARD STYLES --- */
      .app-layout { display: flex; flex-direction: column; width: 100vw; min-height: 100vh; }
      .main-body { flex: 1; display: flex; flex-direction: column; width: 100%; }
      .top-header { height: 65px; border-bottom: 1px solid var(--card-border); background: var(--card-bg); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; transition: background 0.3s; }
      .header-left { display: flex; align-items: center; gap: 12px; }
      .header-logo-img { height: 40px; width: auto; object-fit: contain; }
      .header-right { display: flex; align-items: center; gap: 18px; }
      .header-icon-btn { position: relative; color: var(--text-muted); font-size: 1.4rem; cursor: pointer; background: none; border: none; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; }
      .header-icon-btn:hover { color: var(--accent-cyan); background: var(--hover-bg); }
      .user-profile-badge { display: flex; align-items: center; cursor: pointer; }
      .avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; border: 2px solid rgba(56, 189, 248, 0.4); overflow: hidden;}
      .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
      
      .dashboard-content { padding: 2rem; max-width: 1200px; width: 100%; margin: 0 auto; }
      .dash-top-row { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
      .hero-banner { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.8rem 2rem; display: flex; flex-direction: column; justify-content: center; height: 100%; }
      .greeting-subtitle { color: #f59e0b; font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;}
      .hero-banner h2 { margin: 0 0 8px 0; font-size: 1.8rem; font-weight: 800; }
      .full-date-subtext { font-size: 0.95rem; color: var(--text-muted); font-weight: 500; margin-top: 4px; }
      
      .vacancy-quick-banner { background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); border: 1px solid #6366f1; border-radius: 16px; padding: 1.2rem 1.8rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;}
      .vacancy-quick-banner:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25); }
      
      .quick-actions-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; }
      .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
      .qa-btn { background: var(--bg-dark); border: 1px solid var(--card-border); padding: 1rem; border-radius: 12px; display: flex; align-items: center; gap: 12px; color: var(--text-main); font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
      .qa-btn:hover { border-color: var(--accent-cyan); transform: translateY(-2px); }
      .qa-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
      
      .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
      .stat-card-new { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.2rem 1.5rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s;}
      .stat-card-new:hover { transform: translateY(-2px); }
      .stat-icon-wrapper { width: 55px; height: 55px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0; }
      .stat-num { font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 2px; line-height: 1.1; }
      .stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

      /* --- EVENTS --- */
      .upcoming-wrapper { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.5rem; }
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
      
      /* --- SIDE DRAWER --- */
      .drawer-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: flex-end; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
      .drawer-overlay.open { opacity: 1; pointer-events: auto; }
      .drawer-card { width: 100%; max-width: 320px; height: 100%; background: var(--card-bg); color: var(--text-main); display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow:-10px 0 30px rgba(0,0,0,0.3); }
      .drawer-overlay.open .drawer-card { transform: translateX(0); }
      .drawer-header { background: #3b82f6; color: #ffffff; padding: 2rem 1.5rem 1.5rem 1.5rem; position: relative; }
      .drawer-close-btn { position: absolute; top: 1rem; right: 1rem; width: 28px; height: 28px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; }
      .drawer-profile-row { display: flex; align-items: center; gap: 1rem; }
      .drawer-avatar { width: 60px; height: 60px; border-radius: 50%; background: #ffffff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; overflow: hidden; border: 2px solid rgba(255,255,255,0.3); }
      .drawer-menu { flex: 1; padding: 1rem 0; overflow-y: auto; }
      .drawer-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--card-border); color: var(--text-main); font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
      .drawer-item:hover { background: var(--hover-bg); color: var(--accent-cyan); }
      .drawer-item i { width: 22px; text-align: center; color: var(--text-muted); font-size: 1.1rem; }
      .drawer-footer { padding: 1.5rem; border-top: 1px solid var(--card-border); text-align: center; }
      .btn-logout-drawer { width: 100%; padding: 0.8rem; background: #3b82f6; color: #ffffff; border: none; border-radius: 30px; font-size: 0.95rem; font-weight: 700; cursor: pointer; margin-bottom: 1rem; transition: background 0.2s; }
      .btn-logout-drawer:hover { background: #2563eb; }

      /* --- TALENTINO --- */
      .talentino-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
      .talentino-stat-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 1.5rem; }
      .t-stat-num { font-size: 2.2rem; font-weight: 800; color: var(--text-main); line-height: 1; margin-bottom: 10px; }
      .progress-bar { height: 8px; background: rgba(148, 163, 184, 0.15); border-radius: 10px; overflow: hidden; }
      .progress-fill { height: 100%; border-radius: 10px; transition: width 0.4s ease; background-color: #10b981;}
      .star-rating { display: flex; gap: 10px; font-size: 1.8rem; cursor: pointer; margin-top: 4px; align-items: center; padding: 10px 0; }
      .star-rating .star { color: var(--input-border); transition: transform 0.2s; }
      .star-rating .star:hover { transform: scale(1.5); }
      .star-rating .star.selected { color: #f59e0b; }

      /* --- PROFILE & SETTINGS --- */
      .profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; align-items: start; }
      .profile-left-col { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 2rem 1.5rem; text-align: center; }
      .profile-large-avatar { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 1rem auto; overflow: hidden; border: 3px solid var(--input-border); background: var(--bg-dark); display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 800; color: var(--text-muted); cursor: pointer; position: relative;}
      .profile-large-avatar img { width: 100%; height: 100%; object-fit: cover; }
      .info-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.8rem; position: relative; margin-bottom: 1.5rem;}
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
      .doc-box { display: flex; align-items: center; justify-content: space-between; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 12px; padding: 1rem 1.5rem; transition: border-color 0.2s; margin-bottom: 10px;}
      .settings-container { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; align-items: start; }
      .settings-tab { display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; color: var(--text-muted); font-weight: 600; font-size: 0.95rem; border-radius: 10px; cursor: pointer; }
      .settings-tab.active { background: rgba(56, 189, 248, 0.1); color: var(--accent-cyan); }

      /* --- VACANCIES --- */
      .vacancies-hero { text-align: center; padding: 3rem 1.5rem 2.5rem 1.5rem; background: radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%); border-bottom: 1px solid var(--card-border); position: relative; }
      .location-table-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; overflow-x: auto; }
      .vac-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; min-width: 700px; }
      .vac-table th { background: var(--table-header); color: var(--text-muted); text-align: left; padding: 12px 16px; font-size: 0.78rem; text-transform: uppercase; }
      .vac-table td { padding: 14px 16px; border-bottom: 1px solid var(--card-border); color: var(--text-main); }
      .vac-table tr { border-bottom: 1px solid var(--card-border); transition: background 0.3s; }
      .vac-table tr:hover td { background: var(--hover-bg); }
      
      .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
      .status-applied { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #0284c7; }

      .animate-fade-in { animation: fadeInUp 0.4s ease forwards; }
      
      .notif-dropdown { position: absolute; top: 50px; right: 0; width: 320px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 1000; overflow: hidden; transform-origin: top right; animation: fadeInUp 0.2s ease; }
      .notif-item { padding: 12px 16px; border-bottom: 1px solid var(--card-border); cursor: pointer; transition: background 0.2s; display: flex; flex-direction: column; gap: 4px; }
      .notif-item:hover { background: var(--hover-bg); }
      .notif-item:last-child { border-bottom: none; }

      .resume-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
      .resume-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 1.2rem; cursor: pointer; transition: transform 0.2s, border-color 0.2s; }
      .resume-card:hover { transform: translateY(-2px); border-color: var(--accent-cyan); }
      .resume-icon-box { width: 60px; height: 60px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0; }

      @media (max-width: 900px) {
        .profile-grid, .settings-container { grid-template-columns: 1fr; }
        .dash-top-row, .dash-bottom-row, .stats-row { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .grid-2col, .grid-3col, .info-grid { grid-template-columns: 1fr; }
        .primary-layout-row { grid-template-columns: 1fr; gap: 1rem; }
        .vacancy-quick-banner { flex-direction: column; gap: 15px; text-align: center; }
        .top-header { padding: 0 1rem; }
        .dashboard-content { padding: 1rem; }
        .resume-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tncAccepted, setTncAccepted] = useState(false);
  const [status, setStatus] = useState(null);
  const [showTncModal, setShowTncModal] = useState(false);
  const [tncScrolled, setTncScrolled] = useState(false);

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
      const response = await axios.post('API_BASE_URL + '/api/auth/login', { email, password });
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
              <span className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                <i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'}`}></i>
              </span>
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
              <i className="ph ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }} onClick={() => setShowTncModal(false)}></i>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1.5rem' }}>Below mentioned are the Rules to be followed by students for getting Placement Support from IPCS. Please scroll to the bottom to accept.</p>
            <div className="tnc-content-box" onScroll={handleTncScroll}>
              <h4>ELIGIBILITY CRITERIA FOR ATTENDING THE INTERVIEWS</h4>
              <ul>
                <li>Students who have completed at least 90% of the course.</li>
                <li>Students who have paid the full fees.</li>
                <li>Students who have passion for working & take their career seriously.</li>
                <li>Candidates should be ready for any location (exemption only for female students).</li>
              </ul>
              <h4>DOS & DON’TS FOR THE CANDIDATES</h4>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>During Job applications & Interview:</strong>
              <ul>
                <li>Check all criteria mentioned in the employment news, if everything suits to you then only APPLY to the mentioned company.</li>
                <li>Students should attend the interview on the date and time as allotted by the recruiter.</li>
                <li>It is mandatory for Students to update the placement coordinator of their attendance in the interviews.</li>
                <li>Students attending the interview and not getting selected is not a problem. Losing in an interview is not a criteria for further interviews.</li>
                <li>Students who are not attending the 3 interviews even after their acceptance to attend the interviews will be barred to attend any further interviews.</li>
              </ul>
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

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null);
  
  const [showTncModal, setShowTncModal] = useState(false);
  const [tncScrolled, setTncScrolled] = useState(false);
  const [tncAccepted, setTncAccepted] = useState(false);

  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [finalPhotoBase64, setFinalPhotoBase64] = useState('');

  const [qualSelect, setQualSelect] = useState('');
  const [streamSelect, setStreamSelect] = useState('');
  const [qualOther, setQualOther] = useState('');
  const [streamOther, setStreamOther] = useState('');

  const [formData, setFormData] = useState({
    rollNo: '', name: '', phone: '', email: '', age: '', gender: '', branch: '', 
    course: '', joiningDate: '', fresherStatus: '', homeTown: '',
    linkedin: '', instagram: '', placementReq: '', parentName: '', parentContact: '', 
    friend1Name: '', friend1Phone: '', friend2Name: '', friend2Phone: '', password: '', confirmPassword: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setImageSrc(reader.result); setShowCropModal(true); });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => { setCroppedAreaPixels(croppedAreaPixels); }, []);

  const generateCroppedImage = () => {
    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      canvas.width = 250; canvas.height = 250;
      const ctx = canvas.getContext('2d');
      ctx.drawImage( image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, 250, 250 );
      setFinalPhotoBase64(canvas.toDataURL('image/jpeg'));
      setShowCropModal(false);
    };
  };

  const handleTncScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 25;
    if (bottom) setTncScrolled(true);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setStatus({ type: 'error', message: 'Passwords do not match!' }); return; }
    if (!tncAccepted) { setStatus({ type: 'error', message: 'You must accept the Terms & Conditions.' }); return; }

    setStatus({ type: 'info', message: 'Uploading photo & registering account...' });
    const finalQual = qualSelect === 'Other' ? qualOther : qualSelect;
    const finalStream = streamSelect === 'Other' ? streamOther : streamSelect;

    const payload = { ...formData, photoBase64: finalPhotoBase64, qualification: finalQual, stream: finalStream };

    try {
      const response = await axios.post('API_BASE_URL + '/api/auth/register', payload);
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Account created! Redirecting to login...' });
        setTimeout(() => navigate('/'), 2500); 
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Server Error.' });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="profile-reg-card">
        <div className="reg-header">
          <div><h2 style={{ margin: '0 0 4px 0' }}>Create Student Profile</h2><p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Register records, course details, and placement preferences</p></div>
          <div className="brand-logo-container" style={{ marginBottom: 0 }}>
            <img src="https://lh3.googleusercontent.com/d/1y36ddjxHfSsu4cINBvUbeTe0OyobG2TP" alt="IPCS Global Logo" style={{ height: '38px' }} />
          </div>
        </div>

        <form onSubmit={handleSignup}>
          <div className="section-title" style={{ color: '#38bdf8' }}><i className="ph ph-user" style={{ fontSize: '1.2rem' }}></i> PRIMARY DETAILS</div>
          <div className="primary-layout-row">
            <div className="avatar-upload-box" onClick={() => document.getElementById('photoUpload').click()}>
              <input type="file" id="photoUpload" accept="image/*" className="hidden" onChange={onFileChange} />
              <div className="avatar-preview-circle">{finalPhotoBase64 ? <img src={finalPhotoBase64} alt="Profile" /> : (formData.name ? formData.name.charAt(0).toUpperCase() : 'U')}</div>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>Tap to Upload</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2col">
                <div className="form-group" style={{ marginBottom: 0 }}><label>IPCS Roll Number *</label><input type="text" name="rollNo" placeholder="IPCS XXXXXX" onChange={handleChange} required /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label>Full Name *</label><input type="text" name="name" placeholder="e.g. Vishnu Kumar" onChange={handleChange} required /></div>
              </div>
              <div className="grid-2col">
                <div className="form-group" style={{ marginBottom: 0 }}><label>Phone Number *</label><input type="tel" name="phone" placeholder="+91 9876543210" onChange={handleChange} required /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label>Email ID *</label><input type="email" name="email" placeholder="student@ipcsglobal.com" onChange={handleChange} required /></div>
              </div>
            </div>
          </div>

          <div className="grid-3col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Age</label><input type="number" name="age" placeholder="e.g. 22" onChange={handleChange} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Gender</label>
              <select name="gender" onChange={handleChange} defaultValue="">
                <option value="" disabled>Select</option><option value="Male">Male</option><option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Branch Campus *</label>
              <select name="branch" onChange={handleChange} defaultValue="" required>
                <option value="" disabled>Select Branch</option>
                <option value="Bangalore">Bangalore</option><option value="Kochi">Kochi</option><option value="Trivandrum">Trivandrum</option>
              </select>
            </div>
          </div>

          <div className="grid-2col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Parent/Guardian Name</label><input type="text" name="parentName" placeholder="Full Name" onChange={handleChange} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Parent Contact No.</label><input type="tel" name="parentContact" placeholder="+91 XXXXXXXXXX" onChange={handleChange} /></div>
          </div>

          <div className="section-title" style={{ color: '#4ade80', marginTop: '2rem' }}><i className="ph ph-graduation-cap" style={{ fontSize: '1.2rem' }}></i> ACADEMIC & COURSE DETAILS</div>
          <div className="grid-3col">
            <div className="form-group" style={{ marginBottom: 0 }}><label>Course Category *</label>
              <select name="course" onChange={handleChange} defaultValue="" required>
                <option value="" disabled>Select Course Category</option><option value="Industrial Automation">Industrial Automation</option><option value="Python Full Stack">Python Full Stack</option><option value="MERN Stack">MERN Stack</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Joining Date *</label><input type="date" name="joiningDate" onChange={handleChange} required /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Qualification *</label>
              <select onChange={(e) => setQualSelect(e.target.value)} defaultValue="" required>
                <option value="" disabled>Select Qualification</option><option value="SSLC">SSLC</option><option value="Diploma">Diploma</option><option value="B.Tech">B.Tech</option><option value="Other">Other</option>
              </select>
              {qualSelect === 'Other' && <input type="text" placeholder="Please specify qualification" style={{ marginTop: '8px' }} onChange={(e) => setQualOther(e.target.value)} required />}
            </div>
          </div>

          <div className="grid-3col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Stream / Branch *</label>
              <select onChange={(e) => setStreamSelect(e.target.value)} defaultValue="" required>
                <option value="" disabled>Select Stream</option><option value="IT">IT</option><option value="EEE">EEE</option><option value="Other">Other</option>
              </select>
              {streamSelect === 'Other' && <input type="text" placeholder="Please specify stream" style={{ marginTop: '8px' }} onChange={(e) => setStreamOther(e.target.value)} required />}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Experience Status *</label>
              <select name="fresherStatus" onChange={handleChange} defaultValue="" required>
                <option value="" disabled>Select Status</option><option value="Fresher">Fresher</option><option value="Experienced">Experienced</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Home Town *</label><input type="text" name="homeTown" placeholder="e.g. Kozhikode" onChange={handleChange} required /></div>
          </div>

          <div className="grid-2col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>LinkedIn Link</label><input type="text" name="linkedin" placeholder="www.linkedin.com/in/..." onChange={handleChange} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Instagram Handle</label><input type="text" name="instagram" placeholder="@username" onChange={handleChange} /></div>
          </div>
          <div className="form-group" style={{ marginTop: '1.1rem' }}><label>Placement Requirements</label><textarea name="placementReq" rows="2" placeholder="Preferred location, salary expectation..." onChange={handleChange}></textarea></div>

          <div className="section-title" style={{ color: '#c084fc', marginTop: '2rem' }}><i className="ph ph-users" style={{ fontSize: '1.2rem' }}></i> REFERRALS & SECURITY CREDENTIALS</div>
          <div className="grid-2col">
            <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--input-border)' }}>
              <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>FRIEND 1 REFERRAL *</span>
              <input type="text" name="friend1Name" placeholder="Full Name" style={{ marginBottom: '0.6rem' }} onChange={handleChange} required />
              <input type="tel" name="friend1Phone" placeholder="10-digit Contact Number" onChange={handleChange} required />
            </div>
            <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--input-border)' }}>
              <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>FRIEND 2 REFERRAL *</span>
              <input type="text" name="friend2Name" placeholder="Full Name" style={{ marginBottom: '0.6rem' }} onChange={handleChange} required />
              <input type="tel" name="friend2Phone" placeholder="10-digit Contact Number" onChange={handleChange} required />
            </div>
          </div>

          <div className="grid-2col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Password *</label>
              <div className="pwd-wrapper">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Create account password" onChange={handleChange} required />
                <span className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}><i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'}`}></i></span>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Confirm Password *</label>
              <div className="pwd-wrapper"><input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter password" onChange={handleChange} required /></div>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <input type="checkbox" style={{ width: 'auto', cursor: tncAccepted ? 'pointer' : 'not-allowed' }} checked={tncAccepted} disabled={!tncAccepted} onChange={(e) => setTncAccepted(e.target.checked)} />
            <label style={{ margin: 0, fontSize: '0.82rem', textTransform: 'none' }}>
              I have read and accepted the <span className="tnc-link" onClick={() => setShowTncModal(true)}>Terms & Conditions</span>
            </label>
          </div>

          {status && <div className={`alert alert-${status.type}`}>{status.message}</div>}

          <div className="form-footer-bar">
            <button type="button" className="btn-cancel" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn-action" style={{ padding: '0.8rem 2rem', background: '#2563eb' }}>Create Account &rarr;</button>
          </div>
        </form>
      </div>

      {/* CROP MODAL */}
      {showCropModal && (
        <div className="report-modal-overlay">
          <div className="report-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header-border">
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Adjust Profile Photo</h3>
              <i className="ph ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowCropModal(false)}></i>
            </div>
            <div style={{ position: 'relative', width: '100%', height: '250px', background: '#333', borderRadius: '12px', overflow: 'hidden' }}>
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(e.target.value)} style={{ margin: '20px 0', width: '100%' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-action" style={{ flex: 1, background: '#22c55e' }} onClick={generateCroppedImage}>Confirm Photo</button>
            </div>
          </div>
        </div>
      )}

      {/* TNC MODAL */}
      {showTncModal && (
        <div className="report-modal-overlay">
          <div className="report-card" style={{ maxWidth: '650px' }}>
            <div className="modal-header-border">
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>IPCS Placement Rule Set</h3>
              <i className="ph ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowTncModal(false)}></i>
            </div>
            <div className="tnc-content-box" onScroll={handleTncScroll}>
              <h4>ELIGIBILITY CRITERIA FOR ATTENDING THE INTERVIEWS</h4>
              <ul>
                <li>Students who have completed at least 90% of the course.</li>
                <li>Students who have paid the full fees.</li>
              </ul>
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

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [data, setData] = useState({ stats: {}, events: [], appliedJobs: [], vacancies: [], attendanceHistory: [], tpoInfo: {} });
  const [theme, setTheme] = useState('dark');
  
  // View State 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tpoModal, setTpoModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  // Talentino States (FIXED - re-added from new code)
  const [gpsCoords, setGpsCoords] = useState(null);
  const [locStatus, setLocStatus] = useState("Capture my location");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [attStatus, setAttStatus] = useState(null);

  // Vacancy & Applying States (FIXED - using updated boolean checkboxes & celebration animation)
  const [jobModal, setJobModal] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [q1, setQ1] = useState(false); 
  const [q2, setQ2] = useState(false); 
  const [showConfetti, setShowConfetti] = useState(false);

  // Profile Edit / Document / Security States
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [epData, setEpData] = useState({});
  const [epStatus, setEpStatus] = useState(null);
  const [docStatus, setDocStatus] = useState({ type: '', msg: '' });
  const [settingsTab, setSettingsTab] = useState('security');
  const [pwdData, setPwdData] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdStatus, setPwdStatus] = useState(null);
  const [issueText, setIssueText] = useState('');
  const [issueStatus, setIssueStatus] = useState(null);

  // Auto-Fix Google Drive Image URLs
  const getDriveImageUrl = (url) => {
    if (!url || url === "N/A") return null;
    const match = url.match(/(?:id=|\/d\/)([\w-]+)/);
    return match ? `https://lh3.googleusercontent.com/d/${match[1]}` : url;
  };

  const fetchDashboard = useCallback(async (storedUser) => {
    try {
      const res = await axios.post('API_BASE_URL + '/api/dashboard/data', { 
        email: storedUser.email, branch: storedUser.branch, course: storedUser.course 
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
    if (!storedUser.email) { navigate('/'); return; }
    setUser(storedUser);
    fetchDashboard(storedUser);

    // REAL-TIME SILENT SYNC (Refreshes data automatically every 15 seconds)
    const interval = setInterval(() => {
      fetchDashboard(storedUser);
    }, 15000);
    return () => clearInterval(interval);
  }, [navigate, fetchDashboard]);

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
      if (job.status !== 'Applied') notifs.push({ title: `Status Update: ${job.company}`, desc: `Your application status changed to ${job.status}.`, tab: 'status' });
    });
    (data.events || []).forEach(ev => {
      notifs.push({ title: `New Event: ${ev.title}`, desc: `Scheduled for ${ev.date}.`, tab: 'dashboard' });
    });
    return notifs;
  };
  const notifications = getNotifications();

  // Profile Edit Functions
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
        const res = await axios.post('API_BASE_URL + '/api/dashboard/profile/update', { email: user.email, ...epData });
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
    
    setDocStatus({ type: 'info', msg: `Uploading ${docType} to Drive...` });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        try {
            const res = await axios.post('API_BASE_URL + '/api/dashboard/profile/document', {
                email: user.email, rollNo: user.rollNo, base64: reader.result, docType
            });
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
        const res = await axios.post('API_BASE_URL + '/api/dashboard/profile/password', {
            email: user.email, currentPassword: pwdData.current, newPassword: pwdData.newPwd
        });
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
        const res = await axios.post('API_BASE_URL + '/api/dashboard/support/issue', {
            email: user.email, name: user.name, branch: user.branch, course: user.course, issueDetails: issueText
        });
        if(res.data.success) {
            setIssueStatus({ type: 'success', message: 'Report submitted successfully. The Placement Cell has been notified.' });
            setTimeout(() => { setHelpModal(false); setIssueText(''); setIssueStatus(null); }, 2500);
        }
    } catch(err) { setIssueStatus({ type: 'error', message: 'Submission failed' }); }
  };

  // TALENTINO LOGIC
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
    setAttStatus({ type: 'info', message: 'Verifying location and submitting...' });
    try {
      const res = await axios.post('API_BASE_URL + '/api/dashboard/attendance', {
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

  // VACANCY LOGIC
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
      const res = await axios.post('API_BASE_URL + '/api/dashboard/apply', {
         email: user.email, jobId: jobModal.newsletterId, companyName: jobModal.company, name: user.name, 
         phone: user.phone, rollNo: user.rollNo, course: user.course, branch: user.branch,
         qualification: user.qualification, resume: user.resume
      });
      if(res.data.success) {
        setShowConfetti(true); // Trigger Celebration Animation
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

  return (
    <div className="app-layout">
      <div className="top-header">
        <div className="header-left">
          {activeTab !== 'dashboard' ? (
            <button type="button" onClick={() => setActiveTab('dashboard')} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ph ph-arrow-left"></i> Dashboard
            </button>
          ) : (
            <img src="https://lh3.googleusercontent.com/d/1y36ddjxHfSsu4cINBvUbeTe0OyobG2TP" alt="IPCS Global" className="header-logo-img" />
          )}
          <span style={{ marginLeft: '10px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{getBreadcrumb()}</span>
        </div>
        <div className="header-right">
          <div style={{ position: 'relative' }}>
            <button className="header-icon-btn" onClick={() => setShowNotif(!showNotif)}>
               <i className="ph ph-bell"></i>
               {notifications.length > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', width: '10px', height: '10px', borderRadius: '50%' }}></span>}
            </button>
            {showNotif && (
              <div className="notif-dropdown">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)', fontWeight: 800, background: 'var(--bg-dark)' }}>Notifications</div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                   {notifications.length === 0 ? <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No new notifications</div> : 
                     notifications.map((n, i) => (
                       <div key={i} className="notif-item" onClick={() => { setActiveTab(n.tab); setShowNotif(false); }}>
                         <strong style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{n.title}</strong>
                         <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.desc}</span>
                       </div>
                     ))
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
                  <div className="greeting-subtitle">Good Day ☀️</div>
                  <h2>Welcome back, <span style={{ color: 'var(--accent-cyan)' }}>{user.name}</span>!</h2>
                  <div className="full-date-subtext">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>

                <div className="quick-actions-card">
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Quick Actions</h3>
                  <div className="quick-actions-grid">
                    <div className="qa-btn" onClick={() => setActiveTab('talentino')}><div className="qa-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><i className="ph-fill ph-user-check"></i></div><div>Talentino</div></div>
                    <div className="qa-btn" onClick={() => setTpoModal(true)}><div className="qa-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><i className="ph-fill ph-address-book"></i></div><div>Contact TPO</div></div>
                    <div className="qa-btn" onClick={() => setHelpModal(true)}><div className="qa-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><i className="ph-fill ph-headset"></i></div><div>Request Help</div></div>
                    <div className="qa-btn" onClick={() => setActiveTab('profile')}><div className="qa-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}><i className="ph-fill ph-user"></i></div><div>Profile</div></div>
                  </div>
                </div>
              </div>
              
              <div className="vacancy-quick-banner" onClick={() => setActiveTab('vacancies')}>
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
                <div className="stat-card-new" onClick={() => setActiveTab('status')} style={{cursor:'pointer'}}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}><i className="ph-fill ph-briefcase"></i></div>
                  <div><div className="stat-num">{data.stats?.applied || 0}</div><div className="stat-label">Jobs Applied</div></div>
                </div>
                <div className="stat-card-new" onClick={() => setActiveTab('status')} style={{cursor:'pointer'}}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><i className="ph-fill ph-calendar-check"></i></div>
                  <div><div className="stat-num">{data.stats?.interviews || 0}</div><div className="stat-label">Interviews Scheduled</div></div>
                </div>
                <div className="stat-card-new" onClick={() => setActiveTab('status')} style={{cursor:'pointer'}}>
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
                  
                  {(data.events || []).length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming events.</div>
                  ) : (
                    (data.events || []).map((ev, index) => {
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
                            <div className="ev-badge badge-general" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid #7e22ce' }}>{ev.type}</div>
                          </div>
                       )
                    })
                  )}
                </div>
              </div>
            </>
          )}

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
                  <h2 style={{ margin: '10px 0 5px 0', fontSize: '1.4rem' }}>{user.name}</h2>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>{user.course}</div>
                  <div style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #22c55e' }}>{user.studyStatus || 'Active'}</div>
                  
                  <div style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '1.2rem', marginTop: '1.5rem', textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Contact Info</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '0.88rem' }}><i className="ph ph-envelope" style={{ color: 'var(--text-muted)' }}></i> <div style={{ wordBreak: 'break-all' }}>{user.email}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '0.88rem' }}><i className="ph ph-phone" style={{ color: 'var(--text-muted)' }}></i> <div>{user.phone}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '0.88rem' }}><i className="ph ph-map-pin" style={{ color: 'var(--text-muted)' }}></i> <div>{user.homeTown || 'N/A'}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}><i className="ph ph-buildings" style={{ color: 'var(--text-muted)' }}></i> <div>{user.branch}</div></div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="info-card">
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem' }}>Personal Information</div>
                    <div className="info-grid">
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</div><div style={{ fontWeight: 600 }}>{user.name}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Roll Number</div><div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{user.rollNo}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parent / Guardian</div><div style={{ fontWeight: 600 }}>{user.parentName || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parent Contact</div><div style={{ fontWeight: 600 }}>{user.parentContact || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age</div><div style={{ fontWeight: 600 }}>{user.age || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gender</div><div style={{ fontWeight: 600 }}>{user.gender || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LinkedIn Profile</div><div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{user.linkedin && user.linkedin !== 'N/A' ? <a href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noreferrer" style={{color: 'var(--accent-blue)'}}>View Profile</a> : 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instagram ID</div><div style={{ fontWeight: 600 }}>{user.instagram || 'N/A'}</div></div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem' }}>Academic & Course Information</div>
                    <div className="info-grid">
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Course Category</div><div style={{ fontWeight: 600 }}>{user.course || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joining Date</div><div style={{ fontWeight: 600 }}>{user.joiningDate || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div><div style={{ color: '#f59e0b', fontWeight: 600 }}>{user.studyStatus || 'Currently Studying'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed Date</div><div style={{ fontWeight: 600 }}>{user.completedDate || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qualification</div><div style={{ fontWeight: 600 }}>{user.qualification || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stream</div><div style={{ fontWeight: 600 }}>{user.stream || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fresher/Experienced</div><div style={{ fontWeight: 600 }}>{user.fresherStatus || 'N/A'}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Specific Placement Req</div><div style={{ fontWeight: 600 }}>{user.placementReq || 'None'}</div></div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem' }}>Documents</div>
                    
                    <div className="doc-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <i className="ph-fill ph-file-pdf" style={{ fontSize: '1.8rem', color: '#ef4444' }}></i>
                        <div>
                          <div style={{ fontWeight: 700 }}>Resume.pdf</div>
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
                          <div style={{ fontWeight: 700 }}>Course Certificate.pdf</div>
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

          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '2rem' }}>Settings</h2>
              <div className="settings-container">
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1rem' }}>
                    <div className={`settings-tab ${settingsTab === 'security' ? 'active' : ''}`} onClick={() => setSettingsTab('security')}><i className="ph ph-lock-key"></i> Security</div>
                    <div className={`settings-tab ${settingsTab === 'appearance' ? 'active' : ''}`} onClick={() => setSettingsTab('appearance')}><i className="ph ph-palette"></i> Appearance</div>
                 </div>
                 <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '2rem', minHeight: '400px' }}>
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
                 <div className="resume-card" onClick={() => window.open('https://drive.google.com/file/d/10lFApxJGwGwRmVFpEtfQxc1RR-lraOq7/view?usp=sharing', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}><i className="ph-fill ph-book-open"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Talentino HandBook</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The official IPCS placement guide</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://www.canva.com/s/templates?query=professional+resume', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8' }}><i className="ph-fill ph-palette"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Canva Templates</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Design highly visual & modern resumes</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://youtu.be/ZMByWenSRdI', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><i className="ph-fill ph-youtube-logo"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Resume Writing Part 1</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Essential basics for beginners</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://youtu.be/gDN7cJ3Rt8Q', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}><i className="ph-fill ph-youtube-logo"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Interview Prep Guide</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>How to confidently answer questions</span></div>
                 </div>
                 <div className="resume-card" onClick={() => window.open('https://resume.io', '_blank')}>
                    <div className="resume-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}><i className="ph-fill ph-file-text"></i></div>
                    <div><h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem' }}>Resume.io</h3><span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Professional builder with ATS templates</span></div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'talentino' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: 800 }}>Talentino Attendance</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Mark your attendance and track your session participation</p>
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sessions in your branch</div>
                </div>
                <div className="talentino-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}><i className="ph ph-clock" style={{ color: '#f59e0b' }}></i> On Leave</div>
                  <div className="t-stat-num">{data.stats?.onLeave || 0}</div>
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
                      <i className="ph ph-calendar-check" style={{ color: data.isScheduledToday ? '#3b82f6' : '#ef4444', fontSize: '1.2rem' }}></i>
                      {data.isScheduledToday ? <span>Session active today <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(09:00:00 - 17:00:00)</span></span> : <span style={{ color: '#ef4444' }}>No Session scheduled for today</span>}
                    </div>
                    
                    <div className="form-group" style={{ opacity: data.isScheduledToday ? 1 : 0.5, pointerEvents: data.isScheduledToday ? 'auto' : 'none' }}>
                      <label>Location Verification</label>
                      <div onClick={captureGPS} style={{ background: gpsCoords ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-dark)', color: gpsCoords ? '#10b981' : 'var(--text-main)', border: `1px solid ${gpsCoords ? '#10b981' : 'var(--card-border)'}`, padding: '1rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
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
                   <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>No attendance records yet.</div>
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

          {activeTab === 'vacancies' && (
            <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
              <div className="vacancies-hero" style={{ background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', borderRadius: '16px', padding: '3rem 1.5rem 2.5rem 1.5rem', marginBottom: '2rem', textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '2px', color: '#ffffff', margin: '0 0 8px 0', textTransform: 'uppercase' }}>JOB VACANCIES</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Job ID Not Valid After Expiry Date</p>
              </div>
              
              {(!user.vacancyOpen || user.vacancyOpen.toString().trim().toLowerCase() !== 'yes') ? (
                 <div className="alert alert-error" style={{ margin: '2rem auto', maxWidth: '600px', padding: '2rem' }}>
                     <i className="ph-fill ph-lock-key" style={{ marginRight: '8px', fontSize: '2rem', display: 'block', marginBottom: '10px' }}></i> 
                     Your access to view Job Vacancies is currently restricted. Please contact your Placement Officer.
                 </div>
              ) : (data.vacancies || []).length === 0 ? (
                 <div className="alert alert-info" style={{ margin: '2rem auto', maxWidth: '600px' }}><i className="ph-fill ph-spinner ph-spin"></i> Fetching live job vacancies...</div>
              ) : (
                 Object.entries(
                   [...(data.vacancies || [])].sort((a, b) => (isPastDate(a.lastDate) ? 1 : 0) - (isPastDate(b.lastDate) ? 1 : 0))
                   .reduce((acc, vac) => {
                     const loc = (vac.state || 'OTHER STATES').toUpperCase().trim();
                     if(!acc[loc]) acc[loc] = [];
                     acc[loc].push(vac);
                     return acc;
                 }, {})).map(([locationName, vacs], index) => (
                     <div key={index} className="location-table-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
                         <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.2rem' }}>{locationName}</h2>
                         <table className="vac-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
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

          {activeTab === 'status' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: 800 }}>Application Status</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Track the current status of all your applied job openings</p>
              </div>
              <div className="location-table-card">
                <table className="vac-table">
                  <thead><tr><th>Job ID</th><th>Company</th><th>Applied Date & Time</th><th>Current Status</th></tr></thead>
                  <tbody>
                    {(data.appliedJobs || []).length === 0 ? <tr><td colSpan="4" style={{textAlign:'center'}}>No applications yet.</td></tr> : 
                      (data.appliedJobs || []).map((job, idx) => (
                        <tr key={idx}>
                          <td style={{color:'var(--accent-purple)', fontWeight:700}}>{job.jobId}</td>
                          <td style={{fontWeight:600}}>{job.company}</td>
                          <td style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>{job.date}</td>
                          <td><span className="status-badge status-applied">{job.status}</span></td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={(e) => { if(e.target.className.includes('drawer-overlay')) setDrawerOpen(false); }}>
        <div className="drawer-card" style={{ position: 'absolute', right: 0 }}>
          <div className="drawer-header">
            <div className="drawer-close-btn" onClick={() => setDrawerOpen(false)}><i className="ph ph-x"></i></div>
            <div className="drawer-profile-row">
              <div className="drawer-avatar">
                 {user?.photo && user.photo.includes('http') ? <img src={user.photo} alt="Profile" /> : user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style={{ display:'block', fontSize:'1.1rem', fontWeight:700 }}>{user?.name}</strong>
                <span style={{ fontSize:'0.8rem', opacity:0.9 }}>{user?.rollNo}</span>
              </div>
            </div>
          </div>
          <div className="drawer-menu">
            <div className="drawer-item" onClick={() => { setActiveTab('dashboard'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-house"></i> Dashboard</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setActiveTab('talentino'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-user-check"></i> Talentino</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setActiveTab('profile'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-user"></i> Profile</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setActiveTab('status'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-list-checks"></i> Application Status</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setActiveTab('vacancies'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-briefcase"></i> Current Job Vacancies</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setActiveTab('guide'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-book-open"></i> Guide</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setTpoModal(true); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-address-book"></i> Contact TPO</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setHelpModal(true); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-info"></i> Request Help</div><span>&rsaquo;</span></div>
            <div className="drawer-item" onClick={() => { setActiveTab('settings'); setDrawerOpen(false); }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="ph ph-gear"></i> Settings</div><span>&rsaquo;</span></div>
          </div>
          <div className="drawer-footer">
            <button className="btn-logout-drawer" onClick={handleLogout}>Log Out</button>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Copyright &copy; 2026 Talentino IPCS Global</div>
          </div>
        </div>
      </div>
      
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

      {/* JOB DETAIL MODAL (Updated) */}
      {jobModal && (
        <div className="report-modal-overlay">
          <div className="report-card" style={{ maxWidth: '600px', width: '90%', padding: '0', overflow: 'hidden', position: 'relative' }}>
            
            {/* CELEBRATION OVERLAY */}
            {showConfetti && (
              <div className="celebration-overlay">
                <div className="celebration-content">
                  <span className="party-emoji">🎉</span>
                  <h2 style={{ color: 'white', marginBottom: '10px' }}>Application Successful!</h2>
                  <p style={{ color: '#a5b4fc', margin: 0 }}>You can track this in Application Status.</p>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--card-border)', background: 'var(--bg-dark)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>
                  {jobModal.position} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({jobModal.newsletterId})</span>
                </h3>
                <i className="ph ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.4rem' }} onClick={() => { setJobModal(null); setShowConsent(false); setQ1(false); setQ2(false); setShowConfetti(false); }}></i>
              </div>
              <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.15rem' }}>{jobModal.company}</strong>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '2rem', maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* Job Specs Grid */}
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

              {/* THE APPLY SECTION */}
              {showConsent ? (
                <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  
                  {/* If Resume is Missing */}
                  {actionStatus && actionStatus.type === 'error' && actionStatus.message.includes('Resume') ? (
                    <div className="alert alert-error" style={{ margin: 0, padding: '1.5rem', textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {actionStatus.message}
                    </div>
                  ) : (
                    /* Checkbox Consent Form */
                    <>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                        <input type="checkbox" checked={q1} onChange={e => setQ1(e.target.checked)} style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }} />
                        <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                          1. As I am applying for this job, I agree that I will attend the interview whenever the company calls me without fail.
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                        <input type="checkbox" checked={q2} onChange={e => setQ2(e.target.checked)} style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }} />
                        <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
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
          <div className="report-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header-border">
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Contact Placement Officer</h3>
              <i className="ph ph-x" style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }} onClick={() => setTpoModal(false)}></i>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--hover-bg)', margin: '0 auto 10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-cyan)', overflow: 'hidden' }}>
                {data.tpoInfo?.photo && data.tpoInfo.photo !== "N/A" ? <img src={getDriveImageUrl(data.tpoInfo.photo)} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="TPO" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} /> : null}
                <i className="ph ph-user-tie" style={{ fontSize: '2.5rem', color: 'var(--accent-cyan)', display: (!data.tpoInfo?.photo || data.tpoInfo.photo === "N/A") ? 'block' : 'none' }}></i>
              </div>
              <h2 style={{ margin: '0 0 5px 0' }}>{data.tpoInfo?.name || "Placement Officer"}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sitting Branch: <strong style={{ color: 'var(--text-main)' }}>{data.tpoInfo?.sittingBranch || "N/A"}</strong></div>
            </div>
            <div style={{ background: 'var(--input-bg)', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '0.9rem' }}>
              <div style={{ marginBottom: '10px' }}><strong>Email:</strong> <span style={{ color: 'var(--accent-cyan)' }}>{data.tpoInfo?.email || "placement@ipcsglobal.com"}</span></div>
              <div style={{ marginBottom: '10px' }}><strong>Phone:</strong> <span>{data.tpoInfo?.phone || "N/A"}</span></div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--card-border)' }}><strong>Assigned Regions:</strong> <span style={{ color: 'var(--text-muted)' }}>{data.tpoInfo?.assignedBranches || "N/A"}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <a href={`tel:${data.tpoInfo?.phone || ''}`} className="btn-action" style={{ flex: 1, background: '#2563eb', textDecoration: 'none' }}><i className="ph-fill ph-phone"></i> Call</a>
              <a href={`https://wa.me/${data.tpoInfo?.phone ? data.tpoInfo.phone.toString().replace(/\D/g,'') : ''}`} className="btn-action" style={{ flex: 1, background: '#22c55e', textDecoration: 'none' }}><i className="ph-fill ph-whatsapp-logo"></i> WhatsApp</a>
              <a href={`mailto:${data.tpoInfo?.email || 'placement@ipcsglobal.com'}?cc=placementcell.ipcs@gmail.com&subject=Student Inquiry: ${user?.name} (${user?.rollNo})`} className="btn-action" style={{ flex: 1, background: '#ef4444', textDecoration: 'none' }}><i className="ph-fill ph-envelope"></i> Mail</a>
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

export default function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
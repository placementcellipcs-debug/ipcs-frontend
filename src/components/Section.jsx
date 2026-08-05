import React from 'react';
import { companies, tpoTeam } from '../data'; // from Step 2

export const Navbar = () => (
  <nav className="absolute top-0 w-full z-50 py-6 px-6 lg:px-12 flex justify-between items-center border-b border-slate-800/50">
    <div className="flex items-center gap-3">
       <span className="text-xl font-black text-white">IPCS <span className="text-cyan-400">GLOBAL</span></span>
    </div>
    <ul className="hidden md:flex gap-8 text-sm font-semibold text-slate-300">
      <li className="hover:text-cyan-400 cursor-pointer transition">Home</li>
      <li className="hover:text-cyan-400 cursor-pointer transition">Recruiters</li>
      <li className="hover:text-cyan-400 cursor-pointer transition">Placements</li>
      <li className="hover:text-cyan-400 cursor-pointer transition">Testimonials</li>
    </ul>
    <button className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-5 py-2 rounded-lg text-sm font-bold hover:bg-cyan-500 hover:text-white transition">
      Hire From Us &rarr;
    </button>
  </nav>
);

export const Features = () => (
  <section className="py-24 bg-[#050B14] border-t border-slate-900">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-900/30 px-4 py-1.5 rounded-full">Professional Training Edge</span>
      <h2 className="text-3xl lg:text-5xl font-extrabold mt-6 mb-16 text-white">The IPCS Training-to-Hired Ecosystem</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
        {[
          { title: "Industry-Grade Labs", icon: "fa-laptop-code", color: "text-cyan-400 bg-cyan-400/10", desc: "Students train directly on advanced PLC panels and SCADA." },
          { title: "Mock Technical Audits", icon: "fa-file-invoice", color: "text-indigo-400 bg-indigo-400/10", desc: "Simulated real HR algorithms and technical panels." },
          { title: "Global Outreach", icon: "fa-globe", color: "text-yellow-400 bg-yellow-400/10", desc: "Active tie-ups in Gulf nations, Singapore, and Germany." },
          { title: "Corporate Placement", icon: "fa-user-shield", color: "text-green-400 bg-green-400/10", desc: "Exclusive on-campus recruitment cycles." }
        ].map((f, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-cyan-500/50 transition duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${f.color}`}>
              <i className={`fa-solid ${f.icon}`}></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
            <p className="text-sm text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const CompaniesMarquee = () => (
  <section className="py-20 bg-[#080c14] overflow-hidden border-t border-slate-900" id="companies">
    <div className="text-center mb-12">
      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-900/30 px-4 py-1.5 rounded-full">IPCS Valued Partners</span>
      <h2 className="text-3xl lg:text-4xl font-extrabold mt-6 text-white">Trusted By Top Tier Global Brands</h2>
    </div>
    
    <div className="relative w-full flex overflow-x-hidden">
      <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-[#080c14] to-transparent z-10"></div>
      <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-[#080c14] to-transparent z-10"></div>
      
      <div className="flex animate-marquee-left gap-6 py-4 px-3 w-max">
        {[...companies, ...companies].map((c, i) => (
          <div key={i} className="company-card">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${c.color} ${c.bg}`}>
                <i className={`fa-solid ${c.icon}`}></i>
              </div>
              <div>
                <h4 className="font-extrabold text-white">{c.name}</h4>
                <p className="text-[0.65rem] text-slate-500 uppercase tracking-wider">{c.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const MeetTheTeam = () => (
  <section className="py-24 bg-[#050B14] border-t border-slate-900">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="text-center mb-16">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Our Team</span>
        <h2 className="text-3xl lg:text-4xl font-extrabold mt-4 text-white">Meet Placement Officers</h2>
      </div>

      {/* Zonal Head */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden flex flex-col lg:flex-row mb-16 shadow-2xl">
         <div className="lg:w-1/3 bg-slate-800 relative">
            <img src="assets/images/PlacementTeam/gifty.png" className="w-full h-full object-cover" alt="Zonal Head" />
            <span className="absolute top-4 left-4 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">Zonal Head</span>
         </div>
         <div className="p-8 lg:p-12 lg:w-2/3 flex flex-col justify-center">
            <h3 className="text-3xl font-bold text-white mb-2">Ms. Gifty KP</h3>
            <p className="text-cyan-400 font-bold uppercase tracking-wider text-sm mb-6">Zonal Placement Manager</p>
            <p className="text-slate-400 mb-8 leading-relaxed">Ms. Gifty has over 9 years of diverse experience in the EdTech industry. Starting as a JAVA Trainer, she mastered technical expertise and teaching methodologies, eventually advancing to specialize in Training Excellence.</p>
            <div className="flex gap-4">
               <button className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-cyan-500 transition"><i className="fa-brands fa-linkedin-in"></i></button>
               <button className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-green-500 transition"><i className="fa-brands fa-whatsapp"></i></button>
            </div>
         </div>
      </div>

      {/* TPO Grid */}
      <h3 className="text-center text-xl font-bold text-white mb-8 border-b border-slate-800 pb-4 inline-block w-full max-w-sm mx-auto">Training & Placement Officers</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {tpoTeam.map((t, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden text-center hover:-translate-y-2 transition duration-300">
            <img src={t.img} alt={t.name} className="w-full h-48 object-cover object-top" />
            <div className="p-5">
              <h4 className="font-bold text-white text-sm mb-1">{t.name}</h4>
              <p className="text-[0.65rem] text-cyan-400 uppercase tracking-widest font-bold mb-3">{t.role}</p>
              <div className="flex justify-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs hover:text-white cursor-pointer"><i className="fa-brands fa-linkedin-in"></i></div>
                 <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs hover:text-white cursor-pointer"><i className="fa-solid fa-envelope"></i></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
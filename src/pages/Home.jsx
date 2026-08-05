import React from 'react';
import HeroSection from '../components/HeroSection';
import { Navbar, Features, CompaniesMarquee, MeetTheTeam } from '../components/Sections';

// Placed Gallery Placeholder Component (To match the screenshot)
const PlacedGallery = () => (
  <section className="py-20 bg-[#080c14] border-t border-slate-900" id="placedStudentsMarquee">
    <div className="text-center mb-12">
      <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Our Achievers</span>
      <h2 className="text-3xl lg:text-4xl font-extrabold mt-4 text-white">Placed Students Gallery</h2>
    </div>
    {/* Dual Marquees go here. We use placeholders for brevity. */}
    <div className="w-full overflow-hidden flex gap-4 animate-marquee-left h-64 opacity-50 bg-slate-900 items-center justify-center rounded-xl border border-slate-800 mx-auto max-w-7xl">
       <span className="text-slate-500">Insert Images dynamically mapping through student list here</span>
    </div>
    <div className="mt-12 text-center">
       <button className="bg-green-500 text-white font-bold px-8 py-3 rounded-full hover:bg-green-600 transition">See More Placements &rarr;</button>
    </div>
  </section>
);

export default function Home() {
  return (
    <div className="w-full bg-[#080c14]">
      <Navbar />
      <HeroSection />
      <Features />
      <CompaniesMarquee />
      <PlacedGallery />
      <MeetTheTeam />
      {/* Footer can be imported and added here */}
    </div>
  );
}
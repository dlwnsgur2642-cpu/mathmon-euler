'use client';

import React, { useState } from 'react';
import { SPECIES_DATA } from '@/lib/mathmonData';

interface PokedexModalProps {
  onClose: () => void;
}

export const PokedexModal: React.FC<PokedexModalProps> = ({ onClose }) => {
  const speciesList = Object.values(SPECIES_DATA);
  const [selectedSpecies, setSelectedSpecies] = useState(speciesList[0]);

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 text-white font-game select-none animate-in fade-in">
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-3">
        <div>
          <h2 className="text-sm font-bold text-amber-400 font-pixel">📱 수학몬 도감</h2>
          <span className="text-[10px] text-slate-400">중1-2 수학 개념으로 창조된 수학몬들의 정보</span>
        </div>
        <button onClick={onClose} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs">닫기</button>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        <div className="w-48 overflow-y-auto space-y-1.5 pr-1">
          {speciesList.map((sp) => (
            <button
              key={sp.id}
              onClick={() => setSelectedSpecies(sp)}
              className={`w-full p-2 rounded-xl border text-left text-xs flex items-center gap-2 transition-all ${
                selectedSpecies.id === sp.id
                  ? 'bg-indigo-600 border-indigo-400 font-bold'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow" style={{ backgroundColor: sp.color }}>{sp.name[0]}</div>
              <span className="truncate">{sp.name}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg border border-white/20" style={{ backgroundColor: selectedSpecies.color }}>{selectedSpecies.name[0]}</div>
              <div>
                <h3 className="text-base font-bold text-white font-pixel">{selectedSpecies.name}</h3>
                <div className="text-[11px] text-amber-300">{selectedSpecies.dexCategory}</div>
                <div className="flex gap-1 mt-1">
                  {selectedSpecies.type.map((t) => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-semibold text-slate-300">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 bg-slate-800/80 rounded-xl p-2.5 text-xs text-slate-300 leading-relaxed border border-slate-700">{selectedSpecies.dexDesc}</div>
            <div className="mt-3 space-y-1.5 text-[10px]">
              {[
                { label: 'HP', val: selectedSpecies.baseHp, color: 'bg-emerald-500' },
                { label: '공격', val: selectedSpecies.baseAtk, color: 'bg-rose-500' },
                { label: '방어', val: selectedSpecies.baseDef, color: 'bg-sky-500' },
                { label: '속도', val: selectedSpecies.baseSpd, color: 'bg-amber-500' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="w-8 text-slate-400 font-bold">{stat.label}</span>
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                    <div className={`h-full ${stat.color}`} style={{ width: `${Math.min(100, stat.val)}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-slate-400">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[9px] text-slate-500 text-center mt-2">중학교 1학년 2학기 기하학 &amp; 통계 기반 수학몬</div>
        </div>
      </div>
    </div>
  );
};

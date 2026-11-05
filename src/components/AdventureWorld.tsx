'use client';

import React, { useState, useEffect } from 'react';
import { MathmonInstance, QuizQuestion } from '@/types/game';
import { createMathmon, SPECIES_DATA } from '@/lib/mathmonData';
import { BattleScene } from './BattleScene';
import { sfx } from '@/lib/audio';

interface AdventureWorldProps {
  playerName: string;
  party: MathmonInstance[];
  badges: boolean[];
  onUpdateParty: (newParty: MathmonInstance[]) => void;
  onUpdateBadges: (newBadges: boolean[]) => void;
  onRecordWrongAnswer: (quiz: QuizQuestion, myChoice: string) => void;
  onOpenPvp: () => void;
}

export const AdventureWorld: React.FC<AdventureWorldProps> = ({
  playerName,
  party,
  badges,
  onUpdateParty,
  onUpdateBadges,
  onRecordWrongAnswer,
  onOpenPvp,
}) => {
  // 모험 위치 상태: 'intro' | 'town' | 'route1' | 'gym' | 'battle'
  const [subScene, setSubScene] = useState<'intro' | 'town' | 'route1' | 'gym' | 'battle'>('intro');
  const [dialog, setDialog] = useState<string>('');
  const [activeEnemy, setActiveEnemy] = useState<MathmonInstance | null>(null);
  const [activeTrainerTitle, setActiveTrainerTitle] = useState<string | undefined>(undefined);
  const [selectedGymIdx, setSelectedGymIdx] = useState<number>(0);

  const starterSpecies = ['gakdorong', 'damyeonho', 'wonppulbeom'];

  useEffect(() => {
    if (party.length === 0) {
      setSubScene('intro');
      setDialog(
        `오일러 박사: "어서 오너라, ${playerName}! 나는 다면체와 한붓그리기를 연구하는 오일러 박사란다.\n중1 수학 2학기 모험을 함께할 첫 번째 수학몬을 골라보렴!"`
      );
    } else {
      setSubScene('town');
      setDialog(`기하마을 광장이다. 어디로 가볼까?`);
    }
  }, [party.length, playerName]);

  // 스타터 수학몬 선택
  const handleSelectStarter = (spId: string) => {
    sfx.playSelect();
    const newMon = createMathmon(spId, 5);
    const newParty = [newMon];
    onUpdateParty(newParty);
    setSubScene('town');
    setDialog(
      `오일러 박사: "훌륭한 선택이구나! ${newMon.name}과(와) 함께 5개 체육관의 배지를 모두 모아 학기말 챔피언에 도전해 보렴!"`
    );
  };

  // 풀숲 탐험 (야생 수학몬 조우)
  const handleWalkGrass = () => {
    sfx.playSelect();
    const wildPool = ['matkkokji_bird', 'pyeonghaeng_cat', 'jakdo_frog', 'histo_turtle'];
    const chosen = wildPool[Math.floor(Math.random() * wildPool.length)];
    const wildMon = createMathmon(chosen, Math.floor(Math.random() * 3) + 3);

    setActiveEnemy(wildMon);
    setActiveTrainerTitle(undefined);
    setSubScene('battle');
  };

  // 체육관 도전
  const handleChallengeGym = (idx: number) => {
    sfx.playSelect();
    setSelectedGymIdx(idx);
    const gymLeaders = [
      { name: '1관장 직선', mon: 'matkkokji_bird', lv: 6 },
      { name: '2관장 컴퍼스', mon: 'jakdo_frog', lv: 8 },
      { name: '3관장 부채', mon: 'buchaedorong', lv: 10 },
      { name: '4관장 오일러', mon: 'jeongdamyeonho', lv: 12 },
      { name: '5관장 히스토', mon: 'histo_turtle', lv: 14 },
    ];
    const leader = gymLeaders[idx];
    const gymMon = createMathmon(leader.mon, leader.lv);

    setActiveEnemy(gymMon);
    setActiveTrainerTitle(leader.name);
    setSubScene('battle');
  };

  // 배틀 종료 처리
  const handleBattleEnd = (result: 'win' | 'lose') => {
    if (result === 'win' && activeTrainerTitle) {
      // 체육관 배지 획득
      const nextBadges = [...badges];
      nextBadges[selectedGymIdx] = true;
      onUpdateBadges(nextBadges);
      setDialog(`승리! ${activeTrainerTitle}에게서 공식 수학 체육관 배지를 획득했다!`);
    } else if (result === 'win') {
      setDialog(`야생 수학몬과의 배틀에서 승리했다! 경험치를 얻었다.`);
    } else {
      setDialog(`배틀에서 패배했다... 기하마을 연구소에서 수학몬을 치료했다.`);
    }

    setSubScene('town');
    setActiveEnemy(null);
  };

  return (
    <div className="relative w-full max-w-[540px] aspect-[4/3] bg-slate-950 border-4 border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col select-none font-game">
      {/* 1. 배틀 씬일 때 */}
      {subScene === 'battle' && activeEnemy && party[0] && (
        <BattleScene
          playerMon={party[0]}
          enemyMon={activeEnemy}
          enemyTrainerName={activeTrainerTitle}
          onBattleEnd={handleBattleEnd}
          onRecordWrongAnswer={onRecordWrongAnswer}
        />
      )}

      {/* 2. 스타터 선택 화면 */}
      {subScene === 'intro' && (
        <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
          <div className="bg-slate-900/90 border-2 border-indigo-500 rounded-xl p-3 text-xs leading-relaxed text-amber-200 whitespace-pre-wrap">
            {dialog}
          </div>

          <div className="grid grid-cols-3 gap-2 my-auto">
            {starterSpecies.map((spId) => {
              const sp = SPECIES_DATA[spId];
              return (
                <button
                  key={spId}
                  onClick={() => handleSelectStarter(spId)}
                  className="bg-slate-800 hover:bg-indigo-600 border-2 border-slate-600 hover:border-indigo-400 rounded-xl p-3 flex flex-col items-center gap-2 transition-all active:scale-95 text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md"
                    style={{ backgroundColor: sp.color }}
                  >
                    {sp.name[0]}
                  </div>
                  <div className="font-bold text-xs text-white">{sp.name}</div>
                  <div className="text-[10px] text-amber-300 font-semibold">{sp.type.join('/')}</div>
                  <div className="text-[9px] text-slate-400 leading-tight line-clamp-2">{sp.dexDesc}</div>
                </button>
              );
            })}
          </div>

          <div className="text-center text-[10px] text-slate-400">
            원하는 수학몬을 터치하여 파트너로 선택하세요!
          </div>
        </div>
      )}

      {/* 3. 마을 광장 (허브 화면) */}
      {subScene === 'town' && (
        <div className="flex-1 flex flex-col justify-between p-3.5 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
          {/* 상단 마을 안내 */}
          <div className="bg-slate-900/90 border-2 border-slate-700 rounded-xl p-3 text-xs leading-relaxed flex items-center justify-between">
            <span className="text-amber-300 font-bold">🏛️ 기하마을 (Geometry Town)</span>
            <div className="flex gap-1">
              {badges.map((hasBadge, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-1.5 py-0.5 rounded border ${
                    hasBadge
                      ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                  title={`${idx + 1}체육관 배지`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* 중앙 파티 현황 */}
          {party[0] && (
            <div className="my-auto bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow"
                style={{ backgroundColor: SPECIES_DATA[party[0].speciesId]?.color || '#10b981' }}
              >
                {party[0].name[0]}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">{party[0].name}</span>
                  <span className="text-[11px] text-amber-400 font-bold">Lv.{party[0].level}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[9px] text-slate-400">HP</span>
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(party[0].hp / party[0].maxHp) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {party[0].hp}/{party[0].maxHp}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 하단 행동 메뉴 그리드 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWalkGrass}
              className="py-3 bg-emerald-700 hover:bg-emerald-600 border-2 border-emerald-500 rounded-xl font-bold text-xs shadow transition-all active:scale-95 text-left px-3 flex items-center gap-2"
            >
              <span>🌿</span>
              <div>
                <div>1번 도로 풀숲 탐험</div>
                <div className="text-[9px] font-normal text-emerald-200">야생 수학몬 레벨업 배틀</div>
              </div>
            </button>

            <button
              onClick={onOpenPvp}
              className="py-3 bg-indigo-700 hover:bg-indigo-600 border-2 border-indigo-400 rounded-xl font-bold text-xs shadow transition-all active:scale-95 text-left px-3 flex items-center gap-2"
            >
              <span>⚔️</span>
              <div>
                <div>교실 1:1 통신 대전</div>
                <div className="text-[9px] font-normal text-indigo-200">친구와 실시간 퀴즈 배틀</div>
              </div>
            </button>

            {/* 체육관 관장 도전 리스트 */}
            <div className="col-span-2 grid grid-cols-5 gap-1.5 mt-1">
              {[
                { title: '1관', desc: '기본도형' },
                { title: '2관', desc: '작도합동' },
                { title: '3관', desc: '평면도형' },
                { title: '4관', desc: '입체도형' },
                { title: '5관', desc: '통계분포' },
              ].map((gym, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChallengeGym(idx)}
                  className={`py-2 px-1 border rounded-lg text-center transition-all active:scale-95 ${
                    badges[idx]
                      ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-bold">{gym.title}</div>
                  <div className="text-[8px] text-slate-400">{gym.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

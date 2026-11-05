'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { MathmonInstance, QuizQuestion } from '@/types/game';
import { AdventureWorld } from '@/components/AdventureWorld';
import { PvpArena } from '@/components/PvpArena';
import { WrongNotesModal } from '@/components/WrongNotesModal';
import { PokedexModal } from '@/components/PokedexModal';
import { sfx } from '@/lib/audio';

type MainScreen = 'title' | 'nameInput' | 'game' | 'pvp';

const SAVE_KEY = 'mathmon_euler_save';

interface SaveState {
  name: string;
  party: MathmonInstance[];
  badges: boolean[];
  wrongNotes: { quiz: QuizQuestion; myChoice: string; date: number }[];
  savedAt: number;
}

function loadSave(): SaveState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return null;
}

function writeSave(state: SaveState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch { /* empty */ }
}

export default function Home() {
  const [screen, setScreen] = useState<MainScreen>('title');
  const [playerName, setPlayerName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [party, setParty] = useState<MathmonInstance[]>([]);
  const [badges, setBadges] = useState<boolean[]>([false, false, false, false, false]);
  const [wrongNotes, setWrongNotes] = useState<{ quiz: QuizQuestion; myChoice: string; date: number }[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [showDex, setShowDex] = useState(false);
  const [hasSave, setHasSave] = useState(false);

  // 마운트 시 저장 데이터 탐색
  useEffect(() => {
    const s = loadSave();
    if (s && s.name) setHasSave(true);
  }, []);

  // 자동 저장
  useEffect(() => {
    if (screen === 'game' && playerName) {
      const timer = setInterval(() => {
        writeSave({ name: playerName, party, badges, wrongNotes, savedAt: Date.now() });
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [screen, playerName, party, badges, wrongNotes]);

  const handleContinue = () => {
    const s = loadSave();
    if (s) {
      setPlayerName(s.name);
      setParty(s.party || []);
      setBadges(s.badges || [false, false, false, false, false]);
      setWrongNotes(s.wrongNotes || []);
      setScreen('game');
    }
  };

  const handleNewGame = () => {
    sfx.playSelect();
    setScreen('nameInput');
  };

  const handleNameConfirm = () => {
    const name = nameInput.trim() || '수학이';
    sfx.playLevelUp();
    setPlayerName(name);
    setParty([]);
    setBadges([false, false, false, false, false]);
    setWrongNotes([]);
    setScreen('game');
  };

  const handleUpdateParty = useCallback((newParty: MathmonInstance[]) => {
    setParty(newParty);
  }, []);

  const handleUpdateBadges = useCallback((newBadges: boolean[]) => {
    setBadges(newBadges);
  }, []);

  const handleRecordWrong = useCallback((quiz: QuizQuestion, myChoice: string) => {
    setWrongNotes((prev) => [{ quiz, myChoice, date: Date.now() }, ...prev].slice(0, 100));
  }, []);

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-4 gap-4 bg-slate-950">

      {/* 타이틀 화면 */}
      {screen === 'title' && (
        <div className="relative w-full max-w-[540px] aspect-[4/3] bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border-4 border-amber-600 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center select-none">
          {/* 배경 장식 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-pulse"
                style={{
                  left: `${10 + (i * 37) % 80}%`,
                  top: `${15 + (i * 23) % 70}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          <div className="z-10 flex flex-col items-center gap-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-pixel text-amber-400 drop-shadow-lg tracking-wide" style={{ textShadow: '3px 3px 0 #7c2d12' }}>
              수학몬스터
            </h1>
            <span className="text-xl md:text-2xl font-pixel text-white" style={{ textShadow: '2px 2px 0 #312e81' }}>
              오일러
            </span>
            <div className="mt-2 bg-indigo-800/80 px-4 py-1 rounded-full border border-indigo-500/50 text-xs text-indigo-200 font-bold tracking-widest">
              중학교 1학년 · 2학기 수학 대모험
            </div>
          </div>

          <div className="z-10 flex flex-col gap-3 w-52">
            {hasSave && (
              <button
                onClick={handleContinue}
                className="py-3 bg-emerald-700 hover:bg-emerald-600 border-2 border-emerald-400 rounded-xl font-bold text-sm text-white shadow-lg active:scale-95 transition-all"
              >
                이어서 하기
              </button>
            )}
            <button
              onClick={handleNewGame}
              className="py-3 bg-indigo-700 hover:bg-indigo-600 border-2 border-indigo-400 rounded-xl font-bold text-sm text-white shadow-lg active:scale-95 transition-all"
            >
              새 게임 시작
            </button>
          </div>

          <div className="absolute bottom-3 text-[10px] text-slate-500 z-10">
            ⓒ 2026 중1 수학 연구소 · 비영리 교육용 오리지널 게임
          </div>
        </div>
      )}

      {/* 이름 입력 화면 */}
      {screen === 'nameInput' && (
        <div className="relative w-full max-w-[540px] aspect-[4/3] bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center gap-6 select-none p-8">
          <div className="bg-slate-900/90 border-2 border-indigo-500 rounded-xl p-4 text-xs text-amber-200 leading-relaxed text-center font-game max-w-xs">
            오일러 박사: &quot;어서 오너라! 나는 다면체와 한붓그리기를 연구하는 오일러 박사란다. 자, 너의 이름은 무엇이니?&quot;
          </div>

          <div className="flex flex-col items-center gap-3 w-64">
            <input
              type="text"
              maxLength={6}
              placeholder="예: 수학이"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNameConfirm(); }}
              autoFocus
              className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl px-4 py-3 text-center text-base font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-game"
            />
            <button
              onClick={handleNameConfirm}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-400 rounded-xl font-bold text-sm text-white shadow-lg active:scale-95 transition-all"
            >
              결정
            </button>
          </div>
        </div>
      )}

      {/* 게임 메인 화면 */}
      {screen === 'game' && (
        <div className="relative w-full max-w-[540px]">
          <AdventureWorld
            playerName={playerName}
            party={party}
            badges={badges}
            onUpdateParty={handleUpdateParty}
            onUpdateBadges={handleUpdateBadges}
            onRecordWrongAnswer={handleRecordWrong}
            onOpenPvp={() => setScreen('pvp')}
          />

          {/* 하단 메뉴 바 */}
          <div className="mt-2 flex gap-2 justify-center">
            <button
              onClick={() => setShowDex(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-[11px] text-slate-300 font-bold transition-all"
            >
              📱 도감
            </button>
            <button
              onClick={() => setShowNotes(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-[11px] text-slate-300 font-bold transition-all"
            >
              📖 오답노트 ({wrongNotes.length})
            </button>
            <button
              onClick={() => { sfx.toggleMute(); }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-[11px] text-slate-300 font-bold transition-all"
            >
              🔊 사운드
            </button>
          </div>

          {/* 오답노트 모달 */}
          {showNotes && (
            <div className="absolute inset-0 z-50">
              <WrongNotesModal notes={wrongNotes} onClose={() => setShowNotes(false)} />
            </div>
          )}

          {/* 도감 모달 */}
          {showDex && (
            <div className="absolute inset-0 z-50">
              <PokedexModal onClose={() => setShowDex(false)} />
            </div>
          )}
        </div>
      )}

      {/* PVP 통신대전 화면 */}
      {screen === 'pvp' && (
        <PvpArena
          playerName={playerName}
          myParty={party}
          onExitPvp={() => setScreen('game')}
        />
      )}

      {/* 비영리 교육용 Disclaimer */}
      <p className="text-[9px] text-slate-600 text-center max-w-sm mt-2 leading-relaxed">
        본 웹사이트는 중학교 수학 학습을 위한 비영리 교육용 프로젝트입니다.
        모든 수학몬과 기술명은 자체 창작 오리지널 콘텐츠이며, 기존 게임의 공식 콘텐츠와 무관합니다.
      </p>
    </main>
  );
}

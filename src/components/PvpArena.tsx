'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MathmonInstance, Move, QuizQuestion } from '@/types/game';
import { PvpRoomManager } from '@/lib/supabase';
import { generateQuiz } from '@/lib/quizGenerator';
import { sfx } from '@/lib/audio';
import { SPECIES_DATA, getEffectiveness } from '@/lib/mathmonData';
import confetti from 'canvas-confetti';

interface PvpArenaProps {
  playerName: string;
  myParty: MathmonInstance[];
  onExitPvp: () => void;
}

export const PvpArena: React.FC<PvpArenaProps> = ({ playerName, myParty, onExitPvp }) => {
  const [mode, setMode] = useState<'lobby' | 'waiting' | 'battling' | 'ended'>('lobby');
  const [roomId, setRoomId] = useState<string>('');
  const [joinInput, setJoinInput] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [opponentName, setOpponentName] = useState<string>('');
  const [opponentParty, setOpponentParty] = useState<MathmonInstance[]>([]);

  // 배틀 상태
  const [myMonIndex, setMyMonIndex] = useState<number>(0);
  const [oppMonIndex, setOppMonIndex] = useState<number>(0);
  const [myMon, setMyMon] = useState<MathmonInstance>({ ...myParty[0] });
  const [oppMon, setOppMon] = useState<MathmonInstance | null>(null);

  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [oppSelectedMove, setOppSelectedMove] = useState<Move | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [quizTimer, setQuizTimer] = useState<number>(15);
  const [quizAnswerTime, setQuizAnswerTime] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [oppAnswerTime, setOppAnswerTime] = useState<number | null>(null);
  const [oppAnswerCorrect, setOppAnswerCorrect] = useState<boolean | null>(null);

  const [battleLog, setBattleLog] = useState<string>('상대방과 연결되었습니다! 기술을 선택하세요.');
  const [winner, setWinner] = useState<string | null>(null);

  const roomMgrRef = useRef<PvpRoomManager | null>(null);
  const timerStartRef = useRef<number>(0);

  // 방 만들기 (호스트)
  const handleCreateRoom = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomId(code);
    setIsHost(true);
    setMode('waiting');

    const mgr = new PvpRoomManager(code, playerName, true, {
      onGuestJoined: (guest, guestParty) => {
        setOpponentName(guest);
        setOpponentParty(guestParty);
        setOppMon({ ...guestParty[0] });
        setMode('battling');
        sfx.playSelect();
      },
      onOpponentAnswered: (isCorrect, timeMs) => {
        setOppAnswerCorrect(isCorrect);
        setOppAnswerTime(timeMs);
      },
      onTurnResolved: (hDmg, gDmg, msg) => {
        // 결과 처리
      },
      onOpponentQuit: () => {
        alert('상대방이 접속을 종료했습니다.');
        handleExit();
      },
    });

    mgr.connect(myParty);
    roomMgrRef.current = mgr;
  };

  // 방 참가하기 (게스트)
  const handleJoinRoom = () => {
    if (joinInput.length !== 4) {
      alert('4자리 방 코드를 입력해주세요.');
      return;
    }
    const code = joinInput;
    setRoomId(code);
    setIsHost(false);
    setMode('waiting');

    const mgr = new PvpRoomManager(code, playerName, false, {
      onHostReady: (host, hostParty) => {
        setOpponentName(host);
        setOpponentParty(hostParty);
        setOppMon({ ...hostParty[0] });
        setMode('battling');
        sfx.playSelect();
      },
      onBothSelectedMoves: (hMove, gMove, quiz) => {
        setOppSelectedMove(hMove);
        setActiveQuiz(quiz);
        setQuizTimer(15);
        setQuizAnswerTime(null);
        setIsAnswerCorrect(null);
        setOppAnswerTime(null);
        setOppAnswerCorrect(null);
        timerStartRef.current = Date.now();
      },
      onOpponentAnswered: (isCorrect, timeMs) => {
        setOppAnswerCorrect(isCorrect);
        setOppAnswerTime(timeMs);
      },
      onOpponentQuit: () => {
        alert('상대방이 접속을 종료했습니다.');
        handleExit();
      },
    });

    mgr.connect(myParty);
    roomMgrRef.current = mgr;
  };

  const handleExit = () => {
    if (roomMgrRef.current) {
      roomMgrRef.current.disconnect();
      roomMgrRef.current = null;
    }
    onExitPvp();
  };

  // 기술 선택 시
  const handleSelectMove = (move: Move) => {
    if (selectedMove || activeQuiz) return;
    sfx.playSelect();
    setSelectedMove(move);

    if (isHost) {
      // 호스트가 기술을 선택했고, 게스트도 선택했을 때 퀴즈 출제
      if (oppSelectedMove) {
        const quiz = generateQuiz();
        setActiveQuiz(quiz);
        setQuizTimer(15);
        setQuizAnswerTime(null);
        setIsAnswerCorrect(null);
        setOppAnswerTime(null);
        setOppAnswerCorrect(null);
        timerStartRef.current = Date.now();

        roomMgrRef.current?.broadcast('both_ready_quiz', {
          hostMove: move,
          guestMove: oppSelectedMove,
          quiz,
        });
      } else {
        setBattleLog('상대방이 기술을 고르는 중입니다...');
        roomMgrRef.current?.broadcast('move_selected', { move });
      }
    } else {
      // 게스트가 선택함
      setBattleLog('기술 선택 완료! 상대방 대기 중...');
      roomMgrRef.current?.broadcast('move_selected', { move });
    }
  };

  // 퀴즈 답안 제출
  const handleAnswerQuiz = (idx: number) => {
    if (isAnswerCorrect !== null || !activeQuiz) return;
    const timeSpent = Date.now() - timerStartRef.current;
    const isCorrect = idx === activeQuiz.answerIndex;

    setIsAnswerCorrect(isCorrect);
    setQuizAnswerTime(timeSpent);

    if (isCorrect) sfx.playCorrect();
    else sfx.playWrong();

    // 상대방에게 정답 여부와 소요시간 브로드캐스트
    roomMgrRef.current?.broadcast('quiz_answered', {
      isCorrect,
      timeMs: timeSpent,
    });
  };

  // 두 플레이어 모두 답안을 제출했거나 시간이 끝났을 때 턴 정산
  useEffect(() => {
    if (!activeQuiz || isAnswerCorrect === null || oppAnswerCorrect === null || !myMon || !oppMon) return;

    const timer = setTimeout(() => {
      // 정산 로직: 누가 더 빠르고 정확했는가?
      let log = '';
      let nextMyHp = myMon.hp;
      let nextOppHp = oppMon.hp;

      // 내 공격 판정
      if (isAnswerCorrect) {
        const isFaster = (quizAnswerTime || 99999) < (oppAnswerTime || 99999);
        const crit = isFaster ? 1.5 : 1.0;
        const myMove = selectedMove || myMon.moves[0];
        const mult = getEffectiveness(myMove.type, SPECIES_DATA[oppMon.speciesId]?.type || ['노말']);
        const dmg = Math.max(5, Math.floor((myMove.power * (myMon.atk / oppMon.def) * mult * crit) / 5));

        nextOppHp = Math.max(0, nextOppHp - dmg);
        log += `${playerName}의 ${myMon.name}! ${myMove.name}! (${dmg} 대미지) `;
        if (isFaster) log += '⚡ 더 빠른 정답으로 급소 일격! ';
        sfx.playHit();
      } else {
        log += `${playerName}은(는) 문제를 틀려 공격 실패! `;
      }

      // 상대 공격 판정
      if (oppAnswerCorrect && nextOppHp > 0) {
        const isOppFaster = (oppAnswerTime || 99999) <= (quizAnswerTime || 99999);
        const crit = isOppFaster ? 1.5 : 1.0;
        const oppMove = oppSelectedMove || oppMon.moves[0];
        const mult = getEffectiveness(oppMove.type, SPECIES_DATA[myMon.speciesId]?.type || ['노말']);
        const dmg = Math.max(5, Math.floor((oppMove.power * (oppMon.atk / myMon.def) * mult * crit) / 5));

        nextMyHp = Math.max(0, nextMyHp - dmg);
        log += `상대 ${opponentName}의 ${oppMon.name}! ${oppMove.name}! (${dmg} 대미지) `;
      } else if (!oppAnswerCorrect) {
        log += `상대 ${opponentName}도 문제를 틀려 공격 실패! `;
      }

      setMyMon((prev) => ({ ...prev, hp: nextMyHp }));
      setOppMon((prev) => (prev ? { ...prev, hp: nextOppHp } : null));
      setBattleLog(log);

      // 초기화 및 다음 턴 준비
      setActiveQuiz(null);
      setSelectedMove(null);
      setOppSelectedMove(null);
      setIsAnswerCorrect(null);
      setOppAnswerCorrect(null);

      // 승패 판정
      if (nextOppHp <= 0) {
        setWinner(playerName);
        setMode('ended');
        sfx.playVictory();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else if (nextMyHp <= 0) {
        setWinner(opponentName);
        setMode('ended');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAnswerCorrect, oppAnswerCorrect]);

  return (
    <div className="relative w-full max-w-[540px] aspect-[4/3] bg-slate-950 border-4 border-indigo-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col p-4 text-white font-game select-none">
      {/* 1. 로비 화면 */}
      {mode === 'lobby' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
          <div>
            <h2 className="text-xl font-bold text-amber-400 font-pixel">교실 1:1 수학몬 배틀 아레나</h2>
            <p className="text-xs text-slate-400 mt-1">친구와 같은 수학 문제를 풀며 실시간으로 승부하세요!</p>
          </div>

          <div className="flex flex-col gap-3 w-64">
            <button
              onClick={handleCreateRoom}
              className="py-3 bg-indigo-600 hover:bg-indigo-500 border-2 border-indigo-400 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
            >
              새 배틀 룸 만들기 (호스트)
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                placeholder="방 코드 4자리"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                className="flex-1 bg-slate-900 border-2 border-slate-700 rounded-xl px-3 text-center text-sm font-bold tracking-widest text-amber-300 focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={handleJoinRoom}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-400 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
              >
                입장
              </button>
            </div>
          </div>

          <button onClick={onExitPvp} className="text-xs text-slate-500 hover:text-slate-300 underline">
            메인 메뉴로 돌아가기
          </button>
        </div>
      )}

      {/* 2. 대기실 화면 */}
      {mode === 'waiting' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <div className="text-xs text-slate-400">배틀 룸 코드</div>
          <div className="text-4xl font-mono font-bold tracking-widest text-amber-300 bg-slate-900 border-2 border-amber-500/50 px-6 py-2 rounded-2xl animate-pulse">
            {roomId}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isHost ? '상대방 학생에게 위 코드를 알려주세요! 입장을 기다리는 중...' : '호스트에게 연결 중입니다...'}
          </p>
          <button onClick={handleExit} className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs">
            취소하고 나가기
          </button>
        </div>
      )}

      {/* 3. 실시간 배틀 화면 */}
      {mode === 'battling' && oppMon && (
        <div className="flex-1 flex flex-col justify-between">
          {/* 상단 HUD */}
          <div className="flex justify-between items-center bg-slate-900/80 border border-slate-700 rounded-xl p-2 px-3">
            <div>
              <div className="text-xs font-bold text-emerald-400">{playerName} (나)</div>
              <div className="text-[10px] text-slate-400">
                {myMon.name} Lv.{myMon.level} ({myMon.hp}/{myMon.maxHp})
              </div>
            </div>
            <div className="text-center font-bold text-amber-400 text-xs">VS</div>
            <div className="text-right">
              <div className="text-xs font-bold text-rose-400">{opponentName} (상대)</div>
              <div className="text-[10px] text-slate-400">
                {oppMon.name} Lv.{oppMon.level} ({oppMon.hp}/{oppMon.maxHp})
              </div>
            </div>
          </div>

          {/* 중앙 로그 */}
          <div className="bg-slate-900/90 border-2 border-slate-700 rounded-xl p-3 text-center text-xs leading-relaxed min-h-[60px] flex items-center justify-center text-amber-200">
            {battleLog}
          </div>

          {/* 하단 기술 선택 버튼 */}
          <div className="grid grid-cols-2 gap-2">
            {myMon.moves.map((m) => (
              <button
                key={m.id}
                disabled={selectedMove !== null || activeQuiz !== null}
                onClick={() => handleSelectMove(m)}
                className="bg-slate-800 hover:bg-indigo-600 disabled:opacity-40 border-2 border-slate-600 rounded-xl p-2 text-left transition-all active:scale-95"
              >
                <div className="text-xs font-bold text-white">{m.name}</div>
                <div className="text-[10px] text-slate-400">
                  {m.type} · 위력 {m.power}
                </div>
              </button>
            ))}
          </div>

          {/* 4. 동시 퀴즈 모달 */}
          {activeQuiz && (
            <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col justify-between p-4 animate-in fade-in">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-xs font-bold text-emerald-400">{activeQuiz.unitName}</span>
                <span className="text-xs font-bold text-amber-400 font-mono">스피드 퀴즈 배틀!</span>
              </div>

              <div className="text-center py-2">
                <p className="text-sm font-bold text-white leading-relaxed">{activeQuiz.question}</p>
                {activeQuiz.svgFigure && (
                  <div
                    dangerouslySetInnerHTML={{ __html: activeQuiz.svgFigure }}
                    className="flex justify-center items-center"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {activeQuiz.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={isAnswerCorrect !== null}
                    onClick={() => handleAnswerQuiz(idx)}
                    className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-xl py-2.5 px-3 text-xs font-bold text-center"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. 종료 화면 */}
      {mode === 'ended' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-2xl font-bold font-pixel text-amber-400">
            {winner === playerName ? '승리하였습니다! 🎉' : '패배하였습니다... 😭'}
          </h2>
          <p className="text-xs text-slate-300">승자: {winner}</p>
          <button
            onClick={() => setMode('lobby')}
            className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs"
          >
            로비로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

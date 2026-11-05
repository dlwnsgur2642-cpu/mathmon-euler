'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MathmonInstance, Move, QuizQuestion } from '@/types/game';
import { SPECIES_DATA, getEffectiveness } from '@/lib/mathmonData';
import { generateQuiz } from '@/lib/quizGenerator';
import { sfx } from '@/lib/audio';
import { drawRetroMathmon } from '@/lib/renderer';
import confetti from 'canvas-confetti';

interface BattleSceneProps {
  playerMon: MathmonInstance;
  enemyMon: MathmonInstance;
  enemyTrainerName?: string;
  onBattleEnd: (result: 'win' | 'lose') => void;
  onRecordWrongAnswer?: (quiz: QuizQuestion, myChoice: string) => void;
}

export const BattleScene: React.FC<BattleSceneProps> = ({
  playerMon,
  enemyMon,
  enemyTrainerName,
  onBattleEnd,
  onRecordWrongAnswer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [pMon, setPMon] = useState<MathmonInstance>({ ...playerMon });
  const [eMon, setEMon] = useState<MathmonInstance>({ ...enemyMon });

  const [dialogText, setDialogText] = useState<string>(
    enemyTrainerName
      ? `${enemyTrainerName}이(가) 승부를 걸어왔다!`
      : `야생의 ${enemyMon.name}이(가) 나타났다!`
  );

  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [pendingMove, setPendingMove] = useState<Move | null>(null);
  const [quizTimer, setQuizTimer] = useState<number>(15);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // 캔버스 렌더링 루프
  useEffect(() => {
    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 배경 그리기 (레트로 그라데이션)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.6, '#312e81');
      grad.addColorStop(0.61, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 배틀 플랫폼 원
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(380, 140, 80, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(120, 260, 100, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // 상대 수학몬 (앞모습, 우상단)
      const eSpecies = SPECIES_DATA[eMon.speciesId] || SPECIES_DATA.matkkokji_bird;
      const eHover = Math.sin(frame * 0.05) * 3;
      drawRetroMathmon(
        ctx,
        eSpecies.spriteShape,
        380,
        130 + eHover,
        2.2,
        false,
        eSpecies.color,
        eSpecies.accentColor
      );

      // 내 수학몬 (뒷모습, 좌하단)
      const pSpecies = SPECIES_DATA[pMon.speciesId] || SPECIES_DATA.gakdorong;
      const pHover = Math.sin((frame + 20) * 0.05) * 2;
      drawRetroMathmon(
        ctx,
        pSpecies.spriteShape,
        120,
        240 + pHover,
        3.0,
        true,
        pSpecies.color,
        pSpecies.accentColor
      );

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [pMon, eMon]);

  // 퀴즈 타이머
  useEffect(() => {
    if (!activeQuiz || quizAnswered) return;
    if (quizTimer <= 0) {
      handleQuizAnswer(-1); // 시간 초과 오답
      return;
    }
    const timer = setTimeout(() => setQuizTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [activeQuiz, quizTimer, quizAnswered]);

  // 기술 클릭 시 -> 해당 단원의 퀴즈 출제!
  const handleSelectMove = (move: Move) => {
    if (!isPlayerTurn || isProcessing) return;
    sfx.playSelect();
    setPendingMove(move);

    // 퀴즈 생성 (중1 2학기 5개 단원 중 랜덤)
    const quiz = generateQuiz();
    setActiveQuiz(quiz);
    setQuizTimer(15);
    setQuizAnswered(false);
    setSelectedOption(null);
  };

  // 퀴즈 답안 선택 처리
  const handleQuizAnswer = async (idx: number) => {
    if (quizAnswered || !activeQuiz || !pendingMove) return;
    setQuizAnswered(true);
    setSelectedOption(idx);

    const isCorrect = idx === activeQuiz.answerIndex;
    const isFast = quizTimer >= 10; // 5초 이내 정답 = 급소 일격!

    if (isCorrect) {
      sfx.playCorrect();
      if (isFast) sfx.playCritical();
    } else {
      sfx.playWrong();
      if (onRecordWrongAnswer && idx >= 0) {
        onRecordWrongAnswer(activeQuiz, activeQuiz.options[idx]);
      }
    }

    // 1.5초 후 퀴즈 닫고 배틀 연출 진행
    setTimeout(async () => {
      setActiveQuiz(null);
      setIsProcessing(true);

      if (isCorrect) {
        const mult = getEffectiveness(pendingMove.type, SPECIES_DATA[eMon.speciesId]?.type || ['노말']);
        const critMultiplier = isFast ? 1.5 : 1.0;
        const damage = Math.max(
          5,
          Math.floor((((pMon.level * 2) / 5 + 2) * pendingMove.power * (pMon.atk / eMon.def) * mult * critMultiplier) / 5)
        );

        sfx.playHit();
        const nextEhp = Math.max(0, eMon.hp - damage);
        setEMon((prev) => ({ ...prev, hp: nextEhp }));

        let log = `${pMon.name}의 ${pendingMove.name}! `;
        if (isFast) log += `⚡ 수학 퀴즈 초고속 정답! 급소에 맞았다! `;
        if (mult > 1) log += `효과가 굉장했다! `;
        if (mult < 1 && mult > 0) log += `효과가 별로인 듯하다... `;
        setDialogText(log);

        if (nextEhp <= 0) {
          // 상대 기절
          setTimeout(() => {
            sfx.playVictory();
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            setDialogText(`상대 ${eMon.name}은(는) 쓰러졌다! 승리했다!`);
            setTimeout(() => onBattleEnd('win'), 2200);
          }, 1200);
          return;
        }
      } else {
        setDialogText(`문제를 틀려서 기술이 빗나갔다!\n(${activeQuiz.explanation})`);
      }

      // 1.5초 후 상대 차례
      setTimeout(() => {
        enemyTurn();
      }, 1600);
    }, 1500);
  };

  // 상대 턴
  const enemyTurn = () => {
    setIsPlayerTurn(false);
    const moves = eMon.moves.length > 0 ? eMon.moves : [pendingMove || { id: 'tackle', name: '몸통박치기', power: 40, type: '노말' } as Move];
    const enemyMove = moves[Math.floor(Math.random() * moves.length)];

    setDialogText(`상대 ${eMon.name}의 ${enemyMove.name}!`);
    sfx.playHit();

    setTimeout(() => {
      const mult = getEffectiveness(enemyMove.type, SPECIES_DATA[pMon.speciesId]?.type || ['노말']);
      const damage = Math.max(
        4,
        Math.floor((((eMon.level * 2) / 5 + 2) * enemyMove.power * (eMon.atk / pMon.def) * mult) / 5)
      );

      const nextPhp = Math.max(0, pMon.hp - damage);
      setPMon((prev) => ({ ...prev, hp: nextPhp }));

      if (nextPhp <= 0) {
        setDialogText(`${pMon.name}은(는) 쓰러졌다... 패배했다.`);
        setTimeout(() => onBattleEnd('lose'), 2200);
      } else {
        setIsPlayerTurn(true);
        setIsProcessing(false);
        setDialogText(`어떤 기술을 쓸까? (맞히면 기술 발동!)`);
      }
    }, 1200);
  };

  return (
    <div className="relative w-full max-w-[540px] aspect-[4/3] bg-slate-900 border-4 border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col select-none">
      {/* 1. 상단 캔버스 배틀 영역 */}
      <div className="relative flex-1 w-full bg-black">
        <canvas ref={canvasRef} width={500} height={320} className="w-full h-full object-contain" />

        {/* 상대 정보 HUD (좌상단) */}
        <div className="absolute top-3 left-3 bg-slate-900/90 border-2 border-slate-600 rounded-xl px-3 py-2 text-white text-xs w-48 shadow-lg">
          <div className="flex justify-between font-bold text-amber-300">
            <span>{eMon.name}</span>
            <span>Lv.{eMon.level}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold">HP</span>
            <div className="flex-1 bg-slate-800 h-2.5 rounded-full border border-slate-600 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  eMon.hp / eMon.maxHp > 0.5 ? 'bg-emerald-500' : eMon.hp / eMon.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(eMon.hp / eMon.maxHp) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-right text-slate-400 mt-0.5 font-mono">
            {eMon.hp} / {eMon.maxHp}
          </div>
        </div>

        {/* 내 정보 HUD (우하단) */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 border-2 border-emerald-600 rounded-xl px-3 py-2 text-white text-xs w-52 shadow-lg">
          <div className="flex justify-between font-bold text-emerald-300">
            <span>{pMon.name}</span>
            <span>Lv.{pMon.level}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold">HP</span>
            <div className="flex-1 bg-slate-800 h-2.5 rounded-full border border-slate-600 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  pMon.hp / pMon.maxHp > 0.5 ? 'bg-emerald-500' : pMon.hp / pMon.maxHp > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(pMon.hp / pMon.maxHp) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-right text-slate-400 mt-0.5 font-mono">
            {pMon.hp} / {pMon.maxHp}
          </div>
        </div>
      </div>

      {/* 2. 하단 텍스트 및 기술 선택 패널 */}
      <div className="h-36 bg-slate-800 border-t-4 border-slate-700 p-2 flex gap-2">
        {/* 대화 상자 */}
        <div className="flex-1 bg-slate-900 border-2 border-slate-600 rounded-xl p-3 text-xs text-white leading-relaxed font-game flex items-center justify-center text-center whitespace-pre-wrap">
          {dialogText}
        </div>

        {/* 기술 버튼 그리드 (2x2) */}
        <div className="w-56 grid grid-cols-2 gap-1.5">
          {pMon.moves.map((move) => (
            <button
              key={move.id}
              disabled={!isPlayerTurn || isProcessing || activeQuiz !== null}
              onClick={() => handleSelectMove(move)}
              className="bg-slate-700 hover:bg-indigo-600 disabled:opacity-40 border-2 border-slate-600 hover:border-indigo-400 rounded-xl p-1.5 flex flex-col justify-between text-left transition-colors active:scale-95"
            >
              <div className="text-[11px] font-bold text-white truncate">{move.name}</div>
              <div className="flex justify-between items-center text-[9px] text-slate-300">
                <span className="px-1 bg-slate-800 rounded font-semibold text-amber-300">{move.type}</span>
                <span className="font-mono">위력 {move.power || '-'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. 퀴즈 오버레이 모달 */}
      {activeQuiz && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-sm flex flex-col justify-between p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* 타이틀 및 단원 헤더 */}
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700">
              {activeQuiz.unitName}
            </span>
            <div className="flex items-center gap-1.5 font-bold font-mono">
              <span className="text-xs text-slate-400">남은 시간:</span>
              <span
                className={`text-sm px-2 py-0.5 rounded-lg border ${
                  quizTimer > 5 ? 'text-amber-300 border-amber-600 bg-amber-950/50' : 'text-red-400 border-red-600 bg-red-950/70 animate-pulse'
                }`}
              >
                {quizTimer}초
              </span>
            </div>
          </div>

          {/* 문제 내용 및 SVG 도형 */}
          <div className="my-auto py-2 text-center">
            <p className="text-sm md:text-base font-bold text-white leading-relaxed px-2 font-game">
              {activeQuiz.question}
            </p>
            {activeQuiz.svgFigure && (
              <div
                dangerouslySetInnerHTML={{ __html: activeQuiz.svgFigure }}
                className="flex justify-center items-center"
              />
            )}
          </div>

          {/* 4지선다 보기 버튼 */}
          <div className="grid grid-cols-2 gap-2">
            {activeQuiz.options.map((opt, idx) => {
              let btnClass = 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700';
              if (quizAnswered) {
                if (idx === activeQuiz.answerIndex) {
                  btnClass = 'bg-emerald-600 border-emerald-400 text-white animate-bounce';
                } else if (idx === selectedOption) {
                  btnClass = 'bg-rose-700 border-rose-500 text-white';
                } else {
                  btnClass = 'bg-slate-800/40 border-slate-700 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={quizAnswered}
                  onClick={() => handleQuizAnswer(idx)}
                  className={`border-2 rounded-xl py-2.5 px-3 text-xs md:text-sm font-bold text-center transition-all ${btnClass}`}
                >
                  <span className="text-amber-400 mr-1.5 font-mono">[{idx + 1}]</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

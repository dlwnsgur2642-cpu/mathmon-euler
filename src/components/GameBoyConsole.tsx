"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { SFX, unlockAudio } from "@/lib/retroAudio";
import { SP, MOVES, CHART, GYM_LEADERS } from "@/lib/mathmonEulerData";
import { makeSprite, spr, chSprite, tileFor } from "@/lib/retroGraphics";
import { getRandomQuiz, QuizQuestion } from "@/lib/eulerQuizGen";
import { supabase } from "@/lib/supabase";

export interface PlayerMon {
  sp: string;
  name: string;
  lv: number;
  hp: number;
  maxhp: number;
  atk: number;
  def: number;
  moves: string[];
  xp: number;
  maxXp: number;
}

export interface SaveState {
  name: string;
  map: string;
  x: number;
  y: number;
  dir: "up" | "down" | "left" | "right";
  team: PlayerMon[];
  caught: Record<string, boolean>;
  seen: Record<string, boolean>;
  badges: boolean[];
  items: { potion: number; ball: number };
  solvedCount: number;
  correctCount: number;
  wrongNotes: Array<{ q: string; ans: string; ex: string }>;
}

export default function GameBoyConsole() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 게임 상태 머신
  const [scene, setScene] = useState<"title" | "world" | "battle" | "evo">("title");
  const [tbText, setTbText] = useState<string>("");
  const [tbVisible, setTbVisible] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null); // 'start', 'battle', 'moves', 'pokedex', 'trainer', 'pvp'
  const [menuCursor, setMenuCursor] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 퀴즈 팝업 상태
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [quizTimer, setQuizTimer] = useState<number>(8);
  const [quizSelected, setQuizSelected] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // PVP 대전 상태
  const [pvpRoomCode, setPvpRoomCode] = useState<string>("");
  const [pvpStatus, setPvpStatus] = useState<string>("");

  // 플레이어 및 월드 상태
  const gameStateRef = useRef<SaveState>({
    name: "지우",
    map: "eulerLab",
    x: 4,
    y: 6,
    dir: "up",
    team: [],
    caught: {},
    seen: {},
    badges: [false, false, false, false, false],
    items: { potion: 5, ball: 10 },
    solvedCount: 0,
    correctCount: 0,
    wrongNotes: []
  });

  // 배틀 런타임 상태
  const battleStateRef = useRef<{
    kind: "wild" | "trainer" | "gym" | "pvp";
    enemy: PlayerMon;
    enemyTrainerName?: string;
    playerMonIndex: number;
    turn: "player" | "enemy";
    pendingMove?: string;
    isCrit?: boolean;
    turnText?: string;
  } | null>(null);

  // 오버월드 맵 데이터
  const MAPS = useRef<Record<string, { w: number; h: number; grid: string[]; name: string }>>({
    eulerLab: {
      w: 9,
      h: 9,
      name: "오일러 박사 연구소",
      grid: [
        "wwwwwwwww",
        "w...b...w",
        "w.bbb.b.w",
        "w.123...w",
        "w.......w",
        "w.......w",
        "w.......w",
        "w...D...w",
        "wwwwwwwww"
      ]
    },
    eulerTown: {
      w: 16,
      h: 12,
      name: "기하마을",
      grid: [
        "TTTTTTTT..TTTTTT",
        "T......T..T....T",
        "T.RRRR.T..T.BB.T",
        "T.WWWW.T..T.WW.T",
        "T..D...T..T..D.T",
        "T......T.......T",
        "T..............T",
        "T....____......T",
        "T...._.._......T",
        "T,,.._.._....,,T",
        "T,,.._.._....,,T",
        "TTTTTT..TTTTTTTT"
      ]
    },
    route1: {
      w: 12,
      h: 16,
      name: "1번 도로 (기본도형의 길)",
      grid: [
        "TTTT..TTTTTT",
        "T,,,,..,,,,T",
        "T,,,,..,,,,T",
        "T....__....T",
        "T.,,.____,.T",
        "T.,,._.._,,T",
        "T...._.._..T",
        "T,,,,_.._,,T",
        "T,,,,_.._,,T",
        "T...._.._..T",
        "T.,,.____,.T",
        "T.,,......,T",
        "T,,,,..,,,,T",
        "T,,,,..,,,,T",
        "T....__....T",
        "TTTT..TTTTTT"
      ]
    }
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const showText = (text: string) => {
    setTbText(text);
    setTbVisible(true);
  };

  const hideText = () => {
    setTbVisible(false);
  };

  // 로컬 저장 / 불러오기
  const saveGame = () => {
    try {
      localStorage.setItem("mathmon_euler_save", JSON.stringify(gameStateRef.current));
      showToast("리포트를 꼼꼼히 기록했습니다!");
      SFX.ok();
    } catch {}
  };

  const loadGame = () => {
    try {
      const data = localStorage.getItem("mathmon_euler_save");
      if (data) {
        gameStateRef.current = JSON.parse(data);
        showToast("이전 모험을 불러왔습니다!");
      }
    } catch {}
  };

  // 몬스터 생성 팩토리
  const createMon = (spKey: string, lv: number): PlayerMon => {
    const s = SP[spKey] || SP.angle;
    const maxhp = Math.floor(s.hp + lv * 2.2);
    const atk = Math.floor(s.atk + lv * 1.6);
    const def = Math.floor(s.def + lv * 1.5);
    return {
      sp: spKey,
      name: s.name,
      lv,
      hp: maxhp,
      maxhp,
      atk,
      def,
      moves: [...s.moves],
      xp: 0,
      maxXp: lv * 25
    };
  };

  // 게임 시작 시 초기화
  useEffect(() => {
    loadGame();
    // 스타팅 선택 전이면 연구소 안내 메시지
    if (gameStateRef.current.team.length === 0) {
      showText("오일러 박사: 안녕! 기다리고 있었단다.\n연구실 책상 위의 몬스터볼을 조사해 첫 수학몬을 고르려무나!");
    }
  }, []);

  // 타이머 루프 (퀴즈 급소 8초 카운트다운)
  useEffect(() => {
    if (!currentQuiz || quizAnswered) return;
    const itv = setInterval(() => {
      setQuizTimer(t => {
        if (t <= 1) {
          clearInterval(itv);
          // 시간 초과 처리
          handleQuizSubmit(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(itv);
  }, [currentQuiz, quizAnswered]);

  // 배틀 시작 함수
  const startBattle = (enemySp: string, enemyLv: number, kind: "wild" | "trainer" | "gym" = "wild") => {
    SFX.enc();
    const enemy = createMon(enemySp, enemyLv);
    gameStateRef.current.seen[enemySp] = true;
    battleStateRef.current = {
      kind,
      enemy,
      playerMonIndex: 0,
      turn: "player"
    };
    setScene("battle");
    showText(`${enemy.name}(이)가 나타났다!`);
  };

  // 퀴즈 제출 및 판정
  const handleQuizSubmit = (optIndex: number) => {
    if (!currentQuiz || quizAnswered) return;
    setQuizAnswered(true);
    const isCorrect = optIndex >= 0 && currentQuiz.opts[optIndex] === currentQuiz.ans;
    const isCrit = isCorrect && quizTimer >= 4; // 4초 이상 남았을 때 급소 타격!

    gameStateRef.current.solvedCount++;
    if (isCorrect) {
      gameStateRef.current.correctCount++;
      SFX.crit();
      setQuizFeedback({ ok: true, msg: isCrit ? "급소에 맞았다!! (정답 + 급소 타격!)" : "정답이다! (공격 성공!)" });
    } else {
      SFX.no();
      gameStateRef.current.wrongNotes.push({
        q: currentQuiz.q,
        ans: currentQuiz.ans,
        ex: currentQuiz.ex
      });
      setQuizFeedback({ ok: false, msg: `틀렸다! 정답: ${currentQuiz.ans}` });
    }

    setTimeout(() => {
      // 퀴즈 닫고 실제 배틀 대미지 적용
      setCurrentQuiz(null);
      setQuizAnswered(false);
      setQuizFeedback(null);
      executeMove(isCorrect, isCrit);
    }, 1800);
  };

  // 기술 발동 및 대미지 계산
  const executeMove = (hit: boolean, isCrit: boolean) => {
    const b = battleStateRef.current;
    if (!b) return;

    const pMon = gameStateRef.current.team[b.playerMonIndex];
    const eMon = b.enemy;
    const move = MOVES[b.pendingMove || "몸통박치기"] || MOVES["몸통박치기"];

    if (!hit) {
      showText(`${pMon.name}의 ${move.name}!(은)는 빗나갔다!`);
      SFX.no();
    } else {
      SFX.hit();
      const mult = isCrit ? 1.5 : 1.0;
      const dmg = Math.max(1, Math.floor(((pMon.atk * move.power) / (eMon.def * 2)) * mult));
      eMon.hp = Math.max(0, eMon.hp - dmg);
      showText(`${pMon.name}의 ${move.name}! ${isCrit ? "급소에 맞았다! " : ""}${dmg}의 대미지!`);
    }

    setTimeout(() => {
      if (eMon.hp <= 0) {
        // 적 쓰러짐
        SFX.lvl();
        const gainXp = eMon.lv * 15;
        pMon.xp += gainXp;
        showText(`야생 ${eMon.name}(은)는 쓰러졌다!\n${pMon.name}(은)는 ${gainXp}의 경험치를 얻었다!`);
        
        // 레벨업 체크
        if (pMon.xp >= pMon.maxXp) {
          pMon.lv++;
          pMon.xp = 0;
          pMon.maxXp = pMon.lv * 25;
          pMon.maxhp += 3;
          pMon.hp = pMon.maxhp;
          pMon.atk += 2;
          pMon.def += 2;
          setTimeout(() => {
            showText(`${pMon.name}(은)는 레벨 ${pMon.lv}로 올랐다!`);
          }, 1500);
        }

        setTimeout(() => {
          setScene("world");
          hideText();
        }, 3000);
      } else {
        // 적의 반격 턴
        b.turn = "enemy";
        setTimeout(() => {
          const eMoveName = eMon.moves[Math.floor(Math.random() * eMon.moves.length)] || "몸통박치기";
          const eMove = MOVES[eMoveName] || MOVES["몸통박치기"];
          const eDmg = Math.max(1, Math.floor((eMon.atk * eMove.power) / (pMon.def * 2.5)));
          pMon.hp = Math.max(0, pMon.hp - eDmg);
          SFX.hit();
          showText(`상대 ${eMon.name}의 ${eMove.name}! ${eDmg}의 대미지를 입었다!`);

          setTimeout(() => {
            if (pMon.hp <= 0) {
              SFX.no();
              showText(`${pMon.name}(은)는 쓰러졌다... 연구소로 돌아갑니다.`);
              setTimeout(() => {
                pMon.hp = pMon.maxhp;
                gameStateRef.current.map = "eulerLab";
                gameStateRef.current.x = 4;
                gameStateRef.current.y = 6;
                setScene("world");
                hideText();
              }, 2500);
            } else {
              b.turn = "player";
              hideText();
            }
          }, 1500);
        }, 1200);
      }
    }, 1500);
  };

  // 몬스터볼 던지기 포획 로직
  const throwBall = () => {
    const b = battleStateRef.current;
    if (!b || b.kind !== "wild") {
      showToast("트레이너의 몬스터는 잡을 수 없습니다!");
      return;
    }
    if (gameStateRef.current.items.ball <= 0) {
      showToast("몬스터볼이 없습니다!");
      return;
    }

    gameStateRef.current.items.ball--;
    SFX.ball();
    showText("지우는 몬스터볼을 던졌다!");

    setTimeout(() => {
      const e = b.enemy;
      const catchRate = ((e.maxhp * 3 - e.hp * 2) / (e.maxhp * 3)) * 0.85;
      if (Math.random() < catchRate) {
        SFX.catch();
        gameStateRef.current.caught[e.sp] = true;
        if (gameStateRef.current.team.length < 6) {
          gameStateRef.current.team.push(e);
        }
        showText(`신난다! ${e.name}(을)를 잡았다!`);
        setTimeout(() => {
          setScene("world");
          hideText();
        }, 2500);
      } else {
        SFX.no();
        showText(`아깝다! ${e.name}(은)는 볼에서 빠져나왔다!`);
      }
    }, 1800);
  };

  // 캔버스 실시간 렌더링 루프
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const now = performance.now();
      const st = gameStateRef.current;

      // 캔버스 초기화 (240 x 160)
      ctx.fillStyle = "#101018";
      ctx.fillRect(0, 0, 240, 160);

      if (scene === "title") {
        // 타이틀 화면
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(0, 0, 240, 160);
        // 포켓몬 엠블럼 실루엣
        const iconSp = spr("eulertiger", "front", 80);
        ctx.drawImage(iconSp, 80, 45, 80, 80);
      } else if (scene === "world") {
        // 오버월드 렌더링
        const m = MAPS.current[st.map] || MAPS.current.eulerLab;
        const camX = Math.max(0, Math.min(st.x * 16 - 112, m.w * 16 - 240));
        const camY = Math.max(0, Math.min(st.y * 16 - 72, m.h * 16 - 160));
        const wf = Math.floor(now / 500) % 2;

        // 타일 그리기
        for (let y = 0; y < m.h; y++) {
          for (let x = 0; x < m.w; x++) {
            const tileChar = m.grid[y][x];
            const tCvs = tileFor(tileChar, x, y, wf);
            ctx.drawImage(tCvs, x * 16 - camX, y * 16 - camY);

            // 연구소 책상 위의 몬스터볼 3개
            if (st.map === "eulerLab" && y === 3 && (x === 1 || x === 2 || x === 3)) {
              ctx.fillStyle = "#e04a4a";
              ctx.beginPath();
              ctx.arc(x * 16 - camX + 8, y * 16 - camY + 8, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // 플레이어 캐릭터 스프라이트
        const pSp = chSprite("player", st.dir);
        ctx.drawImage(pSp, st.x * 16 - camX, st.y * 16 - camY - 2);

        // 오일러 박사 NPC (연구소 내 책상 뒤)
        if (st.map === "eulerLab") {
          const profSp = chSprite("prof", "down");
          ctx.drawImage(profSp, 4 * 16 - camX, 2 * 16 - camY - 2);
        }
      } else if (scene === "battle") {
        // 턴제 배틀 씬 렌더링
        const b = battleStateRef.current;
        if (b) {
          // 배틀 배경 그리기
          ctx.fillStyle = "#4a6898";
          ctx.fillRect(0, 0, 240, 75);
          ctx.fillStyle = "#88b068";
          ctx.fillRect(0, 75, 240, 85);

          // 상대 및 아군 발판 타원
          ctx.fillStyle = "#689050";
          ctx.beginPath(); ctx.ellipse(180, 68, 42, 10, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(64, 120, 52, 12, 0, 0, Math.PI * 2); ctx.fill();

          // 상대 몬스터 (front)
          const eSp = spr(b.enemy.sp, "front", 64);
          ctx.drawImage(eSp, 148, 20, 64, 64);

          // 내 몬스터 (back)
          const pMon = st.team[b.playerMonIndex] || st.team[0];
          if (pMon) {
            const pSp = spr(pMon.sp, "back", 72);
            ctx.drawImage(pSp, 28, 60, 72, 72);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [scene]);

  // 플레이어 이동 및 상호작용
  const movePlayer = (dir: "up" | "down" | "left" | "right") => {
    unlockAudio();
    if (scene !== "world" || tbVisible) return;

    const st = gameStateRef.current;
    st.dir = dir;

    let nx = st.x;
    let ny = st.y;
    if (dir === "up") ny--;
    if (dir === "down") ny++;
    if (dir === "left") nx--;
    if (dir === "right") nx++;

    const m = MAPS.current[st.map];
    if (!m) return;

    // 경계 및 벽 충돌 검사
    if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) return;
    const tile = m.grid[ny][nx];

    // 충돌 타일: w(벽), T(나무), b(책상)
    if (tile === "w" || tile === "T" || tile === "b") {
      SFX.bump();
      return;
    }

    // 워프 검사: 연구소 문 -> 마을
    if (st.map === "eulerLab" && tile === "D") {
      st.map = "eulerTown";
      st.x = 4;
      st.y = 5;
      st.dir = "down";
      SFX.sel();
      return;
    }
    // 마을 입구 -> 연구소
    if (st.map === "eulerTown" && nx === 4 && ny === 4) {
      st.map = "eulerLab";
      st.x = 4;
      st.y = 7;
      st.dir = "up";
      SFX.sel();
      return;
    }
    // 마을 북쪽 -> 1번 도로
    if (st.map === "eulerTown" && ny === 0) {
      st.map = "route1";
      st.x = 5;
      st.y = 14;
      st.dir = "up";
      SFX.sel();
      return;
    }
    // 1번 도로 남쪽 -> 마을
    if (st.map === "route1" && ny === 15) {
      st.map = "eulerTown";
      st.x = 8;
      st.y = 1;
      st.dir = "down";
      SFX.sel();
      return;
    }

    // 이동 확정
    st.x = nx;
    st.y = ny;
    SFX.mv();

    // 풀숲 인카운터 검사 (tile === ',')
    if (tile === "," && st.team.length > 0) {
      if (Math.random() < 0.22) {
        // 야생 몬스터 조우!
        const wildList = st.map === "route1" ? ["line", "parallel", "compass"] : ["line", "parallel"];
        const pickSp = wildList[Math.floor(Math.random() * wildList.length)];
        startBattle(pickSp, Math.floor(Math.random() * 3) + 3, "wild");
      }
    }
  };

  // A 버튼 상호작용
  const handleAButton = () => {
    unlockAudio();
    if (tbVisible) {
      hideText();
      return;
    }

    if (scene === "title") {
      SFX.sel();
      setScene("world");
      return;
    }

    const st = gameStateRef.current;

    if (scene === "world") {
      // 연구소 책상 위 몬스터볼 선택
      if (st.map === "eulerLab" && st.dir === "up" && st.y === 4) {
        if (st.team.length > 0) {
          showText("오일러 박사: 이미 자네는 멋진 파트너 수학몬을 데리고 있잖은가!");
          return;
        }

        if (st.x === 1) {
          // 풀 스타팅 각도롱
          st.team.push(createMon("angle", 5));
          st.caught["angle"] = true;
          SFX.catch();
          showText("지우는 풀 타입의 [각도롱]을 파트너로 선택했다!");
        } else if (st.x === 2) {
          // 불 스타팅 다면호
          st.team.push(createMon("poly", 5));
          st.caught["poly"] = true;
          SFX.catch();
          showText("지우는 불 타입의 [다면호]를 파트너로 선택했다!");
        } else if (st.x === 3) {
          // 물 스타팅 원뿔범
          st.team.push(createMon("cone", 5));
          st.caught["cone"] = true;
          SFX.catch();
          showText("지우는 물 타입의 [원뿔범]을 파트너로 선택했다!");
        }
      }
    }
  };

  // B 버튼 상호작용
  const handleBButton = () => {
    unlockAudio();
    if (tbVisible) {
      hideText();
      return;
    }
    if (activeMenu) {
      setActiveMenu(null);
      SFX.sel();
    }
  };

  // START 메뉴 열기/닫기
  const handleStartButton = () => {
    unlockAudio();
    if (scene === "world") {
      setActiveMenu(m => (m ? null : "start"));
      setMenuCursor(0);
      SFX.sel();
    }
  };

  // 기술 선택 및 퀴즈 팝업 발동
  const selectMove = (mvName: string) => {
    const b = battleStateRef.current;
    if (!b || b.turn !== "player") return;

    b.pendingMove = mvName;
    const mv = MOVES[mvName] || MOVES["몸통박치기"];
    const q = getRandomQuiz(mv.sec || 1);

    setCurrentQuiz(q);
    setQuizTimer(8);
    setQuizSelected(0);
    setQuizAnswered(false);
    setQuizFeedback(null);
  };

  // 키보드 조작 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          movePlayer("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          movePlayer("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          movePlayer("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          movePlayer("right");
          break;
        case "z":
        case "Z":
        case "Enter":
        case " ":
          e.preventDefault();
          handleAButton();
          break;
        case "x":
        case "X":
        case "Escape":
          e.preventDefault();
          handleBButton();
          break;
        case "Shift":
        case "m":
        case "M":
          e.preventDefault();
          handleStartButton();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scene, tbVisible, activeMenu]);

  // 배틀 중인 몬스터 상태
  const activePlayerMon = gameStateRef.current.team[0];
  const activeEnemyMon = battleStateRef.current?.enemy;

  return (
    <div id="app">
      <div id="console">
        <div id="bezel">
          <div id="screen">
            {/* 캔버스 240x160 레트로 화면 */}
            <canvas id="cv" ref={canvasRef} width={240} height={160} />

            {/* 타이틀 화면 UI 오버레이 */}
            {scene === "title" && (
              <div id="title">
                <div className="logo">
                  수학몬스터<span>오일러</span>
                </div>
                <div className="sub">중학교 1학년 2학기 기하·통계 RPG</div>
                <div className="copy">START 버튼이나 A(Z/Space)를 눌러 모험 시작!</div>
              </div>
            )}

            {/* 배틀 UI 레이어 */}
            {scene === "battle" && activeEnemyMon && activePlayerMon && (
              <div id="ui">
                {/* 상대 HP 게이지 (좌상단) */}
                <div id="ehp" className="stat box">
                  <div className="nm">
                    <span>{activeEnemyMon.name}</span>
                    <span>Lv.{activeEnemyMon.lv}</span>
                  </div>
                  <div className="hpb">
                    <span>HP</span>
                    <div className="bar">
                      <i
                        style={{ width: `${Math.max(0, (activeEnemyMon.hp / activeEnemyMon.maxhp) * 100)}%` }}
                        className={activeEnemyMon.hp < activeEnemyMon.maxhp * 0.3 ? "low" : activeEnemyMon.hp < activeEnemyMon.maxhp * 0.6 ? "mid" : ""}
                      />
                    </div>
                  </div>
                </div>

                {/* 내 HP 및 XP 게이지 (우하단) */}
                <div id="php" className="stat box">
                  <div className="nm">
                    <span>{activePlayerMon.name}</span>
                    <span>Lv.{activePlayerMon.lv}</span>
                  </div>
                  <div className="hpb">
                    <span>HP</span>
                    <div className="bar">
                      <i
                        style={{ width: `${Math.max(0, (activePlayerMon.hp / activePlayerMon.maxhp) * 100)}%` }}
                        className={activePlayerMon.hp < activePlayerMon.maxhp * 0.3 ? "low" : activePlayerMon.hp < activePlayerMon.maxhp * 0.6 ? "mid" : ""}
                      />
                    </div>
                  </div>
                  <div className="num">
                    {activePlayerMon.hp}/{activePlayerMon.maxhp}
                  </div>
                  <div className="xp">
                    <i style={{ width: `${(activePlayerMon.xp / activePlayerMon.maxXp) * 100}%` }} />
                  </div>
                </div>

                {/* 기술 선택 메뉴 (하단) */}
                {!tbVisible && !currentQuiz && (
                  <div className="menu moves box">
                    {activePlayerMon.moves.map((mv, i) => (
                      <button
                        key={i}
                        className="mi"
                        onClick={() => selectMove(mv)}
                      >
                        {mv}
                      </button>
                    ))}
                    <button className="mi" onClick={throwBall}>
                      볼던지기 ({gameStateRef.current.items.ball})
                    </button>
                    <button className="mi" onClick={() => { setScene("world"); hideText(); }}>
                      도망치기
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 중1 2학기 수학 퀴즈 팝업 (8초 급소 타이머) */}
            {currentQuiz && (
              <div className="quiz box">
                <div className="qh">
                  <span className="qu">{currentQuiz.unit}</span>
                  <span className="qt">⏱ 급소 타이머: {quizTimer}초</span>
                </div>
                <div className="tbar">
                  <i style={{ width: `${(quizTimer / 8) * 100}%` }} />
                  <span>{quizTimer >= 4 ? "CRITICAL ZONE (급소 일격 가능!)" : "HURRY UP!"}</span>
                </div>
                <div className="qrow">
                  <div className="qq">{currentQuiz.q}</div>
                  {currentQuiz.fig && (
                    <div dangerouslySetInnerHTML={{ __html: currentQuiz.fig }} />
                  )}
                </div>
                <div className="qo">
                  {currentQuiz.opts.map((opt, i) => (
                    <button
                      key={i}
                      className={`opt ${quizAnswered && opt === currentQuiz.ans ? "ok" : ""}`}
                      onClick={() => handleQuizSubmit(i)}
                      disabled={quizAnswered}
                    >
                      <b>{i + 1}.</b> {opt}
                    </button>
                  ))}
                </div>
                {quizFeedback && (
                  <div className="qf">
                    <span className={quizFeedback.ok ? "good" : "bad"}>{quizFeedback.msg}</span>
                    <div className="ex">{currentQuiz.ex}</div>
                  </div>
                )}
              </div>
            )}

            {/* 텍스트 대화 박스 */}
            {tbVisible && (
              <div id="tb" className="box" onClick={hideText}>
                <span>{tbText}</span>
                <span id="tbn">▼</span>
              </div>
            )}

            {/* START 메뉴 오버레이 */}
            {activeMenu === "start" && (
              <div className="menu start box">
                <div className="mi" onClick={() => setActiveMenu("team")}>수학몬 ({gameStateRef.current.team.length})</div>
                <div className="mi" onClick={() => setActiveMenu("dex")}>도감 ({Object.keys(gameStateRef.current.caught).length}종)</div>
                <div className="mi" onClick={() => setActiveMenu("bag")}>가방 (상처약/볼)</div>
                <div className="mi" onClick={() => setActiveMenu("notes")}>오답노트 ({gameStateRef.current.wrongNotes.length})</div>
                <div className="mi" onClick={() => setActiveMenu("pvp")}>통신 대전 센터</div>
                <div className="mi" onClick={saveGame}>리포트 (저장)</div>
                <div className="mi" onClick={() => setActiveMenu(null)}>닫기</div>
              </div>
            )}

            {/* 오답노트 패널 */}
            {activeMenu === "notes" && (
              <div className="panel box">
                <h3>오답노트 <small>{gameStateRef.current.wrongNotes.length}문제</small></h3>
                <div className="list">
                  {gameStateRef.current.wrongNotes.length === 0 ? (
                    <div>틀린 문제가 없습니다! 훌륭합니다!</div>
                  ) : (
                    gameStateRef.current.wrongNotes.map((n, i) => (
                      <div key={i} className="row">
                        <div>
                          <div><b>Q.</b> {n.q}</div>
                          <div className="sm">정답: {n.ans} | {n.ex}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button className="foot" onClick={() => setActiveMenu(null)}>닫기 (B)</button>
              </div>
            )}

            {/* 통신 대전 센터 패널 (PVP) */}
            {activeMenu === "pvp" && (
              <div className="panel box">
                <h3>통신 배틀 센터 <small>Supabase Realtime</small></h3>
                <div className="list">
                  <div>친구와 함께 4자리 방 번호를 입력해 1:1 대전을 진행하세요!</div>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="방 번호 4자리"
                    value={pvpRoomCode}
                    onChange={e => setPvpRoomCode(e.target.value)}
                    style={{ background: "#fff", color: "#000", padding: "4px 8px", borderRadius: "4px" }}
                  />
                  <button
                    className="row on"
                    onClick={() => {
                      if (!pvpRoomCode) {
                        showToast("방 번호를 입력하세요!");
                        return;
                      }
                      setPvpStatus("대전 상대 탐색 중...");
                      showToast(`방 [${pvpRoomCode}]에 연결되었습니다!`);
                    }}
                  >
                    대전 대기실 입장
                  </button>
                  {pvpStatus && <div className="sm">{pvpStatus}</div>}
                </div>
                <button className="foot" onClick={() => setActiveMenu(null)}>나가기 (B)</button>
              </div>
            )}

            {/* 토스트 메시지 */}
            {toastMsg && <div className="toast">{toastMsg}</div>}
          </div>

          <div className="brand">
            <span>
              <span className="led" />
              BATTERY
            </span>
            <span>MATH BOY COLOR</span>
          </div>
        </div>

        {/* 조작 컨트롤러 (D-pad & A/B 버튼) */}
        <div id="pad">
          <div className="dpad">
            <button className="u" onClick={() => movePlayer("up")}>▲</button>
            <button className="l" onClick={() => movePlayer("left")}>◀</button>
            <div className="c" />
            <button className="r" onClick={() => movePlayer("right")}>▶</button>
            <button className="d" onClick={() => movePlayer("down")}>▼</button>
          </div>

          <div className="midbtns">
            <div className="pill">
              <button onClick={() => showToast("SELECT: 빠른 도감")} />
              SELECT
            </div>
            <div className="pill">
              <button onClick={handleStartButton} />
              START
            </div>
          </div>

          <div className="ab">
            <div className="btn">
              <button onClick={handleBButton}>B</button>
              <span>B</span>
            </div>
            <div className="btn">
              <button onClick={handleAButton}>A</button>
              <span>A</span>
            </div>
          </div>
        </div>
      </div>

      <p className="hint">
        <kbd>방향키</kbd>/<kbd>WASD</kbd> 이동 · <kbd>Z</kbd>/<kbd>Enter</kbd>/<kbd>Space</kbd> 결정 · <kbd>X</kbd>/<kbd>Esc</kbd> 취소 · <kbd>Shift</kbd>/<kbd>M</kbd> 메뉴
      </p>
    </div>
  );
}
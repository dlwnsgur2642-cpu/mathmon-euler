// 수학몬스터 오일러: 중1-2 수학 대모험 & PVP 타입 정의

export type ElementType = '노말' | '풀' | '불' | '물' | '전기' | '땅' | '비행' | '기하' | '입체' | '통계';

export interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number; // 0이면 변화기
  accuracy: number;
  pp: number;
  maxPp: number;
  description: string;
  effect?: 'heal' | 'atkUp' | 'defUp' | 'atkDown' | 'defDown' | 'paralyze' | 'burn' | 'sleep';
}

export interface MathmonSpecies {
  id: string;
  name: string;
  type: ElementType[];
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  learnset: { level: number; moveId: string }[];
  evo?: { level: number; toId: string };
  dexCategory: string;
  dexDesc: string;
  color: string;
  accentColor: string;
  spriteShape: string; // 캔버스 프로그래밍 렌더링용 형태 식별자
}

export interface MathmonInstance {
  instanceId: string;
  speciesId: string;
  name: string; // 별명 가능
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  moves: Move[];
  currentPp: { [moveId: string]: number };
  exp: number;
  expToNext: number;
  status?: 'par' | 'brn' | 'slp' | null;
  stageAtk: number;
  stageDef: number;
}

export interface QuizQuestion {
  id: string;
  unit: 1 | 2 | 3 | 4 | 5; // 중1-2 단원
  unitName: string;
  question: string;
  svgFigure?: string; // 기하 도형/그래프 인라인 SVG
  options: string[]; // 보기 4개
  answerIndex: number;
  explanation: string;
}

export interface PlayerSaveData {
  name: string;
  playTimeSeconds: number;
  badges: boolean[]; // 5개 체육관 배지
  party: MathmonInstance[];
  box: MathmonInstance[];
  seenIds: string[];
  caughtIds: string[];
  money: number;
  inventory: { [itemId: string]: number };
  savedAt: number;
}

export interface PvpRoomState {
  roomId: string;
  hostName: string;
  guestName?: string;
  hostParty: MathmonInstance[];
  guestParty?: MathmonInstance[];
  currentTurn: number;
  hostSelectedMove?: Move | null;
  guestSelectedMove?: Move | null;
  activeQuiz?: QuizQuestion | null;
  hostAnswerTime?: number | null; // 밀리초 (소요 시간)
  guestAnswerTime?: number | null;
  hostAnswerCorrect?: boolean | null;
  guestAnswerCorrect?: boolean | null;
  battleLog: string[];
  winner?: 'host' | 'guest' | null;
}

// 중학교 1학년 2학기 전 단원 수학 퀴즈 생성기 및 기하 SVG 도면 렌더러 (FG)

export interface QuizQuestion {
  sec: number; // 단원 번호 1~5
  unit: string;
  q: string;
  ans: string;
  opts: string[];
  ex: string;
  fig?: string; // SVG 도면 문자열
}

const R = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// SVG 도면 생성기
export const FG = {
  // 평행선과 엇각/동위각
  parallel(ang: number, xIsAlt = true) {
    const rad = (ang * Math.PI) / 180;
    const dx = Math.cos(rad) * 45;
    return `
      <svg viewBox="0 0 160 100" class="qfig">
        <line x1="10" y1="30" x2="150" y2="30" stroke="#26263a" stroke-width="2"/>
        <line x1="10" y1="70" x2="150" y2="70" stroke="#26263a" stroke-width="2"/>
        <line x1="${80 - dx}" y1="15" x2="${80 + dx}" y2="85" stroke="#d0345a" stroke-width="2"/>
        <text x="35" y="24" font-size="11" font-weight="bold" fill="#2a5ab0">l // m</text>
        <text x="92" y="26" font-size="11" font-weight="bold" fill="#26263a">${ang}°</text>
        <text x="${xIsAlt ? '62' : '92'}" y="66" font-size="12" font-weight="bold" fill="#d0345a">∠x</text>
      </svg>
    `;
  },

  // 맞꼭지각
  intersect(ang: number) {
    return `
      <svg viewBox="0 0 140 100" class="qfig">
        <line x1="15" y1="20" x2="125" y2="80" stroke="#26263a" stroke-width="2"/>
        <line x1="15" y1="80" x2="125" y2="20" stroke="#26263a" stroke-width="2"/>
        <text x="65" y="26" font-size="12" font-weight="bold" fill="#2a5ab0">${ang}°</text>
        <text x="65" y="82" font-size="12" font-weight="bold" fill="#d0345a">∠x</text>
      </svg>
    `;
  },

  // 부채꼴
  sector(r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    const x2 = 70 + Math.cos(rad) * 45;
    const y2 = 80 - Math.sin(rad) * 45;
    const sw = deg > 180 ? 1 : 0;
    return `
      <svg viewBox="0 0 140 100" class="qfig">
        <path d="M 70 80 L 115 80 A 45 45 0 ${sw} 0 ${x2} ${y2} Z" fill="#fffbe8" stroke="#26263a" stroke-width="2"/>
        <text x="90" y="93" font-size="11" font-weight="bold" fill="#2a5ab0">r=${r}</text>
        <text x="76" y="72" font-size="10" font-weight="bold" fill="#d0345a">${deg}°</text>
      </svg>
    `;
  },

  // 삼각형 합동 (SSS, SAS, ASA)
  congruent(type: 'SSS' | 'SAS' | 'ASA') {
    return `
      <svg viewBox="0 0 160 80" class="qfig">
        <polygon points="20,65 60,65 35,25" fill="#e8f4ff" stroke="#26263a" stroke-width="2"/>
        <polygon points="100,65 140,65 115,25" fill="#ffe8e8" stroke="#26263a" stroke-width="2"/>
        <text x="40" y="75" font-size="10" text-anchor="middle" font-weight="bold" fill="#2a5ab0">△ABC</text>
        <text x="120" y="75" font-size="10" text-anchor="middle" font-weight="bold" fill="#d0345a">△DEF</text>
        <text x="80" y="45" font-size="12" text-anchor="middle" font-weight="bold" fill="#7c3aed">≡ (${type})</text>
      </svg>
    `;
  }
};

function mk(sec: number, unit: string, q: string, a: string, ds: string[], ex: string, fig?: string): QuizQuestion {
  const opts = [a];
  for (const d of ds) {
    if (opts.length >= 4) break;
    if (d !== undefined && d !== null && !opts.includes(d)) opts.push(d);
  }
  return { sec, unit, q, ans: a, opts: shuffle(opts), ex, fig };
}

export const QUIZ_GEN: Record<number, (() => QuizQuestion)[]> = {
  // Ⅰ. 기본도형
  1: [
    () => {
      const a = R(35, 75);
      const x = 180 - a;
      return mk(1, '기본도형', `평각 180°에서 한 각의 크기가 ${a}°일 때, 그 보각 ∠x의 크기는?`, `${x}°`, [`${x - 10}°`, `${x + 10}°`, `${180 - a / 2}°`], `평각은 180°이므로 ∠x = 180° - ${a}° = ${x}°`);
    },
    () => {
      const a = R(40, 80);
      return mk(1, '기본도형', `두 직선이 한 점에서 만날 때 생기는 맞꼭지각의 크기는 서로 같다. 한 각이 ${a}°이면 마주보는 맞꼭지각 ∠x는?`, `${a}°`, [`${180 - a}°`, `${90 - a}°`, `${a + 20}°`], `맞꼭지각의 크기는 서로 같으므로 ∠x = ${a}°`, FG.intersect(a));
    },
    () => {
      const a = R(45, 85);
      return mk(1, '기본도형', `두 직선 l, m이 평행할 때, 엇각 ∠x의 크기는?`, `${a}°`, [`${180 - a}°`, `${a + 10}°`, `${90}°`], `평행선에서 엇각의 크기는 서로 같으므로 ∠x = ${a}°`, FG.parallel(a, true));
    },
    () => {
      const a = R(50, 80);
      const x = 180 - a;
      return mk(1, '기본도형', `두 평행선에서 동측내각의 크기의 합은 180°이다. 한 내각이 ${a}°일 때 다른 쪽 동측내각의 크기는?`, `${x}°`, [`${a}°`, `${x - 15}°`, `${90}°`], `평행선에서 동측내각의 합은 180°이므로 180° - ${a}° = ${x}°`);
    },
    () => {
      return mk(1, '기본도형', '공간에서 두 직선이 만나지도 않고 평행하지도 않은 위치 관계는?', '꼬인 위치', ['일치', '평행', '수직'], '공간에서 만나지도 않고 평행하지도 않은 두 직선의 위치 관계를 "꼬인 위치"에 있다고 합니다.');
    }
  ],

  // Ⅱ. 작도와 합동
  2: [
    () => {
      return mk(2, '작도와합동', '눈금 없는 자와 컴퍼스만을 사용하여 도형을 그리는 것을 무엇이라 하는가?', '작도', ['측정', '설계', '합동'], '눈금 없는 자(선분을 긋거나 연장)와 컴퍼스(원이나 길이를 옮김)로 도형을 그리는 것을 작도라고 합니다.');
    },
    () => {
      const a = R(4, 8), b = R(4, 8);
      const maxC = a + b - 1;
      return mk(2, '작도와합동', `삼각형의 세 변의 길이가 ${a}cm, ${b}cm, c cm일 때, 가장 긴 변 c가 될 수 있는 최대 자연수는?`, `${maxC}cm`, [`${a + b}cm`, `${a + b + 1}cm`, `${Math.abs(a - b) + 1}cm`], `가장 긴 변의 길이는 나머지 두 변의 길이의 합보다 작아야 하므로 c < ${a + b}, 즉 최대 ${maxC}cm`);
    },
    () => {
      const cond = pick(['세 쌍의 대응변의 길이가 각각 같을 때', '두 쌍의 대응변과 그 끼인각의 크기가 같을 때', '한 쌍의 대응변과 그 양 끝 각의 크기가 같을 때']);
      const ans = cond.includes('끼인각') ? 'SAS 합동' : cond.includes('양 끝') ? 'ASA 합동' : 'SSS 합동';
      return mk(2, '작도와합동', `두 삼각형에서 "${cond}" 성립하는 합동 조건은?`, ans, ['SSS 합동', 'SAS 합동', 'ASA 합동', 'RHS 합동'].filter(x => x !== ans), `대응 요소에 따라 SSS(세 변), SAS(두 변과 끼인각), ASA(한 변과 양 끝 각) 합동이 됩니다.`, FG.congruent(ans.slice(0, 3) as 'SSS' | 'SAS' | 'ASA'));
    },
    () => {
      return mk(2, '작도와합동', '다음 중 두 삼각형이 항상 합동이라고 할 수 없는 경우는?', '세 각의 크기가 각각 같을 때(AAA)', ['세 변의 길이가 각각 같을 때', '두 변의 길이와 그 끼인각이 같을 때', '한 변의 길이와 양 끝 각이 같을 때'], '세 각의 크기만 같은 경우(AAA)는 모양은 같지만 크기가 다를 수 있어(닮음) 합동이 아닙니다.');
    }
  ],

  // Ⅲ. 평면도형
  3: [
    () => {
      const n = R(5, 9);
      const ans = n - 3;
      return mk(3, '평면도형', `${n}각형의 한 꼭짓점에서 그을 수 있는 대각선의 개수는?`, `${ans}개`, [`${ans + 1}개`, `${ans - 1}개`, `${n}개`], `n각형의 한 꼭짓점에서 그을 수 있는 대각선의 개수는 (n - 3)개이므로 ${n} - 3 = ${ans}개`);
    },
    () => {
      const n = R(5, 8);
      const total = (n * (n - 3)) / 2;
      return mk(3, '평면도형', `${n}각형의 대각선의 총 개수는?`, `${total}개`, [`${total + 2}개`, `${total - 2}개`, `${n * 2}개`], `대각선의 총 개수는 n(n-3)/2 이므로 ${n}×${n - 3}/2 = ${total}개`);
    },
    () => {
      const n = R(5, 8);
      const sum = 180 * (n - 2);
      return mk(3, '평면도형', `${n}각형의 내각의 크기의 합은?`, `${sum}°`, [`${sum - 180}°`, `${sum + 180}°`, `${360}°`], `n각형의 내각의 크기의 합은 180° × (n - 2) = 180° × ${n - 2} = ${sum}°`);
    },
    () => {
      const r = R(3, 8) * 2;
      const deg = pick([60, 90, 120]);
      const l = (2 * r * deg) / 360;
      return mk(3, '평면도형', `반지름의 길이가 ${r}cm이고 중심각의 크기가 ${deg}°인 부채꼴의 호의 길이는?`, `${l}π cm`, [`${l * 2}π cm`, `${l / 2}π cm`, `${l + 2}π cm`], `호의 길이 l = 2πr × (x/360) = 2π × ${r} × (${deg}/360) = ${l}π cm`, FG.sector(r, deg));
    },
    () => {
      return mk(3, '평면도형', '모든 다각형의 외각의 크기의 총합은 몇 도(°)인가?', '360°', ['180°', '540°', '720°'], '어떤 다각형이든 외각의 크기의 총합은 항상 360°입니다.');
    }
  ],

  // Ⅳ. 입체도형과 오일러 공식
  4: [
    () => {
      // 오일러 다면체 공식: v - e + f = 2
      const solids = [
        { name: '정사면체', v: 4, e: 6, f: 4 },
        { name: '정육면체', v: 8, e: 12, f: 6 },
        { name: '정팔면체', v: 6, e: 12, f: 8 },
        { name: '정십이면체', v: 20, e: 30, f: 12 },
        { name: '정이십면체', v: 12, e: 30, f: 20 }
      ];
      const s = pick(solids);
      return mk(4, '입체도형', `오일러 공식(꼭짓점 v - 모서리 e + 면 f = 2)에서, ${s.name}의 꼭짓점 v=${s.v}, 면 f=${s.f}일 때 모서리 e의 개수는?`, `${s.e}개`, [`${s.e - 2}개`, `${s.e + 2}개`, `${s.v + s.f}개`], `오일러 다면체 공식 v - e + f = 2 에 대입하면 ${s.v} - e + ${s.f} = 2 이므로 e = ${s.e}`);
    },
    () => {
      return mk(4, '입체도형', '다면체 중에서 각 면이 모두 합동인 정다각형이고 각 꼭짓점에 모인 면의 개수가 같은 입체도형을 무엇이라 하는가?', '정다면체', ['각기둥', '각뿔', '회전체'], '각 면이 모두 합동인 정다각형이고 꼭짓점에 모인 면의 수가 같은 다면체를 정다면체라고 합니다.');
    },
    () => {
      return mk(4, '입체도형', '정다면체는 세상에 오직 몇 종류만 존재하는가?', '5종류', ['4종류', '6종류', '무수히 많다'], '정다면체는 정사면체, 정육면체, 정팔면체, 정십이면체, 정이십면체의 오직 5종류만 존재합니다.');
    },
    () => {
      const solids = [
        { name: '원기둥', shape: '직사각형' },
        { name: '원뿔', shape: '이등변삼각형' },
        { name: '구', shape: '원' },
        { name: '원뿔대', shape: '사다리꼴' }
      ];
      const s = pick(solids);
      return mk(4, '입체도형', `회전체인 [${s.name}]을 회전축을 포함하는 평면으로 자를 때 생기는 단면의 모양은?`, s.shape, ['원', '직사각형', '이등변삼각형', '사다리꼴'].filter(x => x !== s.shape), `${s.name}을 회전축을 포함하여 자른 단면은 선대칭도형인 ${s.shape}이 됩니다.`);
    }
  ],

  // Ⅴ. 통계 (자료의 정리와 해석)
  5: [
    () => {
      return mk(5, '통계', '어떤 도수분포표에서 모든 계급의 "상대도수의 총합"은 항상 얼마인가?', '1', ['10', '100', '도수 총합'], '상대도수는 (그 계급의 도수) / (전체 도수)이므로 모든 상대도수의 총합은 항상 1입니다.');
    },
    () => {
      const tot = pick([20, 25, 40, 50]);
      const cnt = pick([4, 5, 8, 10]);
      const rel = (cnt / tot).toFixed(2);
      return mk(5, '통계', `전체 학생 수가 ${tot}명이고, 어떤 계급의 학생 수가 ${cnt}명일 때 이 계급의 상대도수는?`, rel, [(cnt / tot + 0.05).toFixed(2), (cnt / tot - 0.05).toFixed(2), `${cnt}`], `상대도수 = 계급 도수 ÷ 총 도수 = ${cnt} ÷ ${tot} = ${rel}`);
    },
    () => {
      const min = R(10, 20) * 5;
      const step = 10;
      const val = min + step / 2;
      return mk(5, '통계', `계급이 "${min}점 이상 ${min + step}점 미만"일 때, 이 계급을 대표하는 계급값은?`, `${val}점`, [`${min}점`, `${min + step}점`, `${val + 5}점`], `계급값은 양 끝 값의 중앙값이므로 (${min} + ${min + step}) / 2 = ${val}점`);
    },
    () => {
      return mk(5, '통계', '히스토그램에서 각 직사각형의 넓이의 총합을 구하는 올바른 식은?', '(계급의 크기) × (도수의 총합)', ['(계급값) × (도수의 총합)', '(계급의 개수) × (전체 학생수)', '모든 계급값의 합'], '히스토그램 직사각형들의 가로는 모두 계급의 크기이므로 넓이의 합 = (계급의 크기) × (도수의 총합) 입니다.');
    }
  ]
};

export function getRandomQuiz(sec?: number): QuizQuestion {
  const s = sec && QUIZ_GEN[sec] ? sec : pick([1, 2, 3, 4, 5]);
  const genList = QUIZ_GEN[s];
  const gen = pick(genList);
  return gen();
}
import { QuizQuestion } from '@/types/game';

const R = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export function generateQuiz(targetUnit?: 1 | 2 | 3 | 4 | 5): QuizQuestion {
  const unit = targetUnit || (R(1, 5) as 1 | 2 | 3 | 4 | 5);

  switch (unit) {
    case 1:
      return generateUnit1Quiz();
    case 2:
      return generateUnit2Quiz();
    case 3:
      return generateUnit3Quiz();
    case 4:
      return generateUnit4Quiz();
    case 5:
    default:
      return generateUnit5Quiz();
  }
}

// Ⅰ. 기본 도형
function generateUnit1Quiz(): QuizQuestion {
  const type = R(1, 3);
  if (type === 1) {
    // 맞꼭지각 문제: (a*x + b)° = (c*x - d)°
    const x = R(15, 45);
    const a = R(2, 4);
    const c = a + R(1, 2);
    const d = R(5, 25);
    const b = (c - a) * x - d;
    const angle = a * x + b;

    const question = `두 직선이 만날 때 생기는 맞꼭지각의 크기가 각각 (${a}x + ${b})°와 (${c}x − ${d})°이다. x의 값은?`;
    const ans = `${x}`;
    const wrong = [x + 5, x - 5, x + 10].map(String);
    const options = shuffle([ans, ...wrong]);

    const svg = `
      <svg width="200" height="100" viewBox="0 0 200 100" class="mx-auto my-2">
        <line x1="20" y1="20" x2="180" y2="80" stroke="#f59e0b" stroke-width="3" />
        <line x1="20" y1="80" x2="180" y2="20" stroke="#f59e0b" stroke-width="3" />
        <text x="50" y="55" fill="#fef08a" font-size="11" font-weight="bold">(${a}x+${b})°</text>
        <text x="110" y="55" fill="#fef08a" font-size="11" font-weight="bold">(${c}x−${d})°</text>
      </svg>
    `;

    return {
      id: Math.random().toString(),
      unit: 1,
      unitName: 'Ⅰ. 기본 도형 (맞꼭지각)',
      question,
      svgFigure: svg,
      options,
      answerIndex: options.indexOf(ans),
      explanation: `맞꼭지각의 크기는 서로 같으므로 ${a}x + ${b} = ${c}x − ${d} 입니다. 이항하여 정리하면 (${c - a})x = ${b + d} 이므로 x = ${x} 입니다. (각도 = ${angle}°)`,
    };
  }

  if (type === 2) {
    // 평행선 엇각/동위각 문제
    const deg = pick([40, 50, 65, 75, 80]);
    const ans = `${180 - deg}°`;
    const wrong = [`${deg}°`, `${90 - deg}°`, `${180 - deg + 10}°`];
    const options = shuffle([ans, ...wrong]);

    const svg = `
      <svg width="220" height="110" viewBox="0 0 220 110" class="mx-auto my-2">
        <line x1="10" y1="25" x2="210" y2="25" stroke="#38bdf8" stroke-width="3" />
        <line x1="10" y1="85" x2="210" y2="85" stroke="#38bdf8" stroke-width="3" />
        <line x1="50" y1="10" x2="170" y2="100" stroke="#f472b6" stroke-width="3" />
        <text x="190" y="20" fill="#38bdf8" font-size="12">l</text>
        <text x="190" y="80" fill="#38bdf8" font-size="12">m</text>
        <text x="110" y="45" fill="#fef08a" font-size="12" font-weight="bold">${deg}°</text>
        <text x="80" y="80" fill="#f43f5e" font-size="13" font-weight="bold">∠x</text>
      </svg>
    `;

    return {
      id: Math.random().toString(),
      unit: 1,
      unitName: 'Ⅰ. 기본 도형 (평행선)',
      question: `두 직선 l과 m이 평행(l ∥ m)할 때, 각 ∠x의 크기는?`,
      svgFigure: svg,
      options,
      answerIndex: options.indexOf(ans),
      explanation: `l ∥ m 이므로 동위각에 의해 맞은편 각은 ${deg}°이며, 직선의 평각 180°에서 ${deg}°를 빼면 ∠x = ${180 - deg}° 입니다.`,
    };
  }

  // 선분의 중점
  const ab = R(6, 18) * 2;
  const am = ab / 2;
  const mn = am / 2;
  const question = `선분 AB의 길이가 ${ab} cm이고, 점 M은 선분 AB의 중점, 점 N은 선분 MB의 중점일 때, 선분 AN의 길이는?`;
  const ans = `${am + mn} cm`;
  const wrong = [`${am} cm`, `${mn * 2} cm`, `${ab - 2} cm`];
  const options = shuffle([ans, ...wrong]);

  return {
    id: Math.random().toString(),
    unit: 1,
    unitName: 'Ⅰ. 기본 도형 (선분의 중점)',
    question,
    options,
    answerIndex: options.indexOf(ans),
    explanation: `M은 AB의 중점이므로 AM = MB = ${am} cm입니다. N은 MB의 중점이므로 MN = NB = ${mn} cm입니다. 따라서 AN = AM + MN = ${am} + ${mn} = ${am + mn} cm 입니다.`,
  };
}

// Ⅱ. 작도와 합동
function generateUnit2Quiz(): QuizQuestion {
  const type = R(1, 2);
  if (type === 1) {
    // 삼각형의 결정 조건
    const correctTri = [
      '세 변의 길이가 5 cm, 6 cm, 9 cm일 때',
      '두 변의 길이가 4 cm, 7 cm이고 그 끼인각이 50°일 때',
      '한 변의 길이가 8 cm이고 그 양 끝 각이 40°, 60°일 때',
    ];
    const impossibleTri = [
      '세 변의 길이가 3 cm, 4 cm, 8 cm일 때 (가장 긴 변 ≥ 나머지 합)',
      '세 각의 크기가 40°, 60°, 80°일 때 (무수히 많은 삼각형)',
      '두 변의 길이가 5 cm, 9 cm이고 끼인각이 아닌 각이 30°일 때',
    ];

    const isAskPossible = Math.random() < 0.5;
    if (isAskPossible) {
      const ans = pick(correctTri);
      const wrong = shuffle(impossibleTri).slice(0, 3);
      const options = shuffle([ans, ...wrong]);
      return {
        id: Math.random().toString(),
        unit: 2,
        unitName: 'Ⅱ. 작도와 합동 (삼각형의 작도)',
        question: '다음 중 삼각형이 하나로 정해지는 조건으로 옳은 것은?',
        options,
        answerIndex: options.indexOf(ans),
        explanation: `정답: "${ans}". 삼각형이 하나로 정해지려면 (1) 세 변의 길이(가장 긴 변 < 나머지 두 변의 합), (2) 두 변과 그 끼인각, (3) 한 변과 그 양 끝 각이 주어져야 합니다.`,
      };
    } else {
      const ans = pick(impossibleTri);
      const wrong = shuffle(correctTri).slice(0, 3);
      const options = shuffle([ans, ...wrong]);
      return {
        id: Math.random().toString(),
        unit: 2,
        unitName: 'Ⅱ. 작도와 합동 (삼각형의 작도)',
        question: '다음 중 삼각형이 하나로 정해지지 않는 경우는?',
        options,
        answerIndex: options.indexOf(ans),
        explanation: `정답: "${ans}". 세 각만 주어지면 크기는 다르고 모양만 같은 삼각형이 무수히 많이 그려지며, 가장 긴 변이 나머지 두 변의 합보다 크거나 같으면 삼각형이 만들어지지 않습니다.`,
      };
    }
  }

  // 합동 조건
  const congTypes = [
    { name: 'SSS 합동', desc: '대응하는 세 변의 길이가 각각 같을 때' },
    { name: 'SAS 합동', desc: '대응하는 두 변의 길이가 각각 같고, 그 끼인각의 크기가 같을 때' },
    { name: 'ASA 합동', desc: '대응하는 한 변의 길이가 같고, 그 양 끝 각의 크기가 각각 같을 때' },
  ];
  const target = pick(congTypes);
  const options = shuffle(['SSS 합동', 'SAS 합동', 'ASA 합동', 'AAA 합동']);

  return {
    id: Math.random().toString(),
    unit: 2,
    unitName: 'Ⅱ. 작도와 합동 (삼각형의 합동)',
    question: `두 삼각형에서 "${target.desc}" 성립하는 합동 조건의 이름은?`,
    options,
    answerIndex: options.indexOf(target.name),
    explanation: `정답은 [${target.name}]입니다. S는 변(Side), A는 각(Angle)을 뜻합니다. (참고: AAA는 합동 조건이 아닙니다)`,
  };
}

// Ⅲ. 평면도형
function generateUnit3Quiz(): QuizQuestion {
  const type = R(1, 3);

  if (type === 1) {
    // 다각형의 내각의 합 또는 한 내각
    const n = pick([5, 6, 8, 10, 12]);
    const sum = 180 * (n - 2);
    const one = sum / n;
    const askOne = Math.random() < 0.5;

    if (askOne) {
      const ans = `${one}°`;
      const wrong = [`${one - 10}°`, `${one + 15}°`, `${360 / n}°`];
      const options = shuffle([ans, ...wrong]);
      return {
        id: Math.random().toString(),
        unit: 3,
        unitName: 'Ⅲ. 평면도형 (다각형의 내각)',
        question: `정${n}각형의 한 내각의 크기는?`,
        options,
        answerIndex: options.indexOf(ans),
        explanation: `n각형의 내각의 합은 180° × (${n} − 2) = ${sum}° 입니다. 정${n}각형은 모든 내각이 같으므로 ${sum}° ÷ ${n} = ${one}° 입니다. (또는 180° − 외각 ${360 / n}° = ${one}°)`,
      };
    } else {
      const ans = `${sum}°`;
      const wrong = [`${sum - 180}°`, `${sum + 180}°`, `${180 * n}°`];
      const options = shuffle([ans, ...wrong]);
      return {
        id: Math.random().toString(),
        unit: 3,
        unitName: 'Ⅲ. 평면도형 (다각형의 내각)',
        question: `${n}각형의 모든 내각의 크기의 합은?`,
        options,
        answerIndex: options.indexOf(ans),
        explanation: `n각형의 내각의 크기의 합은 180° × (n − 2) 입니다. 180° × (${n} − 2) = 180° × ${n - 2} = ${sum}° 입니다.`,
      };
    }
  }

  if (type === 2) {
    // 대각선의 총 개수
    const n = pick([6, 7, 8, 9, 10]);
    const count = (n * (n - 3)) / 2;
    const ans = `${count}개`;
    const wrong = [`${count - 2}개`, `${count + 3}개`, `${n * (n - 3)}개`];
    const options = shuffle([ans, ...wrong]);

    return {
      id: Math.random().toString(),
      unit: 3,
      unitName: 'Ⅲ. 평면도형 (대각선의 개수)',
      question: `${n}각형의 대각선의 총 개수는?`,
      options,
      answerIndex: options.indexOf(ans),
      explanation: `n각형의 대각선의 총 개수 공식은 n(n − 3) ÷ 2 입니다. 따라서 ${n} × (${n} − 3) ÷ 2 = ${n} × ${n - 3} ÷ 2 = ${count}개 입니다.`,
    };
  }

  // 부채꼴 호의 길이와 넓이
  const r = pick([6, 8, 12]);
  const angle = pick([45, 60, 90, 120]);
  const askArc = Math.random() < 0.5;

  if (askArc) {
    const arcCoeff = (2 * r * angle) / 360;
    const ans = `${arcCoeff}π cm`;
    const wrong = [`${arcCoeff * 2}π cm`, `${arcCoeff + 1}π cm`, `${r * 2} cm`];
    const options = shuffle([ans, ...wrong]);

    return {
      id: Math.random().toString(),
      unit: 3,
      unitName: 'Ⅲ. 평면도형 (부채꼴)',
      question: `반지름의 길이가 ${r} cm이고 중심각의 크기가 ${angle}°인 부채꼴의 호의 길이는?`,
      options,
      answerIndex: options.indexOf(ans),
      explanation: `호의 길이 l = 2πr × (x/360) = 2π × ${r} × (${angle}/360) = ${arcCoeff}π cm 입니다.`,
    };
  } else {
    const areaCoeff = (r * r * angle) / 360;
    const ans = `${areaCoeff}π cm²`;
    const wrong = [`${areaCoeff / 2}π cm²`, `${areaCoeff * 2}π cm²`, `${r * 2}π cm²`];
    const options = shuffle([ans, ...wrong]);

    return {
      id: Math.random().toString(),
      unit: 3,
      unitName: 'Ⅲ. 평면도형 (부채꼴의 넓이)',
      question: `반지름의 길이가 ${r} cm이고 중심각의 크기가 ${angle}°인 부채꼴의 넓이는?`,
      options,
      answerIndex: options.indexOf(ans),
      explanation: `부채꼴의 넓이 S = πr² × (x/360) = π × ${r * r} × (${angle}/360) = ${areaCoeff}π cm² 입니다.`,
    };
  }
}

// Ⅳ. 입체도형
function generateUnit4Quiz(): QuizQuestion {
  const type = R(1, 3);

  if (type === 1) {
    // 오일러 공식 (꼭짓점 v, 모서리 e, 면 f => v - e + f = 2)
    const n = pick([5, 6, 7, 8]); // n각기둥 또는 n각뿔
    const isPrism = Math.random() < 0.5;

    if (isPrism) {
      // n각기둥: V = 2n, E = 3n, F = n + 2
      const v = 2 * n;
      const e = 3 * n;
      const f = n + 2;
      const question = `${n}각기둥의 꼭짓점의 수를 v, 모서리의 수를 e, 면의 수를 f라 할 때, v − e + f의 값은?`;
      const ans = '2';
      const wrong = ['0', '1', `${n}`];
      const options = shuffle([ans, ...wrong]);

      return {
        id: Math.random().toString(),
        unit: 4,
        unitName: 'Ⅳ. 입체도형 (오일러 공식)',
        question,
        options,
        answerIndex: options.indexOf(ans),
        explanation: `오일러 다면체 정리에 의해 모든 다면체에서 (꼭짓점 v) − (모서리 e) + (면 f) = 2 가 항상 성립합니다. (${n}각기둥: v=${v}, e=${e}, f=${f} ➔ ${v} − ${e} + ${f} = 2)`,
      };
    } else {
      // n각뿔: V = n+1, E = 2n, F = n+1
      const v = n + 1;
      const e = 2 * n;
      const f = n + 1;
      const question = `${n}각뿔의 면의 수(f)와 꼭짓점의 수(v)의 합은?`;
      const ans = `${v + f}`;
      const wrong = [`${v + f - 2}`, `${e}`, `${v + f + 2}`];
      const options = shuffle([ans, ...wrong]);

      return {
        id: Math.random().toString(),
        unit: 4,
        unitName: 'Ⅳ. 입체도형 (다면체)',
        question,
        options,
        answerIndex: options.indexOf(ans),
        explanation: `${n}각뿔의 밑면은 1개, 옆면은 ${n}개이므로 면의 수 f = ${f}입니다. 꼭짓점의 수는 밑면 ${n}개 + 각뿔의 꼭짓점 1개 = ${v}입니다. 따라서 합은 ${v} + ${f} = ${v + f} 입니다.`,
      };
    }
  }

  if (type === 2) {
    // 정다면체 성질
    const polyList = [
      { name: '정사면체', face: '정삼각형', vertFaces: 3, faces: 4 },
      { name: '정육면체', face: '정사각형', vertFaces: 3, faces: 6 },
      { name: '정팔면체', face: '정삼각형', vertFaces: 4, faces: 8 },
      { name: '정십이면체', face: '정오각형', vertFaces: 3, faces: 12 },
      { name: '정이십면체', face: '정삼각형', vertFaces: 5, faces: 20 },
    ];
    const target = pick(polyList);
    const question = `면의 모양이 "${target.face}"이고 한 꼭짓점에 모인 면의 수가 ${target.vertFaces}개인 정다면체의 이름은?`;
    const ans = target.name;
    const wrong = shuffle(polyList.filter((p) => p.name !== ans).map((p) => p.name)).slice(0, 3);
    const options = shuffle([ans, ...wrong]);

    return {
      id: Math.random().toString(),
      unit: 4,
      unitName: 'Ⅳ. 입체도형 (정다면체)',
      question,
      options,
      answerIndex: options.indexOf(ans),
      explanation: `정답: [${target.name}]. 정다면체는 오직 5가지뿐이며, ${target.name}은(는) 면의 모양이 ${target.face}이고 한 꼭짓점에 ${target.vertFaces}개의 면이 모여 총 ${target.faces}개의 면을 가집니다.`,
    };
  }

  // 구의 겉넓이와 부피
  const r = pick([3, 6]);
  const askVolume = Math.random() < 0.5;
  if (askVolume) {
    const vol = (4 / 3) * (r * r * r);
    const ans = `${vol}π cm³`;
    const wrong = [`${vol / 2}π cm³`, `${4 * r * r}π cm³`, `${vol * 2}π cm³`];
    const options = shuffle([ans, ...wrong]);

    return {
      id: Math.random().toString(),
      unit: 4,
      unitName: 'Ⅳ. 입체도형 (구의 부피)',
      question: `반지름의 길이가 ${r} cm인 구의 부피는?`,
      options,
      answerIndex: options.indexOf(ans),
      explanation: `구의 부피 공식은 V = (4/3)πr³ 입니다. V = (4/3) × π × ${r}³ = (4/3) × ${r * r * r}π = ${vol}π cm³ 입니다.`,
    };
  } else {
    const area = 4 * r * r;
    const ans = `${area}π cm²`;
    const wrong = [`${area / 2}π cm²`, `${r * r}π cm²`, `${area + 12}π cm²`];
    const options = shuffle([ans, ...wrong]);

    return {
      id: Math.random().toString(),
      unit: 4,
      unitName: 'Ⅳ. 입체도형 (구의 겉넓이)',
      question: `반지름의 길이가 ${r} cm인 구의 겉넓이는?`,
      options,
      answerIndex: options.indexOf(ans),
      explanation: `구의 겉넓이 공식은 S = 4πr² 입니다. S = 4 × π × ${r}² = 4 × ${r * r}π = ${area}π cm² 입니다.`,
    };
  }
}

// Ⅴ. 통계 (자료의 정리와 해석)
function generateUnit5Quiz(): QuizQuestion {
  const type = R(1, 2);

  if (type === 1) {
    // 상대도수 계산
    const total = pick([20, 40, 50, 100]);
    const freq = pick([4, 8, 12, 15, 20]);
    const rel = freq / total;

    const ans = `${rel.toFixed(2)}`;
    const wrong = [`${(rel * 2).toFixed(2)}`, `${(rel + 0.1).toFixed(2)}`, `${(freq / 10).toFixed(2)}`];
    const options = shuffle([ans, ...wrong]);

    return {
      id: Math.random().toString(),
      unit: 5,
      unitName: 'Ⅴ. 통계 (상대도수)',
      question: `어떤 계급의 도수가 ${freq}명이고, 전체 도수의 총합이 ${total}명일 때, 이 계급의 상대도수는?`,
      options,
      answerIndex: options.indexOf(ans),
      explanation: `상대도수 = (그 계급의 도수) ÷ (도수의 총합) = ${freq} ÷ ${total} = ${rel.toFixed(2)} 입니다. (모든 계급의 상대도수의 총합은 항상 1입니다.)`,
    };
  }

  // 계급의 크기와 계급값
  const start = pick([60, 70, 80]);
  const size = pick([10, 5]);
  const end = start + size;
  const mid = (start + end) / 2;

  const ans = `${mid}점`;
  const wrong = [`${start}점`, `${end}점`, `${size}점`];
  const options = shuffle([ans, ...wrong]);

  return {
    id: Math.random().toString(),
    unit: 5,
    unitName: 'Ⅴ. 통계 (도수분포표)',
    question: `수학 점수가 "${start}점 이상 ${end}점 미만"인 계급의 계급값은?`,
    options,
    answerIndex: options.indexOf(ans),
    explanation: `계급값은 계급의 가운데 값이므로, (계급의 양 끝값의 합) ÷ 2 = (${start} + ${end}) ÷ 2 = ${mid}점 입니다.`,
  };
}

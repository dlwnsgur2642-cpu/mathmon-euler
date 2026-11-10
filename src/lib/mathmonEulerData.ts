export interface MathmonSpecies {
  name: string;
  art: string;
  type: string | [string, string];
  hp: number;
  atk: number;
  def: number;
  moves: string[];
  evo?: [number, string];
  dex: [string, number, number, string]; // [분류, 키(m), 몸무게(kg), 도감설명]
  big?: number;
}

export interface MoveData {
  name: string;
  type: string;
  power: number;
  pp: number;
  sec?: number; // 퀴즈 카테고리 (1: 기본도형, 2: 작도와합동, 3: 평면도형, 4: 입체도형, 5: 통계)
  eff?: string;
  charge?: boolean;
  struggle?: boolean;
}

export const SP: Record<string, MathmonSpecies> = {
  // --- 스타팅: 풀/기하 계통 ---
  angle: {
    name: '각도롱', art: 'angle', type: '풀', hp: 48, atk: 52, def: 46,
    moves: ['몸통박치기', '맞꼭지광선', '잎날가르기', '부채꼴바람'],
    evo: [16, 'fan'],
    dex: ['각도포켓몬', 0.6, 6.5, '맞꼭지각의 크기가 항상 같다는 성질을 이용해 정확한 광선을 쏜다.']
  },
  fan: {
    name: '부채도롱', art: 'fan', type: ['풀', '기하'], hp: 62, atk: 66, def: 58,
    moves: ['맞꼭지광선', '잎날가르기', '부채꼴바람', '중심각폭풍'],
    evo: [36, 'radon'],
    dex: ['부채꼴포켓몬', 1.2, 18.0, '꼬리의 부채꼴을 활짝 펴서 중심각 크기에 비례하는 거센 바람을 일으킨다.']
  },
  radon: {
    name: '호도룡', art: 'radon', big: 1.15, type: ['풀', '비행'], hp: 82, atk: 88, def: 76,
    moves: ['부채꼴바람', '중심각폭풍', '호의길이베기', '기하대폭풍'],
    dex: ['호룡포켓몬', 1.8, 85.0, '원둘레와 호의 곡선을 타고 창공을 가르는 전설적인 기하 수학몬.']
  },

  // --- 스타팅: 불/입체 계통 ---
  poly: {
    name: '다면호', art: 'poly', type: '불', hp: 46, atk: 56, def: 42,
    moves: ['몸통박치기', '불꽃세례', '꼭짓점찌르기', '오일러공식'],
    evo: [16, 'regpoly'],
    dex: ['다면체포켓몬', 0.5, 7.8, '꼭짓점과 모서리가 날카로운 아기 호랑이. 다면체 오일러 공식을 품고 있다.']
  },
  regpoly: {
    name: '정다면호', art: 'regpoly', type: ['불', '입체'], hp: 60, atk: 72, def: 54,
    moves: ['불꽃세례', '꼭짓점찌르기', '오일러공식', '정다면체화염'],
    evo: [36, 'eulertiger'],
    dex: ['정다면체포켓몬', 1.1, 25.0, '모든 면이 합동인 정다각형으로 둘러싸여 있으며 오일러 공식(v-e+f=2)의 화염을 뿜는다.']
  },
  eulertiger: {
    name: '오일러타이거', art: 'eulertiger', big: 1.2, type: ['불', '격투'], hp: 78, atk: 94, def: 70,
    moves: ['꼭짓점찌르기', '오일러공식', '정다면체화염', '오일러대폭발'],
    dex: ['오일러제왕', 1.9, 92.0, '오일러 박사의 이름을 이어받은 입체 수학의 화신. 불패의 위용을 자랑한다.']
  },

  // --- 스타팅: 물/회전체 계통 ---
  cone: {
    name: '원뿔범', art: 'cone', type: '물', hp: 52, atk: 48, def: 52,
    moves: ['몸통박치기', '물대포', '모선베기', '회전물보라'],
    evo: [16, 'rotseal'],
    dex: ['원뿔포켓몬', 0.5, 9.2, '직각삼각형이 한 변을 축으로 회전할 때 태어난 수학몬. 머리의 뿔로 파도를 가른다.']
  },
  rotseal: {
    name: '회전바다사자', art: 'rotseal', type: ['물', '회전체'], hp: 68, atk: 60, def: 65,
    moves: ['물대포', '모선베기', '회전물보라', '원기둥파도'],
    evo: [36, 'sphereking'],
    dex: ['회전체바다사자', 1.3, 35.0, '회전축을 품고 빠르게 회전하여 회전체 단면의 강력한 수압 공격을 펼친다.']
  },
  sphereking: {
    name: '구해왕', art: 'sphereking', big: 1.18, type: ['물', '얼음'], hp: 90, atk: 78, def: 85,
    moves: ['회전물보라', '구의단면베기', '절대구체웨이브', '하이드로회전'],
    dex: ['구체제왕', 2.1, 110.0, '어떤 방향으로 잘라도 단면이 항상 완벽한 원이 되는 구의 신비를 지닌 제왕.']
  },

  // --- 필드 몬스터: 기본도형 & 작도 ---
  line: {
    name: '직선이', art: 'line', type: '노말', hp: 42, atk: 45, def: 40,
    moves: ['몸통박치기', '선분자르기', '직선돌진', '두점거리빔'],
    evo: [14, 'ray'],
    dex: ['직선포켓몬', 0.3, 2.0, '양쪽으로 끝없이 뻗어나가는 성질이 있다.']
  },
  ray: {
    name: '반직선이', art: 'ray', type: '노말', hp: 58, atk: 64, def: 52,
    moves: ['선분자르기', '직선돌진', '두점거리빔', '무한직선포'],
    dex: ['반직선포켓몬', 0.8, 8.0, '한 점에서 시작해 한쪽 방향으로 무한히 직진한다.']
  },
  parallel: {
    name: '평행냥', art: 'parallel', type: '전기', hp: 45, atk: 55, def: 42,
    moves: ['할퀴기', '동위각스파크', '평행선전격', '엇각번개'],
    evo: [18, 'alter'],
    dex: ['평행포켓몬', 0.4, 5.0, '아무리 길게 뻗어도 결코 만나지 않는 두 평행선의 전기를 다룬다.']
  },
  alter: {
    name: '엇각표범', art: 'alter', type: ['전기', '기하'], hp: 65, atk: 80, def: 55,
    moves: ['동위각스파크', '평행선전격', '엇각번개', '동측내각볼트'],
    dex: ['엇각포켓몬', 1.2, 28.0, '평행선 사이를 Z자로 가로지르며 같은 크기의 엇각 번개를 내리친다.']
  },
  compass: {
    name: '작도개구리', art: 'compass', type: '독', hp: 50, atk: 48, def: 54,
    moves: ['거품', '컴퍼스찌르기', '눈금없는자베기', '합동점프'],
    evo: [20, 'congru'],
    dex: ['작도포켓몬', 0.5, 6.0, '컴퍼스 다리로 호를 그리며 정확하게 각과 선분을 복사한다.']
  },
  congru: {
    name: '합동두꺼비', art: 'congru', type: ['독', '물'], hp: 72, atk: 68, def: 78,
    moves: ['컴퍼스찌르기', '눈금없는자베기', '합동점프', 'SSS합동프레스'],
    dex: ['합동포켓몬', 1.3, 34.0, 'SSS, SAS, ASA 세 가지 조건으로 상대와 완벽히 겹쳐지는 합동 기술을 구사한다.']
  },

  // --- 통계 계통 ---
  histo: {
    name: '히스토북이', art: 'histo', type: '바위', hp: 55, atk: 45, def: 70,
    moves: ['몸통박치기', '줄기와잎치기', '도수기둥쌓기', '계급값가르기'],
    evo: [22, 'distrib'],
    dex: ['히스토그램포켓몬', 0.7, 22.0, '등에 직사각형 모양의 도수 기둥들을 쌓아 방어력을 극대화한다.']
  },
  distrib: {
    name: '도수분포거북', art: 'distrib', type: ['바위', '통계'], hp: 75, atk: 65, def: 95,
    moves: ['줄기와잎치기', '도수기둥쌓기', '계급값가르기', '도수다각형록'],
    dex: ['도수분포포켓몬', 1.5, 75.0, '도수분포다각형 껍질을 지녀 어떤 공격도 통계적으로 분산시킨다.']
  },
  freq: {
    name: '상대도수유령', art: 'freq', type: '고스트', hp: 44, atk: 62, def: 40,
    moves: ['핥기', '상대도수빔', '총합은1쇼크', '백분율커스'],
    evo: [25, 'percent'],
    dex: ['상대도수포켓몬', 0.6, 1.2, '전체 도수에 대한 비율로 나타나며 상대도수의 총합은 언제나 1이다.']
  },
  percent: {
    name: '백분율팬텀', art: 'percent', type: ['고스트', '통계'], hp: 65, atk: 86, def: 60,
    moves: ['상대도수빔', '총합은1쇼크', '백분율커스', '100퍼센트악몽'],
    dex: ['백분율포켓몬', 1.4, 3.5, '100%의 확률로 적의 통계적 맹점을 찌르는 강력한 고스트.']
  },

  // --- 5대 전설의 정다면체 ---
  tetra: {
    name: '정사면체새', art: 'tetra', big: 1.1, type: ['비행', '입체'], hp: 80, atk: 85, def: 75,
    moves: ['쪼기', '면4모서리6폭풍', '정삼각형에어', '사면체강타'],
    dex: ['정사면체수호신', 1.4, 40.0, '면 4개, 꼭짓점 4개, 모서리 6개로 이루어진 가장 단순하고 고귀한 입체수호새.']
  },
  cube: {
    name: '정육면체곰', art: 'cube', big: 1.15, type: ['땅', '입체'], hp: 95, atk: 90, def: 90,
    moves: ['할퀴기', '정사각형스퀘어', '면6모서리12지진', '큐브퀘이크'],
    dex: ['정육면체수호신', 2.0, 180.0, '면 6개, 꼭짓점 8개, 모서리 12개로 견고한 대지를 지키는 수호곰.']
  },
  octa: {
    name: '정팔면체돌', art: 'octa', big: 1.1, type: ['바위', '입체'], hp: 85, atk: 88, def: 98,
    moves: ['돌떨구기', '정삼각형8다이아', '꼭짓점6포격', '팔면체크러시'],
    dex: ['정팔면체수호신', 1.6, 120.0, '면 8개, 꼭짓점 6개, 모서리 12개로 반짝이는 결정의 정팔면체 수호신.']
  },
  dodeca: {
    name: '정십이면체용', art: 'dodeca', big: 1.25, type: ['드래곤', '입체'], hp: 95, atk: 105, def: 88,
    moves: ['용의숨결', '정오각형12배리어', '꼭짓점20드래곤', '십이면체브레스'],
    dex: ['정십이면체수호신', 2.5, 210.0, '정오각형 12개로 감싸인 신비로운 우주를 상징하는 전설의 용.']
  },
  icosa: {
    name: '정이십면체신', art: 'icosa', big: 1.3, type: ['에스퍼', '입체'], hp: 100, atk: 110, def: 100,
    moves: ['사이코키네시스', '정삼각형20광휘', '오일러궁극포', '이십면체빅뱅'],
    dex: ['정이십면체수호신', 2.8, 250.0, '면 20개, 꼭짓점 12개, 모서리 30개로 이루어진 기하와 입체 수학의 최고신.']
  }
};

export const MOVES: Record<string, MoveData> = {
  몸통박치기: { name: '몸통박치기', type: '노말', power: 40, pp: 35 },
  할퀴기: { name: '할퀴기', type: '노말', power: 40, pp: 30 },
  핥기: { name: '핥기', type: '고스트', power: 30, pp: 30 },
  거품: { name: '거품', type: '물', power: 40, pp: 30 },
  쪼기: { name: '쪼기', type: '비행', power: 35, pp: 35 },
  돌떨구기: { name: '돌떨구기', type: '바위', power: 50, pp: 15 },
  물대포: { name: '물대포', type: '물', power: 40, pp: 25 },
  불꽃세례: { name: '불꽃세례', type: '불', power: 40, pp: 25 },
  잎날가르기: { name: '잎날가르기', type: '풀', power: 55, pp: 25 },

  // 1단원: 기본도형 (sec: 1)
  맞꼭지광선: { name: '맞꼭지광선', type: '기하', power: 65, pp: 15, sec: 1 },
  선분자르기: { name: '선분자르기', type: '노말', power: 50, pp: 20, sec: 1 },
  직선돌진: { name: '직선돌진', type: '노말', power: 60, pp: 15, sec: 1 },
  두점거리빔: { name: '두점거리빔', type: '기하', power: 70, pp: 12, sec: 1 },
  동위각스파크: { name: '동위각스파크', type: '전기', power: 65, pp: 15, sec: 1 },
  평행선전격: { name: '평행선전격', type: '전기', power: 75, pp: 12, sec: 1 },
  엇각번개: { name: '엇각번개', type: '전기', power: 85, pp: 10, sec: 1 },
  동측내각볼트: { name: '동측내각볼트', type: '전기', power: 95, pp: 8, sec: 1 },

  // 2단원: 작도와 합동 (sec: 2)
  컴퍼스찌르기: { name: '컴퍼스찌르기', type: '독', power: 60, pp: 20, sec: 2 },
  눈금없는자베기: { name: '눈금없는자베기', type: '노말', power: 65, pp: 15, sec: 2 },
  합동점프: { name: '합동점프', type: '물', power: 70, pp: 12, sec: 2 },
  SSS합동프레스: { name: 'SSS합동프레스', type: '물', power: 90, pp: 10, sec: 2 },

  // 3단원: 평면도형 (sec: 3)
  부채꼴바람: { name: '부채꼴바람', type: '풀', power: 65, pp: 15, sec: 3 },
  중심각폭풍: { name: '중심각폭풍', type: '기하', power: 80, pp: 10, sec: 3 },
  호의길이베기: { name: '호의길이베기', type: '풀', power: 90, pp: 10, sec: 3 },
  기하대폭풍: { name: '기하대폭풍', type: '비행', power: 110, pp: 5, sec: 3 },

  // 4단원: 입체도형과 오일러 (sec: 4)
  꼭짓점찌르기: { name: '꼭짓점찌르기', type: '입체', power: 65, pp: 15, sec: 4 },
  오일러공식: { name: '오일러공식', type: '불', power: 85, pp: 10, sec: 4 },
  정다면체화염: { name: '정다면체화염', type: '불', power: 95, pp: 8, sec: 4 },
  오일러대폭발: { name: '오일러대폭발', type: '격투', power: 120, pp: 5, sec: 4 },
  모선베기: { name: '모선베기', type: '회전체', power: 65, pp: 15, sec: 4 },
  회전물보라: { name: '회전물보라', type: '물', power: 80, pp: 12, sec: 4 },
  원기둥파도: { name: '원기둥파도', type: '물', power: 90, pp: 10, sec: 4 },
  구의단면베기: { name: '구의단면베기', type: '얼음', power: 95, pp: 8, sec: 4 },
  절대구체웨이브: { name: '절대구체웨이브', type: '물', power: 115, pp: 5, sec: 4 },
  하이드로회전: { name: '하이드로회전', type: '회전체', power: 120, pp: 5, sec: 4 },

  // 5단원: 통계 (sec: 5)
  줄기와잎치기: { name: '줄기와잎치기', type: '통계', power: 55, pp: 20, sec: 5 },
  도수기둥쌓기: { name: '도수기둥쌓기', type: '바위', power: 65, pp: 15, sec: 5 },
  계급값가르기: { name: '계급값가르기', type: '바위', power: 75, pp: 12, sec: 5 },
  도수다각형록: { name: '도수다각형록', type: '통계', power: 95, pp: 8, sec: 5 },
  상대도수빔: { name: '상대도수빔', type: '고스트', power: 65, pp: 15, sec: 5 },
  총합은1쇼크: { name: '총합은1쇼크', type: '통계', power: 80, pp: 10, sec: 5 },
  백분율커스: { name: '백분율커스', type: '고스트', power: 90, pp: 10, sec: 5 },
  '100퍼센트악몽': { name: '100퍼센트악몽', type: '고스트', power: 110, pp: 5, sec: 5 },

  // 전설기
  면4모서리6폭풍: { name: '면4모서리6폭풍', type: '비행', power: 100, pp: 5, sec: 4 },
  정삼각형에어: { name: '정삼각형에어', type: '기하', power: 85, pp: 10, sec: 3 },
  사면체강타: { name: '사면체강타', type: '입체', power: 110, pp: 5, sec: 4 },
  정사각형스퀘어: { name: '정사각형스퀘어', type: '기하', power: 85, pp: 10, sec: 3 },
  면6모서리12지진: { name: '면6모서리12지진', type: '땅', power: 100, pp: 5, sec: 4 },
  큐브퀘이크: { name: '큐브퀘이크', type: '입체', power: 110, pp: 5, sec: 4 },
  돌떨구기8다이아: { name: '돌떨구기8다이아', type: '바위', power: 85, pp: 10, sec: 4 },
  꼭짓점6포격: { name: '꼭짓점6포격', type: '기하', power: 100, pp: 5, sec: 4 },
  팔면체크러시: { name: '팔면체크러시', type: '입체', power: 110, pp: 5, sec: 4 },
  용의숨결: { name: '용의숨결', type: '드래곤', power: 80, pp: 15 },
  정오각형12배리어: { name: '정오각형12배리어', type: '기하', power: 85, pp: 10, sec: 3 },
  꼭짓점20드래곤: { name: '꼭짓점20드래곤', type: '드래곤', power: 105, pp: 5, sec: 4 },
  십이면체브레스: { name: '십이면체브레스', type: '입체', power: 120, pp: 5, sec: 4 },
  사이코키네시스: { name: '사이코키네시스', type: '에스퍼', power: 90, pp: 10 },
  정삼각형20광휘: { name: '정삼각형20광휘', type: '기하', power: 95, pp: 8, sec: 3 },
  오일러궁극포: { name: '오일러궁극포', type: '입체', power: 125, pp: 5, sec: 4 },
  이십면체빅뱅: { name: '이십면체빅뱅', type: '에스퍼', power: 130, pp: 5, sec: 4 },

  발버둥: { name: '발버둥', type: '노말', power: 30, pp: 99, struggle: true }
};

export const CHART: Record<string, Record<string, number>> = {
  불: { 풀: 2, 얼음: 2, 입체: 1.5, 물: 0.5, 불: 0.5, 바위: 0.5 },
  물: { 불: 2, 땅: 2, 바위: 2, 물: 0.5, 풀: 0.5, 드래곤: 0.5 },
  풀: { 물: 2, 땅: 2, 바위: 2, 불: 0.5, 풀: 0.5, 독: 0.5, 비행: 0.5 },
  전기: { 물: 2, 비행: 2, 전기: 0.5, 풀: 0.5, 드래곤: 0.5, 땅: 0 },
  기하: { 입체: 1.5, 회전체: 1.5, 통계: 1.2, 노말: 1 },
  입체: { 기하: 1.5, 바위: 1.5, 격투: 1.2 },
  회전체: { 기하: 1.5, 물: 1.2, 불: 1.5 },
  통계: { 고스트: 1.5, 에스퍼: 1.5, 기하: 1.2 }
};

export const GYM_LEADERS = [
  { name: '각도', town: '각도마을', badge: '앵글배지', desc: '기본도형의 달인', team: [{ sp: 'alter', lv: 14 }] },
  { name: '합동', town: '작도마을', badge: '컴퍼스배지', desc: '작도와 합동의 달인', team: [{ sp: 'congru', lv: 21 }] },
  { name: '부채', town: '부채마을', badge: '부채꼴배지', desc: '평면도형의 달인', team: [{ sp: 'radon', lv: 32 }] },
  { name: '입체', town: '입체도시', badge: '오일러배지', desc: '다면체와 회전체의 달인', team: [{ sp: 'eulertiger', lv: 38 }] },
  { name: '도수', town: '통계타운', badge: '히스토배지', desc: '자료의 정리와 해석의 달인', team: [{ sp: 'percent', lv: 45 }] }
];
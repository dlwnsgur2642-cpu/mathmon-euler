// 레트로 픽셀 아트 생성 엔진 (Game Boy Color 스타일)

export interface DrawAdapter {
  e: (x: number, y: number, rx: number, ry: number, col: string, rot?: number) => void;
  p: (col: string, ...pt: number[]) => void;
  r: (x: number, y: number, w: number, h: number, col: string) => void;
  t: (s: string, x: number, y: number, sz: number, col: string, font?: string) => void;
  eye: (x: number, y: number, s?: number) => void;
  ln: (x1: number, y1: number, x2: number, y2: number, w: number, col: string) => void;
  c: CanvasRenderingContext2D;
}

export function A(c: CanvasRenderingContext2D, tf: (x: string) => string = x => x): DrawAdapter {
  const e = (x: number, y: number, rx: number, ry: number, col: string, rot = 0) => {
    c.fillStyle = tf(col);
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    c.fill();
  };
  const p = (col: string, ...pt: number[]) => {
    c.fillStyle = tf(col);
    c.beginPath();
    c.moveTo(pt[0], pt[1]);
    for (let i = 2; i < pt.length; i += 2) c.lineTo(pt[i], pt[i + 1]);
    c.closePath();
    c.fill();
  };
  const r = (x: number, y: number, w: number, h: number, col: string) => {
    c.fillStyle = tf(col);
    c.fillRect(x, y, w, h);
  };
  const t = (s: string, x: number, y: number, sz: number, col: string, font = 'serif') => {
    c.fillStyle = tf(col);
    c.font = `bold ${sz}px ${font}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(s, x, y);
  };
  const eye = (x: number, y: number, s = 2.6) => {
    e(x, y, s, s + 0.5, '#ffffff');
    e(x - 0.5, y + 0.4, s * 0.55, s * 0.7, '#141420');
    c.fillStyle = '#fff';
    c.fillRect(Math.round(x - 0.5), Math.round(y - 1), 1, 1);
  };
  const ln = (x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
    c.strokeStyle = tf(col);
    c.lineWidth = w;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  };
  return { e, p, r, t, eye, ln, c };
}

function hexRGB(h: string): [number, number, number] {
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// 몬스터 벡터 도면 정의
export const ART: Record<string, (g: DrawAdapter) => void> = {
  // 풀/기하 스타팅 3계통
  angle(g) {
    // 각도롱: 각도기와 부채꼴 꼬리를 지닌 작은 공룡
    g.p('#3a8a30', 20, 48, 12, 54, 24, 52); // 다리
    g.p('#3a8a30', 36, 48, 44, 54, 32, 52);
    g.e(28, 38, 16, 14, '#6cc85a'); // 몸통
    g.e(28, 41, 11, 8, '#c8f0a0'); // 배
    g.e(28, 22, 12, 11, '#6cc85a'); // 머리
    // 머리 위 각도 뿔
    g.p('#4aa048', 22, 14, 18, 4, 26, 10);
    g.p('#4aa048', 34, 14, 38, 4, 30, 10);
    g.eye(22, 22, 2.5);
    g.eye(34, 22, 2.5);
    g.e(28, 27, 2, 1.2, '#2a6a20'); // 코
    g.t('∠', 28, 41, 12, '#2a6a20', 'sans-serif'); // 가슴의 각 기호
    // 꼬리
    g.p('#58c050', 14, 40, 2, 34, 6, 44);
  },

  fan(g) {
    // 부채도롱: 꼬리에 화려한 부채꼴과 날개를 지닌 파충류
    // 부채꼴 꼬리
    for (let k = 0; k < 7; k++) {
      const a = (k / 6) * Math.PI - Math.PI * 0.9;
      g.p(k % 2 ? '#ffd040' : '#4aa048', 12, 38, 12 + Math.cos(a) * 22, 38 + Math.sin(a) * 20, 12 + Math.cos(a + 0.3) * 22, 38 + Math.sin(a + 0.3) * 20);
    }
    g.e(32, 38, 17, 14, '#58c050'); // 몸통
    g.e(32, 42, 12, 8, '#d8f8a0'); // 배
    g.e(34, 20, 14, 12, '#58c050'); // 머리
    g.p('#2e9038', 28, 12, 24, 2, 34, 8); // 벼슬
    g.p('#2e9038', 40, 12, 44, 2, 36, 8);
    g.eye(28, 20, 2.8);
    g.eye(40, 20, 2.8);
    g.r(24, 48, 6, 8, '#2e9038');
    g.r(38, 48, 6, 8, '#2e9038');
    g.t('⌒', 32, 42, 14, '#1e6028', 'sans-serif');
  },

  radon(g) {
    // 호도룡: 거대한 원호 날개와 부채꼴 꼬리를 펼친 드래곤
    // 거대한 날개 (원호 기하)
    g.p('#2e9038', 28, 28, 2, 6, 8, 30, 20, 28);
    g.p('#2e9038', 36, 28, 62, 6, 56, 30, 44, 28);
    g.p('#7ad860', 4, 10, 14, 26, 20, 26);
    g.p('#7ad860', 60, 10, 50, 26, 44, 26);
    g.e(32, 36, 18, 15, '#3aa048'); // 몸통
    g.e(32, 40, 12, 9, '#f0ffd0'); // 배
    g.e(32, 18, 13, 11, '#3aa048'); // 머리
    g.eye(26, 18, 2.6);
    g.eye(38, 18, 2.6);
    // 황금빛 호 뿔
    g.p('#f0c030', 26, 10, 20, 0, 29, 8);
    g.p('#f0c030', 38, 10, 44, 0, 35, 8);
    g.r(24, 48, 6, 8, '#25702e');
    g.r(36, 48, 6, 8, '#25702e');
    g.t('π', 32, 40, 15, '#1e5a24', 'serif');
  },

  // 불/입체 스타팅 3계통
  poly(g) {
    // 다면호: 꼭짓점과 모서리가 강조된 아기 호랑이
    g.e(28, 38, 16, 14, '#f07828'); // 몸통
    g.e(28, 42, 10, 8, '#ffe0a0'); // 배
    g.e(28, 22, 14, 12, '#f07828'); // 머리
    // 삼각형 귀
    g.p('#d05018', 16, 14, 12, 4, 22, 10);
    g.p('#d05018', 40, 14, 44, 4, 34, 10);
    g.eye(22, 22, 2.6);
    g.eye(34, 22, 2.6);
    g.e(28, 27, 2, 1.2, '#501808'); // 코
    g.r(20, 48, 5, 8, '#d05018');
    g.r(31, 48, 5, 8, '#d05018');
    g.p('#f07828', 42, 40, 54, 30, 48, 42); // 꼬리
    g.t('V', 28, 42, 11, '#802008', 'sans-serif'); // 꼭짓점 기호
  },

  regpoly(g) {
    // 정다면호: 불타는 입체 프레임을 두른 호랑이
    g.e(30, 36, 19, 15, '#e85a18');
    g.e(30, 40, 13, 9, '#ffd880');
    g.e(30, 18, 15, 13, '#e85a18');
    // 입체 귀
    g.p('#b83808', 18, 10, 14, 0, 24, 6);
    g.p('#b83808', 42, 10, 46, 0, 36, 6);
    g.eye(24, 18, 2.8);
    g.eye(36, 18, 2.8);
    // 불꽃 갈기
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      g.p('#ffd030', 30 + Math.cos(a) * 16, 20 + Math.sin(a) * 14, 30 + Math.cos(a + 0.3) * 22, 20 + Math.sin(a + 0.3) * 20, 30 + Math.cos(a + 0.6) * 16, 20 + Math.sin(a + 0.6) * 14);
    }
    g.r(22, 48, 6, 8, '#a02804');
    g.r(34, 48, 6, 8, '#a02804');
    g.t('F', 30, 40, 13, '#601000', 'sans-serif');
  },

  eulertiger(g) {
    // 오일러타이거: 오일러 공식(v-e+f=2) 문양과 거대한 화염 갈기를 지닌 제왕
    // 화염 아우라
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      g.p(i % 2 ? '#ffb820' : '#e03010', 30 + Math.cos(a) * 22, 32 + Math.sin(a) * 20, 30 + Math.cos(a + 0.25) * 30, 32 + Math.sin(a + 0.25) * 28, 30 + Math.cos(a + 0.5) * 22, 32 + Math.sin(a + 0.5) * 20);
    }
    g.e(30, 36, 21, 16, '#ffeed0'); // 백호/황금호 몸체
    g.e(30, 40, 14, 10, '#ff9030');
    g.e(30, 18, 16, 14, '#ffeed0');
    g.eye(23, 18, 3.0);
    g.eye(37, 18, 3.0);
    g.p('#d02000', 16, 8, 12, -2, 22, 4);
    g.p('#d02000', 44, 8, 48, -2, 38, 4);
    g.r(20, 48, 7, 9, '#b02000');
    g.r(34, 48, 7, 9, '#b02000');
    g.t('v-e+f', 30, 38, 9, '#801000', 'sans-serif');
    g.t('=2', 30, 46, 8, '#801000', 'sans-serif');
  },

  // 물/회전체 스타팅 3계통
  cone(g) {
    // 원뿔범: 머리에 원뿔을 얹은 아기 물범
    g.e(28, 38, 18, 13, '#5aa8e8'); // 몸통
    g.e(28, 42, 12, 7, '#d8f0ff'); // 배
    g.e(28, 22, 13, 11, '#5aa8e8'); // 머리
    // 머리 위 원뿔
    g.p('#ffd040', 22, 14, 28, 2, 34, 14);
    g.e(28, 14, 6, 2, '#e0b020');
    g.eye(22, 22, 2.5);
    g.eye(34, 22, 2.5);
    g.e(28, 26, 2, 1.4, '#1a3a60'); // 코
    // 지느러미
    g.e(16, 42, 6, 3, '#3a80c8', -0.4);
    g.e(40, 42, 6, 3, '#3a80c8', 0.4);
    // 꼬리
    g.p('#3a80c8', 24, 50, 20, 56, 28, 52);
    g.p('#3a80c8', 32, 50, 36, 56, 28, 52);
    g.t('△', 28, 40, 11, '#1a4a8a', 'sans-serif');
  },

  rotseal(g) {
    // 회전바다사자: 원기둥 회전체를 휘감은 바다사자
    g.e(30, 36, 21, 15, '#3a88d8');
    g.e(30, 40, 14, 8, '#cfe8ff');
    g.e(30, 20, 15, 12, '#3a88d8');
    // 회전축과 원기둥 링
    g.ln(30, 4, 30, 52, 2, '#ffd040');
    g.e(30, 26, 18, 5, '#e0f0ff', 0);
    g.eye(24, 20, 2.8);
    g.eye(36, 20, 2.8);
    g.e(16, 42, 8, 4, '#2068b0', -0.5);
    g.e(44, 42, 8, 4, '#2068b0', 0.5);
    g.p('#2068b0', 24, 50, 18, 58, 30, 53);
    g.p('#2068b0', 36, 50, 42, 58, 30, 53);
    g.t('360°', 30, 41, 10, '#103868', 'sans-serif');
  },

  sphereking(g) {
    // 구해왕: 완벽한 구체와 얼음 왕관을 두른 제왕
    // 구체 회전 링
    g.e(30, 34, 25, 20, '#2a6ab0');
    g.e(30, 34, 20, 16, '#60b0ff');
    g.e(30, 34, 15, 12, '#ffffff');
    // 얼음 왕관
    g.p('#d0f4ff', 18, 14, 24, 4, 30, 12);
    g.p('#d0f4ff', 30, 12, 36, 4, 42, 14);
    g.p('#d0f4ff', 24, 14, 30, 2, 36, 14);
    g.eye(24, 24, 3.0);
    g.eye(36, 24, 3.0);
    g.e(12, 40, 9, 5, '#184880', -0.4);
    g.e(48, 40, 9, 5, '#184880', 0.4);
    g.t('S', 30, 35, 16, '#0f2f58', 'serif');
  },

  // 필드 수학몬들
  line(g) {
    g.e(28, 35, 14, 14, '#e8b878');
    g.ln(8, 35, 48, 35, 3, '#c07830');
    g.eye(22, 32, 2.2);
    g.eye(34, 32, 2.2);
    g.t('←→', 28, 44, 10, '#5a3010', 'sans-serif');
  },

  ray(g) {
    g.e(28, 32, 16, 15, '#e0a050');
    g.p('#b06020', 10, 32, 48, 26, 48, 38);
    g.eye(24, 28, 2.4);
    g.eye(34, 28, 2.4);
    g.t('●→', 28, 43, 11, '#502008', 'sans-serif');
  },

  parallel(g) {
    g.e(28, 38, 15, 13, '#f8e050');
    g.e(28, 22, 13, 11, '#f8e050');
    g.p('#f8e050', 17, 16, 14, 6, 22, 12);
    g.p('#f8e050', 39, 16, 42, 6, 34, 12);
    g.eye(22, 22, 2.4);
    g.eye(34, 22, 2.4);
    g.ln(12, 34, 44, 34, 2.5, '#c09810');
    g.ln(12, 42, 44, 42, 2.5, '#c09810');
    g.t('//', 28, 38, 11, '#604800', 'sans-serif');
  },

  alter(g) {
    g.e(30, 36, 18, 14, '#f0c830');
    g.e(30, 20, 15, 12, '#f0c830');
    g.p('#d0a018', 18, 12, 14, 2, 24, 8);
    g.p('#d0a018', 42, 12, 46, 2, 36, 8);
    g.eye(24, 20, 2.8);
    g.eye(36, 20, 2.8);
    // Z자 엇각 번개
    g.ln(16, 32, 44, 32, 2.5, '#202020');
    g.ln(44, 32, 16, 44, 2.5, '#202020');
    g.ln(16, 44, 44, 44, 2.5, '#202020');
    g.t('Z', 30, 38, 12, '#ff3010', 'sans-serif');
  },

  compass(g) {
    g.e(28, 38, 17, 13, '#4ab088');
    g.e(28, 42, 11, 7, '#c8f0d8');
    g.e(20, 26, 6, 6, '#4ab088');
    g.e(36, 26, 6, 6, '#4ab088');
    g.eye(20, 26, 3.0);
    g.eye(36, 26, 3.0);
    // 컴퍼스 다리
    g.ln(28, 14, 14, 52, 2.5, '#306850');
    g.ln(28, 14, 42, 52, 2.5, '#306850');
    g.e(28, 14, 3, 3, '#ffd040');
    g.t('∧', 28, 40, 13, '#184830', 'sans-serif');
  },

  congru(g) {
    g.e(29, 38, 20, 15, '#2a8868');
    g.e(29, 42, 13, 8, '#b0e8c8');
    g.e(18, 25, 7, 7, '#2a8868');
    g.e(40, 25, 7, 7, '#2a8868');
    g.eye(18, 25, 3.4);
    g.eye(40, 25, 3.4);
    g.t('≡', 29, 41, 16, '#0f4830', 'sans-serif');
  },

  histo(g) {
    // 히스토북이
    g.e(16, 47, 5, 3, '#7a7060');
    g.e(42, 47, 5, 3, '#7a7060');
    g.e(10, 36, 6, 6, '#9a8870');
    g.e(31, 38, 18, 12, '#7a7060'); // 거북 등껍질
    // 히스토그램 막대 기둥들
    g.r(18, 26, 5, 12, '#e08830');
    g.r(24, 20, 5, 18, '#e0a030');
    g.r(30, 16, 5, 22, '#f0c040');
    g.r(36, 22, 5, 16, '#e08830');
    g.r(42, 28, 5, 10, '#c06820');
    g.eye(8, 35, 2.0);
  },

  distrib(g) {
    g.e(32, 38, 22, 14, '#605848');
    g.r(16, 24, 7, 14, '#3a8ae8');
    g.r(24, 18, 7, 20, '#5ab0f8');
    g.r(32, 14, 7, 24, '#7ac8ff');
    g.r(40, 20, 7, 18, '#5ab0f8');
    g.eye(10, 34, 2.4);
    // 꺾은선 다각형
    g.ln(19, 24, 27, 18, 2, '#ff3030');
    g.ln(27, 18, 35, 14, 2, '#ff3030');
    g.ln(35, 14, 43, 20, 2, '#ff3030');
  },

  freq(g) {
    // 상대도수유령: 꼬리가 흐르는 유령
    g.p('#d0e0f8', 12, 30, 16, 52, 22, 46, 28, 54, 34, 46, 40, 54, 46, 30);
    g.e(28, 26, 18, 17, '#d0e0f8');
    g.e(22, 24, 4, 5, '#1e2840');
    g.e(34, 24, 4, 5, '#1e2840');
    g.t('Σ=1', 28, 38, 10, '#304878', 'sans-serif');
  },

  percent(g) {
    g.p('#b0c8f0', 10, 28, 14, 54, 22, 46, 30, 56, 38, 46, 46, 54, 50, 28);
    g.e(30, 24, 20, 18, '#b0c8f0');
    g.e(23, 22, 5, 6, '#182038');
    g.e(37, 22, 5, 6, '#182038');
    g.t('%', 30, 38, 14, '#ff2040', 'sans-serif');
  },

  // 5대 정다면체
  tetra(g) {
    // 정사면체새: 정삼각형 4개의 날개
    g.p('#ffd040', 28, 10, 8, 46, 48, 46);
    g.ln(28, 10, 28, 40, 2, '#b08810');
    g.ln(8, 46, 28, 40, 2, '#b08810');
    g.ln(48, 46, 28, 40, 2, '#b08810');
    g.eye(24, 28, 2.2);
    g.eye(32, 28, 2.2);
    g.t('4', 28, 48, 10, '#805800', 'sans-serif');
  },

  cube(g) {
    // 정육면체곰
    g.r(16, 20, 26, 26, '#a87850');
    g.p('#c89870', 16, 20, 26, 10, 52, 10, 42, 20);
    g.p('#8a5a38', 42, 20, 52, 10, 52, 36, 42, 46);
    g.eye(22, 30, 2.5);
    g.eye(34, 30, 2.5);
    g.t('6', 29, 38, 12, '#4a2810', 'sans-serif');
  },

  octa(g) {
    // 정팔면체돌
    g.p('#6cc8e8', 28, 8, 12, 30, 28, 52, 44, 30);
    g.ln(12, 30, 44, 30, 2, '#206888');
    g.ln(28, 8, 28, 52, 2, '#206888');
    g.eye(24, 26, 2.2);
    g.eye(32, 26, 2.2);
    g.t('8', 28, 38, 12, '#104860', 'sans-serif');
  },

  dodeca(g) {
    // 정십이면체용
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
      g.p('#e0a0f0', 28 + Math.cos(a) * 18, 30 + Math.sin(a) * 18, 28 + Math.cos(a + 0.5) * 26, 30 + Math.sin(a + 0.5) * 26, 28, 30);
    }
    g.eye(24, 26, 2.5);
    g.eye(32, 26, 2.5);
    g.t('12', 28, 38, 12, '#602078', 'sans-serif');
  },

  icosa(g) {
    // 정이십면체신
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      g.p(k % 2 ? '#fff080' : '#80c8ff', 28 + Math.cos(a) * 20, 30 + Math.sin(a) * 20, 28 + Math.cos(a + 0.4) * 28, 30 + Math.sin(a + 0.4) * 28, 28, 30);
    }
    g.eye(24, 28, 2.8);
    g.eye(32, 28, 2.8);
    g.t('20', 28, 38, 13, '#102060', 'serif');
  },

  // 인물: 오일러 박사
  euler(g) {
    g.e(28, 20, 16, 12, '#e0d8c8'); // 회색 가발
    g.e(28, 24, 12, 10, '#f0c8a0'); // 얼굴
    g.eye(23, 23, 2.0);
    g.eye(33, 23, 2.0);
    g.r(16, 34, 24, 20, '#3a4a78'); // 학자 코트
    g.p('#ffffff', 24, 34, 32, 34, 28, 44); // 넥타이
    g.t('E', 28, 48, 8, '#ffd040', 'serif');
  },

  // 인물: 주인공 트레이너 앞/뒤
  player(g) {
    g.r(20, 34, 16, 18, '#d83838'); // 빨간 조끼
    g.e(28, 22, 10, 9, '#f0c090'); // 얼굴
    g.r(18, 14, 20, 6, '#283868'); // 파란 모자
    g.eye(24, 22, 2.2);
    g.eye(32, 22, 2.2);
    g.r(20, 48, 6, 8, '#303848'); // 바지
    g.r(30, 48, 6, 8, '#303848');
  }
};

const sprCache: Record<string, HTMLCanvasElement> = {};

// 캔버스 스프라이트 실시간 생성 (도트 외곽선 및 픽셀 음영 처리)
export function makeSprite(sp: string, mode: 'front' | 'back' | 'sil' = 'front', P = 58): HTMLCanvasElement {
  const R = P / 58;
  const cvs = document.createElement('canvas');
  cvs.width = cvs.height = P;
  const c = cvs.getContext('2d');
  if (!c) return cvs;

  c.scale(R, R);
  c.translate(1, 1);
  if (mode === 'back') {
    c.translate(56, 0);
    c.scale(-1, 1);
  }

  const palM = new Map<string, [number, number, number]>();
  const rec = (col: string) => {
    if (typeof col === 'string' && col[0] === '#' && (col.length === 7 || col.length === 4) && !palM.has(col)) {
      palM.set(col, hexRGB(col));
    }
    return col;
  };

  const g = A(c, rec);
  rec('#ffffff');

  // 도면 그리기
  const drawFn = ART[sp] || ART.angle;
  drawFn(g);

  // 픽셀 스캔 및 양자화 & 외곽선/음영 합성
  const im = c.getImageData(0, 0, P, P);
  const px = im.data;
  const N = P * P;
  const pal = [...palM.values()];
  const idx = new Int16Array(N).fill(-1);
  const lum = pal.map(([r, g2, b]) => r * 0.3 + g2 * 0.59 + b * 0.11);

  for (let i = 0; i < N; i++) {
    if (px[i * 4 + 3] < 110) continue;
    const r = px[i * 4], g2 = px[i * 4 + 1], b = px[i * 4 + 2];
    let best = 0, bd = 1e9;
    for (let k = 0; k < pal.length; k++) {
      const q = pal[k];
      const dd = (q[0] - r) ** 2 + (q[1] - g2) ** 2 + (q[2] - b) ** 2;
      if (dd < bd) { bd = dd; best = k; }
    }
    idx[i] = best;
  }

  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < P && y < P && idx[y * P + x] >= 0;
  const out = new Uint8ClampedArray(N * 4);
  const lx = mode === 'back' ? -1 : 1;
  const T = Math.max(1, Math.round(R));
  const LW = Math.max(1, Math.round(R * 0.6));
  const D1 = Math.max(1, Math.round(R));
  const D2 = Math.max(2, Math.round(R * 2));
  const HL = Math.max(1, Math.round(R * 0.7));

  const ring: number[] = [];
  for (let dy = -T; dy <= T; dy++) {
    for (let dx = -T; dx <= T; dx++) {
      if ((dx || dy) && dx * dx + dy * dy <= (T + 0.45) ** 2) {
        ring.push(dx, dy);
      }
    }
  }

  const oc = mode === 'sil' ? [44, 30, 22] : [24, 22, 34];

  for (let y = 0; y < P; y++) {
    for (let x = 0; x < P; x++) {
      const i = y * P + x;
      const k = idx[i];
      if (k < 0) continue;

      // 바깥 외곽선
      if (!op(x + 1, y) || !op(x - 1, y) || !op(x, y + 1) || !op(x, y - 1)) {
        for (let j = 0; j < ring.length; j += 2) {
          const xx = x + ring[j], yy = y + ring[j + 1];
          if (xx >= 0 && yy >= 0 && xx < P && yy < P && idx[yy * P + xx] < 0) {
            const o = (yy * P + xx) * 4;
            out[o] = oc[0]; out[o + 1] = oc[1]; out[o + 2] = oc[2]; out[o + 3] = 255;
          }
        }
      }

      const o = i * 4;
      out[o + 3] = 255;
      if (mode === 'sil') {
        out[o] = 44; out[o + 1] = 30; out[o + 2] = 22;
        continue;
      }

      const curPal = pal[k] || [200, 200, 200];
      let r = curPal[0], g2 = curPal[1], b = curPal[2], f = 1;
      let line = false;
      const lk = lum[k] + 22;

      for (let s2 = 1; s2 <= LW && !line; s2++) {
        if (x + s2 < P && idx[i + s2] >= 0 && lum[idx[i + s2]] > lk) line = true;
        if (x - s2 >= 0 && idx[i - s2] >= 0 && lum[idx[i - s2]] > lk) line = true;
        if (y + s2 < P && idx[i + s2 * P] >= 0 && lum[idx[i + s2 * P]] > lk) line = true;
        if (y - s2 >= 0 && idx[i - s2 * P] >= 0 && lum[idx[i - s2 * P]] > lk) line = true;
      }

      if (line) f = 0.62;
      else if (!op(x + lx * D1, y + D1) || !op(x + lx * D2, y + D2)) f = 0.76;
      else if (!op(x - lx * HL, y - HL)) {
        r = Math.min(255, r + 42);
        g2 = Math.min(255, g2 + 42);
        b = Math.min(255, b + 42);
      }

      out[o] = r * f;
      out[o + 1] = g2 * f;
      out[o + 2] = b * (f === 1 ? 1 : f + 0.04);
    }
  }

  im.data.set(out);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.putImageData(im, 0, 0);
  return cvs;
}

export function spr(sp: string, mode: 'front' | 'back' | 'sil' = 'front', P = 58): HTMLCanvasElement {
  const k = `${sp}_${mode}_${P}`;
  if (!sprCache[k]) {
    sprCache[k] = makeSprite(sp, mode, P);
  }
  return sprCache[k];
}

// 16x16 오버월드 캐릭터 보행 스프라이트
const charCache: Record<string, HTMLCanvasElement> = {};
export function chSprite(pal: string, dir: string): HTMLCanvasElement {
  const k = `${pal}_${dir}`;
  if (charCache[k]) return charCache[k];

  const cvs = document.createElement('canvas');
  cvs.width = cvs.height = 16;
  const c = cvs.getContext('2d');
  if (!c) return cvs;

  const isPlayer = pal === 'player';
  const bodyCol = isPlayer ? '#d83838' : pal === 'prof' ? '#3a4a78' : '#3078a8';
  const headCol = isPlayer ? '#f0c090' : pal === 'prof' ? '#e0d8c8' : '#f0c090';
  const capCol = isPlayer ? '#283868' : '#222';

  // 그림자
  c.fillStyle = '#0003';
  c.fillRect(3, 14, 10, 2);

  if (dir === 'up') {
    c.fillStyle = bodyCol; c.fillRect(4, 7, 8, 7);
    c.fillStyle = capCol; c.fillRect(4, 2, 8, 6);
  } else if (dir === 'down') {
    c.fillStyle = bodyCol; c.fillRect(4, 7, 8, 7);
    c.fillStyle = headCol; c.fillRect(4, 3, 8, 5);
    c.fillStyle = capCol; c.fillRect(4, 1, 8, 3);
    c.fillStyle = '#141420'; c.fillRect(5, 5, 2, 2); c.fillRect(9, 5, 2, 2); // 눈
  } else if (dir === 'left') {
    c.fillStyle = bodyCol; c.fillRect(5, 7, 7, 7);
    c.fillStyle = headCol; c.fillRect(4, 3, 7, 5);
    c.fillStyle = capCol; c.fillRect(3, 1, 8, 3);
    c.fillStyle = '#141420'; c.fillRect(4, 5, 2, 2);
  } else { // right
    c.fillStyle = bodyCol; c.fillRect(4, 7, 7, 7);
    c.fillStyle = headCol; c.fillRect(5, 3, 7, 5);
    c.fillStyle = capCol; c.fillRect(5, 1, 8, 3);
    c.fillStyle = '#141420'; c.fillRect(10, 5, 2, 2);
  }

  charCache[k] = cvs;
  return cvs;
}

// 16x16 타일 렌더러
const tileCache: Record<string, HTMLCanvasElement> = {};
export function tileFor(tile: string, x: number, y: number, wf = 0): HTMLCanvasElement {
  const k = `${tile}_${(x % 4)}_${(y % 4)}_${tile === '~' ? wf : 0}`;
  if (tileCache[k]) return tileCache[k];

  const cvs = document.createElement('canvas');
  cvs.width = cvs.height = 16;
  const c = cvs.getContext('2d');
  if (!c) return cvs;

  switch (tile) {
    case '.': // 흙길
      c.fillStyle = '#e8d8a0'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#d8c890';
      if ((x + y) % 2) { c.fillRect(2, 3, 2, 1); c.fillRect(10, 11, 2, 1); }
      break;

    case '_': // 포장도로
      c.fillStyle = '#dcd8cf'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#c8c0b4'; c.fillRect(0, 15, 16, 1); c.fillRect(15, 0, 1, 16);
      break;

    case ',': // 풀숲 (인카운터 타일)
      c.fillStyle = '#6cc85a'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#3a8a30';
      // 짙은 풀 무늬
      c.fillRect(2, 2, 3, 8); c.fillRect(8, 4, 3, 8); c.fillRect(13, 2, 2, 8);
      c.fillStyle = '#a0e880';
      c.fillRect(3, 1, 2, 2); c.fillRect(9, 3, 2, 2);
      break;

    case 'T': // 나무 (충돌 타일)
      c.fillStyle = '#58a848'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#327028';
      c.fillRect(1, 1, 14, 14);
      c.fillStyle = '#7ad860';
      c.fillRect(3, 3, 4, 4);
      break;

    case '~': // 물 (애니메이션)
      c.fillStyle = wf ? '#4a98e8' : '#3a88d8'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#fff';
      if (wf) { c.fillRect(3, 4, 4, 1); c.fillRect(9, 11, 5, 1); }
      else { c.fillRect(8, 5, 4, 1); c.fillRect(2, 12, 5, 1); }
      break;

    case 'W': // 건물 벽
      c.fillStyle = '#f0e8d0'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#c8b898'; c.fillRect(0, 15, 16, 1); c.fillRect(0, 7, 16, 1);
      break;

    case 'R': // 붉은 지붕
      c.fillStyle = '#d84a3a'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#a02820'; c.fillRect(0, 14, 16, 2);
      break;

    case 'B': // 파란 지붕
      c.fillStyle = '#3a6ad8'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#204090'; c.fillRect(0, 14, 16, 2);
      break;

    case 'G': // 체육관 지붕
      c.fillStyle = '#d89a28'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#986810'; c.fillRect(0, 14, 16, 2);
      break;

    case 'f': // 실내 바닥 (나무 마루)
      c.fillStyle = '#e8c898'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#c8a070'; c.fillRect(0, 15, 16, 1);
      break;

    case 'w': // 실내 벽
      c.fillStyle = '#3a3a50'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#252538'; c.fillRect(0, 15, 16, 1);
      break;

    case 'D': // 문
      c.fillStyle = '#503020'; c.fillRect(0, 0, 16, 16);
      c.fillStyle = '#d0b060'; c.fillRect(11, 7, 2, 2); // 손잡이
      break;

    case 'b': // 책상
      c.fillStyle = '#8a5a30'; c.fillRect(1, 2, 14, 12);
      c.fillStyle = '#b88048'; c.fillRect(2, 3, 12, 10);
      break;

    default:
      c.fillStyle = '#101018'; c.fillRect(0, 0, 16, 16);
  }

  tileCache[k] = cvs;
  return cvs;
}
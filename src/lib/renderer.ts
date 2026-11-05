// 캔버스 기반 레트로 픽셀 도트 아트 렌더러 (순수 코드 렌더링, 외부 이미지 의존성 0)

export function drawRetroMathmon(
  ctx: CanvasRenderingContext2D,
  speciesShape: string,
  x: number,
  y: number,
  scale: number,
  isBack: boolean = false,
  color: string = '#10b981',
  accentColor: string = '#047857'
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 픽셀 아트 스타일: imageSmoothing 비활성화
  ctx.imageSmoothingEnabled = false;

  // 그림자
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (speciesShape) {
    case 'lizard':
    case 'lizard_evo':
    case 'dragon':
      drawLizard(ctx, color, accentColor, isBack);
      break;
    case 'tiger':
    case 'tiger_evo':
    case 'beast':
      drawTiger(ctx, color, accentColor, isBack);
      break;
    case 'seal':
    case 'seal_evo':
    case 'whale':
      drawSeal(ctx, color, accentColor, isBack);
      break;
    case 'bird':
      drawBird(ctx, color, accentColor, isBack);
      break;
    case 'turtle':
      drawTurtle(ctx, color, accentColor, isBack);
      break;
    default:
      drawDefaultMon(ctx, color, accentColor, isBack);
      break;
  }

  ctx.restore();
}

function drawLizard(ctx: CanvasRenderingContext2D, color: string, accent: string, isBack: boolean) {
  // 부채꼴 꼬리 도롱뇽 (각도롱 계열)
  // 몸통
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#064e3b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 배 (앞모습일 때)
  if (!isBack) {
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.ellipse(0, 4, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 부채꼴 꼬리 (기하학 각도 모티브)
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(isBack ? -8 : 8, 6);
  ctx.arc(isBack ? -8 : 8, 6, 20, isBack ? Math.PI * 0.8 : -Math.PI * 0.2, isBack ? Math.PI * 1.3 : Math.PI * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 눈
  if (!isBack) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -8, 4, 5);
    ctx.fillRect(2, -8, 4, 5);
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(-4, -6, 2, 3);
    ctx.fillRect(4, -6, 2, 3);
  }
}

function drawTiger(ctx: CanvasRenderingContext2D, color: string, accent: string, isBack: boolean) {
  // 정사면체 뿔을 단 입체 호랑이 (다면호 계열)
  // 몸통
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-15, -10, 30, 24, 6);
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 줄무늬 (모서리 각진 패턴)
  ctx.fillStyle = accent;
  ctx.fillRect(-12, -4, 4, 3);
  ctx.fillRect(8, -4, 4, 3);
  ctx.fillRect(-10, 4, 5, 3);
  ctx.fillRect(5, 4, 5, 3);

  // 이마의 정사면체 뿔 (정삼각형)
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(-7, -10);
  ctx.lineTo(7, -10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.stroke();

  // 눈
  if (!isBack) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -4, 4, 4);
    ctx.fillRect(4, -4, 4, 4);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-7, -3, 2, 3);
    ctx.fillRect(5, -3, 2, 3);
  }
}

function drawSeal(ctx: CanvasRenderingContext2D, color: string, accent: string, isBack: boolean) {
  // 원뿔 고깔모자를 쓴 물범 (원뿔범 계열)
  // 몸통
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 4, 16, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 지느러미
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(-16, 8, 6, 4, Math.PI * 0.2, 0, Math.PI * 2);
  ctx.ellipse(16, 8, 6, 4, -Math.PI * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // 원뿔 모자
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(-9, -8);
  ctx.lineTo(9, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.stroke();

  // 눈
  if (!isBack) {
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(-5, 0, 2.5, 0, Math.PI * 2);
    ctx.arc(5, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // 볼터치
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(-9, 4, 3, 2);
    ctx.fillRect(6, 4, 3, 2);
  }
}

function drawBird(ctx: CanvasRenderingContext2D, color: string, accent: string, isBack: boolean) {
  // 맞꼭지새
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.stroke();

  // 가위 모양 부리
  if (!isBack) {
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(10, -4);
    ctx.lineTo(24, -8);
    ctx.lineTo(12, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, 4);
    ctx.lineTo(24, 8);
    ctx.lineTo(12, 0);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTurtle(ctx: CanvasRenderingContext2D, color: string, accent: string, isBack: boolean) {
  // 히스토북이 (히스토그램 막대 등껍질)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 2, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0e7490';
  ctx.stroke();

  // 등껍질 막대그래프 무늬
  ctx.fillStyle = accent;
  ctx.fillRect(-10, -8, 5, 12);
  ctx.fillRect(-3, -12, 6, 16);
  ctx.fillRect(5, -6, 5, 10);
}

function drawDefaultMon(ctx: CanvasRenderingContext2D, color: string, accent: string, isBack: boolean) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-14, -14, 28, 28, 8);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (!isBack) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(-6, -4, 4, 4);
    ctx.fillRect(2, -4, 4, 4);
  }
}

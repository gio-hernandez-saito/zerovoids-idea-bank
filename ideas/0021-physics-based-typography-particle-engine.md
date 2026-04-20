---
id: idea-0021
title: "물리 기반 타이포그래피 파티클 엔진"
generated: 2026-04-20T02:27:53.484Z

category: utility
subcategory: npm-package
difficulty: intermediate
tags: [typography, physics-simulation, particle-system, canvas, npm-package, typescript, animation]

estimated_time: "3-5일"
tech_stack: [TypeScript, Canvas API, Matter.js]
languages: [TypeScript]

evaluation:
  originality: 8
  feasibility: 8
  market_need: 6
  monetization_potential: 5
  tech_interest: 9
  learning_value: 9
  open_source_value: 8
  distinctness: 8

  total: 7.52
  iterations: 1
  status: pass

inspiration_source: "물리학 크로스도메인 영감 + 주간 제약: npm 단일 목적 라이브러리"
---

# 물리 기반 타이포그래피 파티클 엔진

> 텍스트를 중력, 충돌, 유체 역학에 반응하는 파티클로 분해하고 재조합하는 npm 라이브러리

## 🎯 문제 정의

### 현재 상황
웹에서 텍스트 애니메이션은 대부분 CSS 트랜지션이나 GSAP 기반의 위치 이동에 그친다. 물리 엔진과 타이포그래피를 진정으로 통합한 라이브러리는 존재하지 않는다. 기존 파티클 라이브러리(tsParticles, Particles.js)는 텍스트를 "배경 장식"으로만 활용할 뿐, 텍스트 자체가 물리 시뮬레이션의 주체가 되지는 않는다.

### 불편한 점
- **파편화된 도구 체인**: Canvas 렌더링 + 물리 엔진 + 폰트 래스터라이징을 직접 조합해야 함
- **텍스트 = 정적 오브젝트**: 대부분의 구현에서 글자는 이동하지만 물리 법칙에 반응하지 않음
- **높은 진입 장벽**: Matter.js나 Rapier와 Canvas 폰트 파싱을 직접 연결하는 것은 복잡한 작업

### 대상 사용자
인터랙티브 포트폴리오를 만드는 프론트엔드 개발자, 크리에이티브 에이전시의 랜딩 페이지 개발자, 실험적 웹 아트를 제작하는 디지털 아티스트

---

## 💡 해결책

### 핵심 개념
`typo-physics`는 텍스트를 픽셀 단위로 분해해 각 파티클에 물리 속성을 부여하고, 중력·충돌·자기장 등의 힘을 적용한 뒤 원래 글자 형태로 재조합할 수 있는 npm 라이브러리다. 단 몇 줄의 코드로 "글자가 폭발하고 다시 모이는" 효과부터 "유체처럼 흘러내리는 텍스트"까지 구현 가능하다.

### 작동 방식
1. **래스터라이징**: 지정된 텍스트를 오프스크린 캔버스에 렌더링해 픽셀 맵 추출
2. **파티클 생성**: 불투명 픽셀을 물리 바디로 변환, 각 파티클에 질량·탄성·마찰 계수 할당
3. **시뮬레이션**: Matter.js 물리 엔진으로 매 프레임 위치·속도·회전 계산
4. **렌더링**: Canvas에 파티클을 원래 색상으로 그리며 실시간 업데이트
5. **재조합**: `attract()` 호출 시 파티클이 원래 글자 형태로 수렴

### 주요 기능
- **`TypoPhysics.explode(text, options)`**: 텍스트를 파티클로 분해하며 폭발 효과
- **`TypoPhysics.gravity(direction, strength)`**: 중력 방향과 강도를 런타임에 변경
- **`TypoPhysics.attract(target)`**: 흩어진 파티클을 특정 텍스트 형태로 재조합
- **`TypoPhysics.cursor(radius, force)`**: 마우스 커서가 파티클에 척력/인력 적용
- **`TypoPhysics.fluid(viscosity)`**: 유체 저항 시뮬레이션으로 물처럼 흘러내리는 효과

---

## 🏗️ 기술 아키텍처

### 시스템 개요

```
┌─────────────────────────────────────┐
│          Public API Layer           │
│    TypoPhysics(canvas, options)     │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────────┐
│   Rasterizer │  │  Physics Engine │
│  (Canvas 2D) │  │  (Matter.js)    │
│  Font → Pixels│  │  Bodies + Forces│
└──────┬──────┘  └────────┬────────┘
       │                  │
       └────────┬─────────┘
                ▼
       ┌─────────────────┐
       │    Renderer     │
       │  (requestAnim-  │
       │   ationFrame)   │
       └─────────────────┘
```

### 기술 스택 선택 근거
- **Canvas API**: 픽셀 수준 폰트 래스터라이징과 고성능 렌더링을 동시에 처리. WebGL 대비 셋업 간단
- **Matter.js**: 2D 물리 엔진 중 API가 가장 직관적이며 번들 크기 적당(약 80KB gzip). Rapier WASM 대비 도입 장벽 낮음
- **TypeScript**: 라이브러리 사용자에게 명확한 타입 힌트 제공, `PhysicsOptions`, `ForceConfig` 등 인터페이스 문서화

### 핵심 기술 과제
1. **파티클 밀도 최적화**: 고해상도 텍스트를 픽셀 단위로 변환하면 파티클이 수만 개 → 샘플링 전략(격자 샘플링, 에지 강조 샘플링) 필요
2. **재조합 수렴 알고리즘**: 흩어진 파티클이 목표 위치로 자연스럽게 모이려면 단순 인력 이상의 감쇠(damping) 제어가 필요
3. **폰트 크로스 플랫폼 래스터라이징**: Canvas의 폰트 렌더링이 OS마다 다름 → 오프스크린 캔버스 표준화 처리

---

## 🎨 흥미로운 점

### 독특한 각도
물리 시뮬레이션과 타이포그래피는 웹 개발에서 각자의 영역에 머물러 왔다. 이 라이브러리는 "텍스트를 물질로 취급한다"는 개념 전환에서 출발한다. 글자가 중력에 반응하고, 마우스에 밀려나고, 서로 충돌한다는 것은 단순한 애니메이션 효과가 아닌, 물리 세계의 은유를 언어에 적용하는 것이다.

### 혁신 포인트
- 폰트 래스터라이징 → 물리 바디 변환 파이프라인 (기존 라이브러리에 없는 단계)
- `attract()` API로 "흩어짐 → 재조합" 내러티브 구현 가능
- 물리 파라미터를 CSS 커스텀 프로퍼티처럼 런타임에 변경 가능한 선언적 API

### 학습 기회
- Canvas 2D API의 `getImageData`를 활용한 픽셀 맵 분석
- Matter.js의 바디 생성, 제약 조건, 복합 힘 시스템
- npm 라이브러리 배포 파이프라인 (tsup 번들링, `.d.ts` 생성, tree-shaking 최적화)
- requestAnimationFrame 루프와 물리 엔진 타임스텝 동기화

---

## 📊 시장 및 검증

### 유사 프로젝트
- **tsParticles** (github.com/tsparticles/tsparticles): 배경 파티클 효과 중심. 텍스트가 물리 시뮬레이션의 주체가 되지 않음
- **Oimo.js / Cannon.js**: 3D 물리 엔진으로 타이포그래피와의 통합 없음
- **GSAP TextPlugin**: 텍스트 애니메이션이지만 물리 법칙 없이 트윈 기반

### 왜 이 틈새가 존재하는가
Canvas API의 `getImageData`를 활용한 폰트 파싱과 2D 물리 엔진 통합은 각각 구현 사례가 있지만, 이를 "npm install로 즉시 사용 가능한 라이브러리"로 패키징한 사례는 없다. 크리에이티브 개발자들이 매번 같은 보일러플레이트를 작성하고 있다는 증거다.

### 성공 지표
- [ ] `npm install typo-physics` 후 10줄 이하 코드로 동작하는 데모
- [ ] CodeSandbox 인터랙티브 예제 5개 이상
- [ ] GitHub Star 200개 (오픈소스 크리에이티브 커뮤니티 반응 기준)
- [ ] 번들 사이즈 gzip 기준 100KB 이하 (Matter.js 포함)

---

## 🚀 구현 로드맵

### Phase 1: 코어 엔진 (1-2일)
**목표**: 텍스트 → 파티클 → 렌더링 파이프라인 완성
- 오프스크린 Canvas에 텍스트 래스터라이징 + 픽셀 샘플링
- Matter.js 바디 생성 및 월드 설정
- requestAnimationFrame 렌더 루프
- 기본 중력 + 경계 충돌

### Phase 2: API 완성 (1-2일)
**목표**: 사용자가 실제로 쓸 수 있는 인터페이스 완성
- `explode()`, `attract()`, `cursor()` API 구현
- `fluid()` 유체 저항 모드
- TypeScript 타입 정의 완성
- 파티클 밀도 최적화 (성능 프로파일링)

### Phase 3: 배포 및 문서화 (1일)
**목표**: npm 배포 가능한 상태
- tsup으로 ESM + CJS 번들 생성
- README 퀵스타트 + API 레퍼런스
- CodeSandbox 라이브 데모 3개
- npm publish + GitHub Release

### 기술 마일스톤
| 단계 | 산출물 | 성공 기준 |
|------|--------|----------|
| Day 1-2 | 코어 파이프라인 | "Hello" 텍스트가 파티클로 분해되고 중력 적용 |
| Day 3-4 | 전체 API | `attract()` 호출 시 파티클이 원래 글자로 재조합 |
| Day 5 | npm 패키지 | `npm install` 후 데모 코드 10줄로 동작 |

---

## 🌱 학습 성과

### 새로운 기술 및 개념
- **픽셀 맵 분석**: `getImageData`로 Canvas 픽셀 데이터를 읽어 파티클 좌표 추출하는 방법
- **물리 엔진 통합**: Matter.js의 `Engine`, `World`, `Body`, `Events` 시스템 깊이 이해
- **감쇠 제어**: 파티클이 목표로 수렴할 때 진동 없이 안정되게 하는 damping 수학
- **라이브러리 배포**: tsup, publint, Are the types wrong? 툴체인으로 올바른 패키지 구조 만들기

### 성장 기회
- "물리 엔진은 게임에서만 쓴다"는 고정관념을 깨고 UI 레이어에 적용하는 사고 전환
- 렌더 루프의 타임스텝 독립성 (물리 업데이트를 60fps 렌더링과 분리하는 패턴)
- 성능 한계를 고려한 API 설계 (파티클 수 자동 조절 전략)

### 도전 구간
수만 개의 파티클을 60fps로 렌더링하면서 물리 시뮬레이션을 돌리는 것은 브라우저의 메인 스레드 성계를 시험한다. 이 한계를 직접 측정하고, Web Worker로 물리 계산을 오프로드하거나 파티클 수를 적응적으로 줄이는 전략을 직접 결정해야 한다.

---

## 🌍 오픈소스 가치

### 커뮤니티 가치
크리에이티브 코딩 커뮤니티(CodePen, p5.js 사용자, Awwwards 개발자)는 정기적으로 이런 효과를 직접 구현한다. 잘 문서화된 npm 패키지로 이 반복 작업을 없애면 커뮤니티 전체의 생산성이 높아진다.

### 재사용성
- 프레임워크 비종속 (React, Vue, Svelte 모두 사용 가능)
- Canvas 엘리먼트만 있으면 동작하는 순수 라이브러리
- 물리 엔진 백엔드를 교체할 수 있는 어댑터 패턴 적용 가능

### 문서화 계획
- README: 설치 → 30초 데모 → API 레퍼런스 순서
- 인터랙티브 CodeSandbox 예제 (explode, attract, fluid 각 1개)
- CONTRIBUTING.md: 새 힘(Force) 플러그인 추가 방법 가이드
- CHANGELOG: semver 기반 변경 이력

---

## 💭 확장 가능성

### 자연스러운 확장
- **WebGL 렌더러**: Canvas 2D 대신 WebGL/Three.js 백엔드로 수십만 파티클 처리
- **SVG 경로 지원**: 텍스트 외에도 SVG 패스를 파티클 목표 형태로 사용
- **3D 모드**: z축 추가로 텍스트가 공간 속에서 흩어지고 모이는 효과

### 연구 질문
- 파티클 재조합 시 헝가리안 알고리즘으로 최적 매칭하면 더 자연스러운가?
- Web Worker + SharedArrayBuffer로 물리 계산을 병렬화할 수 있는가?
- WebGPU compute shader로 파티클 수를 100만 개까지 늘릴 수 있는가?

### 커뮤니티 기여 가능 영역
- 새로운 힘(Force) 플러그인: 자기장, 소용돌이, 폭발파
- 렌더러 어댑터: PixiJS, WebGL, SVG
- 미리 정의된 애니메이션 프리셋 컬렉션

---

## 🔗 관련 컨텍스트

**영감**: 물리학 크로스도메인 영감(파티클 시스템, 중력 모델링) + 주간 제약(npm 단일 목적 유틸리티 라이브러리)

**관련 레퍼런스**:
- [Matter.js 문서](https://brm.io/matter-js/)
- [Canvas getImageData MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
- [tsup 번들러](https://tsup.egoist.dev/)
- [Three.js Particle 시스템 사례](https://threejs.org/examples/#webgl_points_sprites)

---

**Generated by**: idea-generator-critic probe  
**Index**: #0021  
**Evaluation Score**: 7.52/10 (after 1 iterations)  
**Status**: ✅ Ready for consideration


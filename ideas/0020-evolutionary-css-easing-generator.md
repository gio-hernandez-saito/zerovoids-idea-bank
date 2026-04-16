---
id: idea-0020
title: "진화 알고리즘 기반 CSS 이징 함수 생성기"
generated: 2026-04-16T02:26:57.660Z

category: utility
subcategory: animation-tooling
difficulty: intermediate
tags: [css, easing, genetic-algorithm, animation, typescript, npm-package]

estimated_time: "3-5 days"
tech_stack: [TypeScript, Vite, CSS Houdini]
languages: [TypeScript]

evaluation:
  originality: 9
  feasibility: 8
  market_need: 7
  monetization_potential: 5
  tech_interest: 9
  learning_value: 8
  open_source_value: 9
  distinctness: 9

  total: 7.44
  iterations: 1
  status: pass

inspiration_source: "생물학 도메인 크로스오버 — 진화 알고리즘으로 CSS cubic-bezier 이징 함수 진화"
---

# 진화 알고리즘 기반 CSS 이징 함수 생성기

> 자연 선택처럼 이징 함수를 '진화'시켜, 원하는 움직임 느낌을 설명하면 가장 잘 맞는 cubic-bezier를 찾아주는 npm 라이브러리

## 🎯 문제

### 현재 상황
cubic-bezier 이징 함수를 손으로 조정하는 것은 시행착오의 연속이다. `ease-in-out`, `ease-in-out-back` 같은 이름 있는 함수들은 있지만, "천천히 시작했다가 탄력 있게 끝나면서 약간 흔들리는" 느낌을 코드로 표현하려면 4개의 숫자를 맹목적으로 조정해야 한다.

### 불편한 점
- **언어와 숫자 사이의 단절**: "바운시하게", "부드럽게 착지하게" 같은 직관적인 설명을 cubic-bezier 값으로 변환할 방법이 없다
- **조합 폭발**: 4개의 컨트롤 포인트(0~1 범위)가 만드는 공간은 방대해서 수동 탐색이 비효율적이다
- **반복 작업**: 디자이너가 원하는 느낌에 가까운 이징을 찾으려고 개발자가 수십 번 조정을 반복한다

### 누가 겪는가?
모션 디자인을 중요시하는 프론트엔드 개발자와 UI 엔지니어, 특히 CSS 애니메이션 라이브러리를 만들거나 인터랙션 디자인을 다루는 사람들

---

## 💡 해결책

### 핵심 개념
유전 알고리즘(Genetic Algorithm)을 사용해 cubic-bezier 이징 함수의 파라미터 공간을 탐색한다. 사용자가 "목표 곡선"을 정의하면 — 키프레임 샘플 배열이든, 기존 이징 이름이든, 직접 그린 곡선이든 — 라이브러리가 수백 세대에 걸쳐 후보 이징 함수들을 교배·변이·선택해 가장 근접한 cubic-bezier를 찾아낸다.

이것을 npm 패키지로 배포하면 `evolve-easing` 하나로 어떤 JS 환경에서도 사용 가능하다.

### 작동 방식
1. **목표 정의**: 원하는 곡선을 키프레임 배열(`[{t: 0, v: 0}, {t: 0.5, v: 0.9}, {t: 1, v: 1}]`), 이름(`"ease-in-out-back"`), 또는 설명 객체로 전달
2. **초기 집단 생성**: 랜덤한 cubic-bezier 파라미터 집합 N개를 생성 (첫 세대)
3. **적합도 평가**: 각 후보의 곡선을 수치 적분으로 샘플링해 목표 곡선과 MSE(평균제곱오차) 계산
4. **선택·교배·변이**: 적합도 높은 개체들을 교배하고, 일부에 무작위 변이를 주입해 다음 세대 생성
5. **수렴 반환**: 설정한 세대 수 또는 오차 임계값 도달 시 최적 cubic-bezier 반환

### 핵심 기능
- **`evolve(target, options)`**: 메인 함수. 비동기로 실행, 진행 콜백 지원
- **`evolveSync(target, options)`**: 소규모 탐색용 동기 버전
- **사전 정의 목표**: `BOUNCY`, `SNAPPY`, `GENTLE`, `ELASTIC` 등 느낌 프리셋
- **진행 스트림**: 세대별 최적해 변화를 이터레이터로 노출해 실시간 미리보기 가능
- **재현성**: seed 파라미터로 같은 결과 재생산 가능

---

## 🏗️ 기술 아키텍처

### 시스템 개요

```
사용자 입력 (목표 곡선)
        │
        ▼
┌──────────────────┐
│  Target Sampler  │  목표 곡선을 N개 시간점에서 샘플링
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Initial Population│  랜덤 cubic-bezier 파라미터 집합 생성
│   Generator      │  [p1x, p1y, p2x, p2y] × populationSize
└────────┬─────────┘
         │
         ▼ (루프: maxGenerations 횟수)
┌──────────────────┐
│ Fitness Evaluator│  각 개체의 MSE 계산
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Selection +     │  토너먼트 선택 + 단일점 교배 + 가우시안 변이
│  Crossover +     │
│  Mutation        │
└────────┬─────────┘
         │
         ▼
최적 cubic-bezier 반환
```

### 기술 스택 선택 이유
- **TypeScript 단독**: 런타임 의존성 제로. 브라우저, Node.js, Deno, Bun 모두 지원. 번들 크기 최소화
- **수치 계산 직접 구현**: cubic-bezier 샘플링은 de Casteljau 알고리즘으로 직접 구현 — 외부 의존성 없음
- **Worker 지원 (선택)**: 대규모 탐색 시 `WorkerPool` 옵션으로 Web Worker에서 병렬 실행

### 주요 기술적 도전
1. **cubic-bezier 정확한 역산**: CSS cubic-bezier는 `t` 파라미터와 시간이 일치하지 않음. 뉴턴-랩슨 방법으로 정확한 샘플링 구현 필요
2. **수렴 속도 vs 다양성 균형**: 너무 빠른 수렴 = 지역 최적해. 변이율과 선택 압력 튜닝이 핵심
3. **유효한 파라미터 공간**: CSS cubic-bezier는 `p1x, p2x ∈ [0, 1]` 제약. 변이 후 클리핑 vs 패널티 함수 선택

---

## 🎨 무엇이 흥미로운가?

### 독특한 각도
생물학의 자연 선택 메커니즘을 CSS 애니메이션의 파라미터 탐색에 적용한다. "이징 함수의 적자생존"이라는 메타포가 기술적으로 실제로 작동한다. 기존 도구들은 시각적 편집기(bezier.vision, cubic-bezier.com)를 제공하지만, 프로그래매틱하게 목표 곡선으로 수렴하는 라이브러리는 없다.

### 혁신 포인트
- 생물 진화 메커니즘(선택, 교배, 변이)을 연속 파라미터 공간 최적화에 적용
- "느낌"을 키프레임 배열로 수치화해 알고리즘의 목표 함수로 사용
- 진화 과정 자체를 이터레이터로 노출해 애니메이션 미리보기에 활용 가능

### 학습 기회
- 유전 알고리즘의 핵심 연산자 (선택, 교배, 변이) 직접 구현
- cubic-bezier 수치 해석 (de Casteljau 알고리즘, 뉴턴-랩슨 방법)
- 최적화 문제의 적합도 함수 설계

---

## 📊 시장 및 검증

### 유사 프로젝트
- **cubic-bezier.com** (시각적 편집기): 수동 조작만 가능. 프로그래매틱 탐색 없음
- **easings.net** (프리셋 모음): 고정된 함수만 제공. 커스텀 목표 곡선으로 탐색 불가
- **@emotion/css timing functions**: 유틸리티지만 탐색 기능 없음

### 이 격차가 존재하는 이유
수치 최적화와 CSS 애니메이션을 동시에 이해하는 개발자가 드물다. 기존 도구들은 시각 도구로 접근했고, 알고리즘으로 접근한 npm 패키지는 존재하지 않는다.

### 성공 지표
- [ ] 기존 이징 함수(`ease-in-out-back`)를 목표로 주면 0.001 이하 MSE로 재현 가능
- [ ] 100세대 기준 200ms 이내 수렴 (Node.js 환경)
- [ ] TypeScript 타입 완전 지원, 의존성 0개

---

## 🚀 구현 로드맵

### Phase 1: 핵심 알고리즘 (1-2일)
**목표**: 작동하는 GA 엔진
- cubic-bezier 샘플러 구현 (de Casteljau + 뉴턴-랩슨)
- 초기 집단 생성기
- 적합도 평가 (MSE)
- 선택 연산자 (토너먼트 선택)
- 교배 연산자 (블렌드 교배 BLX-α)
- 변이 연산자 (가우시안)

### Phase 2: API 설계 및 배포 (1-2일)
**목표**: npm 배포 가능한 패키지
- `evolve()` / `evolveSync()` 퍼블릭 API
- 목표 형식 파서 (키프레임 배열, 이징 이름, 프리셋)
- 진행 콜백 / 이터레이터 인터페이스
- TypeScript 타입 정의
- Vitest 단위 테스트

### Phase 3: 문서 및 데모 (1일)
**목표**: 공유 가능한 상태
- README (설치, 사용법, 옵션 레퍼런스)
- 브라우저 데모 페이지 (Vite로 빌드)
- JSDoc 주석
- npm publish

### 기술 마일스톤
| 단계 | 산출물 | 성공 기준 |
|------|--------|----------|
| 1일 | GA 엔진 | ease-in-out을 99% 정확도로 재현 |
| 2일 | 공개 API | TypeScript에서 타입 에러 없이 사용 가능 |
| 3일 | npm 패키지 | `npm install evolve-easing` 후 즉시 사용 |

---

## 🌱 배우게 되는 것

### 새로운 기술 및 개념
- **유전 알고리즘 핵심 연산**: 선택·교배·변이를 실제 최적화 문제에 적용하는 감각
- **cubic-bezier 수치 해석**: CSS가 내부적으로 어떻게 곡선을 계산하는지 깊이 이해
- **연속 최적화 vs 이산 최적화**: GA가 언제 그래디언트 기반 방법보다 유리한지 체감

### 성장 기회
- 수학적 개념(뉴턴-랩슨, MSE, 가우시안 분포)을 실용적 코드로 구현하는 경험
- 의존성 없는 순수 TypeScript 라이브러리 아키텍처 설계
- 알고리즘 수렴 속도와 품질 사이의 하이퍼파라미터 튜닝 직관력

### 도전 영역
cubic-bezier의 `t` 파라미터와 CSS 시간 사이의 비선형 관계를 수치적으로 정확히 샘플링하는 것이 예상보다 까다롭다. 이 부분에서 수치 해석의 실전 감각을 얻을 수 있다.

---

## 🌍 오픈소스 가능성

### 커뮤니티 가치
모션 디자인을 코드로 다루는 모든 프론트엔드 개발자에게 유용하다. 특히 디자이너가 Figma에서 커스텀 이징을 정의하고, 개발자가 동일한 곡선을 CSS로 재현해야 할 때 강력한 도구가 된다.

### 재사용성
- 의존성 제로 → 어떤 프로젝트에도 추가 가능
- 입출력이 명확한 순수 함수 → 테스트·통합 용이
- Framer Motion, GSAP 등 애니메이션 라이브러리와 조합 가능

### 문서화 계획
- 설치부터 첫 실행까지 2분 이내 가능한 README
- 실제 디자인 시나리오 기반 예제 ("이 Figma 이징을 코드로")
- 알고리즘 파라미터 튜닝 가이드
- 기여 가이드라인

---

## 💭 확장 및 미래 작업

### 자연스러운 확장
- **다목적 최적화**: 하나가 아닌 여러 이징 함수 프리셋 세트를 한번에 최적화
- **Spring 물리 파라미터 탐색**: cubic-bezier 외에 스프링 시뮬레이션(stiffness, damping) 파라미터까지 확장
- **Figma 플러그인 연동**: Figma의 커스텀 이징을 직접 가져와 CSS로 변환

### 연구 질문
- 토너먼트 선택 vs 룰렛 휠 선택: 이 문제에서 어느 쪽이 더 빠르게 수렴하는가?
- 집단 크기와 세대 수의 트레이드오프: 같은 시간 예산에서 최적 조합은?

### 커뮤니티 기여 가능 영역
- 새로운 선택/교배 연산자 추가
- 언어별 바인딩 (Python, Rust)
- 브라우저 데모 개선 (실시간 진화 과정 시각화)

---

## 🔗 관련 컨텍스트

**영감**: 생물학 도메인 크로스오버 (진화 알고리즘) + 주간 제약 (npm 단일 목적 유틸리티 라이브러리)

**관련 도구**: cubic-bezier.com, easings.net, Framer Motion spring 에디터

**참고 자료**:
- [CSS cubic-bezier 스펙 (W3C)](https://www.w3.org/TR/css-easing-1/)
- de Casteljau 알고리즘 — 베지어 곡선 수치 계산
- Introduction to Evolutionary Algorithms (Xinjie Yu, Mitsuo Gen)

---

**Generated by**: idea-generator-critic probe
**Index**: #0020
**Evaluation Score**: 7.44/10 (after 1 iterations)
**Status**: ✅ Ready for consideration


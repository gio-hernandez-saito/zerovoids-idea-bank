---
id: idea-0026
title: "WASM 기반 실시간 문법 구조 비교기"
generated: 2026-05-07T02:37:44.534Z

category: developer-tool
subcategory: language-analysis
difficulty: advanced
tags: [wasm, webassembly, syntax-tree, linguistics, nlp, diff, typescript, tree-sitter]

estimated_time: "2-3주"
tech_stack: [WebAssembly, Tree-sitter, TypeScript, Vite, Monaco Editor]
languages: [TypeScript, Rust, CSS]

evaluation:
  originality: 8
  feasibility: 7
  market_need: 7
  monetization_potential: 4
  tech_interest: 9
  learning_value: 9
  open_source_value: 8
  distinctness: 9

  total: 7.48
  iterations: 1
  status: pass

inspiration_source: "주간 제약: WebAssembly 활용 + 언어학 도메인: 문법 구조 분석"
---

# WASM 기반 실시간 문법 구조 비교기

> 두 코드 스니펫의 AST(추상 구문 트리)를 언어학적 문법 구조처럼 나란히 비교하고, 의미적으로 동일한 코드가 얼마나 다른 구조를 가지는지 실시간으로 시각화한다.

## 🎯 문제 정의

### 현재 상황
코드 리뷰나 리팩터링 시, 두 버전의 코드가 "의미적으로 같다"고 말하는 건 쉽지만 구조적으로 얼마나 다른지 파악하기는 어렵다. 기존 diff 도구들은 텍스트 줄(line) 차이만 보여줄 뿐, 구문 트리(AST) 레벨의 구조 차이는 드러내지 않는다. 언어학에서 두 문장의 문법 구조를 비교하듯, 코드도 구조 단위로 비교할 수 있어야 한다.

### 주요 불편함
- **텍스트 diff의 한계**: 공백, 세미콜론, 변수명 변경이 실질적 구조 변화를 가리킨다
- **AST 도구의 진입 장벽**: astexplorer.net 같은 도구는 단일 파일만 보여주고 비교 기능이 없다
- **리팩터링 검증 어려움**: 함수를 추출하거나 구조를 바꿨을 때 "진짜로" 달라진 게 무엇인지 직관적으로 보기 힘들다

### 이런 사람에게 필요하다
주니어 개발자에게 리팩터링을 가르치는 멘토, TypeScript/JavaScript 코드 리뷰어, 컴파일러나 파서를 공부하는 학습자, 언어학적 관점으로 코드를 분석하는 PL(프로그래밍 언어) 연구자.

---

## 💡 해결책

### 핵심 개념
Tree-sitter를 WebAssembly로 컴파일하여 브라우저에서 직접 실행하고, 두 코드 스니펫의 AST를 실시간으로 파싱한다. 두 트리를 나란히 렌더링하면서 구조적으로 동일한 노드는 연결선으로 매핑하고, 달라진 노드는 색상으로 강조 표시한다. 언어학의 문장 구조 분석(constituency tree)에서 영감을 받아, 코드를 "문법적 문장"으로 보는 시각을 제공한다.

### 작동 방식
1. **코드 입력**: 두 개의 Monaco Editor 패널에 비교할 코드 스니펫을 입력한다
2. **WASM 파싱**: Tree-sitter WASM 바이너리가 브라우저 안에서 두 코드를 즉시 파싱하여 AST를 생성한다
3. **트리 diff 계산**: Zhang-Shasha 알고리즘 등 tree edit distance 방법으로 두 트리의 최소 편집 거리를 계산한다
4. **시각화**: 두 AST를 SVG로 렌더링하고, 매핑된 노드 간에 연결선을 그린다. 삭제·추가·수정된 노드를 각기 다른 색으로 표시한다
5. **언어학적 요약**: 변경 통계(삭제된 노드 수, 추가된 노드 수, 이동된 서브트리 수)를 언어학 용어(구문 단위 변화, 의미 보존 여부)로 요약한다

### 주요 기능
- **언어 선택**: TypeScript, JavaScript, Python, Rust 등 Tree-sitter가 지원하는 언어 선택 가능
- **의미 보존 점수**: 두 코드가 구조적으로 얼마나 유사한지 0~100% 점수로 표시
- **서브트리 하이라이트**: 클릭한 노드의 대응 노드가 반대편 트리에서 하이라이트됨
- **편집 거리 경로 재생**: 트리 A에서 트리 B로 변환되는 편집 시퀀스를 단계별 애니메이션으로 재생

---

## 🏗️ 기술 아키텍처

### 시스템 개요

```
┌─────────────────────────────────────────┐
│           브라우저 (클라이언트 전용)       │
│                                         │
│  ┌───────────┐       ┌───────────┐      │
│  │ Monaco    │       │ Monaco    │      │
│  │ Editor A  │       │ Editor B  │      │
│  └─────┬─────┘       └─────┬─────┘      │
│        │                   │            │
│        ▼                   ▼            │
│  ┌─────────────────────────────────┐    │
│  │   Tree-sitter WASM (파싱 엔진)   │    │
│  │   (Rust → WASM 컴파일)          │    │
│  └──────────────┬──────────────────┘    │
│                 │ AST A, AST B          │
│                 ▼                       │
│  ┌─────────────────────────────────┐    │
│  │   Tree Diff Engine (TypeScript) │    │
│  │   (Zhang-Shasha 알고리즘)       │    │
│  └──────────────┬──────────────────┘    │
│                 │ 편집 시퀀스            │
│                 ▼                       │
│  ┌─────────────────────────────────┐    │
│  │   SVG 시각화 레이어 (D3-free)   │    │
│  │   (순수 SVG + CSS 애니메이션)   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 기술 스택 선택 근거
- **Tree-sitter (WASM)**: 100개 이상의 언어를 지원하는 파서 라이브러리. Rust로 작성되어 WASM으로 컴파일 시 브라우저에서 네이티브에 가까운 파싱 속도를 제공한다. 서버 없이 클라이언트 전용 동작 가능.
- **Monaco Editor**: VS Code와 동일한 에디터 컴포넌트로 구문 강조와 코드 편집 UX가 뛰어나다
- **TypeScript (diff 엔진)**: Zhang-Shasha tree edit distance 알고리즘을 직접 구현. 외부 의존성 없이 순수 로직으로 작성해 학습 가치를 극대화
- **순수 SVG + CSS**: D3.js 없이 SVG를 직접 계산·렌더링하여 번들 크기를 줄이고 렌더링 제어권을 완전히 가져감

### 핵심 기술 도전
1. **WASM 초기화 비용**: Tree-sitter WASM 바이너리(~1MB)를 로딩하는 초기 시간이 느릴 수 있다. Web Workers로 파싱을 오프로드하고, OPFS(Origin Private File System)로 WASM 바이너리를 캐싱하는 방식으로 해결.
2. **Tree edit distance 복잡도**: Zhang-Shasha 알고리즘은 O(n²m²) 복잡도라 큰 트리에서 느려진다. 실용적 상한선(노드 500개 초과 시 경고)을 설정하고, 필요 시 근사 알고리즘(PQ-Gram)으로 전환하는 폴백 로직 구현.
3. **두 트리의 시각적 정렬**: 레이아웃 계산 시 두 트리의 높이·너비가 달라 연결선이 엉킬 수 있다. 각 트리를 독립적으로 Reingold-Tilford 레이아웃으로 배치하고 연결선은 베지어 곡선으로 처리.

---

## 🎨 무엇이 흥미로운가?

### 독특한 관점
기존 코드 diff 도구(git diff, WinMerge 등)는 모두 **텍스트 레벨**에서 작동한다. 이 프로젝트는 언어학에서 문장의 문법 구조를 분석하는 방식과 같이 코드를 **구문 트리 레벨**에서 비교한다. 같은 로직을 다른 스타일로 작성한 두 코드가 얼마나 구조적으로 다른지(혹은 얼마나 같은지)를 시각적으로 보는 경험은 완전히 새롭다.

### 혁신 포인트
- **WASM을 순수 클라이언트 파싱 엔진으로 활용**: 서버리스 아키텍처로 개인 코드를 외부로 전송하지 않음
- **언어학 메타포 적용**: 코드 노드를 어절·구·절로 분류하는 언어학적 프레임으로 설명
- **편집 시퀀스 애니메이션**: 트리 A가 트리 B로 변환되는 최소 편집 경로를 단계별로 재생하는 기능은 컴파일러 교육에서도 사용 가능

### 학습 기회
- WebAssembly 모듈 초기화, 메모리 관리, Web Workers 통신
- Tree edit distance 알고리즘 (Zhang-Shasha, PQ-Gram)
- Reingold-Tilford 트리 레이아웃 알고리즘
- OPFS(Origin Private File System) API 활용
- Tree-sitter의 노드 타입 시스템과 언어 문법 이해

---

## 📊 시장 및 검증

### 유사 프로젝트
- **astexplorer.net**: 단일 AST 탐색기. 두 파일 비교 기능 없음. 이 프로젝트는 비교에 특화됨
- **difftastic** (GitHub): CLI 기반 구문 인식 diff 도구. 터미널 전용이며 시각화 없음. 이 프로젝트는 브라우저 기반 대화형 시각화에 초점
- **ts-morph / babel AST**: Node.js 라이브러리들. 브라우저 대화형 비교 UI 없음

### 이 공백이 존재하는 이유
AST 비교를 브라우저에서 실시간으로 하려면 성능 좋은 파서가 WASM으로 실행되어야 한다. Tree-sitter의 WASM 빌드가 안정화된 것은 최근 일이며, 이를 활용한 대화형 비교 도구는 아직 없다. tree edit distance 알고리즘을 브라우저에서 구현한 사례도 극히 드물다.

### 성공 지표
- [ ] TypeScript 코드 500줄 이내에서 2초 이내 파싱 및 diff 완료
- [ ] 언어 선택 시 해당 Tree-sitter WASM 바이너리를 동적 로딩하는 lazy loading 구현
- [ ] 편집 시퀀스 애니메이션이 10단계 이상 부드럽게 재생

---

## 🚀 구현 로드맵

### Phase 1: MVP (1주차)
**목표**: 단일 언어(TypeScript)에서 두 코드의 AST를 파싱하고 나란히 표시
- Tree-sitter WASM을 Vite 프로젝트에 통합하고 Web Worker로 파싱 오프로드
- Reingold-Tilford 레이아웃 알고리즘 구현으로 트리 SVG 렌더링
- Monaco Editor 두 개를 좌우로 배치하고 실시간 파싱 연동

### Phase 2: 비교 기능 (2주차)
**목표**: 두 트리의 diff 계산 및 시각적 매핑
- Zhang-Shasha tree edit distance 알고리즘 TypeScript 구현
- 노드 매핑을 베지어 곡선 연결선으로 시각화
- 삭제(빨강), 추가(초록), 이동(파랑), 변경(노랑) 색상 코딩
- 의미 보존 점수(유사도 %) 계산 및 표시

### Phase 3: 언어 확장 및 폴리시 (3주차)
**목표**: 다국어 지원 및 편집 애니메이션
- Python, Rust, JavaScript Tree-sitter WASM 바이너리 lazy loading
- 편집 시퀀스 단계별 재생 애니메이션 구현
- OPFS를 활용한 WASM 바이너리 캐싱
- 언어학적 요약 패널 (노드 타입별 변경 통계)

### 기술 마일스톤
| 주차 | 산출물 | 성공 기준 |
|------|--------|-----------|
| 1주 | WASM 파서 + 트리 렌더링 | TypeScript 코드 AST가 SVG로 표시됨 |
| 2주 | Diff 엔진 + 매핑 시각화 | 두 트리 간 편집 거리 계산 및 연결선 렌더링 |
| 3주 | 다언어 + 애니메이션 | 3개 언어 지원, 편집 시퀀스 재생 가능 |

---

## 🌱 배울 수 있는 것들

### 새로운 기술 및 개념
- **WebAssembly 실전**: WASM 모듈 초기화, 메모리 레이아웃, JS-WASM 인터페이스 설계 — 이론이 아닌 실제 파서 엔진을 다루며 체득
- **Tree edit distance 알고리즘**: Zhang-Shasha 알고리즘은 코드 클론 탐지, 문서 비교, XML diff 등 다양한 분야에 응용되는 핵심 알고리즘
- **트리 레이아웃 알고리즘**: Reingold-Tilford는 계층 데이터 시각화의 기초. 조직도, 파일 트리 등 어디서나 재활용 가능
- **OPFS API**: 브라우저의 Origin Private File System은 새로운 파일 액세스 표준. Service Worker, 캐싱 전략과 결합 방법 학습

### 성장 기회
- 컴파일러 프론트엔드(파싱, AST)에 대한 직관 — 언어를 이해하는 방식이 달라진다
- 알고리즘 복잡도가 실제 UX에 영향을 주는 상황에서 성능 트레이드오프 결정 경험
- Web Worker를 통한 멀티스레드 브라우저 프로그래밍 패턴 내면화

### 도전 영역
WASM 통합은 일반 npm 패키지와 달리 바이너리 메모리 관리, 비동기 초기화, Worker 통신 등 low-level 개념을 다뤄야 한다. 알고리즘 구현도 단순 API 호출이 아니라 직접 작성해야 하므로 확실한 실력 향상이 가능하다.

---

## 🌍 오픈소스 가치

### 커뮤니티 기여
- **교육자**: 컴파일러 강의에서 "이 두 코드가 AST 레벨에서 얼마나 다른가"를 시각적으로 보여줄 수 있다
- **코드 리뷰어**: PR에서 리팩터링된 코드가 구조적으로 동등한지 빠르게 검증
- **언어 설계자**: 두 문법 규칙이 생성하는 트리 구조를 비교해 문법 설계 결정에 활용

### 재사용성
- Tree-sitter WASM 통합 보일러플레이트는 어떤 코드 분석 도구에서도 재사용 가능
- Zhang-Shasha 알고리즘 TypeScript 구현은 독립 npm 패키지로 분리 가능
- Reingold-Tilford SVG 렌더러도 독립 라이브러리로 공개 가능

### 문서화 계획
- README에 WASM 통합 방법을 단계별로 설명 (초보자도 따라할 수 있도록)
- 알고리즘 섹션: Zhang-Shasha를 시각적 예시로 설명하는 문서
- 예제 비교 케이스: for문 vs forEach, class vs functional, async/await vs Promise 체인
- 기여 가이드: 새 언어 추가 방법 (Tree-sitter 문법 파일 연동)

---

## 💭 확장 및 향후 작업

### 자연스러운 확장
- **URL 공유 기능**: 두 코드 스니펫을 URL에 인코딩하여 공유 가능 링크 생성
- **GitHub PR 통합**: PR URL을 입력하면 변경된 파일의 AST diff를 자동으로 비교
- **언어 간 비교**: TypeScript 코드와 Rust 코드를 의미적으로 비교 (구조 패턴 레벨에서)

### 연구 질문
- Tree edit distance의 "의미 보존" 정의를 코드 시맨틱으로 확장할 수 있는가?
- PQ-Gram 근사 알고리즘이 실용적 상한선에서 얼마나 정확한가?
- AST 구조 유사도가 코드 품질 지표로 활용될 수 있는가?

### 커뮤니티 기여 유도
- 새 언어 Tree-sitter WASM 바이너리 추가 기여 (가이드 제공)
- 언어별 노드 타입 한국어/다국어 레이블 번역
- 대안 레이아웃 알고리즘 플러그인 (방사형, 수평 트리 등)

---

## 🔗 관련 컨텍스트

**영감**: 주간 제약(WebAssembly 활용) + 언어학 도메인 교차(문법 구조 분석) → 코드의 문법 구조를 언어학적으로 비교하는 아이디어로 발전

**관련 프로젝트**: astexplorer.net, difftastic (CLI), tree-sitter 공식 playground

**참고 자료**:
- Zhang & Shasha (1989), "Simple fast algorithms for the editing distance between trees"
- Tree-sitter 공식 문서 — WASM 빌드 가이드
- Reingold & Tilford (1981), "Tidier Drawings of Trees"
- OPFS MDN 문서 — Origin Private File System

---

**Generated by**: idea-generator-critic probe  
**Index**: #0026  
**Evaluation Score**: 7.48/10 (1회 시도)  
**Status**: ✅ 검토 준비 완료


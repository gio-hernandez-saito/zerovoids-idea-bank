---
id: idea-0027
title: "WebTransport 기반 실시간 대중교통 혼잡도 시뮬레이터"
generated: 2026-05-11T02:51:41.749Z

category: visualization
subcategory: transport-simulation
difficulty: advanced
tags: [webtransport, simulation, transit-data, real-time, typescript, canvas]

estimated_time: "2-3 weeks"
tech_stack: [WebTransport, TypeScript, Canvas API, Vite, Node.js]
languages: [TypeScript, JavaScript]

evaluation:
  originality: 8
  feasibility: 7
  market_need: 7
  monetization_potential: 5
  tech_interest: 9
  learning_value: 9
  open_source_value: 7
  distinctness: 8

  total: 7.42
  iterations: 1
  status: pass

inspiration_source: "Weekly constraint: WebAssembly/WebGPU/최신 Web API + Cross-domain: 교통 흐름 시뮬레이션"
---

# WebTransport 기반 실시간 대중교통 혼잡도 시뮬레이터

> 지하철·버스 노선 전체를 브라우저에서 실시간으로 시뮬레이션하며, WebTransport가 기존 WebSocket 대비 얼마나 빠른지 체감할 수 있는 개발자 실험 도구

## 🎯 문제 정의

### 현재 상황
실시간 대중교통 위치 데이터를 다루는 개발자들은 대부분 WebSocket으로 서버와 통신하지만, 수백 개 차량이 동시에 위치를 업데이트할 때 HOL(Head-Of-Line) 블로킹이 발생한다. WebTransport는 이 문제를 해결할 수 있는 HTTP/3 기반 신규 Web API지만, 실제 대규모 시나리오에서 어떻게 동작하는지 쉽게 실험할 수 있는 도구가 없다.

### 주요 불편 사항
- **프로토콜 비교 불가**: WebSocket과 WebTransport를 같은 조건에서 나란히 비교해볼 수 있는 비주얼 도구가 없음
- **스트레스 테스트 어려움**: 수백 대 차량의 동시 위치 업데이트를 모사하는 테스트 환경 구축이 복잡함
- **HOL 블로킹 체감 불가**: 패킷 손실이 발생했을 때 두 프로토콜의 차이를 시각적으로 확인하기 어려움

### 이 문제를 겪는 사람
실시간 위치 추적 서비스를 개발하는 프론트엔드·풀스택 개발자, 대중교통 데이터 시각화 프로젝트를 진행하는 연구자, WebTransport를 프로덕션에 적용할지 고민하는 아키텍트

---

## 💡 해결책

### 핵심 개념
브라우저 Canvas 위에 서울 또는 임의의 도시 지하철 노선도를 렌더링하고, 가상의 열차 수백 대를 WebTransport Datagram과 Stream 두 가지 채널로 동시에 업데이트한다. 우측 패널에서는 WebSocket 모드와 실시간 레이턴시·프레임드롭 지표를 나란히 보여준다. 네트워크 조건(패킷 손실률, 대역폭 제한)을 슬라이더로 조절하면 두 프로토콜의 회복 속도 차이가 시각적으로 드러난다.

### 동작 방식
1. **시뮬레이터 서버 시작**: Node.js 기반 WebTransport 서버(HTTP/3)와 WebSocket 서버를 동시에 구동
2. **노선 데이터 로드**: GeoJSON 형식의 지하철 노선 및 정거장 데이터를 파싱해 Canvas에 렌더링
3. **가상 차량 생성**: 노선 위를 이동하는 열차 N대를 생성하고 위치를 서버에서 초당 10회 브로드캐스트
4. **프로토콜 분기**: WebTransport Datagram 채널과 WebSocket 채널이 각각 독립적으로 같은 데이터 수신
5. **네트워크 조건 조작**: 슬라이더로 패킷 손실률·지연 주입 후 두 채널의 렌더링 부드러움과 지표 비교

### 주요 기능
- **듀얼 캔버스 모드**: 화면 좌우로 WebTransport vs WebSocket 결과를 동시에 렌더링해 차이를 직관적으로 확인
- **실시간 지표 대시보드**: 수신 레이턴시 히스토그램, 프레임 드롭 카운터, 메시지 손실률을 실시간 그래프로 표시
- **혼잡도 히트맵**: 정거장 간 열차 밀도를 색상으로 표현해 어느 구간에 열차가 몰리는지 시각화
- **스트레스 슬라이더**: 동시 차량 수(10~500대), 업데이트 주기, 패킷 손실률을 실시간 조절
- **Datagram vs Stream 전환**: WebTransport 내에서도 비신뢰성 Datagram과 신뢰성 Stream 중 선택해 트레이드오프 체험

---

## 🏗️ 기술 아키텍처

### 시스템 구조

```
┌─────────────────────────────────────────────────────┐
│                  Browser Client                     │
│  ┌──────────────┐         ┌──────────────┐          │
│  │  Canvas A    │         │  Canvas B    │          │
│  │ (WebTransport│         │ (WebSocket   │          │
│  │   렌더링)    │         │   렌더링)    │          │
│  └──────┬───────┘         └──────┬───────┘          │
│         │ Datagram/Stream        │ ws frame          │
└─────────┼────────────────────────┼──────────────────┘
          │ HTTP/3 (QUIC)          │ TCP
┌─────────┼────────────────────────┼──────────────────┐
│         ▼           Server       ▼                  │
│  ┌──────────────┐         ┌──────────────┐          │
│  │ WebTransport │         │  WebSocket   │          │
│  │   Handler    │◄──┐     │   Handler    │          │
│  └──────────────┘   │     └──────────────┘          │
│                   ┌─┴──────────────┐                │
│                   │  시뮬레이터 엔진│                │
│                   │  (차량 위치     │                │
│                   │   계산 + 브로   │                │
│                   │   드캐스트)    │                │
│                   └────────────────┘                │
└─────────────────────────────────────────────────────┘
```

### 기술 스택 선정 이유
- **WebTransport**: 이 프로젝트의 핵심 학습 목표. QUIC 기반으로 HOL 블로킹 없이 독립 스트림 제공
- **Canvas API**: WebGL 없이도 수백 개 이동 객체를 60fps로 렌더링 가능. OffscreenCanvas로 워커 분리 예정
- **Node.js (node-quic / @fails-components/webtransport)**: 현재 Node.js WebTransport 서버 구현체 중 가장 성숙한 라이브러리
- **TypeScript**: 차량 위치·메시지 스키마를 타입으로 강하게 정의해 직렬화 버그 방지
- **Vite**: 빠른 HMR로 시뮬레이션 파라미터 조정 반복을 빠르게

### 핵심 기술 도전
1. **HTTP/3 서버 인증서 문제**: WebTransport는 HTTPS가 필수. 로컬 개발용 자체 서명 인증서 설정 및 Chrome 플래그 활성화 과정이 까다로움. mkcert 자동화 스크립트로 해결 예정
2. **이진 직렬화 최적화**: 초당 500대 × 10회 = 5,000개 위치 메시지를 JSON이 아닌 ArrayBuffer(Float32 x,y + Uint16 id)로 인코딩해 대역폭 최소화
3. **OffscreenCanvas 워커 분리**: 두 캔버스를 별도 Web Worker로 옮겨 메인 스레드 블로킹 없이 독립 렌더링

---

## 🎨 무엇이 흥미로운가?

### 독창적 관점
대중교통 시뮬레이터는 흔히 서비스 기획자나 도시공학자를 위한 도구지만, 이 프로젝트는 **프로토콜 성능 비교**를 목적으로 재해석했다. 열차가 아니라 패킷이 목적지에 도달하는 이야기다.

### 혁신 포인트
- 동일 데이터 소스를 두 프로토콜로 동시에 수신해 A/B 비교하는 시각적 실험 프레임워크
- WebTransport Datagram(비신뢰) vs Stream(신뢰) 트레이드오프를 실시간 애니메이션으로 체감
- 대중교통 혼잡도 히트맵이라는 친숙한 메타포로 추상적인 네트워크 개념을 직관화

### 학습 기회
- WebTransport API 전체 생명주기 (QUIC 연결, 세션, Stream, Datagram)
- QUIC HOL 블로킹 해소 원리와 HTTP/3 기본 개념
- OffscreenCanvas + Web Worker 패턴으로 고성능 캔버스 렌더링
- 이진 직렬화(ArrayBuffer, DataView) 기법
- 네트워크 시뮬레이션에서 통계 지표(P50/P95 레이턴시) 수집 및 시각화

---

## 📊 시장 및 검증

### 유사 프로젝트
- **WebTransport 공식 에코챌린지 데모** (googlechrome.github.io/samples): 기본 에코 서버 수준. 대규모 실세계 시나리오 없음
- **transit.land / OpenMobilityData**: 실제 대중교통 데이터 제공이지만 프로토콜 비교 기능 없음
- **Artillery.io WebSocket 부하 테스트**: CLI 기반, 시각화 없음

### 이 공백이 존재하는 이유
WebTransport는 2023년 말 Chrome/Firefox에 안정화되었지만 Node.js 서버 생태계가 아직 성숙하지 않아 실제 예제가 매우 부족하다. 교통 데이터라는 구체적인 도메인과 결합한 시각적 비교 도구는 아직 아무도 만들지 않았다.

### 성공 지표
- [ ] 로컬에서 300대 차량을 WebTransport로 60fps 렌더링
- [ ] 패킷 손실 20% 조건에서 WebTransport와 WebSocket의 레이턴시 차이가 시각적으로 명확히 드러남
- [ ] GitHub에서 100+ 스타 (개발자 커뮤니티 반응)

---

## 🚀 구현 로드맵

### Phase 1: MVP (1주차)
**목표**: 단일 노선 위에서 열차 50대가 WebTransport로 움직이는 것을 확인
- Node.js HTTP/3 서버 + mkcert 인증서 자동화
- 단순 원형 노선 GeoJSON 생성 및 Canvas 렌더링
- WebTransport Datagram으로 차량 위치 브로드캐스트
- 기본 레이턴시 측정 로그

### Phase 2: 비교 기능 (2주차)
**목표**: WebSocket 채널 추가 및 듀얼 캔버스 A/B 모드 완성
- WebSocket 서버 및 동일 데이터 브로드캐스트
- 좌우 분할 캔버스 UI
- 실시간 지표 대시보드 (레이턴시 히스토그램, 손실률)
- 네트워크 조건 시뮬레이션 슬라이더 (tc 명령어 또는 서버 사이드 지연 주입)

### Phase 3: 완성도 (3주차)
**목표**: 공개 공유 가능한 수준으로 정제
- 혼잡도 히트맵 오버레이
- OffscreenCanvas 워커 마이그레이션으로 성능 최적화
- Datagram vs Stream 전환 UI
- README + 인터랙티브 데모 스크린샷

### 기술 마일스톤
| 주차 | 산출물 | 성공 기준 |
|------|--------|----------|
| 1 | WebTransport 서버 + 기본 시각화 | 50대 차량 30fps 이상 |
| 2 | 듀얼 캔버스 A/B 비교 | 패킷 손실 조건에서 차이 확인 |
| 3 | 최적화 + 문서화 | 300대 차량 60fps + 공개 배포 |

---

## 🌱 배우게 될 것들

### 새로운 스킬 및 개념
- **WebTransport API 전체 스택**: QUIC 연결 수립부터 Datagram 송수신까지 직접 구현
- **HTTP/3 및 QUIC 프로토콜**: 멀티플렉싱이 TCP와 근본적으로 다른 이유를 코드 레벨에서 이해
- **고성능 Canvas 렌더링**: OffscreenCanvas, requestAnimationFrame 최적화, 배칭 드로우콜
- **이진 직렬화**: JSON 대신 ArrayBuffer로 메시지를 인코딩해 대역폭을 3~5배 절감하는 기법

### 성장 기회
- "WebTransport가 빠르다"는 말을 직접 측정한 수치로 설명할 수 있게 됨
- 실시간 위치 추적 서비스 설계 시 프로토콜 선택 기준을 내재화
- 네트워크 성능 실험을 위한 재현 가능한 테스트 프레임워크 설계 능력

### 도전 구간
로컬 QUIC 서버 인증서 설정, Node.js WebTransport 라이브러리의 미성숙한 문서, 그리고 브라우저 HTTP/3 지원 여부 확인 등 환경 설정에서 상당한 저항이 예상된다. 이 마찰을 극복하는 과정 자체가 핵심 학습이다.

---

## 🌍 오픈소스 가치

### 커뮤니티 이점
WebTransport를 직접 써보고 싶지만 어디서 시작해야 할지 모르는 개발자들에게 완전히 동작하는 레퍼런스 구현체를 제공한다. 교통 도메인을 걷어내면 어떤 실시간 위치 추적 앱에도 재사용 가능한 구조다.

### 재사용성
- 차량 시뮬레이터 코어를 별도 패키지로 분리해 임의의 노선 데이터에 적용 가능
- WebTransport 서버 보일러플레이트가 현재 거의 없어 커뮤니티 기여 가능성 높음
- 지표 수집 모듈은 다른 프로토콜 비교 실험에도 범용 사용 가능

### 문서화 계획
- README: 30분 내 로컬 실행 보장하는 퀵스타트
- 아키텍처 다이어그램 + WebTransport 개념 설명
- 측정 방법론 문서 (레이턴시를 어떻게 정의하고 측정했는지)
- 기여 가이드: 새로운 도시 노선 데이터 추가 방법

---

## 💭 확장 및 향후 작업

### 자연스러운 확장
- 실제 GTFS(General Transit Feed Specification) 데이터 연동해 서울/도쿄 실제 지하철 시뮬레이션
- WebCodecs를 활용해 시뮬레이션 결과를 영상으로 인코딩·내보내기
- WebTransport Server Push로 혼잡 구간 알림 기능 시연

### 연구 질문
- 차량 수가 몇 대를 넘을 때 WebTransport가 WebSocket을 유의미하게 앞서는가?
- Datagram과 Stream의 손익분기점 패킷 손실률은 얼마인가?
- 모바일 네트워크 조건(4G 지연 + 패킷 손실)에서 차이가 더 두드러지는가?

### 커뮤니티 기여 가능 영역
- 새로운 도시 노선 GeoJSON 추가
- WebTransport vs WebRTC DataChannel 비교 모드
- 서버 사이드 Node.js 대신 Deno/Bun WebTransport 지원

---

## 🔗 관련 컨텍스트

**영감**: 주간 제약 조건(최신 Web API 활용) + 교차 도메인 영감(교통 흐름 시뮬레이션) 결합. Hacker News의 "Local AI needs to be the norm" 트렌드에서 "브라우저에서 직접 실험 가능한 네트워크 도구"라는 방향성을 가져옴.

**관련 프로젝트**: WASM 기반 실시간 문법 구조 비교기(기존 아이디어)와 "실시간 비교" 패턴을 공유하지만, 도메인(교통 vs 언어학)과 기술(WebTransport vs WASM)이 완전히 다름

**참고자료**:
- [WebTransport API MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)
- [@fails-components/webtransport Node.js 구현체](https://github.com/fails-components/webtransport)
- [GTFS Static Reference](https://developers.google.com/transit/gtfs/reference)
- [OffscreenCanvas MDN](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)

---

**Generated by**: idea-generator-critic probe  
**Index**: #0027  
**Evaluation Score**: 7.42/10 (1회 시도)  
**Status**: ✅ 검토 준비 완료


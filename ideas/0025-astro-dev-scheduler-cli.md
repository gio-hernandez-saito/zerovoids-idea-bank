---
id: idea-0025
title: "CLI 천문력 기반 개발 일정 최적화 도구"
generated: 2026-05-04T02:37:15.804Z

category: automation
subcategory: developer-workflow
difficulty: intermediate
tags: [cli, astronomy, scheduling, productivity, typescript, developer-experience]

estimated_time: "3-5일"
tech_stack: [Node.js, TypeScript, Commander.js, Astronomy Engine]
languages: [TypeScript]

evaluation:
  originality: 9
  feasibility: 8
  market_need: 6
  monetization_potential: 4
  tech_interest: 8
  learning_value: 7
  open_source_value: 7
  distinctness: 9

  total: 7.38
  iterations: 1
  status: pass

inspiration_source: "천문학 cross-domain + 자동화/워크플로우 최적화 DX 개선 주간 제약"
---

# CLI 천문력 기반 개발 일정 최적화 도구

> 달의 위상과 일몰 시간, 행성 궤도 데이터를 활용해 당신의 개발 집중 시간대를 자동으로 찾아주는 CLI 도구

## 🎯 문제

### 현재 상황
개발자들은 매일 언제 딥워크(deep work)를 할지, 언제 코드 리뷰나 미팅을 넣을지 결정해야 한다. 대부분은 습관적으로 오전 9시를 '집중 시간'으로 잡지만, 실제로는 날씨·일조량·수면 사이클 등 외부 환경 변수가 집중력에 큰 영향을 준다. 그러나 이러한 자연 주기를 개발 일정에 반영하는 도구는 존재하지 않는다.

### 불편함
- **맥락 없는 시간 블로킹**: 캘린더 앱은 천문학적 조건(일조 시간, 달의 위상)을 전혀 고려하지 않는다
- **계절 변화 미반영**: 겨울 단일(短日) 시즌과 여름 장일(長日) 시즌의 자연 에너지 흐름이 다른데, 일정은 항상 동일하다
- **의례적 루틴의 단조로움**: "매일 오전 9시 딥워크" 같은 패턴은 생체 리듬 변화를 무시한다

### 대상 사용자
자기 주도적으로 시간을 관리하는 프리랜서 개발자, 원격 근무자, 또는 생산성 최적화에 관심 있는 개발자

---

## 💡 해결책

### 핵심 개념
`astrosched`는 사용자의 위치(위도·경도)와 날짜를 입력받아, 그날의 일출·일몰 시간, 달의 위상, 황혼(golden hour) 시간대 등 천문학 데이터를 분석하고 — 이를 기반으로 딥워크·커뮤니케이션·리뷰·휴식 시간대를 추천하는 CLI 도구다. 별도 서버 없이 로컬에서 완전히 동작하며, `cron`이나 `launchd`와 연동해 매일 아침 터미널에 오늘의 최적 일정을 출력할 수 있다.

### 동작 방식
1. **위치 설정**: `astrosched config --lat 37.5 --lng 127.0` 으로 한 번만 위치 등록
2. **일정 생성**: `astrosched today` 실행 시 오늘의 천문 데이터를 계산하고, 시간대별 추천 작업 유형 출력
3. **캘린더 연동**: `astrosched export --format ical` 로 iCal 파일 생성, Google Calendar / Apple Calendar에 임포트
4. **주간 플래닝**: `astrosched week` 로 7일치 일정 최적화 테이블 출력
5. **cron 설정 도우미**: `astrosched cron-setup` 으로 매일 자동 실행 cron 명령어 생성

### 주요 기능
- **천문 일정 엔진**: 일출/일몰, 달의 위상(0~100%), 황혼 시간, 시민/항해/천문 박명(twilight) 계산
- **작업 유형 매핑**: 밝은 낮 시간대 → 딥워크, 황혼/새벽 → 창의 작업, 달이 밝은 밤 → 리뷰/문서화
- **iCal 내보내기**: 표준 `.ics` 파일로 출력해 어떤 캘린더 앱과도 호환
- **ASCII 달력 출력**: 터미널에서 바로 이번 주 달의 위상과 일정 요약을 확인

---

## 🏗️ 기술 아키텍처

### 시스템 개요

```
┌─────────────────────────────┐
│         CLI Layer           │  Commander.js 기반 명령어 파싱
│  (astrosched today/week/...) │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│      Astronomy Engine       │  날짜 + 위치 → 천문 데이터
│  (일출, 달 위상, 박명 계산)  │
└────────────┬────────────────┘
             │
┌────────────▼────────────────┐
│    Schedule Mapper          │  천문 데이터 → 작업 유형 추천
│  (딥워크/리뷰/휴식 블록 생성) │
└────────────┬────────────────┘
             │
      ┌──────┴──────┐
      │             │
┌─────▼─────┐ ┌─────▼──────┐
│  Terminal │ │  iCal/JSON │
│  Renderer │ │  Exporter  │
└───────────┘ └────────────┘
```

### 기술 스택 선택 이유
- **Astronomy Engine (JS)**: NASA JPL 데이터 기반의 순수 JS 천문 계산 라이브러리. 서버 없이 로컬 계산 가능, 정밀도 높음
- **Commander.js**: Node.js CLI 표준 라이브러리. 서브커맨드, 옵션 파싱, 헬프 텍스트 자동 생성
- **TypeScript**: 천문 계산 결과 타입 안전성 보장, 복잡한 날짜/좌표 객체 오류 방지
- **ical-generator**: 표준 RFC 5545 iCal 파일 생성 라이브러리

### 핵심 기술 과제
1. **천문 데이터 → 생산성 매핑 알고리즘**: 달의 위상 70% 이상 = 리뷰 작업 추천 같은 규칙을 어떻게 설계할 것인가? 초기엔 heuristic rule-based, 이후 사용자 커스터마이징 지원
2. **시간대(timezone) 처리**: 천문 계산은 UTC 기반인데, 사용자 로컬 타임존 변환 시 DST(서머타임) 처리 복잡도 존재. `luxon` 또는 `date-fns-tz` 활용
3. **iCal 반복 규칙**: 주간 패턴을 `RRULE`로 표현하는 로직 — 천문 데이터는 매일 달라지므로 단순 반복 규칙으로는 표현 불가. 각 날짜별 개별 이벤트 생성으로 우회

---

## 🎨 왜 흥미로운가?

### 독창적인 각도
천문학 데이터를 '개발자 생산성 도구'에 적용한 사례는 거의 없다. 대부분의 스케줄링 도구는 인간이 정의한 시간 블록(9시~11시)을 기반으로 하지만, 이 도구는 지구 자전과 달의 위상이라는 자연 주기를 개발 워크플로우에 통합한다. "천문학적 DX"라는 새로운 개념이다.

### 혁신 포인트
- 천문학 계산 라이브러리(NASA JPL 기반)를 생산성 도구에 직접 연결
- 달의 위상 사이클(29.5일)을 스프린트 플래닝 사이클과 연결하는 실험적 접근
- 완전 로컬 동작 — API 키도, 서버도, 로그인도 없음

### 학습 기회
- 천문 계산 알고리즘 (적위, 시간각, 위상각)
- RFC 5545 iCal 표준 포맷 구현
- CLI UX 디자인 — 정보 밀도와 가독성 균형
- `cron` / `launchd` 연동 패턴

---

## 📊 시장 및 검증

### 유사 프로젝트
- **Reclaim.ai** (reclaim.ai): AI 기반 스케줄 최적화. 천문 데이터 미활용, SaaS 형태
- **Fantastical** (fantastical.app): 캘린더 앱. 자연어 파싱 지원하지만 자연 주기 미고려
- **f.lux** (justgetflux.com): 일몰 시간 기반 화면 색온도 조정. 개념적으로 가장 유사하지만 스케줄링 기능 없음

### 이 틈새가 존재하는 이유
개발자 생산성 도구는 대부분 '사람이 정의한 시간'을 최적화하는 데 집중한다. '자연이 정의한 시간'을 활용하는 접근은 너무 철학적으로 보여 상업 제품이 시도하지 않았다. 그러나 remote-first 문화와 비동기 작업이 늘어나면서, 자신만의 자연 리듬에 맞춘 스케줄링 수요가 증가하고 있다.

### 성공 지표
- [ ] `astrosched today` 실행 시 5초 이내 결과 출력
- [ ] 생성된 iCal 파일이 Apple Calendar / Google Calendar에 오류 없이 임포트
- [ ] 서울 기준 일출/일몰 시간이 timeanddate.com 데이터와 ±3분 이내 일치

---

## 🚀 구현 로드맵

### Phase 1: MVP (1~2일)
**목표**: 기본 천문 계산 + 터미널 출력
- Astronomy Engine으로 일출/일몰/달의 위상 계산
- `astrosched today` 커맨드 구현
- ASCII 테이블로 시간대별 추천 출력

### Phase 2: 내보내기 (2~3일)
**목표**: 캘린더 연동
- iCal 내보내기 (`astrosched export --format ical`)
- JSON 내보내기 (`astrosched export --format json`)
- `astrosched week` 주간 뷰 구현

### Phase 3: 사용성 개선 (4~5일)
**목표**: 배포 가능한 수준
- `astrosched cron-setup` 자동화 도우미
- 커스텀 작업 유형 매핑 설정 (`~/.astrosched/config.json`)
- npm 패키지로 배포 (`npx astrosched`)
- README + 사용 예시 GIF

### 기술 마일스톤
| 일차 | 산출물 | 성공 기준 |
|------|--------|----------|
| 1 | 천문 계산 모듈 | 서울 일출/일몰 ±3분 정확도 |
| 2 | CLI 기본 커맨드 | `today`, `week` 출력 정상 동작 |
| 3 | iCal 내보내기 | Apple Calendar 임포트 성공 |
| 4 | cron 도우미 | 자동 실행 스크립트 생성 |
| 5 | npm 배포 | `npx astrosched today` 동작 |

---

## 🌱 배울 것들

### 새로운 기술과 개념
- **천문 계산 기초**: 율리우스 날짜(Julian Date), 적경/적위, 위상각(phase angle) 계산 원리
- **RFC 5545 iCal 표준**: 캘린더 데이터 교환 표준 포맷 직접 구현
- **CLI UX 설계**: 정보 계층, 색상 코딩, 진행 표시기 없이 즉각 응답하는 CLI 경험
- **시간대 처리**: UTC ↔ 로컬 타임존, DST 예외 케이스 실전 대응

### 성장 기회
- "도메인 지식(천문학)을 코드로 어떻게 추상화할 것인가"에 대한 설계 감각
- 복잡한 계산 결과를 사용자에게 의미있게 전달하는 정보 설계
- `npm publish` 부터 `npx` 실행까지 패키지 배포 전 과정

### 도전 포인트
천문 계산 라이브러리를 처음 다루는 경험 — 물리/수학 도메인 지식 없이도 라이브러리를 올바르게 사용할 수 있는지 검증하는 과정이 흥미롭다. '블랙박스로 사용하기 vs 내부 원리 이해하기'의 경계에서 학습 깊이를 조절하는 경험이 될 것이다.

---

## 🌍 오픈소스 가능성

### 커뮤니티 가치
자기 주도 시간 관리에 관심 있는 개발자, 바이오리듬/자연 주기 관련 도구를 찾는 생산성 커뮤니티에 유용하다. 완전 오프라인 동작, API 키 불필요라는 특성이 오픈소스 도구로서 매력적이다.

### 재사용성
- 천문 데이터 → 생산성 블록 매핑 로직을 별도 라이브러리로 분리 가능
- 다른 캘린더 앱 플러그인(Obsidian, Notion)으로 확장 가능한 코어 엔진
- 작업 유형 매핑 규칙을 JSON 설정으로 외부화하여 커스터마이징 허용

### 문서화 계획
- README: 설치 → 위치 설정 → 첫 실행까지 5분 퀵스타트
- 예시 출력 스크린샷 (터미널 ASCII 결과물)
- 천문 계산 방식 설명 (비개발자도 이해할 수 있는 수준)
- Contributing 가이드: 새로운 작업 유형 매핑 규칙 추가 방법

---

## 💭 확장 및 미래 작업

### 자연스러운 확장
- **날씨 API 연동**: 천문 데이터 + 실제 날씨 조합으로 더 정밀한 추천
- **Obsidian 플러그인**: 데일리 노트에 오늘의 천문 일정 자동 삽입
- **통계 대시보드**: "보름달 날 나의 커밋 수" 같은 재미있는 상관관계 분석

### 연구 과제
- 달의 위상과 개발자 집중력 사이의 실제 상관관계가 있는가? (자기 실험 데이터 수집)
- 계절에 따른 일조 시간 변화가 코드 품질(버그 수)에 영향을 미치는가?

### 커뮤니티 기여 영역
- 각 문화권의 천문 전통(한국 세시풍속, 일본 절기)을 기반으로 한 로컬라이징된 작업 유형 매핑
- Pomodoro 타이머와 천문 사이클 연동 모드

---

## 🔗 관련 컨텍스트

**영감**: 천문학 cross-domain 인스피레이션 + 자동화/워크플로우 최적화 주간 제약 결합. GitHub Trending의 `career-ops` (AI 기반 잡서치 시스템)에서 "외부 데이터로 개인 워크플로우 최적화" 패턴을 착안.

**관련 프로젝트**: f.lux (일몰 기반 화면 조정), Reclaim.ai (AI 스케줄 최적화)

**참고 자료**:
- [Astronomy Engine JS](https://github.com/cosinekitty/astronomy) — NASA JPL 기반 천문 계산 라이브러리
- [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545) — iCalendar 표준
- [ical-generator](https://github.com/sebbo2002/ical-generator) — Node.js iCal 생성 라이브러리

---

**Generated by**: idea-generator-critic probe  
**Index**: #0025  
**Evaluation Score**: 7.38/10 (after 1 iterations)  
**Status**: ✅ Ready for consideration


---
id: idea-0015
title: "Obsidian 플러그인 — 사진 EXIF 기반 여행 지도 시각화"
generated: 2026-03-30T02:11:15.300Z

category: utility
subcategory: obsidian-plugin
difficulty: intermediate
tags: [obsidian, photography, exif, map-visualization, travel, leaflet, typescript]

estimated_time: "1-2 weeks"
tech_stack: [TypeScript, Obsidian Plugin API, Leaflet.js, ExifReader]
languages: [TypeScript, CSS]

evaluation:
  originality: 8
  feasibility: 8
  market_need: 7
  monetization_potential: 4
  tech_interest: 8
  learning_value: 8
  open_source_value: 8
  distinctness: 9

  total: 7.48
  iterations: 1
  status: pass

inspiration_source: "Cross-domain: 사진 메타데이터 관리 + Obsidian 플러그인 생태계의 빈 틈"
---

# Obsidian 플러그인 — 사진 EXIF 기반 여행 지도 시각화

> 볼트 속 사진들의 EXIF 위치 데이터를 읽어 여행 경로를 인터랙티브 지도로 펼쳐보는 Obsidian 플러그인

## 🎯 The Problem

### Current Situation
Obsidian으로 여행 일지나 사진 일기를 작성하는 사용자들은 이미지 파일을 볼트에 첨부하지만, 사진 속에 숨겨진 GPS 정보는 완전히 묻혀버린다. 지도 뷰를 제공하는 플러그인들(Map View 등)은 노트에 수동으로 좌표를 입력해야 하며, 사진의 EXIF 메타데이터를 자동으로 읽어 지도에 배치하는 기능은 존재하지 않는다.

### Pain Points
- **수동 좌표 입력의 번거로움**: 사진을 찍은 장소를 지도에 표시하려면 Google Maps에서 좌표를 복사해 직접 노트에 적어야 한다
- **시각적 여행 스토리 부재**: 수십 장의 사진이 어떤 경로로 찍혔는지 한 눈에 볼 방법이 없다
- **메타데이터 활용 불가**: EXIF에는 촬영 시각, 카메라 모델, 조리개값까지 담겨 있지만 Obsidian에서는 완전히 무시된다

### Who Experiences This?
여행 기록을 Obsidian에 남기는 사용자, 사진 일기를 작성하는 블로거, 필드 리서치 결과물을 노트와 함께 정리하는 연구자나 탐방 기자.

---

## 💡 The Solution

### Core Concept
볼트 내 이미지 파일(`.jpg`, `.jpeg`, `.heic`)의 EXIF GPS 데이터를 자동으로 파싱해 Leaflet.js 기반 인터랙티브 지도 위에 핀으로 배치하는 Obsidian 플러그인이다. 핀을 클릭하면 사진 썸네일과 해당 이미지가 첨부된 노트로 바로 이동할 수 있다. 단일 노트 뷰와 볼트 전체 뷰 두 가지 모드를 지원해, 오늘 일지의 동선도, 1년치 여행 경로도 한 화면에서 확인 가능하다.

### How It Works
1. **인덱싱**: 플러그인 활성화 시 볼트의 모든 이미지 파일을 스캔해 EXIF GPS 좌표와 촬영 시각을 추출, 인메모리 인덱스 구성
2. **지도 렌더링**: Obsidian의 Leaf(뷰 패널)에 Leaflet 지도를 열고 GPS 좌표가 있는 사진을 핀으로 표시. 시간 순서대로 선으로 연결해 이동 경로 시각화
3. **인터랙션**: 핀 클릭 → 썸네일 팝업 + 해당 이미지가 삽입된 노트로 이동 링크 제공. 날짜 범위 슬라이더로 특정 여행 구간만 필터링

### Key Features
- **자동 EXIF 파싱**: 수동 입력 없이 사진의 GPS, 촬영일시, 카메라 정보 자동 추출
- **경로 선 연결**: 시간 순서로 사진 핀을 연결해 실제 이동 동선을 폴리라인으로 표시
- **노트 연동 핀**: 핀에서 원본 노트로 바로 이동 — 지도가 곧 노트 탐색 인터페이스
- **날짜 필터 슬라이더**: 특정 기간의 사진만 지도에 표시해 여행별로 경로 분리
- **EXIF 사이드패널**: 선택한 사진의 상세 메타데이터(조리개, 셔터속도, ISO, 카메라 모델) 표시

---

## 🏗️ Technical Architecture

### System Overview

```
┌─────────────────────────────────────┐
│  Obsidian Plugin API                │
│  (파일 시스템 접근, 뷰 등록)          │
└──────────────┬──────────────────────┘
               │
    ┌──────────▼──────────┐
    │   EXIF Indexer      │  ← ExifReader.js
    │ (GPS + 촬영시각 파싱) │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   In-Memory Index   │
    │ {path, lat, lng,    │
    │  datetime, noteRef} │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   Map View (Leaf)   │  ← Leaflet.js
    │ 핀 렌더링, 경로 선,   │
    │ 썸네일 팝업          │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   Note Linker       │
    │ 이미지 → 노트 역참조  │
    └─────────────────────┘
```

### Tech Stack Rationale
- **Obsidian Plugin API**: 볼트 파일 시스템 접근, 커스텀 Leaf 뷰 등록, 설정 저장을 위한 공식 인터페이스
- **ExifReader**: 순수 TypeScript EXIF 파서. 브라우저 환경(Obsidian 내부는 Electron/Chromium)에서 동작하며 GPS, 날짜, 카메라 메타데이터 모두 지원
- **Leaflet.js**: 경량 인터랙티브 지도 라이브러리. OpenStreetMap 타일로 오프라인 외 환경에서도 동작하며 커스텀 마커·팝업 API 풍부
- **TypeScript**: Obsidian 플러그인 공식 권장 언어. 타입 안정성으로 Obsidian API 자동완성 최대 활용

### Key Technical Challenges
1. **HEIC 포맷 EXIF 파싱**: iOS 카메라 기본 포맷인 HEIC은 ExifReader가 부분 지원. JPEG 우선 처리 후 HEIC은 별도 fallback 로직 필요
2. **볼트 규모 성능**: 수천 장 이미지를 가진 볼트에서 초기 인덱싱이 느릴 수 있음. 캐시 파일(`.obsidian/exif-map-cache.json`) 저장 + 파일 변경 이벤트로 증분 업데이트로 해결
3. **이미지 → 노트 역참조**: Obsidian은 노트에서 이미지로의 링크는 추적하지만 역방향은 아님. 볼트 내 모든 노트를 스캔해 이미지 경로 참조를 역인덱스로 구성해야 함

---

## 🎨 What Makes This Interesting?

### Unique Angle
Obsidian 생태계에서 지도 플러그인(Map View, Obsidian Leaflet)은 이미 존재하지만, **사진 EXIF를 자동 파싱**해 위치를 추출하는 플러그인은 없다. 기존 플러그인들은 노트에 `location: [37.5, 127.0]` 같은 frontmatter를 수동으로 입력해야 한다. 이 플러그인은 "사진을 볼트에 넣는 것만으로 지도가 완성된다"는 완전히 다른 UX를 제공한다.

### Innovation Points
- **Zero-configuration 지도**: 별도 설정 없이 사진의 GPS 데이터가 곧 지도 데이터
- **시간 축 경로 시각화**: 정적 핀 모음이 아닌 시간 흐름에 따른 동선 스토리텔링
- **양방향 탐색**: 지도에서 노트로, 노트에서 지도로 — 사진이 두 세계를 연결하는 앵커
- **사진 도메인 + 노트 도메인 융합**: photography workflow와 PKM(개인 지식 관리)의 예상치 못한 교차점

### Learning Opportunities
- Obsidian Plugin API 전체 사이클 (뷰 등록, 설정, 이벤트 시스템)
- EXIF 메타데이터 구조와 GPS 좌표 파싱
- Leaflet.js 커스텀 마커·팝업·폴리라인 구성
- Electron/Chromium 환경에서의 바이너리 파일 처리
- 증분 파일 인덱싱과 캐시 무효화 전략

---

## 📊 Market & Validation

### Similar Projects
- **Obsidian Map View** (github.com/esm7/obsidian-map-view): frontmatter의 `location` 필드 기반. EXIF 자동 파싱 없음. 이 플러그인은 수동 입력을 완전히 제거
- **Obsidian Leaflet** (github.com/javalent/obsidian-leaflet): 노트 내 지도 블록 삽입 기능. 사진 메타데이터 연동 없음
- **Google Photos 타임라인**: 훌륭하지만 Obsidian 노트와 연결되지 않고 클라우드 의존적

### Why This Gap Exists
사진 EXIF 파싱은 브라우저 환경에서 바이너리 처리가 필요해 구현 난이도가 있다. 기존 지도 플러그인 개발자들은 지도 렌더링에 집중했고, 사진 처리 영역까지 확장하지 않았다. Obsidian의 인기가 지속적으로 오르면서 여행 일지, 사진 일기 용도 사용자가 급증하고 있어 수요가 충분히 형성됐다.

### Success Indicators
- [ ] GPS 좌표가 있는 JPEG 100장을 1초 이내에 인덱싱
- [ ] Obsidian 커뮤니티 포럼에서 베타 테스터 10명 확보
- [ ] 공식 플러그인 스토어 등록 (커뮤니티 플러그인)
- [ ] 1개월 내 GitHub 스타 50개 이상

---

## 🚀 Implementation Roadmap

### Phase 1: MVP (1주차)
**목표**: GPS가 있는 JPEG를 지도 위에 핀으로 표시
- ExifReader로 EXIF GPS 파싱 검증 (테스트 이미지 10장)
- Obsidian 플러그인 보일러플레이트 설정 (TypeScript + esbuild)
- Leaflet 지도를 Obsidian Leaf 뷰로 렌더링
- 볼트 이미지 스캔 → GPS 핀 표시 기본 동작

### Phase 2: Enhancement (2주차)
**목표**: 실용적 UX 완성
- 시간 순 폴리라인으로 이동 경로 연결
- 핀 클릭 → 썸네일 팝업 + 연관 노트 링크
- 날짜 범위 필터 슬라이더 구현
- 볼트 전체 뷰 / 현재 노트 뷰 토글
- EXIF 캐시 파일로 재시작 시 빠른 로딩

### Phase 3: Refinement (3주차)
**목표**: 커뮤니티 공개 준비
- HEIC 부분 지원 (가능 범위 내)
- 설정 패널 (지도 타일 선택, 핀 색상 커스텀)
- README + 스크린샷 + 데모 GIF
- 커뮤니티 플러그인 스토어 PR 제출

### Technical Milestones
| 주차 | 산출물 | 성공 기준 |
|------|--------|----------|
| 1주 | EXIF 파싱 + 기본 지도 | GPS 핀 10개 지도에 표시 |
| 2주 | 경로 선 + 노트 연동 | 클릭으로 노트 이동 동작 |
| 3주 | 폴리싱 + 스토어 제출 | 커뮤니티 플러그인 PR 오픈 |

---

## 🌱 What You'll Learn

### New Skills & Concepts
- **Obsidian Plugin API**: 커스텀 뷰(Leaf) 등록, 파일 시스템 Vault API, 설정 저장, 이벤트 시스템 — 가장 인기 있는 플러그인 생태계 중 하나를 직접 경험
- **EXIF 메타데이터 구조**: IFD(Image File Directory) 태그 체계, GPS 좌표의 DMS→Decimal 변환, 촬영 시각 타임존 처리
- **Leaflet.js 심화**: 커스텀 아이콘 마커, 팝업 HTML 렌더링, 폴리라인, 레이어 그룹 관리
- **증분 인덱싱 패턴**: 파일 변경 이벤트 감지 + 캐시 무효화 전략

### Growth Opportunities
- 바이너리 파일(이미지)을 JavaScript에서 처리하는 실전 경험 — ArrayBuffer, DataView 다루기
- 플러그인 아키텍처 설계: 독립적인 indexer, renderer, linker 모듈 분리
- 오픈소스 플러그인을 커뮤니티 스토어에 등록하고 유지보수하는 전 과정

### Stretch Points
현재 comfort zone인 React 기반 웹앱에서 벗어나, Obsidian의 독특한 API 제약(DOM 직접 조작, CodeMirror 통합)과 Electron 런타임의 특수성을 다뤄야 한다. 브라우저 환경에서 바이너리 이미지 파일을 파싱하는 저수준 처리도 새로운 도전이다.

---

## 🌍 Open Source Potential

### Community Value
Obsidian 커뮤니티에는 여행 일지(Travel Journal), 사진 일기(Photo Journal), 야외 탐방 기록을 남기는 사용자가 수만 명이다. 사진을 볼트에 넣기만 해도 지도가 자동 완성된다는 UX는 "wow" 반응을 이끌어낼 수 있다. 기존 지도 플러그인의 "수동 좌표 입력"이라는 가장 큰 마찰을 제거한다.

### Reusability
- **ExifReader 래퍼 모듈**: EXIF GPS 파싱 + 좌표 변환 유틸은 독립 패키지로 분리 가능
- **설정 가능한 핀 렌더러**: 다른 Obsidian 플러그인에서 임포트할 수 있는 Leaflet 래퍼
- 플러그인 자체가 Obsidian 플러그인 개발 학습 레퍼런스로 활용 가능

### Documentation Plan
- README: 설치법 + 스크린샷 + 지원 포맷 목록
- `CONTRIBUTING.md`: 로컬 개발 환경 설정 (hot-reload 포함)
- 위키: EXIF GPS가 없는 사진 처리 방법, 수동 좌표 frontmatter fallback
- 데모 GIF: 사진 추가 → 지도에 즉시 핀 등장하는 시퀀스

---

## 💭 Extensions & Future Work

### Natural Extensions
- **클러스터링**: 같은 지역 핀 수백 개를 마커 클러스터로 묶어 성능 개선
- **히트맵 모드**: 자주 방문한 장소를 열지도로 시각화
- **수동 좌표 fallback**: EXIF GPS 없는 사진의 경우 노트 frontmatter `location` 필드를 읽어 호환
- **사진 스트립 타임라인**: 지도 하단에 촬영 시간 순서로 썸네일 가로 스크롤 타임라인

### Research Questions
- HEIC/AVIF 포맷을 Electron 환경에서 효율적으로 파싱할 수 있는가?
- 지도 타일을 로컬 캐시해 오프라인(여행 중 기록 시) 동작 가능한가?
- 여러 볼트의 여행 데이터를 합쳐 평생 여행 지도를 만들 수 있는가?

### Community Contributions
지도 타일 프로바이더 추가(Google Maps, Mapbox), 사진 촬영 기기 아이콘 커스터마이징, 특정 태그가 붙은 노트의 사진만 필터링하는 기능 등을 외부 기여로 열어둘 수 있다.

---

## 🔗 Related Context

**영감**: 사진 메타데이터 관리(크로스 도메인) + Obsidian 플러그인 생태계의 빈 틈 채우기(주간 제약). 기존 Obsidian 지도 플러그인들이 "수동 입력" 방식에서 벗어나지 못한 공백을 사진 EXIF로 메우는 아이디어.

**Related Projects**: obsidian-map-view, obsidian-leaflet

**References**:
- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [ExifReader npm package](https://github.com/mattiasw/ExifReader)
- [Leaflet.js Documentation](https://leafletjs.com/reference.html)
- [EXIF GPS 좌표 변환 공식 (DMS to Decimal)](https://www.fcc.gov/media/radio/dms-decimal)

---

**Generated by**: idea-generator-critic probe
**Index**: #0015
**Evaluation Score**: 7.48/10 (after 1 iteration)
**Status**: ✅ Ready for consideration


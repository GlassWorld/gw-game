# RBB

`RBB`는 `Random Boss Break`의 약자이며, 한글 프로젝트명은 `랜덤보스브레이크`입니다.

캐릭터와 스킬을 고르고, 다양한 보스를 순차적으로 공략하는 보스 러시형 액션 게임을 목표로 합니다. 현재 저장소는 그 전체 구조를 위한 프론트엔드 프로토타입을 중심으로 구성되어 있습니다.

## 현재 프로젝트 상태

현재 구현은 `RBB`의 전체 게임 루프를 단순화한 플레이어블 프로토타입입니다.

- 메인 화면
- 캐릭터 선택
- 주사위 기반 보스 선택
- 대기소 세팅 화면
- 캐릭터별 5개 스킬 중 3개 선택
- 스탯 / 포션 선택과 자원 표시
- 연습 공간
- 보스 진입 컷씬 / 사망 컷씬
- 로딩 / 카운트다운 / 결과 화면
- 다중 보스 런 진행도
- 보스 클리어 보상 표시
- 4종 보스 placeholder와 보스별 전장 톤 / 텔레그래프 색 / 템포 차이

## 목표 게임 흐름

장기적으로는 아래 흐름을 목표로 합니다.

1. `RBB` 시작 화면
2. 캐릭터 선택
3. 주사위 기반 보스 선택
4. 대기소에서 스킬 / 유물 / 스탯 / 포션 / 장비 세팅
5. 연습 공간에서 테스트
6. 보스 컷씬
7. 3초 카운트다운 후 전투
8. 보스 처치 후 사망 컷씬
9. 대기소 복귀
10. 다음 보스를 다시 주사위로 선택
11. 모든 보스를 클리어하면 게임 클리어

## 현재 구현된 조작

- `우클릭`: 이동
- `자동 평타`: 적이 사거리 안에 들어오면 자동 발동
- `Space`: 대시
- `Q`, `W`, `E`: 선택한 3개 스킬 사용

## 현재 구현된 캐릭터

- A 검사
- B 마법사
- C 성기사

## 현재 구현된 화면 흐름

1. 메인 화면
2. 캐릭터 선택
3. 주사위 기반 보스 선택
4. 대기소 세팅
5. 연습 공간
6. 보스 진입 컷씬
7. 보스전
8. 보스 사망 컷씬 또는 패배 결과 화면
9. 대기소 복귀 또는 런 클리어

## 요구 환경

- Node.js 20 이상 권장
- npm 사용

## 설치

```bash
npm install
```

## 개발 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

## 프로덕션 빌드

```bash
npm run build
```

## 미리보기

```bash
npm run preview
```

## 문서

- 기획/방향 문서: [docs/prototype-plan-ko.md](/home/glassworld/workspace/gw-game/docs/prototype-plan-ko.md)
- 구현 계획 문서: [docs/implementation-roadmap-ko.md](/home/glassworld/workspace/gw-game/docs/implementation-roadmap-ko.md)
- 캐릭터 문서: [docs/characters/character-overview-ko.md](/home/glassworld/workspace/gw-game/docs/characters/character-overview-ko.md)
- 스킬 문서: [docs/skills/skill-overview-ko.md](/home/glassworld/workspace/gw-game/docs/skills/skill-overview-ko.md)
- 시나리오 문서: [docs/scenarios/scenario-overview-ko.md](/home/glassworld/workspace/gw-game/docs/scenarios/scenario-overview-ko.md)
- 보스 문서 템플릿: [docs/bosses/_boss-template-ko.md](/home/glassworld/workspace/gw-game/docs/bosses/_boss-template-ko.md)
- 첫 보스 문서: [docs/bosses/red-adjudicator-ko.md](/home/glassworld/workspace/gw-game/docs/bosses/red-adjudicator-ko.md)
- AI 작업 컨텍스트: [.ai/assistant-context.md](/home/glassworld/workspace/gw-game/.ai/assistant-context.md)

## 참고

- 현재 그래픽은 임시 도형 기반입니다.
- 현재는 프론트엔드 전용 프로토타입입니다.
- `유물`, `장비`, `강화`는 아직 `준비중`입니다.
- 보스 4종은 현재 placeholder 단계이며, 개별 기믹/지형/패턴 심화는 아직 진행 전입니다.
- 랭킹, 기록, 백엔드 저장은 아직 미구현입니다.

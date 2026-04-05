import type { BossDefinition } from '~/game/core/types'

export const bossData: BossDefinition[] = [
  {
    id: 'red-adjudicator',
    name: '붉은 심판자',
    region: '잔열의 재판장',
    title: '불완전한 심문 집행자',
    description: '붕괴한 재판장의 불씨를 끌어안은 보스입니다. 탄막, 장판, 돌진을 섞어 압박합니다.',
    introLine: '심판은 끝나지 않았다. 불씨가 꺼지기 전까지 너를 재단하겠다.',
    encounterText: '붉은 열기가 남은 재판장 안쪽에서 심판자가 깨어납니다.',
    introCutscene: [
      {
        stageLabel: 'Boss Entry',
        title: '잔열의 재판장',
        speaker: '기록 장치',
        text: '붕괴한 법정의 잔향이 아직 식지 않았다.\n불씨와 재가 뒤섞인 중앙 법대에서 무언가가 다시 숨을 쉰다.'
      },
      {
        stageLabel: 'Boss Entry',
        title: '붉은 심판자',
        speaker: '붉은 심판자',
        text: '심판은 끝나지 않았다.\n불씨가 꺼지기 전까지 너를 재단하겠다.'
      }
    ],
    deathCutscene: [
      {
        stageLabel: 'Boss Down',
        title: '심판의 종결',
        speaker: '기록 장치',
        text: '갈라진 심판대 위로 남은 열기가 무너진다.\n붉은 불씨는 더 이상 판결을 이어가지 못한 채 흩어진다.'
      },
      {
        stageLabel: 'Boss Down',
        title: '재가 된 선고',
        speaker: '붉은 심판자',
        text: '이번 판결은... 네 것이로군.\n잔열의 재판장은 잠시 침묵한다.'
      }
    ],
    battleProfile: {
      floorColor: 0x15394d,
      gridColor: 0x4de1f7,
      volleyColor: 0xffb38f,
      slamColor: 0xff5f45,
      chargeColor: 0xffe58f,
      speedMultiplier: 1
    },
    diceFace: 'I',
    accentColor: '#ff7f6a'
  },
  {
    id: 'azure-howler',
    name: '청람의 포효자',
    region: '수맥의 공명홀',
    title: '깊은 울림의 감시자',
    description: '차가운 수맥 위를 배회하며 동일한 패턴을 더 날카로운 청색 인상으로 몰아붙이는 보스입니다.',
    introLine: '메아리는 도망치지 않는다. 끝내 네 심장으로 돌아온다.',
    encounterText: '젖은 석판과 푸른 공명이 가득한 홀에서 푸른 거체가 몸을 일으킵니다.',
    introCutscene: [
      {
        stageLabel: 'Boss Entry',
        title: '수맥의 공명홀',
        speaker: '기록 장치',
        text: '차가운 수증기와 푸른 메아리가 홀을 가득 메운다.\n깊은 수맥 아래에서 요동치던 울림이 형체를 갖춘다.'
      },
      {
        stageLabel: 'Boss Entry',
        title: '청람의 포효자',
        speaker: '청람의 포효자',
        text: '메아리는 도망치지 않는다.\n끝내 네 심장으로 돌아온다.'
      }
    ],
    deathCutscene: [
      {
        stageLabel: 'Boss Down',
        title: '메아리의 붕괴',
        speaker: '기록 장치',
        text: '공명하던 홀의 파문이 끊기며, 푸른 진동이 수면 아래로 가라앉는다.'
      },
      {
        stageLabel: 'Boss Down',
        title: '사라지는 포효',
        speaker: '청람의 포효자',
        text: '울림조차... 여기서 끝나는가.\n푸른 홀은 다시 물방울 소리만 남긴다.'
      }
    ],
    battleProfile: {
      floorColor: 0x112f4f,
      gridColor: 0x79c9ff,
      volleyColor: 0x8fd3ff,
      slamColor: 0x57a9ff,
      chargeColor: 0xd0ecff,
      speedMultiplier: 1.08
    },
    diceFace: 'II',
    accentColor: '#63b7ff'
  },
  {
    id: 'verdant-husk',
    name: '녹영의 각피',
    region: '뒤틀린 생장온실',
    title: '과증식한 수호 껍질',
    description: '억세게 자란 껍질과 포자빛을 두른 채 같은 패턴을 더 묵직한 녹색 인상으로 들이미는 보스입니다.',
    introLine: '뿌리는 모두를 붙든다. 너도 예외는 아니다.',
    encounterText: '무너진 유리 온실 안쪽에서 거대한 껍질이 천천히 금을 벌립니다.',
    introCutscene: [
      {
        stageLabel: 'Boss Entry',
        title: '뒤틀린 생장온실',
        speaker: '기록 장치',
        text: '부서진 유리 틈 사이로 포자빛이 새어 나온다.\n자라나기만 하던 생장이 마침내 포식의 형상을 취한다.'
      },
      {
        stageLabel: 'Boss Entry',
        title: '녹영의 각피',
        speaker: '녹영의 각피',
        text: '뿌리는 모두를 붙든다.\n너도 예외는 아니다.'
      }
    ],
    deathCutscene: [
      {
        stageLabel: 'Boss Down',
        title: '생장의 정지',
        speaker: '기록 장치',
        text: '과하게 불어나던 생장 조직이 멈추고, 포자빛이 서서히 바닥으로 흩어진다.'
      },
      {
        stageLabel: 'Boss Down',
        title: '껍질의 붕락',
        speaker: '녹영의 각피',
        text: '자라나기만 하던 시간도... 끝은 있었군.\n온실의 숨결이 한 겹 꺼진다.'
      }
    ],
    battleProfile: {
      floorColor: 0x183a2b,
      gridColor: 0x82e6a3,
      volleyColor: 0xa8f0b7,
      slamColor: 0x5fd27d,
      chargeColor: 0xd7f9c9,
      speedMultiplier: 0.94
    },
    diceFace: 'III',
    accentColor: '#7fdc8b'
  },
  {
    id: 'gilded-warden',
    name: '금휘의 문지기',
    region: '사광의 봉인회랑',
    title: '봉인문을 지키는 수문장',
    description: '빛을 쓸어모은 금빛 외형으로 동일한 패턴을 더 또렷한 텔레그래프와 위압감으로 전개하는 보스입니다.',
    introLine: '허가되지 않은 자는, 이 문턱을 넘지 못한다.',
    encounterText: '희미한 금빛이 줄지어 선 회랑 끝에서 거대한 수문장이 창을 세웁니다.',
    introCutscene: [
      {
        stageLabel: 'Boss Entry',
        title: '사광의 봉인회랑',
        speaker: '기록 장치',
        text: '회랑의 금빛 파편이 천천히 정렬된다.\n봉인을 지키던 의지가 한 몸의 수문장으로 응결한다.'
      },
      {
        stageLabel: 'Boss Entry',
        title: '금휘의 문지기',
        speaker: '금휘의 문지기',
        text: '허가되지 않은 자는,\n이 문턱을 넘지 못한다.'
      }
    ],
    deathCutscene: [
      {
        stageLabel: 'Boss Down',
        title: '봉인의 균열',
        speaker: '기록 장치',
        text: '금빛 장막이 갈라지고, 봉인회랑을 붙들던 긴장도 함께 흩어진다.'
      },
      {
        stageLabel: 'Boss Down',
        title: '쓰러진 수문장',
        speaker: '금휘의 문지기',
        text: '문은... 결국 열리는가.\n남은 빛이 회랑 바닥으로 스며든다.'
      }
    ],
    battleProfile: {
      floorColor: 0x3b3418,
      gridColor: 0xf3d978,
      volleyColor: 0xffe2a1,
      slamColor: 0xf1ba53,
      chargeColor: 0xfff0bf,
      speedMultiplier: 1.02
    },
    diceFace: 'IV',
    accentColor: '#f4c768'
  }
]

export const defaultBoss = bossData[0]

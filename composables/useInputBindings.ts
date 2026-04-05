export function useInputBindings() {
  return {
    bindings: [
      { key: '우클릭', label: '이동 지점 지정' },
      { key: '자동 평타', label: '사거리 안 진입 시 기본 공격 자동 발동' },
      { key: 'Space', label: '마우스 방향으로 대시' },
      { key: 'Q / W / E', label: '선택한 3개 스킬 사용' }
    ]
  }
}

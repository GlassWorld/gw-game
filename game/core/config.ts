import { GAME_HEIGHT, GAME_WIDTH } from '~/game/core/constants'

export function createGameConfig(
  phaser: typeof import('phaser'),
  options: { parent: string, scene: Phaser.Scene }
) {
  return {
    type: phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: options.parent,
    backgroundColor: '#09111b',
    scene: options.scene,
    render: {
      antialias: true,
      pixelArt: false
    },
    scale: {
      mode: phaser.Scale.FIT,
      autoCenter: phaser.Scale.CENTER_BOTH
    }
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useTravelOverlay() {
  const overlay = reactive({
    active: false,
    title: '',
    body: ''
  })

  const open = async (title: string, body: string) => {
    overlay.active = true
    overlay.title = title
    overlay.body = body
    await wait(320)
  }

  const close = async () => {
    await wait(180)
    overlay.active = false
    overlay.title = ''
    overlay.body = ''
  }

  const reset = () => {
    overlay.active = false
    overlay.title = ''
    overlay.body = ''
  }

  return {
    overlay,
    open,
    close,
    reset
  }
}

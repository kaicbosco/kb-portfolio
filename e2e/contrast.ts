import type { Locator } from '@playwright/test'

export async function readContrast(control: Locator) {
  return control.evaluate((element) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Cannot read rendered colors')
    const ctx = context

    function rgba(css: string) {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = css
      ctx.fillRect(0, 0, 1, 1)
      return ctx.getImageData(0, 0, 1, 1).data
    }

    function surface(node: Element | null): string {
      if (!node) throw new Error('Expected an opaque surface behind the control')
      const color = getComputedStyle(node).backgroundColor
      return rgba(color)[3] === 255 ? color : surface(node.parentElement)
    }

    function luminance(css: string) {
      const [r, g, b] = Array.from(rgba(css).slice(0, 3), (channel) => {
        const value = channel / 255
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    function ratio(a: string, b: string) {
      const [first, second] = [luminance(a), luminance(b)]
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
    }

    const style = getComputedStyle(element)
    const inside = surface(element)
    const outside = surface(element.parentElement)
    return {
      fill: style.backgroundColor,
      text: ratio(style.color, inside),
      border: ratio(style.borderTopColor, outside),
      focus: ratio(style.outlineColor, outside),
      decoration: ratio(style.textDecorationColor, inside),
    }
  })
}

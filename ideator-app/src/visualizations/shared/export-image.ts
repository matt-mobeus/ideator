export function exportSvg(svgElement: SVGElement, filename: string): void {
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(svgElement)
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportSvgToPng(svgElement: SVGElement, filename: string): void {
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(svgElement)
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = svgElement.clientWidth * 2
    canvas.height = svgElement.clientHeight * 2
    const ctx = canvas.getContext('2d')!
    ctx.scale(2, 2)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)

    canvas.toBlob(pngBlob => {
      if (!pngBlob) return
      const pngUrl = URL.createObjectURL(pngBlob)
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = filename.endsWith('.png') ? filename : `${filename}.png`
      a.click()
      URL.revokeObjectURL(pngUrl)
    }, 'image/png')
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
  }
  img.src = url
}

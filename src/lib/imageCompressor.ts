/**
 * Utility to compress and resize images client-side.
 * Prevents QuotaExceededError in localStorage and optimizes load times.
 */
export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const dataUrl = canvas.toDataURL(format, quality)
        resolve(dataUrl)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

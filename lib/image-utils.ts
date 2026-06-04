export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Canvas to Blob conversion failed'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = reject
      img.src = e.target?.result as string
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<File> {
  return compressImage(file, size, size, 0.7)
}

export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. الرجاء رفع صورة بصيغة JPG, PNG أو WebP',
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت',
    }
  }

  return { valid: true }
}

export async function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.webp'),
                {
                  type: 'image/webp',
                  lastModified: Date.now(),
                }
              )
              resolve(webpFile)
            } else {
              reject(new Error('Canvas to Blob conversion failed'))
            }
          },
          'image/webp',
          0.9
        )
      }

      img.onerror = reject
      img.src = e.target?.result as string
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Multiple images handler
export async function processMultipleImages(
  files: FileList,
  options: {
    compress?: boolean
    maxWidth?: number
    maxHeight?: number
    quality?: number
  } = {}
): Promise<{ valid: File[]; errors: string[] }> {
  const valid: File[] = []
  const errors: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const validation = validateImageFile(file)

    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error}`)
      continue
    }

    try {
      if (options.compress) {
        const compressed = await compressImage(
          file,
          options.maxWidth,
          options.maxHeight,
          options.quality
        )
        valid.push(compressed)
      } else {
        valid.push(file)
      }
    } catch (error) {
      errors.push(`${file.name}: فشل معالجة الصورة`)
    }
  }

  return { valid, errors }
}

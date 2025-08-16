/**
 * Image processing utilities for handling custom card uploads
 * Ensures uploaded images match the preview by applying the same stretching logic as CSS object-fill
 */

/**
 * Stretches an image to match the standard playing card aspect ratio (2.5:3.5)
 * Uses the same stretching logic as CSS object-fill to ensure preview matches output
 * @param file - The original image file
 * @param targetRatio - The target aspect ratio (width/height), defaults to 2.5/3.5
 * @returns Promise<Blob> - The stretched image as a blob
 */
export async function cropImageToAspectRatio(
  file: File,
  targetRatio: number = 2.5 / 3.5
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const imageUrl = URL.createObjectURL(file)

    img.onload = async () => {
      try {
        // Clean up the object URL to prevent memory leaks
        URL.revokeObjectURL(imageUrl)

        // Create canvas with high resolution output
        // Using 2048px width for high quality printing
        const outputWidth = 2048
        const outputHeight = Math.round(outputWidth / targetRatio)

        const canvas = document.createElement('canvas')
        canvas.width = outputWidth
        canvas.height = outputHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Failed to get canvas context')
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw the entire image stretched to fill the canvas (object-fill behavior)
        // This matches the preview which uses object-fill
        ctx.drawImage(
          img,
          0, 0, img.width, img.height,              // Source rectangle (entire image)
          0, 0, outputWidth, outputHeight           // Destination rectangle (full canvas, stretched)
        )

        // Convert canvas to blob with high quality
        // Always use JPEG to reduce file size (PNG can be very large)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Processed image size: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`)
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob from canvas'))
            }
          },
          'image/jpeg', // Always use JPEG for smaller file sizes
          0.90 // Slightly reduced quality (90%) to ensure smaller file size
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(new Error('Failed to load image'))
    }

    // Start loading the image
    img.src = imageUrl
  })
}

/**
 * Creates a File object from a Blob with the original filename
 * @param blob - The blob to convert
 * @param originalFilename - The original filename to preserve
 * @returns File object
 */
export function blobToFile(blob: Blob, originalFilename: string): File {
  // Preserve the original filename but indicate it's been processed
  const extension = originalFilename.split('.').pop() || 'png'
  const nameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename
  const processedFilename = `${nameWithoutExt}_cropped.${extension}`
  
  return new File([blob], processedFilename, {
    type: blob.type,
    lastModified: Date.now()
  })
}

/**
 * Validates if an image file can be processed
 * @param file - The file to validate
 * @returns boolean indicating if the file is valid
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  return validTypes.includes(file.type) && file.size <= maxSize
}
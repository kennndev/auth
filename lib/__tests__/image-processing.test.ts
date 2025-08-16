/**
 * Tests for image processing utilities
 * Note: These are basic unit tests - in a production environment,
 * you'd want to add visual regression tests to ensure cropping works correctly
 */

import { cropImageToAspectRatio, blobToFile, isValidImageFile } from '../image-processing'

describe('Image Processing Utilities', () => {
  describe('isValidImageFile', () => {
    it('should accept valid image types', () => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      
      validTypes.forEach(type => {
        const file = new File([''], 'test.png', { type })
        expect(isValidImageFile(file)).toBe(true)
      })
    })

    it('should reject invalid image types', () => {
      const invalidTypes = ['image/gif', 'image/svg+xml', 'text/plain', 'application/pdf']
      
      invalidTypes.forEach(type => {
        const file = new File([''], 'test.file', { type })
        expect(isValidImageFile(file)).toBe(false)
      })
    })

    it('should reject files over 10MB', () => {
      // Create a mock file that's 11MB
      const largeContent = new Uint8Array(11 * 1024 * 1024)
      const file = new File([largeContent], 'large.png', { type: 'image/png' })
      
      expect(isValidImageFile(file)).toBe(false)
    })

    it('should accept files under 10MB', () => {
      // Create a mock file that's 5MB
      const content = new Uint8Array(5 * 1024 * 1024)
      const file = new File([content], 'normal.png', { type: 'image/png' })
      
      expect(isValidImageFile(file)).toBe(true)
    })
  })

  describe('blobToFile', () => {
    it('should create a file with _cropped suffix', () => {
      const blob = new Blob(['test'], { type: 'image/png' })
      const file = blobToFile(blob, 'original.png')
      
      expect(file.name).toBe('original_cropped.png')
      expect(file.type).toBe('image/png')
    })

    it('should handle filenames without extensions', () => {
      const blob = new Blob(['test'], { type: 'image/jpeg' })
      const file = blobToFile(blob, 'noextension')
      
      expect(file.name).toBe('noextension_cropped.png')
    })

    it('should preserve the blob content', async () => {
      const content = 'test content'
      const blob = new Blob([content], { type: 'image/png' })
      const file = blobToFile(blob, 'test.png')
      
      const text = await file.text()
      expect(text).toBe(content)
    })
  })

  describe('cropImageToAspectRatio', () => {
    // Note: Testing canvas-based image manipulation in Node.js requires additional setup
    // (like jest-canvas-mock or jsdom with canvas support)
    // For now, we'll just test that the function exists and has the right signature
    
    it('should be a function that returns a promise', () => {
      expect(typeof cropImageToAspectRatio).toBe('function')
      
      // Create a minimal test file
      const file = new File([''], 'test.png', { type: 'image/png' })
      const result = cropImageToAspectRatio(file)
      
      expect(result).toBeInstanceOf(Promise)
    })
  })
})
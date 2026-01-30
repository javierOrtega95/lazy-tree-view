import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateUUID } from './uuid'

describe('generateUUID', () => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  it('should return a string', () => {
    const result = generateUUID()

    expect(typeof result).toBe('string')
  })

  it('should return a valid UUID v4 format', () => {
    const result = generateUUID()

    expect(result).toMatch(UUID_REGEX)
  })

  it('should generate unique values on each call', () => {
    const uuids = new Set<string>()
    const iterations = 100

    for (let i = 0; i < iterations; i++) {
      uuids.add(generateUUID())
    }

    expect(uuids.size).toBe(iterations)
  })

  describe('fallback when crypto.randomUUID is not available', () => {
    const originalCrypto = globalThis.crypto

    beforeEach(() => {
      // Remove crypto.randomUUID to test fallback
      globalThis.crypto = {
        ...originalCrypto,
        randomUUID: undefined,
      } as unknown as Crypto
    })

    afterEach(() => {
      globalThis.crypto = originalCrypto
    })

    it('should return a valid UUID v4 format using fallback', () => {
      const result = generateUUID()

      expect(result).toMatch(UUID_REGEX)
    })

    it('should generate unique values using fallback', () => {
      const uuids = new Set<string>()
      const iterations = 100

      for (let i = 0; i < iterations; i++) {
        uuids.add(generateUUID())
      }

      expect(uuids.size).toBe(iterations)
    })
  })
})

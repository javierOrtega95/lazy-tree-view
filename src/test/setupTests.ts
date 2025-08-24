declare module 'vitest' {
  interface Assertion<T>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})

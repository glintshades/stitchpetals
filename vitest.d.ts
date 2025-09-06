/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom'

declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeInTheDocument(): T
      toHaveTextContent(text: string): T
      toHaveClass(className: string): T
      toBeVisible(): T
      toBeDisabled(): T
      toBeEnabled(): T
      toHaveValue(value: string | number): T
      toHaveAttribute(attr: string, value?: string): T
    }
  }
}
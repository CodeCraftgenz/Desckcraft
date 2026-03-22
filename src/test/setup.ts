import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock framer-motion globally for all component tests
vi.mock('framer-motion', async () => {
  return await import('./mocks/framer-motion');
});

// Mock Tauri API - intercept all invoke calls
const mockInvokeHandlers: Record<string, (...args: unknown[]) => unknown> = {};

export function setMockInvokeHandler(cmd: string, handler: (...args: unknown[]) => unknown) {
  mockInvokeHandlers[cmd] = handler;
}

export function clearMockInvokeHandlers() {
  Object.keys(mockInvokeHandlers).forEach((key) => delete mockInvokeHandlers[key]);
}

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(async (cmd: string, args?: Record<string, unknown>) => {
    const handler = mockInvokeHandlers[cmd];
    if (handler) {
      return handler(args);
    }
    throw new Error(`No mock handler for command: ${cmd}`);
  }),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
  save: vi.fn(),
  message: vi.fn(),
  ask: vi.fn(),
  confirm: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-shell', () => ({
  open: vi.fn(),
}));

// Mock window.sessionStorage
const sessionStorageMock: Record<string, string> = {};
vi.stubGlobal('sessionStorage', {
  getItem: vi.fn((key: string) => sessionStorageMock[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    sessionStorageMock[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete sessionStorageMock[key];
  }),
  clear: vi.fn(() => {
    Object.keys(sessionStorageMock).forEach((key) => delete sessionStorageMock[key]);
  }),
});

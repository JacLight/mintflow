'use client';

import { ReactNode } from 'react';

export type MinimizedPosition = 'bottom' | 'top' | 'left' | 'right';

export interface MinimizedWindow {
  id: string;
  title: string;
  content: ReactNode;
  onRestore: () => void;
  onClose: () => void;
}

// Simple global state for minimized windows
class MinimizedWindowsManager {
  private static instance: MinimizedWindowsManager;
  private windows: Record<string, MinimizedWindow> = {};
  private position: MinimizedPosition = 'bottom';
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  public static getInstance(): MinimizedWindowsManager {
    if (!MinimizedWindowsManager.instance) {
      MinimizedWindowsManager.instance = new MinimizedWindowsManager();
    }
    return MinimizedWindowsManager.instance;
  }

  public getWindows(): Record<string, MinimizedWindow> {
    return this.windows;
  }

  public getPosition(): MinimizedPosition {
    return this.position;
  }

  public setPosition(position: MinimizedPosition): void {
    this.position = position;
    this.notifyListeners();
  }

  public addWindow(window: MinimizedWindow): void {
    this.windows = {
      ...this.windows,
      [window.id]: window
    };
    this.notifyListeners();
  }

  public removeWindow(id: string): void {
    const { [id]: removed, ...rest } = this.windows;
    this.windows = rest;
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Export singleton instance
export const minimizedWindowsManager = MinimizedWindowsManager.getInstance();

// Hook for components to use
export function useMinimizedWindows() {
  return {
    getWindows: () => minimizedWindowsManager.getWindows(),
    getPosition: () => minimizedWindowsManager.getPosition(),
    setPosition: (position: MinimizedPosition) => minimizedWindowsManager.setPosition(position),
    addWindow: (window: MinimizedWindow) => minimizedWindowsManager.addWindow(window),
    removeWindow: (id: string) => minimizedWindowsManager.removeWindow(id),
    subscribe: (listener: () => void) => minimizedWindowsManager.subscribe(listener)
  };
}

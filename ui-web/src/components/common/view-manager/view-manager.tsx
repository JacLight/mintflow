'use client';

import React from 'react';
import ViewManager from './index';
import { MinimizedContainer } from './minimized-container';
import { minimizedWindowsManager, type MinimizedPosition } from './minimized-windows';

// Export the MinimizedContainer component
export { ViewManager, MinimizedContainer, minimizedWindowsManager, type MinimizedPosition };

// Default export for backward compatibility
export default ViewManager;

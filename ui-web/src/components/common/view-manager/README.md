# ViewManager Component

The ViewManager component provides a floating window system with support for minimizing, maximizing, docking, and resizing windows.

## Features

- Floating windows with drag-and-drop support
- Minimize, maximize, and dock windows
- Resize windows
- Configurable minimized windows container (top, bottom, left, right)
- Automatic arrangement of minimized windows using flexbox

## Usage

### Basic Usage

```jsx
import { ViewManager, MinimizedContainer } from 'packages/ui';

function App() {
  return (
    <>
      {/* Add the MinimizedContainer component once in your app */}
      <MinimizedContainer />
      
      {/* Add as many ViewManager components as you need */}
      <ViewManager
        id="window1"
        title="Window 1"
        defaultPosition={{ x: 100, y: 100 }}
        defaultSize={{ width: 400, height: 300 }}
      >
        <div>Window 1 Content</div>
      </ViewManager>
      
      <ViewManager
        id="window2"
        title="Window 2"
        defaultPosition={{ x: 200, y: 200 }}
        defaultSize={{ width: 500, height: 400 }}
      >
        <div>Window 2 Content</div>
      </ViewManager>
    </>
  );
}
```

### Props

#### ViewManager Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | - | Unique identifier for the window |
| `children` | ReactNode | - | The content to render inside the window |
| `title` | string | '' | The title of the window |
| `defaultPosition` | { x: number, y: number } | { x: 20, y: 20 } | The initial position of the window |
| `defaultSize` | { width: number, height: number } | { width: 400, height: 300 } | The initial size of the window |
| `onClose` | () => void | () => {} | Callback when the window is closed |
| `isResizable` | boolean | true | Whether the window can be resized |
| `style` | object | {} | Additional styles for the window |
| `compact` | boolean | false | Whether to use a compact mode for the window |
| `isModal` | boolean | false | Whether the window is a modal |
| `closeOnOutsideClick` | boolean | false | Whether to close the window when clicking outside (only for modals) |
| `usePortal` | boolean | false | Whether to render the window in a portal |

## Advanced Usage

### Custom Minimized Position

You can customize the position of the minimized windows container:

```jsx
import { minimizedWindowsManager } from 'packages/ui';

// Set the position to 'top', 'bottom', 'left', or 'right'
minimizedWindowsManager.setPosition('top');
```

### Programmatically Controlling Windows

You can use state to programmatically control windows:

```jsx
import { useState } from 'react';
import { ViewManager, MinimizedContainer } from 'packages/ui';

function App() {
  const [showWindow, setShowWindow] = useState(false);
  
  return (
    <>
      <MinimizedContainer />
      
      <button onClick={() => setShowWindow(true)}>Open Window</button>
      
      {showWindow && (
        <ViewManager
          id="dynamic-window"
          title="Dynamic Window"
          onClose={() => setShowWindow(false)}
        >
          <div>Dynamic Window Content</div>
        </ViewManager>
      )}
    </>
  );
}

# Pump Scene Responsive Design Issue

## Problem Statement

The `components/pump-scene.tsx` component is not responsive and does not adapt properly to different viewport sizes and zoom levels. Currently, the P5.js animation's position and scale become inconsistent when:

- The browser window is resized
- Different zoom levels are applied
- The component is viewed on different device sizes

The pump scene should remain consistently positioned and scaled proportionally, matching the responsive behavior of the rest of the UI components.

## Current Behavior

The P5.js canvas in `pump-scene.tsx` uses absolute positioning and scaling calculations that don't properly adapt to:

- Container size changes
- Browser zoom levels
- Different viewport dimensions
- Responsive layout breakpoints

Key problematic code sections:

```typescript
// Line 36: Canvas uses window dimensions directly
const canvas = p.createCanvas(p.windowWidth, p.windowHeight);

// Line 48: Scaling based on arbitrary values
const scale = Math.min(p.width / 1200, p.height / 800);

// Line 61-62: Fixed offset positioning
const offsetX = -p.width / 4;
const offsetY = -p.height / 12;
```

## Desired Behavior

The pump scene should:

1. **Respect Container Boundaries**: The P5.js canvas should size itself based on its parent container dimensions, not the entire window
2. **Scale Proportionally**: All drawing elements should scale proportionally when the container size changes
3. **Maintain Aspect Ratio**: The scene should maintain proper aspect ratio across different screen sizes
4. **Center Properly**: The animation should remain centered within its container at all zoom levels
5. **Match UI Responsiveness**: Behave consistently with other UI components (charts, control panel) which properly adapt to different viewports

## Technical Context

### P5.js Canvas Rendering Constraints

**Critical**: P5.js works at the **pixel/bitmap level**, which means:

1. **Canvas is a Raster Element**: Unlike SVG or CSS that can scale infinitely, the HTML canvas is a bitmap that has fixed pixel dimensions
2. **No Automatic Scaling**: When you create a canvas with `p.createCanvas(width, height)`, you're setting actual pixel dimensions. CSS transforms won't make the content scale properly - they just stretch/shrink the bitmap
3. **Pixel Density Matters**: On retina/high-DPI displays, `window.devicePixelRatio` can be 2x or 3x, affecting how crisp the rendering appears
4. **Resize = Redraw**: When the canvas needs to resize, it must be recreated with new dimensions, and the coordinate system needs recalculation
5. **Mathematical Scaling Required**: All drawing coordinates (x, y positions, sizes) must be mathematically scaled based on the canvas dimensions - this can't be delegated to CSS

### Current Implementation

- Uses P5.js in instance mode
- Dynamically imports via Next.js `dynamic()` with `ssr: false`
- Canvas is created with `p.createCanvas(p.windowWidth, p.windowHeight)`
- Has `p.windowResized()` handler but positioning still breaks
- All drawing commands use calculated scale factor (`s`) but based on wrong reference dimensions

### Current Layout (app/page.tsx)

```typescript
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* CAD Scene */}
  <div className="h-[500px] lg:h-[700px] rounded-lg overflow-hidden shadow-xl border border-border">
    <PumpScene ... />
  </div>
  {/* Charts */}
  <div className="h-[500px] lg:h-[700px] ...">
    <SensorCharts ... />
  </div>
</div>
```

## Requirements for Solution

### Must Have

1. Wrap the P5.js scene in a proper responsive container
2. Canvas should size to container dimensions, not window dimensions
3. Maintain proper scaling at all zoom levels (50% - 200%)
4. Keep the pump illustration centered and properly proportioned
5. Work seamlessly on mobile, tablet, and desktop breakpoints
6. Preserve all existing functionality (animation, sensor data display, maintenance indicator)

### Technical Considerations

**Canvas/Pixel-Level Requirements:**

1. **Container-based Sizing**: Use `canvasRef.current.clientWidth` and `canvasRef.current.clientHeight` instead of `p.windowWidth`/`p.windowHeight` to create the canvas
2. **Pixel Density Handling**: Consider `window.devicePixelRatio` for crisp rendering on retina displays:
   ```typescript
   const pixelDensity = window.devicePixelRatio || 1;
   p.pixelDensity(pixelDensity);
   ```
3. **Proper Resize Handler**: The `p.windowResized()` should:
   - Get container dimensions (not window dimensions)
   - Recreate canvas with new pixel dimensions
   - Recalculate the scale factor for all drawing operations
4. **Coordinate System**: All drawing coordinates are calculated based on a scale factor that must update when canvas size changes
5. **Avoid CSS Scaling**: Don't rely on CSS transforms to scale the canvas - this will blur/pixelate the bitmap. Instead, create the canvas at the correct pixel dimensions and scale all drawing math
6. **Performance**: Canvas clearing and redrawing at 60fps must remain performant even when resized
7. **Reference Dimensions**: Establish a base/reference size (e.g., 1200x800) and scale all drawing operations proportionally from this baseline

**Integration Requirements:**

1. Test with Next.js dev server and production build
2. Ensure dynamic import with `ssr: false` continues to work
3. Verify no hydration errors occur
4. Maintain 60fps animation performance

### Nice to Have

1. Smooth transitions when resizing (debounce if needed for performance)
2. Optimized rendering for different screen densities using `p.pixelDensity()`
3. Maintain crisp rendering at all pixel ratios (1x, 2x, 3x displays)
4. Consider using `ResizeObserver` API for more efficient resize detection than `windowResized`

## Expected Outcome

After implementation, the pump scene should:

- Stay consistently positioned within its container
- Scale all elements proportionally when container size changes
- Work seamlessly alongside the responsive SensorCharts component
- Maintain visual consistency across all device sizes and zoom levels
- Match the responsive behavior of other UI components in the application

## Files to Modify

Primary file:

- `components/pump-scene.tsx` (lines 26-57 particularly need attention)

May also need minor adjustments:

- `app/page.tsx` (if container wrapper changes are needed)

## Testing Requirements

Please test the solution with:

**Viewport and Zoom Testing:**

1. Browser window resize (minimum 320px to 3840px width)
2. Zoom levels: 50%, 75%, 100%, 125%, 150%, 200%
3. Mobile viewport (375px, 414px, 390px widths)
4. Tablet viewport (768px, 820px, 1024px widths)
5. Desktop viewport (1280px, 1440px, 1920px, 2560px widths)

**Canvas-Specific Testing:**

6. Verify canvas dimensions match container dimensions (use DevTools to inspect canvas width/height attributes)
7. Check that drawing coordinates stay properly positioned when resizing
8. Ensure no blurriness or pixelation occurs (especially on retina displays)
9. Test that the canvas bitmap is crisp at different zoom levels - not stretched/blurred
10. Ensure animation continues to work smoothly at 60fps during and after resize
11. Verify all interactive elements (sensor displays, status indicator) remain properly positioned
12. Confirm the scale factor recalculates correctly when container size changes

**Visual Quality Checks:**

- Lines should remain crisp (not anti-aliased/blurry from CSS scaling)
- Text should be readable at all sizes
- Pump illustration should maintain proportions
- Colors should remain consistent

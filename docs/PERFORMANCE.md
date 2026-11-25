# Performance Optimization Guide (Issue #318)

This document outlines performance optimization strategies, measurement techniques, and best practices for maintaining a fast, responsive application in the Ahjoor Frontend project.

---

## Table of Contents

1. [Performance Overview](#performance-overview)
2. [Web Vitals & Metrics](#web-vitals--metrics)
3. [Component Optimization](#component-optimization)
4. [Code Splitting & Lazy Loading](#code-splitting--lazy-loading)
5. [Rendering Optimization](#rendering-optimization)
6. [Memory Management](#memory-management)
7. [Network Optimization](#network-optimization)
8. [Bundle Optimization](#bundle-optimization)
9. [Measuring Performance](#measuring-performance)
10. [Performance Monitoring](#performance-monitoring)

---

## Performance Overview

Performance is a core feature. Fast applications provide better user experience and improve conversion rates.

### Performance Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms
- **Bundle Size**: < 500KB (gzipped)

---

## Web Vitals & Metrics

### Core Web Vitals

```typescript
// lib/webVitals.ts
export function reportWebVitals() {
  // Largest Contentful Paint
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        logger.info("LCP:", {
          value: lastEntry.renderTime || lastEntry.loadTime,
          element: (lastEntry as any).element?.tagName,
        });
      });
      
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // Observer not supported
    }
  }

  // First Input Delay (or Interaction to Next Paint in newer browsers)
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingDuration;
          logger.info("FID:", { value: fid, name: entry.name });
        }
      });
      
      observer.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // Observer not supported
    }
  }

  // Cumulative Layout Shift
  if ("PerformanceObserver" in window) {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            logger.info("CLS:", { value: clsValue });
          }
        }
      });
      
      observer.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // Observer not supported
    }
  }
}
```

---

## Component Optimization

### React.memo for Expensive Components

```typescript
// ✅ GOOD: Memoize components that don't need frequent re-renders
interface CircleCardProps {
  circle: Circle;
  onSelect: (circle: Circle) => void;
}

const CircleCard = React.memo(
  ({ circle, onSelect }: CircleCardProps) => (
    <div onClick={() => onSelect(circle)}>
      <h3>{circle.name}</h3>
      <p>{circle.description}</p>
    </div>
  ),
  (prevProps, nextProps) => {
    // Custom comparison: re-render only if circle data changes
    return prevProps.circle.id === nextProps.circle.id &&
           prevProps.circle.updatedAt === nextProps.circle.updatedAt;
  }
);

export default CircleCard;
```

### useMemo for Expensive Calculations

```typescript
// ✅ GOOD: Memoize expensive calculations
function CircleList({ circles, filters }: Props) {
  const filteredCircles = useMemo(() => {
    return circles.filter(circle => {
      // Complex filtering logic
      return filters.every(f => f.match(circle));
    });
  }, [circles, filters]);

  return (
    <ul>
      {filteredCircles.map(circle => (
        <CircleCard key={circle.id} circle={circle} />
      ))}
    </ul>
  );
}
```

### useCallback for Event Handlers

```typescript
// ✅ GOOD: Memoize callbacks to prevent unnecessary child re-renders
function UserSearch() {
  const [results, setResults] = useState<User[]>([]);

  const handleSearch = useCallback(async (query: string) => {
    const data = await apiClient.searchUsers(query);
    setResults(data);
  }, []);

  return (
    <SearchInput onSearch={handleSearch}>
      <UserList users={results} />
    </SearchInput>
  );
}
```

---

## Code Splitting & Lazy Loading

### Route-Based Code Splitting

```typescript
// app/layout.tsx
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./dashboard/page"));
const Settings = lazy(() => import("./settings/page"));
const Analytics = lazy(() => import("./analytics/page"));

export function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/settings" component={Settings} />
        <Route path="/analytics" component={Analytics} />
      </Routes>
    </Suspense>
  );
}
```

### Component-Level Code Splitting

```typescript
// ✅ GOOD: Lazy load heavy components
import { lazy, Suspense } from "react";

const HeavyChart = lazy(() => import("./HeavyChart"));
const DataTable = lazy(() => import("./DataTable"));

export function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      {showChart && (
        <Suspense fallback={<Skeleton />}>
          <HeavyChart />
        </Suspense>
      )}
      
      <Suspense fallback={<Skeleton />}>
        <DataTable />
      </Suspense>
    </div>
  );
}
```

---

## Rendering Optimization

### Virtualization for Large Lists

```typescript
// ✅ GOOD: Virtualize large lists to render only visible items
import { FixedSizeList } from "react-window";

function LargeCircleList({ circles }: Props) {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <CircleCard circle={circles[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={circles.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Avoid Rendering Unnecessary Elements

```typescript
// ❌ WRONG: Renders all items even though only some are visible
function CircleList({ circles }: Props) {
  return (
    <ul>
      {circles.map(circle => (
        <CircleCard key={circle.id} circle={circle} />
      ))}
    </ul>
  );
}

// ✅ CORRECT: Only render what's visible using virtualization or pagination
function CircleList({ circles }: Props) {
  const pageSize = 20;
  const [page, setPage] = useState(0);
  const start = page * pageSize;
  const visibleCircles = circles.slice(start, start + pageSize);

  return (
    <>
      <ul>
        {visibleCircles.map(circle => (
          <CircleCard key={circle.id} circle={circle} />
        ))}
      </ul>
      <Pagination
        page={page}
        total={circles.length}
        pageSize={pageSize}
        onChange={setPage}
      />
    </>
  );
}
```

---

## Memory Management

### Cleanup in useEffect

```typescript
// ✅ GOOD: Always clean up resources
function RealTimeUpdates() {
  useEffect(() => {
    const subscription = dataSource.subscribe(handleUpdate);
    const timer = setInterval(checkConnection, 30000);

    return () => {
      // Cleanup prevents memory leaks
      subscription.unsubscribe();
      clearInterval(timer);
    };
  }, []);

  return <div>{/* Component */}</div>;
}
```

### Avoid Memory Leaks in Event Listeners

```typescript
// ✅ GOOD: Remove event listeners
function WindowResize() {
  useEffect(() => {
    const handleResize = () => {
      // Handle resize
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div>{/* Component */}</div>;
}
```

---

## Network Optimization

### Request Deduplication

```typescript
// ✅ GOOD: TanStack Query handles deduplication
function useCircles() {
  // Multiple calls to this hook will only trigger one network request
  return useQuery({
    queryKey: queryKeys.circles.list(),
    queryFn: () => apiClient.getCircles(),
  });
}

// Usage in multiple components
function CirclesList() {
  const { data: circles } = useCircles(); // Request 1
}

function CirclesStats() {
  const { data: circles } = useCircles(); // Reuses Request 1 data
}
```

### Response Caching

```typescript
// ✅ GOOD: Configure cache time appropriately
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export function useCircles() {
  return useQuery({
    queryKey: queryKeys.circles.list(),
    queryFn: () => apiClient.getCircles(),
    staleTime: 1 * 60 * 1000, // This circle data is fresh for 1 minute
  });
}
```

### Request Prioritization

```typescript
// ✅ GOOD: Load critical data first
function Dashboard() {
  // High priority: immediately loaded
  const { data: stats } = useQuery({
    queryKey: queryKeys.stats.all(),
    queryFn: () => apiClient.getStats(),
  });

  // Low priority: loaded only if needed
  const [showDetails, setShowDetails] = useState(false);
  const { data: details } = useQuery({
    queryKey: queryKeys.details.all(),
    queryFn: () => apiClient.getDetails(),
    enabled: showDetails, // Only fetch when needed
  });

  return (
    <>
      <StatsDisplay stats={stats} />
      <button onClick={() => setShowDetails(true)}>Show Details</button>
      {showDetails && <DetailsDisplay details={details} />}
    </>
  );
}
```

---

## Bundle Optimization

### Tree-Shaking

```typescript
// ✅ GOOD: Named exports enable tree-shaking
export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString();
}

// ✅ Usage: Only imported functions are included in bundle
import { formatDate } from "./utils";
```

### Avoid Large Dependencies

```typescript
// ❌ WRONG: Import entire library
import _ from "lodash"; // 71KB

// ✅ CORRECT: Import only needed functions
import { debounce } from "lodash-es"; // 2KB
```

---

## Measuring Performance

### Performance API Usage

```typescript
// lib/performance.ts
export function measurePerformance(label: string, fn: () => void) {
  performance.mark(`${label}-start`);
  
  fn();
  
  performance.mark(`${label}-end`);
  performance.measure(label, `${label}-start`, `${label}-end`);
  
  const measure = performance.getEntriesByName(label)[0];
  console.log(`${label}: ${measure.duration.toFixed(2)}ms`);
}

// Usage
measurePerformance("Circle filtering", () => {
  const filtered = circles.filter(c => c.name.includes(query));
});
```

### Lighthouse Audit

```bash
# Run Lighthouse audit
pnpm exec lighthouse https://localhost:3000 --view

# Check performance metrics
npm run lighthouse:report
```

---

## Performance Monitoring

### Real User Monitoring (RUM)

```typescript
// Send performance data to analytics
function reportPerformanceMetrics() {
  const metrics = {
    navigation: performance.getEntriesByType("navigation")[0],
    paint: performance.getEntriesByType("paint"),
    navigation: window.performance.timing,
  };

  // Send to analytics service
  analytics.track("performance_metrics", {
    pageLoadTime: metrics.navigation.loadEventEnd - metrics.navigation.navigationStart,
    domReadyTime: metrics.navigation.domContentLoadedEventEnd - metrics.navigation.navigationStart,
  });
}

reportPerformanceMetrics();
```

### Error Rate Monitoring

```typescript
// Track slow operations
function withPerformanceTracking<T>(
  operation: string,
  fn: () => Promise<T>,
  threshold: number = 1000
): Promise<T> {
  const start = performance.now();
  
  return fn().then(result => {
    const duration = performance.now() - start;
    
    if (duration > threshold) {
      logger.warn(`Slow operation: ${operation}`, { duration });
    }
    
    return result;
  });
}
```

---

## Performance Checklist

- [ ] Core Web Vitals within targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Component memoization applied where appropriate
- [ ] Code splitting implemented for routes and heavy components
- [ ] Large lists virtualized or paginated
- [ ] Unused code removed and tree-shaken
- [ ] Bundle size < 500KB gzipped
- [ ] Lighthouse score > 90
- [ ] No memory leaks in useEffect cleanup
- [ ] Network requests deduplicated and cached
- [ ] Performance regularly monitored and reported


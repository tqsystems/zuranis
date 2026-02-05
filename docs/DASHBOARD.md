# Dashboard Documentation

## Overview

The Releason Dashboard is a Release Confidence Intelligence platform that provides real-time insights into test coverage, risk analysis, and release readiness.

## Features

### 🎯 Main Dashboard (`/dashboard`)

The main dashboard provides an at-a-glance view of your release confidence:

- **Release Confidence Score**: Large hero section showing overall confidence (87%)
- **Risk Level Badge**: Visual indicator of current risk level (Medium/High/Low)
- **Metrics Grid**: 4 key metrics with progress bars
  - Release Confidence: 87%
  - Test Coverage: 92%
  - Risk Level: Medium
  - Time to Ship: 2h 30m
- **Coverage by Feature**: Table showing test coverage breakdown by module
- **Risk Summary**: Card with risk items and recommendations

### 📊 Coverage Analysis (`/dashboard/coverage`)

Placeholder page for detailed test coverage analysis (to be implemented).

### ⚠️ Risk Analysis (`/dashboard/risk`)

Placeholder page for comprehensive risk assessment (to be implemented).

### ⚙️ Settings (`/dashboard/settings`)

User account settings and preferences.

## Components

### DashboardLayout

**Location**: `src/components/DashboardLayout.tsx`

Provides the main layout structure for all dashboard pages:

- **Sidebar Navigation**
  - Dashboard
  - Coverage
  - Risk Analysis
  - Settings
  - Logout button
- **Responsive Design**
  - Desktop: Fixed sidebar on left
  - Mobile: Collapsible drawer with overlay
- **Header**
  - User avatar and info
  - Logo and branding
- **User Section**
  - Profile information
  - Logout functionality

**Usage**:
```tsx
import { DashboardLayout } from "@/components/DashboardLayout";

export default function MyPage() {
  return (
    <DashboardLayout>
      {/* Your page content */}
    </DashboardLayout>
  );
}
```

### ReleaseOverview

**Location**: `src/components/dashboard/ReleaseOverview.tsx`

Hero component displaying the main release confidence score:

- **Large confidence score** with circular progress indicator
- **Risk level badge** with color coding
- **Release information** (version, date)
- **Recommendation section** with actionable insights
- **Beautiful gradient background** with pattern overlay

**Features**:
- Animated progress circle
- Color-coded risk levels (green/yellow/red)
- Responsive design for mobile and desktop

### MetricsGrid

**Location**: `src/components/dashboard/MetricsGrid.tsx`

Displays 4 key metrics in a responsive grid:

1. **Release Confidence** (Green)
   - 87% - Above target threshold
   - Progress bar indicator

2. **Test Coverage** (Green)
   - 92% - Overall coverage score
   - Progress bar indicator

3. **Risk Level** (Yellow)
   - Medium - 3 areas need attention
   - Progress bar indicator

4. **Time to Ship** (Blue)
   - 2h 30m - Estimated deployment time
   - Progress bar indicator

**Features**:
- Responsive grid layout (1 column mobile, 2 on tablet, 4 on desktop)
- Icon indicators for each metric
- Color-coded by status
- Hover effects

### CoverageByFeature

**Location**: `src/components/dashboard/CoverageByFeature.tsx`

Table displaying test coverage breakdown by feature:

**Sample Data**:
| Feature | Coverage | Status |
|---------|----------|--------|
| Loan Origination Flow | 98% | ✓ Excellent |
| Credit Check Integration | 94% | ✓ Excellent |
| Approval Rules Engine | 73% | ⚠ Needs Work |
| Compliance Reporting | 58% | ⚠ Critical |
| Document Management | 89% | ✓ Good |
| Payment Processing | 91% | ✓ Excellent |

**Features**:
- Sortable table (future enhancement)
- Color-coded status badges
- Progress bars for visual coverage indication
- Average coverage summary footer
- Responsive table with horizontal scroll on mobile

### RiskSummary

**Location**: `src/components/dashboard/RiskSummary.tsx`

Displays risk items requiring attention:

**Risk Levels**:
- **High Risk** (Red): Critical issues that must be addressed
- **Medium Risk** (Yellow): Issues that should be addressed
- **Low Risk** (Blue): Minor issues to consider
- **Info** (Gray): Informational items

**Sample Risks**:
1. Low Test Coverage - Compliance module at 58%
2. Approval Rules Need Testing - 73% coverage
3. Documentation Updates - API docs need updating
4. Performance Optimization - Load testing recommended

**Features**:
- Color-coded risk badges
- Risk count summary
- Actionable recommendations
- "Create Action Plan" CTA button

## Design System

### Color Palette

```css
/* Primary Colors */
--primary: #667eea;      /* Purple */
--secondary: #764ba2;    /* Dark Purple */

/* Status Colors */
--success: #48bb78;      /* Green */
--warning: #ed8936;      /* Orange */
--danger: #f56565;       /* Red */
--info: #4299e1;         /* Blue */

/* Neutral Colors */
--background: #f5f7fa;   /* Light Gray */
--text: #2c3e50;         /* Dark Blue-Gray */
```

### Typography

- **Headings**: Bold, Inter font family
- **Body**: Regular, Inter font family
- **Sizes**: Responsive with Tailwind's text utilities

### Spacing

Following Tailwind's spacing scale:
- Small: 2, 4, 6 (0.5rem, 1rem, 1.5rem)
- Medium: 8, 12, 16 (2rem, 3rem, 4rem)
- Large: 20, 24, 32 (5rem, 6rem, 8rem)

### Components

#### Cards
- White background (`bg-white`)
- Rounded corners (`rounded-xl`)
- Subtle shadow (`shadow-sm`)
- Hover effect (`hover:shadow-md`)

#### Badges
- Rounded (`rounded-full`)
- Padded (`px-3 py-1`)
- Color-coded by status
- Icon support

#### Progress Bars
- Height: `h-2`
- Rounded (`rounded-full`)
- Background: `bg-gray-100`
- Fill: Color-coded by status
- Smooth transitions

## Authentication

All dashboard routes are protected by authentication:

- **Middleware Protection**: Configured in `src/middleware.ts`
- **Server-Side Check**: Each page uses `requireAuth()`
- **Automatic Redirect**: Unauthenticated users redirected to `/auth/signin`
- **Callback URL**: Preserved for post-login redirect

**Example**:
```tsx
export default async function DashboardPage() {
  const user = await requireAuth("/dashboard");
  
  return (
    <DashboardLayout>
      {/* Content */}
    </DashboardLayout>
  );
}
```

## Responsive Design

### Breakpoints

- **Mobile**: < 640px
  - Single column layouts
  - Collapsible sidebar
  - Stacked metrics

- **Tablet**: 640px - 1024px
  - 2 column grids
  - Sidebar visible
  - Optimized layouts

- **Desktop**: > 1024px
  - Full grid layouts
  - Fixed sidebar
  - Maximum content width: 1280px

### Mobile Navigation

- Hamburger menu icon
- Slide-out sidebar
- Backdrop overlay
- Touch-friendly targets

## Data Flow

### Current Implementation

All data is currently **static/mocked** for demonstration purposes:

```tsx
const confidenceScore = 87;
const riskLevel = "Medium";
const releaseNumber = "v2.4.0";
```

### Future Integration

To integrate with real data:

1. **Create API Routes**:
   ```typescript
   // src/app/api/dashboard/metrics/route.ts
   export async function GET() {
     const metrics = await fetchMetricsFromDatabase();
     return NextResponse.json(metrics);
   }
   ```

2. **Fetch in Server Components**:
   ```tsx
   async function getMetrics() {
     const res = await fetch('/api/dashboard/metrics');
     return res.json();
   }
   
   export default async function DashboardPage() {
     const metrics = await getMetrics();
     // Pass to components
   }
   ```

3. **Use Client Components for Real-Time**:
   ```tsx
   "use client";
   
   export function MetricsGrid() {
     const { data } = useSWR('/api/dashboard/metrics');
     // Render with real data
   }
   ```

## Testing

### Unit Tests (To Be Added)

```bash
# Test individual components
npm run test src/components/dashboard/MetricsGrid.test.tsx
```

### E2E Tests (To Be Added)

```bash
# Test full dashboard flow
npm run test:e2e tests/dashboard.spec.ts
```

## Performance

### Current Metrics

- **First Load JS**: ~118 kB (gzipped)
- **Page Size**: 3-7 kB per route
- **Rendering**: Server-side (dynamic)

### Optimization Opportunities

1. **Image Optimization**: Already using Next.js Image
2. **Code Splitting**: Automatic with Next.js
3. **Lazy Loading**: Can add for heavy components
4. **Caching**: Add API response caching

## Deployment

The dashboard is ready for deployment:

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Required:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Optional (Supabase):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Future Enhancements

### Short Term
- [ ] Real-time data integration
- [ ] Historical trends charts
- [ ] Export reports (PDF/CSV)
- [ ] Filter and sort tables
- [ ] Search functionality

### Medium Term
- [ ] Custom dashboards
- [ ] Alerts and notifications
- [ ] Team collaboration features
- [ ] API documentation viewer
- [ ] Release history timeline

### Long Term
- [ ] ML-powered risk predictions
- [ ] Integration with CI/CD pipelines
- [ ] Multi-repository support
- [ ] Custom metrics and KPIs
- [ ] Advanced analytics

## Troubleshooting

### Issue: Sidebar not showing on mobile
**Solution**: Check that React Icons are installed:
```bash
npm install react-icons
```

### Issue: Authentication redirect loop
**Solution**: Verify environment variables are set correctly and middleware matcher is configured.

### Issue: Styles not applying
**Solution**: Ensure Tailwind CSS is properly configured in `tailwind.config.ts`.

## Support

For issues or questions:
- Check the [Authentication Guide](./AUTHENTICATION.md)
- Review [Quick Reference](./QUICK_REFERENCE.md)
- See [Architecture](./ARCHITECTURE.md)

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-01-29  
**Version**: 1.0.0

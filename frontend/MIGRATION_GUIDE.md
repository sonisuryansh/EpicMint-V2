# Migration Guide: Next.js → React + Vite + Bootstrap

## Overview

The frontend has been migrated from a Next.js + Tailwind CSS setup to a modern React + Vite + Bootstrap stack.

## What Changed

### Framework Migration

| Aspect | Before | After |
|--------|--------|-------|
| **Build Tool** | Next.js | Vite |
| **Framework** | Next.js (SSR/SSG) | React (CSR) |
| **CSS Framework** | Tailwind CSS | Bootstrap 5 |
| **Component Library** | shadcn/ui + Radix UI | Native Bootstrap Components |
| **Node** | CommonJS | ES Modules |
| **Dev Server** | Next.js dev | Vite dev |

### File Structure Changes

```
Before:
frontend/
├── pages/          → Now in src/pages/
├── components/     → Now in src/components/
├── public/
├── next.config.js  → Replaced with vite.config.js
└── tailwind.config.ts → Removed

After:
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

### Dependencies Changes

**Removed:**
- `next` - No longer using Next.js
- `@hookform/*` - Replaced with native React form handling
- `@radix-ui/*` - Replaced with Bootstrap components
- `tailwindcss` - Replaced with Bootstrap
- `zod`, `react-hook-form` - Can be added back if needed for validation
- `genkit` - No longer included by default

**Added:**
- `vite` - New build tool
- `@vitejs/plugin-react` - Vite React support
- `bootstrap` - CSS framework
- `react-router-dom` - Client-side routing

### Environment Variables

All environment variables now use the `VITE_` prefix instead of `NEXT_PUBLIC_`:

```
Before: NEXT_PUBLIC_API_URL
After:  VITE_API_URL
```

Update your `.env` file accordingly. See `.env.example` for the complete list.

### API Endpoints

API calls now use the pre-configured Axios client in `src/lib/api.js`:

```jsx
import apiClient from '@/lib/api'

// Before (Next.js)
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`)

// After (React + Axios)
const response = await apiClient.get('/endpoint')
```

### Styling

**Before (Tailwind CSS):**
```jsx
<div className="flex justify-center items-center h-screen bg-gray-100 text-blue-500">
  Content
</div>
```

**After (Bootstrap):**
```jsx
<div className="d-flex justify-content-center align-items-center vh-100 bg-light text-primary">
  Content
</div>
```

### Routing

**Before (Next.js File-based routing):**
- `pages/index.js` → `/`
- `pages/marketplace.js` → `/marketplace`
- `pages/create.js` → `/create`

**After (React Router):**
```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/marketplace" element={<Marketplace />} />
  <Route path="/create" element={<Create />} />
</Routes>
```

## Migration Checklist

- [x] Replace Next.js with Vite + React
- [x] Replace Tailwind CSS with Bootstrap 5
- [x] Replace shadcn/ui with Bootstrap components
- [x] Set up React Router for client-side routing
- [x] Create custom hooks for common patterns
- [x] Set up Axios API client with interceptors
- [x] Create reusable component library
- [x] Update environment variable names
- [x] Create ESLint and Prettier configs
- [ ] Update backend API to handle SPA requests
- [ ] Test all pages and features
- [ ] Update deployment configuration

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/MyPage.jsx`:
```jsx
import React from 'react'
import './MyPage.css'

function MyPage() {
  return (
    <div className="container-fluid py-4">
      <h1>My Page</h1>
    </div>
  )
}

export default MyPage
```

2. Add route in `src/App.jsx`:
```jsx
<Route path="/mypage" element={<MyPage />} />
```

3. Add navigation link in `src/components/Navigation.jsx`:
```jsx
<Link to="/mypage" className="nav-link">My Page</Link>
```

### Adding a New Component

1. Create component in `src/components/MyComponent.jsx`
2. Export it in `src/components/index.js`
3. Use it:
```jsx
import { MyComponent } from '@/components'
```

### Making API Calls

```jsx
import { useEffect, useState } from 'react'
import apiClient from '@/lib/api'

function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get('/endpoint')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  return <div>{JSON.stringify(data)}</div>
}
```

### Using Custom Hooks

```jsx
import { useLocalStorage, useAsync } from '@/hooks'

function MyComponent() {
  const [user, setUser] = useLocalStorage('user', null)
  const { data, status, error } = useAsync(fetchUser)
}
```

## Bootstrap Classes Quick Reference

### Layout
- `container`, `container-fluid` - Containers
- `row`, `col-*`, `col-md-*` - Grid system
- `d-flex`, `justify-content-*`, `align-items-*` - Flexbox

### Typography
- `display-1` to `display-6` - Large headings
- `h1` to `h6`, `lead` - Standard typography
- `fw-bold`, `fw-normal` - Font weight
- `text-center`, `text-start`, `text-end` - Alignment

### Components
- `btn`, `btn-primary`, `btn-lg` - Buttons
- `card`, `card-body`, `card-title` - Cards
- `form-control`, `form-select` - Forms
- `navbar`, `nav-link` - Navigation
- `alert`, `badge`, `modal` - Feedback

### Spacing
- `m-*`, `mt-*`, `mb-*`, `ms-*`, `me-*` - Margin
- `p-*`, `pt-*`, `pb-*`, `ps-*`, `pe-*` - Padding
- `gap-*` - Flexbox gap

## Troubleshooting

### Module not found errors
- Make sure imports use the `@/` alias
- Check that file extensions are correct (`.jsx`, `.css`, `.js`)

### Environment variables not working
- Make sure they start with `VITE_`
- Restart the dev server after changing `.env`
- Access with `import.meta.env.VITE_VAR_NAME`

### Styling not applied
- Check Bootstrap classes are correct
- Make sure Bootstrap CSS is imported in `src/index.css`
- Verify custom CSS files are imported in components

### API calls failing
- Check `VITE_API_URL` in `.env`
- Verify CORS is configured on backend
- Check browser console for error details

## Next Steps

1. **Update API integration**: Connect the Marketplace and Create pages to real API endpoints
2. **Add form validation**: Integrate react-hook-form for advanced form handling
3. **Add state management**: Consider Redux or Zustand for complex state
4. **Add authentication**: Implement wallet connection and Firebase auth
5. **Add testing**: Set up Vitest and React Testing Library
6. **Improve SEO**: Consider using React Helmet for meta tags

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)

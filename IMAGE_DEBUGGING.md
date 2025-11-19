# Image Loading Debugging Guide

## Quick Checks

### 1. Check Browser Console
Open DevTools (F12) and check:
- Console tab for error messages
- Network tab to see if image requests are being made
- Check the status code (200 = success, 404 = not found)

### 2. Verify Image Path
The image should be accessible at:
- Local: `http://localhost:5173/figmaAssets/students.png`
- Production: `https://your-site.netlify.app/figmaAssets/students.png`

### 3. Check Build Output
After building, verify the `dist` folder contains:
```
dist/
  ├── figmaAssets/
  │   └── students.png
  └── index.html
```

## Common Issues & Solutions

### Issue 1: 404 Error
**Solution:** 
- Verify `public/figmaAssets/students.png` exists
- Check `netlify.toml` redirects are correct
- Ensure `copyPublicDir: true` in vite.config.ts

### Issue 2: Image loads but not visible
**Solution:**
- Check CSS - image might have `display: none` or `opacity: 0`
- Check container width/height
- Check z-index issues

### Issue 3: CORS or Network Error
**Solution:**
- Check Netlify headers configuration
- Verify static assets are being served correctly

## Test Image Path

Try accessing the image directly in your browser:
```
https://your-netlify-site.netlify.app/figmaAssets/students.png
```

If this works, the issue is in the component. If not, it's a deployment/build issue.


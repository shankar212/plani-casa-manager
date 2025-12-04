# Deployment Instructions

Since this is a Vite + React application, it can be easily deployed to various static hosting providers. Here are instructions for the two most popular options: Vercel and Netlify.

## Option 1: Vercel (Recommended)

Vercel is optimized for frontend frameworks and offers a very smooth deployment experience.

1.  **Push your code to GitHub**: Ensure your latest changes are committed and pushed to your GitHub repository.
2.  **Sign up/Login to Vercel**: Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
3.  **Add New Project**:
    *   Click "Add New..." -> "Project".
    *   Import your `plani-casa-manager` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vercel should automatically detect "Vite".
    *   **Root Directory**: `./` (default)
    *   **Build Command**: `npm run build` (default)
    *   **Output Directory**: `dist` (default)
    *   **Environment Variables**: You MUST add your Supabase environment variables here.
        *   `VITE_SUPABASE_URL`: (Get this from your local .env file)
        *   `VITE_SUPABASE_PROJECT_ID`: (Get this from your local .env file)
        *   `VITE_SUPABASE_PUBLISHABLE_KEY`: (Get this from your local .env file)
5.  **Deploy**: Click "Deploy".

**Custom Domain**:
Once deployed, you can go to the project "Settings" -> "Domains" on Vercel and add your `plani-tec.com` domain. Follow the instructions to update your DNS records.

## Option 2: Netlify

1.  **Push your code to GitHub**.
2.  **Sign up/Login to Netlify**: Go to [netlify.com](https://www.netlify.com).
3.  **Add New Site**: Click "Add new site" -> "Import from an existing project".
4.  **Connect to GitHub** and select your repository.
5.  **Configure Build Settings**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
6.  **Environment Variables**:
    *   Go to "Site configuration" -> "Environment variables".
    *   Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, and `VITE_SUPABASE_PUBLISHABLE_KEY`.
7.  **Deploy**: Click "Deploy site".

**Custom Domain**:
Go to "Domain management" in your site settings to add `plani-tec.com`.

## Option 3: Manual Build (For other hosting)

If you have a traditional web host (cPanel, etc.):

1.  Run `npm run build` in your terminal.
2.  This will create a `dist` folder in your project directory.
3.  Upload the *contents* of the `dist` folder to the `public_html` (or equivalent) folder on your server.
4.  **Note**: For client-side routing (React Router) to work on Apache/Nginx, you might need additional configuration (e.g., `.htaccess` or `nginx.conf`) to redirect all requests to `index.html`.

### Example .htaccess for Apache:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
kodya
├─ app
│  ├─ (admin)
│  │  └─ dashboard
│  │     └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ landing
│  │  ├─ page.tsx
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ layout.tsx
│  └─ page.tsx
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
└─ tsconfig.json

```
```
kodya
├─ app
│  ├─ (admin)
│  │  ├─ dashboard
│  │  │  ├─ actions
│  │  │  │  └─ admin.ts
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  └─ products
│  │     └─ create
│  │        ├─ actions.ts
│  │        ├─ Editor.tsx
│  │        └─ page.tsx
│  ├─ (customer)
│  │  ├─ cart
│  │  │  └─ page.tsx
│  │  ├─ checkout
│  │  │  └─ page.tsx
│  │  ├─ product
│  │  │  ├─ actions
│  │  │  │  ├─ categories.ts
│  │  │  │  └─ product.ts
│  │  │  ├─ category
│  │  │  │  ├─ products.ts
│  │  │  │  └─ [category]
│  │  │  │     ├─ CategoryClientContent.tsx
│  │  │  │     └─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ saldo
│  │     └─ page.tsx
│  ├─ actions.ts
│  ├─ api
│  │  └─ payment
│  │     ├─ mark-opened
│  │     │  └─ route.ts
│  │     ├─ notification
│  │     │  └─ route.ts
│  │     ├─ regenerate
│  │     │  └─ route.ts
│  │     ├─ route.ts
│  │     └─ webhook
│  │        └─ route.ts
│  ├─ auth
│  │  ├─ callback
│  │  │  └─ route.ts
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  └─ register
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ categorySection.tsx
│  │  ├─ heroSection.tsx
│  │  ├─ layoutBeranda.tsx
│  │  ├─ navbar.tsx
│  │  ├─ paymentModal.tsx
│  │  ├─ productCard.tsx
│  │  ├─ productDetail.tsx
│  │  ├─ ProductListClient.tsx
│  │  └─ showWindow.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ landing
│  │  ├─ page.tsx
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ layout.tsx
│  ├─ middleware.ts
│  └─ page.tsx
├─ docker-compose.yaml
├─ Dockerfile
├─ eslint.config.mjs
├─ hooks
│  └─ useSupabase.ts
├─ lib
│  ├─ supabase-client.ts
│  ├─ supabase-server.ts
│  └─ supabase.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ logo.png
│  ├─ next.svg
│  ├─ product-1.jpg
│  ├─ product-2.jpg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ supabase
│  ├─ .temp
│  │  └─ cli-latest
│  └─ config.toml
├─ tsconfig.json
└─ types
   ├─ midtrans.d.ts
   └─ supabase.ts

```
```
kodya
├─ .windsurf
│  └─ workflows
│     └─ cart.md
├─ app
│  ├─ (admin)
│  │  ├─ dashboard
│  │  │  ├─ actions
│  │  │  │  └─ admin.ts
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  └─ products
│  │     ├─ create
│  │     │  ├─ actions.ts
│  │     │  ├─ Editor.tsx
│  │     │  └─ page.tsx
│  │     ├─ page.tsx
│  │     └─ [id]
│  │        ├─ edit
│  │        │  ├─ actions.ts
│  │        │  └─ page.tsx
│  │        └─ page.tsx
│  ├─ (customer)
│  │  ├─ cart
│  │  │  └─ page.tsx
│  │  ├─ checkout
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ my-orders
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ product
│  │  │  ├─ actions
│  │  │  │  ├─ categories.ts
│  │  │  │  └─ product.ts
│  │  │  ├─ category
│  │  │  │  ├─ products.ts
│  │  │  │  └─ [category]
│  │  │  │     ├─ CategoryClientContent.tsx
│  │  │  │     └─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ saldo
│  │     └─ page.tsx
│  ├─ actions.ts
│  ├─ api
│  │  ├─ payment
│  │  │  ├─ mark-opened
│  │  │  │  └─ route.ts
│  │  │  ├─ notification
│  │  │  │  └─ route.ts
│  │  │  ├─ regenerate
│  │  │  │  └─ route.ts
│  │  │  ├─ route.ts
│  │  │  └─ webhook
│  │  │     └─ route.ts
│  │  └─ websocket
│  │     └─ route.ts
│  ├─ auth
│  │  ├─ callback
│  │  │  └─ route.ts
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  └─ register
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ Alert.tsx
│  │  ├─ AlertExample.tsx
│  │  ├─ categorySection.tsx
│  │  ├─ heroSection.tsx
│  │  ├─ layoutBeranda.tsx
│  │  ├─ LottieNotFound.tsx
│  │  ├─ navbar.tsx
│  │  ├─ Notification.tsx
│  │  ├─ paymentModal.tsx
│  │  ├─ productCard.tsx
│  │  ├─ productDetail.tsx
│  │  ├─ ProductListClient.tsx
│  │  ├─ README.md
│  │  ├─ ReviewForm.tsx
│  │  ├─ ReviewList.tsx
│  │  └─ showWindow.tsx
│  ├─ contexts
│  │  ├─ CartContext.tsx
│  │  └─ DarkModeContext.tsx
│  ├─ favicon.ico
│  ├─ forbidden
│  │  └─ page.tsx
│  ├─ globals.css
│  ├─ landing
│  │  ├─ page.tsx
│  │  └─ [id]
│  │     └─ page.tsx
│  ├─ layout.tsx
│  ├─ middleware.ts
│  ├─ not-found.tsx
│  ├─ page.tsx
│  └─ profile
│     └─ page.tsx
├─ docker-compose.yaml
├─ Dockerfile
├─ eslint.config.mjs
├─ hooks
│  ├─ useAlert.ts
│  ├─ useDebounce.ts
│  └─ useSupabase.ts
├─ lib
│  ├─ supabase-client.ts
│  ├─ supabase-server.ts
│  ├─ supabase.ts
│  └─ websocket.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ logo.png
│  ├─ lottie
│  │  └─ 404.json
│  ├─ next.svg
│  ├─ product-1.jpg
│  ├─ product-2.jpg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ server.js
├─ supabase
│  ├─ .temp
│  │  └─ cli-latest
│  └─ config.toml
├─ tsconfig.json
├─ types
│  ├─ midtrans.d.ts
│  └─ supabase.ts
└─ WEBSOCKET_README.md

```
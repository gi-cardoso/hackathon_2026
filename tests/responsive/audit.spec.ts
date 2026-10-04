import { test, expect } from '@playwright/test';

const viewports = [
  { width: 320, height: 568, name: 'mobile-small' }, // iPhone SE
  { width: 390, height: 844, name: 'mobile' }, // iPhone 12/13
  { width: 768, height: 1024, name: 'tablet' }, // iPad
  { width: 1366, height: 768, name: 'desktop' }, // Common laptop
];

const apps = [
  {
    name: 'frontend',
    baseUrl: 'http://localhost:5173',
    routes: [
      '/login',
      '/compras/solicitacoes',
      '/compras/fornecedores',
      '/agendamentos/lista',
      '/agendamentos/agenda-operacional',
      '/boletim/publicacoes',
      '/armazem/recebimentos',
      '/bi/indicadores',
      '/usuarios/lista'
    ],
  },
  {
    name: 'frontend-fornecedor',
    baseUrl: 'http://localhost:5174', // Assumed port
    routes: [
      '/login',
      '/dashboard',
      '/agendamentos',
      '/agendamentos/novo'
    ],
  }
];

test.describe('Responsive Audit', () => {
  for (const app of apps) {
    for (const route of app.routes) {
      for (const vp of viewports) {
        test(`Audit ${app.name} ${route} at ${vp.width}x${vp.height}`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(`${app.baseUrl}${route}`, { waitUntil: 'networkidle' });

          // 1. Detect horizontal overflow
          const overflow = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const clientWidth = document.documentElement.clientWidth;
            if (docWidth > clientWidth) {
              const elements = Array.from(document.querySelectorAll('*')).filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.right > window.innerWidth;
              });
              return elements.map(el => ({
                tag: el.tagName,
                className: el.className,
                right: el.getBoundingClientRect().right
              }));
            }
            return null;
          });

          // 2. Touch targets < 44px (only for mobile/tablet)
          let smallTouchTargets = [];
          if (vp.width < 1024) {
            smallTouchTargets = await page.evaluate(() => {
              const elements = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
              return elements.filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
              }).map(el => ({
                tag: el.tagName,
                className: el.className,
                width: el.getBoundingClientRect().width,
                height: el.getBoundingClientRect().height
              }));
            });
          }

          // 3. Screenshot
          const slug = route.replace(/\//g, '-').replace(/^-|-$/g, '') || 'index';
          await page.screenshot({ path: `docs/responsive/${app.name}/${slug}-${vp.name}.png`, fullPage: true });

          // Expect no overflow
          if (overflow) {
            console.log(`[OVERFLOW] ${app.name} ${route} ${vp.name}:`, overflow);
          }
        });
      }
    }
  }
});

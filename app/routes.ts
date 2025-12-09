import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('auth', 'routes/auth.tsx'),

  layout('layout/auth.tsx', [
    ...prefix('dashboard', [
      index('routes/dashboard/index.tsx'),
      route('me', 'routes/dashboard/profile.tsx'),
      route('form/:formId', 'routes/dashboard/form.tsx'),
      route('form/:formId/:pageId', 'routes/dashboard/form-page.tsx'),
      route('form/:formId/submissions', 'routes/dashboard/form-submissions.tsx'),
      route('form/:formId/submission/:submissionId', 'routes/dashboard/form-submission.tsx'),
      route('statistics', 'routes/dashboard/statistics.tsx'),
      route('logout', 'routes/dashboard/logout.ts'),
    ]),
  ]),

  // API
  ...prefix('api', [
    route('form/create', 'routes/api/form/create.ts'),
    route('form/update', 'routes/api/form/update.ts'),
    route('form/delete', 'routes/api/form/delete.ts'),
    route('form/toggle', 'routes/api/form/toggle.ts'),

    route('form/page/update', 'routes/api/form/page/update.ts'),
    route('form/page/delete', 'routes/api/form/page/delete.ts'),
    route('form/theme', 'routes/api/form/theme.ts'),

    // no auth only email from user
    route('form/submissions/next', 'routes/api/form/submissions.next.ts'), // next step
    route('form/:formId/submissions', 'routes/api/form/submissions.ts'), // in case user returns to the form after entering email we should check if he already been on some form pages
    route('form/:formId/pages/:pageId/submissions/:submissionId', 'routes/api/form/submission.ts'), // get single submission for page review
    route('form/submissions/submit', 'routes/api/form/submissions.submit.ts'), // final submit -> get all steps data, calculate results for statistics and save
  ]),

  route(':formId', 'routes/entry-form.tsx'),
  route(':formId/:pageId', 'routes/form-page.tsx'),
  route('submit/:formId', 'routes/submit-form.tsx'),
  route('thank-you', 'routes/thank-you.tsx'),
] satisfies RouteConfig

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  DASHBOARD_ME: '/dashboard/me',
  DASHBOARD_FORM: (formId: string) => `/dashboard/form/${formId}`,
  DASHBOARD_FORM_PAGE: (formId: string, pageId: string) => `/dashboard/form/${formId}/${pageId}`,
  DASHBOARD_FORM_SUBMISSIONS: (formId: string) => `/dashboard/form/${formId}/submissions`,
  DASHBOARD_FORM_SUBMISSION: (formId: string, submissionId: string) =>
    `/dashboard/form/${formId}/submission/${submissionId}`,
  DASHBOARD_STATISTICS: '/dashboard/statistics',
  LOGOUT: '/dashboard/logout',

  API_FORM_CREATE: '/api/form/create',
  API_FORM_UPDATE: '/api/form/update',
  API_FORM_PAGE_UPDATE: '/api/form/page/update',
  API_FORM_PAGE_DELETE: '/api/form/page/delete',
  API_FORM_DELETE: '/api/form/delete',
  API_FORM_THEME_UPDATE: '/api/form/theme',
  API_FORM_TOGGLE_PUBLISH: '/api/form/toggle',
  API_FORM_SUBMISSIONS_GET: (formId: string) => `/api/form/${formId}/submissions`,
  API_FORM_SUBMISSION_GET: (formId: string, pageId: string, submissionId: string) =>
    `/api/form/${formId}/pages/${pageId}/submissions/${submissionId}`,
  API_FORM_SUBMISSIONS_CREATE: '/api/form/submissions/create',
  API_FORM_SUBMISSIONS_NEXT: '/api/form/submissions/next',
  API_FORM_SUBMISSIONS_SUBMIT: '/api/form/submissions/submit',

  ENTRY_FORM: (formId: string) => `/${formId}`,
  FORM_PAGE: (formId: string, pageId: string) => `/${formId}/${pageId}`,
  SUBMIT_FORM: (formId: string) => `/${formId}/submit`,
  THANK_YOU: (formId: string) => `/${formId}/thank-you`,
} as const

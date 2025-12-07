import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('auth', 'routes/auth.tsx'),

  layout('layout/auth.tsx', [
    ...prefix('dashboard', [
      index('routes/dashboard/index.tsx'),
      route('me', 'routes/dashboard/profile.tsx'),
      route('form/:formId', 'routes/dashboard/form.tsx'),
      route('form/:formId/edit', 'routes/dashboard/form-edit.tsx'),
      route('form/:formId/submissions', 'routes/dashboard/form-submissions.tsx'),
      route('form/:formId/submission/:submissionId', 'routes/dashboard/form-submission.tsx'),
      route('statistics', 'routes/dashboard/statistics.tsx'),
      route('logout', 'routes/dashboard/logout.ts'),
    ]),
  ]),

  // API
  ...prefix('api', [route('form/create', 'routes/api/form.create.ts')]),

  route('submit/:formId', 'routes/submit-form.tsx'),
  route('thank-you', 'routes/thank-you.tsx'),
] satisfies RouteConfig

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  DASHBOARD_ME: '/dashboard/me',
  DASHBOARD_FORM: (formId: string) => `/dashboard/form/${formId}`,
  DASHBOARD_FORM_EDIT: (formId: string) => `/dashboard/form/${formId}/edit`,
  DASHBOARD_FORM_SUBMISSIONS: (formId: string) => `/dashboard/form/${formId}/submissions`,
  DASHBOARD_FORM_SUBMISSION: (formId: string, submissionId: string) =>
    `/dashboard/form/${formId}/submission/${submissionId}`,
  DASHBOARD_STATISTICS: '/dashboard/statistics',
  LOGOUT: '/dashboard/logout',

  //API
  API_FORM_CREATE: '/api/form/create',

  // USER FACING
  SUBMIT_FORM: (formId: string) => `/submit/${formId}`,
  THANK_YOU: '/thank-you',
} as const

### Auth - email only

### Form constructor [puck editor](https://puckeditor.com/)

### Resend for emails https://resend.com/docs/send-with-remix

###

### Create needed routes:

Admin: use auth middleware here

- /auth (login/signup name + email only)
- /dashboard: (list of forms)
  - /dashboard/form/:formId (view)
  - /dashboard/form/:formId/edit (edit form) + live preview
  - /dashboard/form/:formId/statistics (view form statistics)
  - /dashboard/form/:formId/submissions (view form submissions)
  - /dashboard/form/:formId/submissions/:submissionId (view single submission)
  - /dashboard/me (view and edit user profile) + password reset flow

Public: no auth middleware here but email is required to fill out the form

- /submit/:formId (view and fill form)
- /thank-you (after form submission)

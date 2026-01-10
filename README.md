### Features

- Auth - email only
- Form constructor [puck editor](https://puckeditor.com/)
- Emails [Resend](https://resend.com/docs/send-with-remix)
- Redis caching

Potential functionality to offload heavy jobs to bullmq + redis:

- form duplication
- formAnswer creation (a lot of parsing/db calls)
- formSubmittion
- export to csv
- emails sending


Potential functionality to cache in redis:
- user sessions (done)
- user facing getFormPage function (done)
- form submit 

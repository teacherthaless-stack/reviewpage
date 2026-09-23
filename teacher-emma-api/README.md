# Teacher Emma secure voice service

This folder is a Vercel-ready serverless service for the Hybrid English Academy speaking app. It keeps the OpenAI API key on the server, never in the student website.

## Deploy

1. Create a new Vercel project from this folder or upload it as a separate repository.
2. Add the environment variables from `.env.example` in the Vercel dashboard. Use a real API key only there; do not commit it or put it in the public website.
3. Set `APP_ORIGIN` to `https://teacherthaless-stack.github.io`.
4. Set `TEACHER_EMMA_API_URL` in the student site to the resulting Vercel URL, for example `https://teacher-emma-api.vercel.app`.

The public app deliberately identifies Teacher Emma as an AI tutor. This is required when using AI-generated speech.

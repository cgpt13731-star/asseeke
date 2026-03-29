# SANA AI

SANA AI is a Node.js website for student motivation testing and profile results.

## Local start

```bash
npm start
```

The app runs on:

```bash
http://localhost:3000
```

## Deploy to Render

1. Push this project to GitHub.
2. Sign in to Render.
3. Create a new `Web Service`.
4. Connect the GitHub repository.
5. Render will use:
   - `Build Command`: `npm install`
   - `Start Command`: `npm start`
6. Deploy the service.

The app automatically uses `process.env.PORT` on Render.

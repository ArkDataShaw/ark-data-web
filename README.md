**Deploying**

This repo builds **arkdata.io**, which is Netlify site `arkdata`
(`8bd2de42-51d6-49c1-9de6-e8e81fd8da08`). `.netlify/state.json` is gitignored, so a fresh
clone or a stale link can point `netlify` at the wrong site — it was previously linked to an
unrelated preview site, where a plain `netlify deploy --prod` would have published
arkdata.io's content to a preview URL and left arkdata.io untouched. Name the site
explicitly:

```
npm run build
netlify deploy --prod --dir=dist --site 8bd2de42-51d6-49c1-9de6-e8e81fd8da08
```

Confirm with `netlify status` before deploying: it must say `Current project: arkdata` and
`Project URL: https://arkdata.io`.

Not to be confused with **app.arkdata.io**, the product app, which lives in the `arkdata`
monorepo on Firebase Hosting and deploys through GitHub Actions — never from here.

**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)

# DocBase

[DocBase](https://getdocbase.com) is a free & open-source alternative to [DocSend](https://docsend.com), which allows you to securely share documents & track engagement in real-time. With DocBase, you can upload any document, get a secure link (with or without a password or expiration date), and view who interacts with it when. 

## Getting Started
I started with @shadcn's template and UI components: https://github.com/shadcn/next-template. It's awesome.

### Clone the repository
`git clone https://github.com/alanagoyal/docbase`

### Set up the database

Create a new [Supabase](https://app.supabase.com/) project, enter your project details, and wait for the database to launch. Run the migration in the repo. Grab the project URL and anon key from the API settings and put them in a new .env.local file in the root directory as shown:

```
NEXT_PUBLIC_SUPABASE_URL = "https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY = "<your-anon-key>"
```

### Install dependencies

`npm install`

### Run the application

Run the application in the command line and it will be available at http://localhost:3000.

`npm run dev`

### Deploy

Deploy using [Vercel](https://vercel.com)

## License

Licensed under the [MIT license](https://github.com/alanagoyal/docbase/blob/main/LICENSE.md).

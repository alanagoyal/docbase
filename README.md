# Docbase

Docbase is an all-in-one platform to create investment documents, share them securely, and communicate with your contacts. I built it for myself to replace multiple tools I use everyday as a founder and investor.

## Getting Started
### Clone the repository

```bash
git clone https://github.com/alanagoyal/docbase
```

### Install Dependencies

```bash
npm install
```

#### Supabase

Create a new [Supabase](https://app.supabase.com/) project, enter your project details, and wait for the database to launch. Follow the [docs](https://supabase.com/docs/guides/cli/local-development) for local development using the [migration](https://github.com/alanagoyal/docbase/blob/main/supabase/migrations/20240729164156_initial.sql) in the repo. Note that you will need to create the storage bucket locally. 

#### Braintrust
This project uses Braintrust to store prompts, log responses, and run evaluations. You can sign up for a free account [here](https://braintrust.dev/) and run the following command to set up the prompts:

```bash
npx braintrust push braintrust/docbase.ts
```

#### Resend
This project uses Resend to send emails. You can sign up for an account [here](https://resend.com/) and retrieve your API key from the dashboard.

#### OpenAI
This project uses OpenAI's API to generate responses to user prompts. You can sign up for an API key [here](https://openai.com/api/).

#### Google Maps
This project uses Google Maps for location autocomplete. You can sign up for an API key [here](https://developers.google.com/maps/documentation/javascript/get-api-key).

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SITE_URL="<your-base-url>"
NEXT_PUBLIC_SUPABASE_URL="<your-supabase-url>"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-supabase-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="<your-google-maps-api-key>"
RESEND_API_KEY="<your-resend-api-key>"
OPENAI_API_KEY="<your-openai-api-key>"
BRAINTRUST_API_KEY="<your-braintrust-api-key>"
```

### Run

Run the application in the command line and it will be available at http://localhost:3000.

`npm run dev`

### Deploy

Deploy using [Vercel](https://vercel.com)

## License

Licensed under the [MIT license](https://github.com/alanagoyal/docbase/blob/main/LICENSE.md).

# DocBase

[DocBase](https://getdocbase.com) is a free & open-source alternative to [DocSend](https://docsend.com). It allows you to securely share documents & track engagement in real-time.

## Getting Started

I'm using @shadcn's template and UI components: https://github.com/shadcn/next-template

Clone the repository
`git clone https://github.com/alanagoyal/docbase`

### Set up the database

Create a new [Supabase](https://app.supabase.com/) project, enter your project details, and wait for the database to launch. Navigate to the SQL editor in the dashboard, paste the SQL below, and run it.

```
-- Create table for user profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  email text unique,
  full_name text
  );

-- This trigger automatically creates a new profile when a new user signs up via Supabase Auth
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up table for links
create table links (
  id uuid on delete cascade not null primary key,
  created_at timestamp with time zone,
  user_id uuid references public.profiles,
  url text,
  password text,
  expires timestamp with time zone,
  filename text
);

-- Set up table for viewers
create table links (
  id uuid on delete cascade not null primary key,
  created_at timestamp with time zone,
  link_id uuid references public.links on delete cascade,
  email text,
  viewed_at timestamp with time zone
);

-- Set up Storage
insert into storage.buckets (id, name)
  values ('docs', 'docs');
```

These instructions don't include RLS or access controls for storage. Make sure to add those if you want them!

Grab the project URL and anon key from the API settings and put them in a new .env.local file in the root directory as shown:

````NEXT_PUBLIC_SUPABASE_URL = "https://<project>.supabase.co";
NEXT_PUBLIC_SUPABASE_ANON_KEY = "<your-anon-key>";```


### Install dependencies

`npm install`

### Run the application

Run the application in the command line and it will be available at http://localhost:3000.

`npm run dev`

### Deploy

Deploy using [Vercel](https://vercel.com)

## License

Licensed under the [MIT license](https://github.com/alanagoyal/docbase/blob/main/LICENSE.md).
````

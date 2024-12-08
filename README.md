# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
npm install
```
Run the database migration:
```bash
npm run migration
```
Run the database seed (throws an error if the tables aren't created or the data allready exists):
```bash
npm run migration:seed
```
## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## API Documentation

The API is documented with OpenAPI. You can view the documentation by running the development server and visiting `http://localhost:3000/_scalar`.

To add additional routes, set the `openAPI` value of `defineRouteMeta` in the respective route file.

## Running Tests

The Test Suite can be run with:

```bash
npm run test
```

For the tests to run, a `.env.test` file must be present. You can copy the `.env.example` file and rename it to `.env.test`. Also, the database must be running.

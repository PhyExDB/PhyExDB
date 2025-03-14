# PhyExDB App

## Setup

Make sure to install dependencies, ideally use `npm ci` to install the exact versions specified in `package-lock.json`:

```bash
npm ci
```

Only use `npm install` if you want to update the dependencies or add new ones.

For the file upload to work, you also need to install `ffmpeg` on your system. In the Docker container, `ffmpeg` is already installed.

### Environment Variables

Create a `.env`, `.env.test` and `.env.development` file in the root directory of the project. Fill them with the values of the `.env.example` file.

In the `.env` file change `localhost` in the `DATABASE_URL` to `db` for the docker container to work correctly.

### Database

Before running the application, you need to create the database. The migrations are run automatically on the server start.

Start the development database with:

```bash
docker compose -f docker-compose.development.yml up -d
```

To revert the development database to the initial state, delete the docker container:

```bash
docker compose -f docker-compose.development.yml down
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application locally for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

### Docker

Alternatively, you can build the application in a Docker container:

```bash
docker build -t phyexdb .
```

To run the docker container with the production docker compose file change the `APP_IMAGE` in the `.env` to `phyexdb` and run:

```bash
docker compose up -d
```

The `-d` flag is optional and runs the container in detached mode, to see the logs remove this flag.

#### Production Database

The production database is not reverted when stopping the container to prevent data loss. To delete the database, run:

```bash
docker compose down -v
```

The `-v` flag deletes the volumes, which contain the database data and the public data files (e.g. uploaded images).

### GitHub Action Builds

The application is built and deployed to GitHub Packages on every push to the `main` branch. The image is tagged with `latest` and can be pulled from GitHub Packages. On every push to a pull request, the image is tagged with `pr-[PR-number]` and can be pulled from GitHub Packages.

To use one of these images, set the `APP_TAG` in the `.env` file to `latest` or `pr-[PR-number]`. Make sure to not set the `APP_IMAGE` in the `.env`, so the default value is used, and the image is pulled from GitHub Packages. You can then run the docker compose commands as described above. Make sure to have the `.env` file in the root directory of the project and run the migrations and seed in the docker container.

## API Documentation

The API is documented with OpenAPI. You can view the documentation by running the development server and visiting `http://localhost:3000/_scalar`.

To add additional routes, set the `openAPI` value of `defineRouteMeta` in the respective route file.

## Running Tests

The entire Test Suite can be run with:

```bash
npm run test
```

For the tests to run, a `.env.test` file must be present. For details see above. Also, the database must be running, since the integration and end-to-end tests require it.

The Test Suite is divided into Unit, and End-to-End tests. You can run each of them separately with:

```bash
npm run test:unit
npm run test:e2e # Requires seeded and migrated database to be running
```

When running Unit Tests, you can also generate a coverage report with:

```bash
npm run test:unit:coverage
```

The coverage report will be generated in the `coverage` directory. You can view the report by opening the `index.html` file in your browser.

## Linting

The project uses ESLint for linting. You can run the linter with:

```bash
npm run lint
```

To automatically fix linting errors, run:

```bash
npm run lint:fix
```

Make sure to fix all linting errors before committing your changes. Otherwise, the CI pipeline will fail.

## Development Setup

For development, we recommend using Visual Studio Code. The project contains a `.vscode` directory with recommended extensions.

To enable format on save, add the following to your `settings.json`:

```json
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
},
```

## Software Stack

- Fullstack framework: nuxt
- Authentication: betterAuth
- Tests: vitest, playwright
- Validation: zod
- Backend:
    - Logger: winston
    - ORM: prisma
    - Files: nuxt-file-storage
    - Mail: vue-email, nodemailer
- Frontend:
    - UI: shadcn-vue, tailwindcss, heroicons
    - Editor: nuxt-tiptap-editor
    - Form-validation: vee-validate

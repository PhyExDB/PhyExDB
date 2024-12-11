# CONTRIBUTING

## Visual Studio Code

- Extensions
  - Nuxt Extension Pack
  - ESLint
    ```
    {
      // ...
      "editor.codeActionsOnSave": {
          "source.fixAll.eslint": "explicit"
      },
      // ...
    }
    ```
    in `.vscode/settings.json` to format on save
  - Teamscale
    ```
    {
      // ...
      "teamscale.teamscaleServers": [
          {
              "serverUrl": "https://teamscale.niklhut.de",
              "username": "<GitHub username>",
              "accessKey": "<accessToken>",
              "trustAllCertificates": false
          }
      ],
      // ...
    }
    ```
    in `.vscode/settings.json`

## Quality assurance

- Teamscale
- ESLint

  ```bash
  npm run lint # check for errors
  npm run lint:fix # fix errors
  ```

- Docker

  Start and delete development db docker containers:
  Setup: copy `.env.example` to `.env`.

  ```bash
  docker compose -f docker-compose.development.yml up -d
  docker compose -f docker-compose.development.yml down
  ```

  Start the database and server image from GitHub:
  Setup:  copy `.env.example` to `.env.development` and replace `localhost` by `db` in the `DATABASE_URL` in `.env`. Also, change `NUXT_DATABASE_DIR_LOCATION` from `server` to `migrations` for the docker container to work correctly.
  The docker imager can be adjusted. By default, the `latest` tag is used, which refers to the latest state of the `main` branch. To test the state of a pull request, set `APP_TAG `in the `.env` to `pr-[PR-number]`. Alternatively a local docker image can be used by setting `APP_IMAGE` in the `.env` to the name of the image.

  ```bash
  docker compose run migrate
  docker compose run seed
  docker compose up -d
  ```

## Git

- Main Branch Protection
  - new feature branch for an issue
  - open pull request
    - draft until ready for review
    - `Fixes #[issue number]` in description
  - pull requests require Actions to pass and a review

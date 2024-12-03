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
  Setup: copy `.env.example` to `.env` and `.env.development` and set `NUXT_DATABASE_HOST=db` in `.env` instead of `localhost`. Also, for the production environment `.env` which is used by the docker container, change `NUXT_DATABASE_DIR_LOCATION` from `server` to `migrations` for the docker container to work correctly.

  Start and delete development docker containers:

  ```bash
  docker compose -f docker-compose.development.yml up -d
  docker compose -f docker-compose.development.yml down
  ```

  Start the database and backend image from GitHub:

  ```bash
  docker compose up -d
  ```

  In the `docker-compose.yml`, the backend image can be adjusted. By default, the `latest` tag is used, which refers to the latest state of the `main` branch. To test the state of a pull request, the tag can be set to `pr-[PR-number]`.

## Git

- Main Branch Protection
  - new feature branch for an issue
  - open pull request
    - draft until ready for review
    - `Fixes #[issue number]` in description
  - pull requests require Actions to pass and a review

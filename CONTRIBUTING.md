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
    in .vscode/settins.json to format on save
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
    in .vscode/settins.json

## Quality assurance

- Teamscale
- ESLint

  ```bash
  npm run lint # check for errors
  npm run lint:fix # fix errors
  ```

- Docker
  Setup: copy `.env.example` to `.env` and `.env.development`

  Starten und Löschen von Datenbank für Entwicklung:

  ```bash
  docker compose -f docker-compose.development.yml up -d
  docker compose -f docker-compose.development.yml down
  ```

  Starten von Datenbank und Backend Image von Github:

  ```bash
  docker compose up -d
  ```

  Dabei kann in der `docker-compose.yml` das Image vom Backend angepasst werden. Standardmäßig wird der `latest` Tag verwendet, welcher den neusten Stand des `main` Branches verwendet. Um den Stand einer Pull Request zu testen, kann der Tag auf `pr-[PR-Nummer]` gesetzt werden.

## Git

- Main Branch Protection
  - new feature branch for an issue
  - open pull request
    - draft until ready for review
    - Fixes #[issue number] in description
  - pull requests require Actions to pass and a review

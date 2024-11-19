# Visual Studio Code
- Extensions
    - Nuxt Extension Pack
    - ESLint
    - Teamscale


# Quality assurance
- Teamscale
- ESLint
    ```
    npm run lint
    npm run lint:fix
    ```
- Docker
    Setup: copy .env.example to .env and .env.development

    Image von github latest, pr?? in docker-compose.development.yml
    ```
    docker compose -f docker-compose.development.yml up -d
    docker compose -f docker-compose.development.yml down
    ```

# Git
- Main Branch Protection
    - new feature branch for an issue
    - open pull request
        - draft until ready for review
        - Fixes #[issue number] in description
    - pull requests require Actions to pass and a review
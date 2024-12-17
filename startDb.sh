docker compose -f docker-compose.development.yml up -d
npm run migrate
npm run migrate:seed
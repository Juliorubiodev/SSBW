dev:
	npm run dev

scraping:
	node --env-file=.env scrap-tp.js

seed:
	node --env-file=.env seed.ts

db-up:
	docker compose up -d

db-down:
	docker compose down

db-studio:
	npx prisma studio

migrate:
	npx prisma migrate dev

generate:
	npx prisma generate

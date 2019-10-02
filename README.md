## Installing Docker containers:

**Docker Machine:** `docker-machine start`

**Postgres:** `docker run --name meetapp-postgres -p 5432:5432 -d -e POSTGRES_PASSWORD=docker postgres`

**Mongo:** `docker run --name meetapp-mongo -p 27017:27017 -d mongo`

**Redis:** `docker run --name meetapp-redis -p 6379:6379 -d redis:alpine`

## Running Docker containers:

**Docker Machine:** `docker-machine start && docker-machine env`

**Postgres:** `docker start meetapp-postgres`

**Mongo:** `docker start meetapp-mongo`

**Redis:** `docker start meetapp-redis`

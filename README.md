# Automerge Repo Postgres Adapter

A straightforward example of an automerge-repo synchronization server that uses custom storage adapter [PostgresStorageAdapter](./src/lib/PostgresStorageAdapter.js) which usese Postgresql database to store automerge documents.

This example was implemented on a fork of the [automerge-repo-sync-server](https://github.com/automerge/automerge-repo-sync-server) 

The server example uses the [Prisma](https://www.prisma.io/docs) as a database client, Idealy you can swap out prisma for another database client of your choice.

## Setup
`touch .env`
Make sure you have a postgres database running and set `DATABASE_URL` variable to the connection string of your running database. 
`DATABASE_URL="postgresql://postgres:password@host:port/databaseName?schema=public"`

`npx prisma init`
`npx prisma generate`

To Run the migrations: `npx primsa migrate dev`

## Running the sync server

`yarn start`

The server is configured with environment variables. There are two options:

- `PORT` - the port to listen for websocket connections on

## Contributors

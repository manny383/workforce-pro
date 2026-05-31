# Railway deployment

This project can keep using MySQL on Railway. The backend already uses `mysql2`
and reads standard `DB_*` environment variables.

## Backend service

Create a Railway service from this GitHub repository and set the root directory
to:

```text
backend
```

Railway will use `backend/railway.json`, install dependencies, and run:

```text
npm start
```

## MySQL service

Add a MySQL database service in the same Railway project. In the backend service,
add these variables:

```env
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=https://your-frontend-domain.example
```

If your MySQL service has a different name than `MySQL`, use that service name
in the variable references.

Railway automatically provides `PORT`, so you do not need to set it manually.
Set `FRONTEND_ORIGIN` to the deployed frontend URL. If the frontend is not
deployed yet, you can leave it unset while testing the API.

## Database schema

Run the SQL in `backend/schema.sql` against the Railway MySQL database before
using the attendance endpoints. This file is based on the project database
script, but is adapted for Railway by removing `DROP DATABASE`, `CREATE
DATABASE`, and `USE`.

The seed admin user is:

```text
correo: admin@workforcepro.com
password: admin1234
```

Change that password after the first deploy.

The backend exposes a healthcheck at:

```text
/health
```

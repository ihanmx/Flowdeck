# Test accounts (local development only)

These accounts exist only in the **local** database (Postgres on `localhost:5433`).
They are fake test users — never reuse these passwords anywhere real.

| Role   | Name         | Email                  | Password       |
| ------ | ------------ | ---------------------- | -------------- |
| OWNER  | Olivia Owner | `owner@flowdeck.test`  | `Flowdeck123!` |
| MEMBER | Max Member   | `member@flowdeck.test` | `Flowdeck123!` |

Both are in the organization **Flowdeck Test Org**. Max joined through a real invitation.

## Typical use

- **Real-time test:** log in as Olivia in a normal window and as Max in a private window, open the same board in both, and move cards.
- **Role checks:** Max (MEMBER) should not see the invite form on Members, and gets `403` when creating projects, boards or columns.

## If the database is reset

The accounts are lost when the database is wiped. Recreate them with the API running:

1. `POST /auth/register` for each account (email, password, name above).
2. As Olivia: `POST /organizations` with `{ "name": "Flowdeck Test Org" }`.
3. As Olivia: `POST /organizations/:id/invitations` with `{ "email": "member@flowdeck.test", "role": "MEMBER" }`.
4. As Max: `POST /invitations/accept` with `{ "token": "<token from step 3>" }`.

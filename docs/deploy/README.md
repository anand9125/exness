# EC2 deploy env files

Use these on your EC2 instance for the GitHub Actions deploy.

## Setup on EC2

```bash
mkdir -p ~/exness-deploy
cd ~/exness-deploy
```

Create each file and paste the contents below (without the `.example` suffix in the filename).

## File contents

### ~/exness-deploy/.env.server

```
REDIS_URL=redis://exness-redis:6379
```

Optional: `PORT=4000` (default is 4000).

---

### ~/exness-deploy/.env.ws

```
REDIS_URL=redis://exness-redis:6379
```

Optional: `WS_PORT=8080` (default is 8080).

---

### ~/exness-deploy/.env.pooler

```
REDIS_URL=redis://exness-redis:6379
```

---

## Permissions (optional)

```bash
chmod 600 ~/exness-deploy/.env.server ~/exness-deploy/.env.ws ~/exness-deploy/.env.pooler
```

Then re-run the deploy workflow from GitHub Actions.

# Campus Notifications Microservice

## Structure

```text
. /
├── logging_middleware/               # Shared custom logger module
├── notification_system_design.md     # Architectural defense documentation
├── notification_app_be/              # Priority engine logic (Stage 1)
├── notification_app_fe/              # React dashboard UI (Stage 2)
└── .gitignore
```

## How to Run

**Note:** Do not run `npm install` in the root directory. Each stage is an independent module.

### Stage 1 (Logic Engine)
```bash
cd stage-1
npm install
npm run start
```
*Note: Make sure to replace the `AUTH_TOKEN` in `stage-1/index.js` with a valid token if you want to see live API responses. Otherwise, it will safely throw a 401 error.*

### Stage 2 (React App)
```bash
cd stage-2
npm install
npm run dev
```
Runs on `http://localhost:3000`.

### Logging
The `logging_middleware` is pre-configured and injected into both stages. It silently points to `http://20.207.122.201/evaluation-service/logs`.

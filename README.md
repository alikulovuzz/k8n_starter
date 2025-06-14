# Node.js HPA Test Application with Modular Architecture

## Loyiha strukturasi
```
├── src/
│   ├── controllers/
│   │   ├── loadController.js
│   │   └── healthController.js
│   ├── routes/
│   │   ├── loadRoutes.js
│   │   ├── healthRoutes.js
│   │   └── index.js
│   ├── services/
│   │   ├── loadService.js
│   │   └── authService.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── swagger.yml
│   └── app.js
├── test/
│   ├── integration/
│   │   └── routes.test.js
│   └── unit/
│       ├── controllers.test.js
│       └── services.test.js
├── package.json
└── README.md

## O'rnatish

```bash
npm install
```

## Ishga tushirish

```bash
npm start
```

## Testlarni ishga tushirish

```bash
npm test
```

## API Documentation

Swagger dokumentatsiyasini ko'rish uchun:
http://localhost:3000/api-docs

## Environment Variables

`.env` faylini yarating:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

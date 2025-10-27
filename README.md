# CRUD Serverless con AWS Lambda y DynamoDB

## Descripción
Este proyecto implementa un API REST para la gestión de **items** y **users** usando **AWS Lambda**, **DynamoDB** y **Serverless Framework**. Se desarrolló para realizar operaciones CRUD (Crear, Leer, Actualizar y Eliminar) de manera eficiente, utilizando **Node.js 20.x** como runtime.

El propósito de este laboratorio fue aprender a:
- Implementar funciones Lambda con rutas dinámicas.
- Conectar AWS Lambda con DynamoDB usando el SDK de AWS.
- Configurar un API Gateway (HTTP API) con Serverless Framework.
- Realizar operaciones CRUD tanto para **items** como para **users**.

## Funcionalidades

### Items
- **Crear un item:** POST `/items`  
- **Obtener todos los items:** GET `/items`  
- **Obtener un item por ID:** GET `/items/{itemId}`  
- **Actualizar un item:** PUT `/items/{itemId}`  
- **Actualizar parcialmente un item:** PATCH `/items/{itemId}`  
- **Eliminar un item:** DELETE `/items/{itemId}`  

### Users
- **Crear un usuario:** POST `/users`  
- **Obtener todos los usuarios:** GET `/users`  
- **Obtener un usuario por ID:** GET `/users/{userId}`  
- **Actualizar un usuario:** PUT `/users/{userId}`  
- **Actualizar parcialmente un usuario:** PATCH `/users/{userId}`  
- **Eliminar un usuario:** DELETE `/users/{userId}`
- 
## Despliegue
Para desplegar el proyecto en AWS:
```bash
npm install -g serverless
sls deploy


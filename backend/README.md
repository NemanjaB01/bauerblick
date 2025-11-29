# README.md

## Project Overview
This documentation outlines the structure and setup process for a Spring Boot microservice architecture project. The project includes the following services:

- **User Service**: Responsible for managing user-related operations such as authentication, user profiles, and user data management.
- **Farm Service**: Handles farm-related functionalities like managing crop data, farm statistics, and other agricultural operations.
- **Service Registry (Eureka Server)**: Used for service discovery, allowing services to locate each other and communicate with one another dynamically.
- **API Gateway**: Acts as a single entry point for clients, routing requests to the appropriate microservices and providing a layer for cross-cutting concerns like authentication and logging.
- **Notification Service**: (...)
- **Rule Engine**: (...)
- **Sensor Ingestion Service**: (...)

## Starting the Microservices
To start all the services in the microservice architecture, follow the steps below:

### 1. Start Database Containers
Execute the script `start_db_containers.sh` to create Docker containers for the user and farm services. The script sets up MongoDB instances as follows:

- **User Service Database (agriscopedb)**: Runs on **port 27017**
- **Farm Service Database (farmdb)**: Runs on **port 27018**

This step ensures that both the user and farm services have their dedicated databases for data persistence.

### 2. Start the Service Registry

Once the database containers are running, start the **Service Registry** (Eureka Server). The service registry is critical for service discovery, enabling the user and farm services to register themselves and discover other services.

You can initiate the service registry using the `service-registry` configuration created in IntelliJ. 
Alternatively, you may execute the following command from the "service-registry" root folder to run the application:

```code
mvn spring-boot:run
```

### 3. Start User and Farm Services

Next, start the **User Service** and **Farm Service**.

- **User Service**: Handles user-related functionalities such as registration, login, and profile management.

You can initiate the user service using the configuration created in IntelliJ. Alternatively, execute the following command from the "user-service" root folder to run the application:

```code
mvn spring-boot:run
```

### 4. Start User and Farm Services

- **Farm Service**: Manages farm-related operations and data. 

You can initiate the farm service using the configuration created in IntelliJ. Alternatively, execute the following command from the "farm-service" root folder to run the application:

```code
mvn spring-boot:run
```
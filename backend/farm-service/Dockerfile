# Use Java 21
FROM eclipse-temurin:21

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml for caching
COPY pom.xml .
COPY mvnw .
COPY .mvn ./.mvn
RUN ./mvnw dependency:go-offline

# Copy source code and build JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Expose farm service port
EXPOSE 8082

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "/app/target/farm-service-0.0.1-SNAPSHOT.jar"]

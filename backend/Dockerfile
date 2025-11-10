FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Expose port
EXPOSE 8080

# Run the application
CMD ["./mvnw", "spring-boot:run"]

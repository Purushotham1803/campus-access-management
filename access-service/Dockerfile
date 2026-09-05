# Build context is the repository root (needed for the parent pom.xml).
# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml .
COPY api-gateway/pom.xml api-gateway/pom.xml
COPY auth-service/pom.xml auth-service/pom.xml
COPY user-service/pom.xml user-service/pom.xml
COPY access-service/pom.xml access-service/pom.xml
COPY approval-service/pom.xml approval-service/pom.xml
RUN mvn -q -pl access-service dependency:go-offline -B

COPY access-service/src access-service/src
RUN mvn -q -pl access-service package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
COPY --from=build /workspace/access-service/target/access-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]

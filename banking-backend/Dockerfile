# --- Build stage ---
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline

COPY src ./src
RUN ./mvnw -q clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN useradd --create-home --shell /bin/false scf
COPY --from=build /app/target/*.jar app.jar
RUN chown scf:scf app.jar
USER scf

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

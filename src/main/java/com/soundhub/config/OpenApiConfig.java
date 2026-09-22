package com.soundhub.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger em http://localhost:8080/swagger-ui.html
 * Clique em "Authorize" e cole o token (sem o "Bearer ").
 * Nos controllers protegidos use @SecurityRequirement(name = "bearerAuth").
 */
@Configuration
@OpenAPIDefinition(info = @Info(
        title = "SoundHub API",
        version = "1.0",
        description = "Plataforma de streaming de musica - artistas publicam, ouvintes escutam e avaliam"))
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT")
public class OpenApiConfig {
}

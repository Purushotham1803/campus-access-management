import os

def create_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'api-gateway/src/main/java/com/campusaccess/apigateway'

jwt_util = """package com.campusaccess.apigateway.util;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }

    public void validateToken(String token) {
        Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
    }
}
"""
create_file(f'{base}/util/JwtUtil.java', jwt_util)

auth_filter = """package com.campusaccess.apigateway.filter;
import com.campusaccess.apigateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {
    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (!exchange.getRequest().getURI().getPath().contains("/auth/login")) {
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }
                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }
                try {
                    jwtUtil.validateToken(authHeader);
                    Claims claims = jwtUtil.getClaims(authHeader);
                    exchange.getRequest().mutate()
                        .header("loggedInUser", claims.getSubject())
                        .header("role", claims.get("role", String.class))
                        .header("userId", String.valueOf(claims.get("userId", Integer.class)))
                        .build();
                } catch (Exception e) {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }
            }
            return chain.filter(exchange);
        };
    }

    public static class Config {}
}
"""
create_file(f'{base}/filter/AuthenticationFilter.java', auth_filter)

sec_config = """package com.campusaccess.apigateway.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http.csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchanges -> exchanges.anyExchange().permitAll());
        return http.build();
    }
}
"""
create_file(f'{base}/config/SecurityConfig.java', sec_config)

# Update application.yml to apply the filter
with open('api-gateway/src/main/resources/application.yml', 'r') as f:
    app_yml = f.read()

app_yml = app_yml.replace('Path=/users/**', 'Path=/users/**\n          filters:\n            - AuthenticationFilter')
app_yml = app_yml.replace('Path=/access/**', 'Path=/access/**\n          filters:\n            - AuthenticationFilter')
app_yml = app_yml.replace('Path=/approvals/**', 'Path=/approvals/**\n          filters:\n            - AuthenticationFilter')

with open('api-gateway/src/main/resources/application.yml', 'w') as f:
    f.write(app_yml)

print("API Gateway code generated.")

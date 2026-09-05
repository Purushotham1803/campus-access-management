import os

def create_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'auth-service/src/main/java/com/campusaccess/authservice'

# Entities
user_entity = """package com.campusaccess.authservice.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String role;
}
"""
create_file(f'{base}/entity/User.java', user_entity)

# Repo
user_repo = """package com.campusaccess.authservice.repository;
import com.campusaccess.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
"""
create_file(f'{base}/repository/UserRepository.java', user_repo)

# Security Config
sec_config = """package com.campusaccess.authservice.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
"""
create_file(f'{base}/config/SecurityConfig.java', sec_config)

# JWT Util
jwt_util = """package com.campusaccess.authservice.util;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private long expiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username, String role, Long userId) {
        return Jwts.builder()
                .setClaims(Map.of("role", role, "userId", userId))
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}
"""
create_file(f'{base}/util/JwtUtil.java', jwt_util)

# DTO
dto = """package com.campusaccess.authservice.dto;
import lombok.Data;
@Data
public class AuthRequest {
    private String username;
    private String password;
}
"""
create_file(f'{base}/dto/AuthRequest.java', dto)

dto_res = """package com.campusaccess.authservice.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
}
"""
create_file(f'{base}/dto/AuthResponse.java', dto_res)

# Controller
ctrl = """package com.campusaccess.authservice.controller;
import com.campusaccess.authservice.dto.AuthRequest;
import com.campusaccess.authservice.dto.AuthResponse;
import com.campusaccess.authservice.entity.User;
import com.campusaccess.authservice.repository.UserRepository;
import com.campusaccess.authservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername()).orElse(null);
        if (user != null && passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getId());
            return ResponseEntity.ok(new AuthResponse(token));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
"""
create_file(f'{base}/controller/AuthController.java', ctrl)

print("Auth Service code generated.")

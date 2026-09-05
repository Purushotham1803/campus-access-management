import os

def create_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base = 'user-service/src/main/java/com/campusaccess/userservice'

# Entities
user_entity = """package com.campusaccess.userservice.entity;
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
    private String role; // STUDENT, FACULTY, ADMIN, SECURITY
    @Column(name = "campus_status")
    private String campusStatus = "IN"; // IN, OUT
}
"""
create_file(f'{base}/entity/User.java', user_entity)

student_entity = """package com.campusaccess.userservice.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "students")
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    private String department;
    private Integer year;
}
"""
create_file(f'{base}/entity/Student.java', student_entity)

faculty_entity = """package com.campusaccess.userservice.entity;
import jakarta.persistence.*;
import lombok.Data;
@Data
@Entity
@Table(name = "faculty")
public class Faculty {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    private String department;
}
"""
create_file(f'{base}/entity/Faculty.java', faculty_entity)

# Repositories
user_repo = """package com.campusaccess.userservice.repository;
import com.campusaccess.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
}
"""
create_file(f'{base}/repository/UserRepository.java', user_repo)

student_repo = """package com.campusaccess.userservice.repository;
import com.campusaccess.userservice.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByUserId(Long userId);
}
"""
create_file(f'{base}/repository/StudentRepository.java', student_repo)

faculty_repo = """package com.campusaccess.userservice.repository;
import com.campusaccess.userservice.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Faculty findByUserId(Long userId);
}
"""
create_file(f'{base}/repository/FacultyRepository.java', faculty_repo)

# Security Config
sec_config = """package com.campusaccess.userservice.config;
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
        http.csrf(AbstractHttpConfigurer::disable).authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
"""
create_file(f'{base}/config/SecurityConfig.java', sec_config)

# Data Initializer
data_init = """package com.campusaccess.userservice.config;
import com.campusaccess.userservice.entity.*;
import com.campusaccess.userservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private FacultyRepository facultyRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            
            User security = new User();
            security.setUsername("security");
            security.setPassword(passwordEncoder.encode("security"));
            security.setRole("SECURITY");
            userRepository.save(security);
            
            User student = new User();
            student.setUsername("student");
            student.setPassword(passwordEncoder.encode("student"));
            student.setRole("STUDENT");
            student = userRepository.save(student);
            Student s = new Student();
            s.setUserId(student.getId());
            s.setDepartment("Computer Science");
            s.setYear(3);
            studentRepository.save(s);
            
            User faculty = new User();
            faculty.setUsername("faculty");
            faculty.setPassword(passwordEncoder.encode("faculty"));
            faculty.setRole("FACULTY");
            faculty = userRepository.save(faculty);
            Faculty f = new Faculty();
            f.setUserId(faculty.getId());
            f.setDepartment("Computer Science");
            facultyRepository.save(f);
        }
    }
}
"""
create_file(f'{base}/config/DataInitializer.java', data_init)

# Controller
ctrl = """package com.campusaccess.userservice.controller;
import com.campusaccess.userservice.entity.User;
import com.campusaccess.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired private UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
"""
create_file(f'{base}/controller/UserController.java', ctrl)

print("User Service code generated.")

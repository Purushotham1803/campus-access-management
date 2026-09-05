package com.campusaccess.userservice.controller;
import com.campusaccess.userservice.dto.CreateUserRequest;
import com.campusaccess.userservice.dto.UserSummaryDto;
import com.campusaccess.userservice.entity.Faculty;
import com.campusaccess.userservice.entity.Student;
import com.campusaccess.userservice.entity.User;
import com.campusaccess.userservice.repository.FacultyRepository;
import com.campusaccess.userservice.repository.StudentRepository;
import com.campusaccess.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {
    private static final Set<String> VALID_ROLES = Set.of("STUDENT", "FACULTY", "ADMIN", "SECURITY");

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private FacultyRepository facultyRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toSummary).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserSummaryDto> getUserProfile(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(toSummary(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> registerUser(@RequestHeader(value = "role", required = false) String callerRole,
                                           @RequestBody CreateUserRequest req) {
        if (!"ADMIN".equals(callerRole)) {
            return ResponseEntity.status(403).body("Only admins can register new users.");
        }
        if (req.getUsername() == null || req.getUsername().isBlank()
                || req.getPassword() == null || req.getPassword().isBlank()
                || req.getRole() == null || req.getRole().isBlank()) {
            return ResponseEntity.badRequest().body("username, password and role are required.");
        }
        String role = req.getRole().toUpperCase();
        if (!VALID_ROLES.contains(role)) {
            return ResponseEntity.badRequest().body("role must be one of STUDENT, FACULTY, ADMIN, SECURITY.");
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists.");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        user.setCampusStatus("IN");
        user = userRepository.save(user);

        if ("STUDENT".equals(role)) {
            Student s = new Student();
            s.setUserId(user.getId());
            s.setDepartment(req.getDepartment());
            s.setYear(req.getYear());
            studentRepository.save(s);
        } else if ("FACULTY".equals(role)) {
            Faculty f = new Faculty();
            f.setUserId(user.getId());
            f.setDepartment(req.getDepartment());
            facultyRepository.save(f);
        }

        return ResponseEntity.ok(toSummary(user));
    }

    private UserSummaryDto toSummary(User u) {
        String department = null;
        Integer year = null;
        if ("STUDENT".equals(u.getRole())) {
            Student s = studentRepository.findByUserId(u.getId());
            if (s != null) {
                department = s.getDepartment();
                year = s.getYear();
            }
        } else if ("FACULTY".equals(u.getRole())) {
            Faculty f = facultyRepository.findByUserId(u.getId());
            if (f != null) {
                department = f.getDepartment();
            }
        }
        return new UserSummaryDto(u.getId(), u.getUsername(), u.getRole(), u.getCampusStatus(), department, year);
    }
}

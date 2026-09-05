package com.campusaccess.userservice.config;
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

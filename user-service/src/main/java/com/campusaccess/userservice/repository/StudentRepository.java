package com.campusaccess.userservice.repository;
import com.campusaccess.userservice.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByUserId(Long userId);
}

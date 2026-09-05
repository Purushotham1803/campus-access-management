package com.campusaccess.userservice.repository;
import com.campusaccess.userservice.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Faculty findByUserId(Long userId);
}

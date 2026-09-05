package com.campusaccess.userservice.repository;
import com.campusaccess.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
}

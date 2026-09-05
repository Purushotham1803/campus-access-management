package com.campusaccess.accessservice.repository;
import com.campusaccess.accessservice.entity.GateEntryExit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface GateEntryExitRepository extends JpaRepository<GateEntryExit, Long> {
    List<GateEntryExit> findAllByOrderByScanTimeDesc();
}

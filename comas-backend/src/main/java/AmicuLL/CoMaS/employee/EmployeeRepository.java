package AmicuLL.CoMaS.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findEmployeeByEmail(String email);
    Optional<Employee> findEmployeeById(Long id);
    Optional<Employee> findEmployeeByEUUID(String uuid);
}


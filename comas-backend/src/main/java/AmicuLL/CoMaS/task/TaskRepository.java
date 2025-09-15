package AmicuLL.CoMaS.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByIdIn(Set<Long> ids);
    Optional<Task> getTaskById(Long id);
}
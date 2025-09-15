package AmicuLL.CoMaS.projects;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    List<Project> findByProjectMembersContains(String memberId); //it doesn't matter if it is a team or member
    List<Project> findAllByClient(String client);
    Optional<Project> findById(Long projectId);
}

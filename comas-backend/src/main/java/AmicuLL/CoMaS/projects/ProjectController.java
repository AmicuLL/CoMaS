package AmicuLL.CoMaS.projects;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping(path = "api/v1/project")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping()
    ResponseEntity<?> addProject(@RequestBody Map<String, Object> body) {
        return projectService.addNewProject(body);
    }

    @GetMapping()
    ResponseEntity<?> getProjects(@RequestParam(name = "project_id", required = false) Long id) {
        return projectService.getProjects(id);
    }

    @DeleteMapping
    ResponseEntity<?> deleteProject(@RequestParam(name="project_id") Long id) {
        if(id == null || id < 1) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return projectService.deleteProject(id);
    }

    @PatchMapping
    ResponseEntity<?> editProject(@RequestParam(name="project_id") Long id, @RequestBody Map<String, Object> body) {
        if(id == null || id < 1) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return projectService.editProject(id, body);
    }
}

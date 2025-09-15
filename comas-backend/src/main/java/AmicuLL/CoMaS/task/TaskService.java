package AmicuLL.CoMaS.task;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> extractTasks(Map<String, Object> body) {
        List<Task> tasks = new ArrayList<>();
        Object tasksObj = body.get("tasks");

        if (tasksObj != null) {
            try {
                JsonNode tasksArray;

                if (tasksObj instanceof String) {
                    String tasksJson = (String) tasksObj;
                    tasksArray = objectMapper.readTree(tasksJson);
                } else if (tasksObj instanceof List) {
                    tasksArray = objectMapper.valueToTree(tasksObj);
                } else {
                    tasksArray = objectMapper.valueToTree(tasksObj);
                }

                for (JsonNode taskNode : tasksArray) {
                    String name = taskNode.get("task_name").asText("N/A");
                    String details = taskNode.get("task_detail").asText("N/A");
                    Set<Long> employeeId = new HashSet<>();
                    Float completionPercentage = 0F;
                    Task task;

                    if (taskNode.has("task_employees")) {
                        employeeId = Arrays.stream(taskNode.get("task_employees").asText().split(","))
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .map(Long::parseLong)
                                .collect(Collectors.toSet());
                    }

                    if (taskNode.has("task_completion")) {
                        try {
                            completionPercentage = Float.parseFloat(taskNode.get("task_completion").asText("0"));
                        } catch (NumberFormatException e) {
                            completionPercentage = 0F;
                        }
                    }
                    if (taskNode.has("task_id")) {
                        task = taskRepository.getTaskById(Long.parseLong(taskNode.get("task_id").asText("0"))).get();
                    } else task = new Task(name, details, employeeId, completionPercentage);
                    //task = taskRepository.save(task);
                    tasks.add(task);
                }

            } catch (IOException e) {
                e.printStackTrace();
                return new ArrayList<>();
            }
        }

        return tasks;
    }
}
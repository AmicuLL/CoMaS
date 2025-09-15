package AmicuLL.CoMaS.projects;

import AmicuLL.CoMaS.client.Client;
import AmicuLL.CoMaS.client.ClientRepository;
import AmicuLL.CoMaS.employee.Employee;
import AmicuLL.CoMaS.employee.EmployeeRepository;
import AmicuLL.CoMaS.notification.Notification;
import AmicuLL.CoMaS.notification.NotificationRepository;
import AmicuLL.CoMaS.notification.NotificationType;
import AmicuLL.CoMaS.task.Task;
import AmicuLL.CoMaS.task.TaskRepository;
import AmicuLL.CoMaS.task.TaskService;
import AmicuLL.CoMaS.user.Permission;
import AmicuLL.CoMaS.user.User;
import AmicuLL.CoMaS.user.UserRepository;
import AmicuLL.CoMaS.user.UserType;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;
    private final NotificationRepository notificationRepository;

    public ProjectService(ProjectRepository projectRepository, TaskRepository taskRepository, EmployeeRepository employeeRepository, ClientRepository clientRepository, UserRepository userRepository, TaskService taskService, NotificationRepository notificationRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.taskService = taskService;
        this.notificationRepository = notificationRepository;
    }

    public class EmployeeDTO {
        private Long id;
        private String email;
        private String phone;
        private String firstName;
        private String lastName;

        public EmployeeDTO(Employee employee) {
            this.id = employee.getId();
            this.email = employee.getEmail();
            this.phone = employee.getPhone();
            this.firstName = employee.getFirstName();
            this.lastName = employee.getLastName();
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }
    private Map<String, Object> buildProjectResponse(Project project, List<Task> tasks, List<Employee> allEmployees) {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("id", project.getId());
        response.put("name", project.getName());
        response.put("client", project.getClient());
        response.put("startDate", project.getStartDate().toString());
        response.put("endDate", project.getEndDate().toString());
        response.put("budget", project.getBudget());
        //response.put("completionPercentage", project.getCompletionPercentage()); //it will get calculated with task progress
        response.put("status", project.getStatus().toString());

        response.put("projectManager", project.getProjectManager().toString());
        response.put("projectMembers", project.getAllProjectMemberIds());

        List<Map<String, Object>> taskList = new ArrayList<>();
        float sum = 0.0f;
        for (Task task : tasks) {
            Map<String, Object> taskMap = new HashMap<>();
            taskMap.put("id", task.getId());
            taskMap.put("name", task.getName());
            taskMap.put("details", task.getDetails());
            taskMap.put("employeeId", task.getEmployeeId());
            taskMap.put("completionPercentage", task.getCompletionPercentage());
            taskList.add(taskMap);
            sum += task.getCompletionPercentage();
        }
        response.put("completionPercentage", String.format("%.2f",project.getCompletionPercentage() + ((sum / tasks.size()) * (100.0f - project.getCompletionPercentage()) / 100.0f))); //avg completion + rounding
                                            //example 30% + (10%+12%/2 * 70%/100%)
        response.put("tasks", taskList);

        List<EmployeeDTO> employeeDTOs = allEmployees.stream()
                .distinct()
                .map(EmployeeDTO::new)
                .toList();

        response.put("employees", employeeDTOs);

        return response;
    }
    @Transactional
    public ResponseEntity<String> addNewProject(Map<String, Object> body) {
        User authUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Employee employee = employeeRepository.findEmployeeById(authUser.getId()).orElseThrow();
        Optional<Client> optionalClient = null; //for sending a notification. Client can be empty or just random name
        String name = "New Project";
        String client = "N/A";
        LocalDate startDate = null;
        LocalDate endDate = null;
        Long projectManager = 0L; //default, no one. Means the entire company is responsible
        Set<String> projectMembers = Set.of("0_0"); // default no team
        Double budget = 0D;
        Float completionPercentage = 0F;
        Status status = Status.INITIATED;

        if (body.get("name") != null) {
            name = body.get("name").toString();
        }
        if (body.get("client") != null) {
            client = body.get("client").toString();
            optionalClient = clientRepository.findClientByCompanyName(client);
        }
        if (body.get("start_date") != null && !body.get("start_date").toString().isBlank()) {
            try {
                startDate = LocalDate.parse(body.get("start_date").toString());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Invalid start date format!\"}");
            }
        }
        if (body.get("end_date") != null && !body.get("end_date").toString().isBlank()) {
            try {
                endDate = LocalDate.parse(body.get("end_date").toString());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Invalid end date format!\"}");
            }
        }
        if (body.get("project_manager") != null && !body.get("project_manager").toString().isBlank()) {
            try {
                projectManager = Long.parseLong(body.get("project_manager").toString());
                String content = "Project assigned as manager:" + employee.getFirstName() + " " + employee.getLastName();
                notificationRepository.save(new Notification(userRepository.findUserByUserRefIdAndUserType(projectManager, UserType.EMPLOYEE).orElseThrow().getId(), authUser.getId(), NotificationType.ACTION_RECEIVED, content, LocalDateTime.now().withNano(0), null));
            } catch (Exception e) {
                projectManager = 0L;
            }
        }
        if (body.get("project_members") != null && !body.get("project_members").toString().isBlank()) {
            try {
                String content = "Project assigned:" + employee.getFirstName() + " " + employee.getLastName();
                projectMembers = Arrays.stream(body.get("project_members").toString().split(","))
                        .map(String::trim)
                        .map(ref -> ref.replace("[", "").replace("]", ""))  // removing [ ]
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toSet());
                for (String member : projectMembers) {
                    String[] parts = member.split("_");
                    if (parts.length == 2) {
                        Long userId = Long.parseLong(parts[1]);
                        notificationRepository.save(
                                new Notification(userRepository.findUserByUserRefIdAndUserType(userId, UserType.EMPLOYEE).orElseThrow().getId(), authUser.getId(), NotificationType.ACTION_RECEIVED, content, LocalDateTime.now().withNano(0), null)
                        );
                    }
                }
            } catch (Exception e) {
                projectMembers = Set.of("0_0");
            }
        }
        if (body.get("budget") != null && !body.get("budget").toString().isBlank()) {
            try {
                budget = Double.parseDouble(body.get("budget").toString());
            } catch (Exception e) {
                budget = 0.0D;
            }
        }
        if (body.get("status") != null && !body.get("status").toString().isBlank()) {
            try {
                status = Status.valueOf(body.get("status").toString());
            } catch (Exception e) {
                status = Status.NOT_SET;
            }
        }
        if (body.get("completion_percentage") != null && !body.get("completion_percentage").toString().isBlank()) {
            try {
                completionPercentage = Float.parseFloat(body.get("completion_percentage").toString());
            } catch (Exception e) {
                completionPercentage = 0.0F;
            }
        }

        Set<Long> taskIds = new HashSet<>();
        if (body.get("tasks") != null) {
            try {
                List<Task> savedTasks = taskService.extractTasks(body);
                taskRepository.saveAll(savedTasks);
                taskIds = savedTasks.stream()
                        .map(Task::getId)
                        .collect(Collectors.toSet());
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Error extracting tasks: " + e.getMessage() + "\"}");
            }
        }

        Project newProject = new Project(name, client, startDate, endDate, taskIds, projectManager, projectMembers, budget, completionPercentage, status);
        projectRepository.save(newProject);

        if(optionalClient.isPresent()) {
            User clientUser = userRepository.findUserByUserRefIdAndUserType(optionalClient.get().getId(), UserType.CLIENT).orElseThrow();
            Notification newNotification = new Notification(clientUser.getId(), authUser.getId(), NotificationType.ACTION_RECEIVED, "Project added:" + employee.getFirstName() + " " + employee.getLastName(), LocalDateTime.now().withNano(0), null);
            notificationRepository.save(newNotification);
        }
        return ResponseEntity.status(HttpStatus.OK).build();
    }
    //TODO Check for authUser perm
    @Transactional
    public ResponseEntity<?> getProjects(Long id) {
        User authUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Boolean isClient = authUser.getUserType() == UserType.CLIENT; //if this is false, means is employee
        //Boolean isEmployee = authUser.getUserType() == UserType.EMPLOYEE; //this is redundant, but extra verification
        Long authRefId = authUser.getUserRefId();
        if (id != null && id > 0) {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            if(!authUser.getPermissions().contains(Permission.PROJECTS_VIEW)) {
                if (isClient) {
                    if (project.getClient() != clientRepository.findClientById(authRefId).get().getCompanyName()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                } else if(!project.getProjectMembers().stream()
                        .map(s -> s.split("_")[1])
                        .map(Long::parseLong)
                        .anyMatch(memberId -> memberId.equals(authRefId))){
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }
            List<Task> tasks = taskRepository.findAllById(project.getProjectTasks());

            Set<Long> allEmployeeIds = new HashSet<>();

            allEmployeeIds.addAll(project.getProjectMembers().stream()
                    .map(ref -> ref.substring(ref.indexOf("_") + 1))
                    .map(Long::parseLong)
                    .collect(Collectors.toSet()));

            for (Task task : tasks) {
                allEmployeeIds.addAll(task.getEmployeeId());
            }

            List<Employee> employees = employeeRepository.findAllById(allEmployeeIds);
            Map<String, Object> response = buildProjectResponse(project, tasks, employees);
            return ResponseEntity.ok(response);
        } else {
            List<Project> projects = projectRepository.findAll();
            List<Map<String, Object>> responses = new ArrayList<>();
            Set<Long> allEmployeeIds = new HashSet<>();

            for (Project project : projects) { //build response for all projects
                if(!authUser.getPermissions().contains(Permission.PROJECTS_VIEW)) { //if user has the permission to view all projects, it doesn't matter
                    if (isClient) {
                        if (!project.getClient().equals(clientRepository.findClientById(authRefId).get().getCompanyName())) {
                            continue;
                        }
                    } else if(!project.getProjectMembers().stream()
                            .map(s -> s.split("_")[1])
                            .map(Long::parseLong)
                            .anyMatch(memberId -> memberId.equals(authRefId))){
                        continue;
                    }
                }
                Set<Long> taskIds = project.getProjectTasks();
                List<Task> tasksProjects = taskIds.isEmpty()
                        ? Collections.emptyList()
                        : taskRepository.findByIdIn(taskIds); ///found all tasks
                allEmployeeIds.addAll(project.getProjectMembers().stream() //Getting employee id-s from the project
                        .map(ref -> ref.substring(ref.indexOf("_") + 1)) //as I saved TeamId_EmployeeId, I need to take the second part
                        .map(Long::parseLong) //parsing to long
                        .collect(Collectors.toSet())); //returning a set

                for (Task task : tasksProjects) { //same for tasks
                    allEmployeeIds.addAll(task.getEmployeeId());
                }

                List<Employee> employees = employeeRepository.findAllById(allEmployeeIds);
                Map<String, Object> projectResponse = buildProjectResponse(project, tasksProjects, employees);
                responses.add(projectResponse);
            }

            if (responses.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
            return ResponseEntity.ok(responses);
        }
    }

    public ResponseEntity<?> deleteProject (Long id) { //if project removed, so do tasks
        Optional<Project> project = projectRepository.findById(id);
        if(project.isPresent()) {
            Project Project = project.get();
            Hibernate.initialize(Project.getProjectMembers());
            List<Task> tasks = taskRepository.findByIdIn(Project.getProjectTasks());
            taskRepository.deleteAll(tasks);
            projectRepository.delete(Project);
            if(Project.getClient() != null || !Project.getProjectMembers().isEmpty()) {
                User authUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                Employee employee = employeeRepository.findEmployeeById(authUser.getUserRefId()).orElseThrow();
                String content = "Project deleted:" + employee.getFirstName() + " " + employee.getLastName();
                Optional<Client> clientOptional = clientRepository.findClientByCompanyName(Project.getClient());
                if(clientOptional.isPresent()) {
                    Optional<User> client = userRepository.findUserByUserRefIdAndUserType(clientOptional.get().getId(), UserType.CLIENT);
                    if(client.isPresent()) {
                        notificationRepository.save(new Notification(client.get().getId(), authUser.getId(), NotificationType.ACTION_RECEIVED, content, LocalDateTime.now().withNano(0), null));
                    }
                }
                for (String member : Project.getProjectMembers()) {
                    String[] parts = member.split("_");
                    if (parts.length == 2) {
                        Long userId = Long.parseLong(parts[1]);
                        notificationRepository.save(
                                new Notification(userRepository.findUserByUserRefIdAndUserType(userId, UserType.EMPLOYEE).orElseThrow().getId(), authUser.getId(), NotificationType.ACTION_RECEIVED, content, LocalDateTime.now().withNano(0), null)
                        );
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.OK).build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    public ResponseEntity<?> editProject(Long id, Map<String, Object> body) {
        if(body.isEmpty()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        Optional<Project> optionalProject = projectRepository.findById(id);
        if(optionalProject.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        Project project = optionalProject.get();
        String name = project.getName();
        String client = project.getClient();
        LocalDate startDate = project.getStartDate();
        LocalDate endDate = project.getEndDate();
        Long projectManager = project.getProjectManager();
        Set<String> projectMembers = project.getProjectMembers();
        Double budget = project.getBudget();
        Float completionPercentage = project.getCompletionPercentage();
        Status status = project.getStatus();
        Set<Long> taskIds = project.getProjectTasks();

        if (body.get("name") != null) {
            name = body.get("name").toString();
        }
        if (body.get("client") != null) {
            client = body.get("client").toString();
        }
        if (body.get("start_date") != null && !body.get("start_date").toString().isBlank()) {
            try {
                startDate = LocalDate.parse(body.get("start_date").toString());
            } catch (Exception e) {
                startDate = project.getStartDate();
            }
        }
        if (body.get("end_date") != null && !body.get("end_date").toString().isBlank()) {
            try {
                endDate = LocalDate.parse(body.get("end_date").toString());
            } catch (Exception e) {
                endDate = project.getEndDate();
            }
        }
        if (body.get("project_manager") != null && !body.get("project_manager").toString().isBlank()) {
            try {
                projectManager = Long.parseLong(body.get("project_manager").toString());
            } catch (Exception e) {
                projectManager = project.getProjectManager();
            }
        }
        if (body.get("project_members") != null && !body.get("project_members").toString().isBlank()) {
            try {
                projectMembers = Arrays.stream(body.get("project_members").toString().split(","))
                        .map(String::trim)
                        .map(ref -> ref.replace("[", "").replace("]", ""))  // removing [ ]
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toSet());
            } catch (Exception e) {
                projectMembers = project.getProjectMembers();
            }
        }
        if (body.get("budget") != null && !body.get("budget").toString().isBlank()) {
            try {
                budget = Double.parseDouble(body.get("budget").toString());
            } catch (Exception e) {
                budget = project.getBudget();
            }
        }
        if (body.get("status") != null && !body.get("status").toString().isBlank()) {
            try {
                status = Status.valueOf(body.get("status").toString());
            } catch (Exception e) {
                status = project.getStatus();
            }
        }
        if (body.get("completion_percentage") != null && !body.get("completion_percentage").toString().isBlank()) {
            try {
                completionPercentage = Float.parseFloat(body.get("completion_percentage").toString());
            } catch (Exception e) {
                completionPercentage = project.getCompletionPercentage();
            }
        }


        if (body.get("tasks") != null && !body.get("tasks").toString().isBlank()) {
            //System.out.println(body.get("tasks")); //debug message
            try {
                List<Task> extractedTasks = taskService.extractTasks(body); //from task service got list

                Set<Long> oldTaskIds = project.getProjectTasks().stream()  //la ce ma gandeam eu cand am ales relationarea asta?! Got all tasks from project
                        .filter(Objects::nonNull)  //if there somehow is a null task object
                        .collect(Collectors.toSet()); //converting to set, indeed

                Set<Long> newTaskIds = extractedTasks.stream() //same here as above, but getting task kinda from "database"
                        .map(Task::getId) //Longs
                        .filter(Objects::nonNull) //same, jesus how much time i spent developing this piece of sheet of iron. Extra precaution xD
                        .collect(Collectors.toSet());

                Set<Long> removedTaskIds = oldTaskIds.stream()
                        .filter(taskid -> !newTaskIds.contains(taskid)) //filtering the ids that are not in body request with those one in db
                        .collect(Collectors.toSet());

                //System.out.println("To be removed: " + removedTaskIds); //debug

                if (!removedTaskIds.isEmpty()) {
                    taskRepository.deleteAllById(removedTaskIds); //gotcha bro. :)
                }

                List<Task> savedTasks = taskRepository.saveAll(extractedTasks);

                taskIds = savedTasks.stream()
                        .map(Task::getId)
                        .collect(Collectors.toSet());

            } catch (Exception e) {
                taskIds = new HashSet<>(project.getProjectTasks()); //intellij said is better. i tried in the old way xD .stream().collect(Collectors.toSet());
            }
        }
        project.setName(name);
        project.setClient(client);
        project.setStartDate(startDate);
        project.setEndDate(endDate);
        project.setProjectTasks(taskIds);
        project.setProjectManager(projectManager);
        project.setProjectMembers(projectMembers);
        project.setBudget(budget);
        project.setCompletionPercentage(completionPercentage);
        project.setStatus(status);
        projectRepository.save(project);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}

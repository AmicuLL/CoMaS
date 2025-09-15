package AmicuLL.CoMaS.projects;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String client; //Name or ID
    private LocalDate startDate;
    private LocalDate endDate;
    @ElementCollection
    @CollectionTable(name = "project_tasks", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "task_id")
    private Set<Long> projectTasks = new HashSet<>();
    private Long projectManager;
    @ElementCollection
    @CollectionTable(name = "project_assignees", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "project_member")
    private Set<String> projectMembers = new HashSet<>(); //saved as: teamID_employee_ID. If employee was added before or after a team where he was allocated was added, admin can remove team from project and he still remains
    private Double budget;
    private Float completionPercentage;
    private Status status;

    public Project(String name, String client, LocalDate startDate, LocalDate endDate, Set<Long> projectTasks, Long projectManager, Set<String> projectMembers, Double budget, Float completionPercentage, Status status) {
        this.name = name;
        this.client = client;
        this.startDate = startDate;
        this.endDate = endDate;
        this.projectTasks = projectTasks;
        this.projectManager = projectManager;
        this.projectMembers = projectMembers;
        this.budget = budget;
        this.completionPercentage = completionPercentage;
        this.status = status;
    }

    public Project() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Set<Long> getProjectTasks() {
        return projectTasks;
    }

    public void setProjectTasks(Set<Long> projectTasks) {
        this.projectTasks = projectTasks;
    }

    public Long getProjectManager() {
        return projectManager;
    }

    public void setProjectManager(Long projectManager) {
        this.projectManager = projectManager;
    }

    public Set<String> getProjectMembers() {
        return projectMembers;
    }

    public void setProjectMembers(Set<String> projectMembers) {
        this.projectMembers = projectMembers;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public Float getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(Float completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    @Transient
    public Set<Long> getAllProjectMemberIds() {
        return projectMembers.stream()
                .map(code -> Long.parseLong(code.split("_")[1]))
                .collect(Collectors.toSet());
    }

    public boolean isManuallyAssigned(Long memberId) {
        return projectMembers.contains("0_" + memberId);
    }

    public boolean isAssignedFromTeam(Long teamId, Long memberId) {
        return projectMembers.contains(teamId + "_" + memberId);
    }
}

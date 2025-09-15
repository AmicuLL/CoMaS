package AmicuLL.CoMaS.task;

import jakarta.persistence.*;

import java.util.Set;
@Entity
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String details;
    @ElementCollection
    @CollectionTable(name = "task_assignees", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "employee_id")
    private Set<Long> employeeId; //or team? Should be a String also as: TeamID_EmplID?
    private Float completionPercentage;

    public Task(String name, String details, Set<Long> employeeId, Float completionPercentage) {
        this.name = name;
        this.details = details;
        this.employeeId = employeeId;
        this.completionPercentage = completionPercentage;
    }

    public Task() {
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

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Set<Long> getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Set<Long> employeeId) {
        this.employeeId = employeeId;
    }

    public Float getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(Float completionPercentage) {
        this.completionPercentage = completionPercentage;
    }
}

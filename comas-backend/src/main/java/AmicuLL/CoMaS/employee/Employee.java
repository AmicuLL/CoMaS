package AmicuLL.CoMaS.employee;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "employee")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private String position = "Trainee";
    private LocalDate hireDate;
    private Long departmentId = 0L;
    private String working_hours = "08:00-17:00";
    private LocalTime break_time = LocalTime.of(1,0);
    private String EUUID = UUID.randomUUID().toString(); //Employee UUID


    public Employee(String email, String phone, String firstName, String lastName, String position, LocalDate hireDate, Long departmentId, String working_hours, LocalTime break_time) {
        this.email = email;
        this.phone = phone;
        this.firstName = firstName;
        this.lastName = lastName;
        if(!position.isBlank()) this.position = position;
        this.hireDate = hireDate;
        this.departmentId = departmentId;
        this.working_hours = working_hours;
        this.break_time = break_time;
    }

    public Employee(String email, String phone, String firstName, String lastName, String position, LocalDate hireDate, Long departmentId) {
        this.email = email;
        this.phone = phone;
        this.firstName = firstName;
        this.lastName = lastName;
        if(!position.isBlank()) this.position = position;
        this.hireDate = hireDate;
        this.departmentId = departmentId;
    }

    public Employee() {}

    public Long getId() {
        return id;
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

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getWorking_hours() {
        return working_hours;
    }

    public void setWorking_hours(String working_hours) {
        this.working_hours = working_hours;
    }

    public LocalTime getBreak_time() {
        return break_time;
    }

    public void setBreak_time(LocalTime break_time) {
        this.break_time = break_time;
    }

    public String getEUUID() {
        return EUUID;
    }

    public void setEUUID(String EUUID) {
        this.EUUID = EUUID;
    }
}

package AmicuLL.CoMaS.employee;

import java.time.LocalTime;

public class EmployeeDTO {
    private Long id;

    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private String position;
    private String hireDate;
    private Long departmentId;
    private String regKey;
    private String working_hours;
    private String break_time;
    private String EUUID;

    public EmployeeDTO(Long id, String email, String phone, String firstName, String lastName, String position, String hireDate, Long departmentId, String regKey, String working_hours, LocalTime break_time, String EUUID) {
        this.id = id;
        this.email = email;
        this.phone = phone;
        this.firstName = firstName;
        this.lastName = lastName;
        this.position = position;
        this.hireDate = hireDate;
        this.departmentId = departmentId;
        this.regKey = regKey;
        this.working_hours = working_hours;
        this.break_time = break_time.toString();
        this.EUUID = EUUID;
    }

    public EmployeeDTO() {
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

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getHireDate() {
        return hireDate;
    }

    public void setHireDate(String hireDate) {
        this.hireDate = hireDate;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getRegKey() {
        return regKey;
    }

    public void setRegKey(String regKey) {
        this.regKey = regKey;
    }

    public String getWorking_hours() {
        return working_hours;
    }

    public void setWorking_hours(String working_hours) {
        this.working_hours = working_hours;
    }

    public String getBreak_time() {
        return break_time;
    }

    public void setBreak_time(String break_time) {
        this.break_time = break_time;
    }

    public String getEUUID() {
        return EUUID;
    }

    public void setEUUID(String EUUID) {
        this.EUUID = EUUID;
    }
}

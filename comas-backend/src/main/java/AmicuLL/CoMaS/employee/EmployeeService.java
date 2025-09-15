package AmicuLL.CoMaS.employee;


import AmicuLL.CoMaS.user.Permission;
import AmicuLL.CoMaS.user.User;
import AmicuLL.CoMaS.user.UserType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class EmployeeService {
    @Value("${isRegKeyRequired}")
    private boolean isRegKeyRequired;
    private final EmployeeRepository employeeRepository;
    @Autowired
    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    public EmployeeDTO mapEmployeeToDTO(Employee employee, User authUser) {
        EmployeeDTO dto = new EmployeeDTO();

        List<String> perms = authUser.getPermissions().stream()
                .map(Permission::getPermission)
                .toList();

        dto.setId(employee.getId());
        if (perms.contains("employee:view") || perms.contains("employee:viewName") || employee.getId().equals(authUser.getUserType() == UserType.EMPLOYEE ? authUser.getUserRefId() : null)) {
            dto.setFirstName(employee.getFirstName());
            dto.setLastName(employee.getLastName());
        }

        if (perms.contains("employee:view") || perms.contains("employee:viewEmail") || employee.getId().equals(authUser.getUserType() == UserType.EMPLOYEE ? authUser.getUserRefId() : null))
            dto.setEmail(employee.getEmail());

        if (perms.contains("employee:view") || perms.contains("employee:viewPhone") || employee.getId().equals(authUser.getUserType() == UserType.EMPLOYEE ? authUser.getUserRefId() : null))
            dto.setPhone(employee.getPhone());

        if (perms.contains("employee:view") || perms.contains("employee:viewPosition") || employee.getId().equals(authUser.getUserType() == UserType.EMPLOYEE ? authUser.getUserRefId() : null))
            dto.setPosition(employee.getPosition());

        if (perms.contains("employee:view") || perms.contains("employee:viewHireDate") || employee.getId().equals(authUser.getUserType() == UserType.EMPLOYEE ? authUser.getUserRefId() : null))
            dto.setHireDate(employee.getHireDate().toString());

        if (perms.contains("employee:view") || perms.contains("employee:viewDepartmentId") || employee.getId().equals(authUser.getUserType() == UserType.EMPLOYEE ? authUser.getUserRefId() : null))
            dto.setDepartmentId(employee.getDepartmentId());

        if (perms.contains("employee:view") || perms.contains("employee:viewEUUID")) //this one just admins can see
            dto.setEUUID(employee.getEUUID());

        if(perms.contains("employee:view") || perms.contains("employee:viewWorkHours") || employee.getId().equals(authUser.getUserType() == UserType.EMPLOYEE ? authUser.getUserRefId() : null))
            dto.setWorking_hours(employee.getWorking_hours());

        if(perms.contains("employee:view") || perms.contains("employee:viewBreak") || employee.getId().equals(authUser.getUserType() == UserType.EMPLOYEE ? authUser.getUserRefId() : null))
            dto.setBreak_time(employee.getBreak_time().toString());
        return dto;
    }
    public List<Employee> getEmployees() {
        return employeeRepository.findAll();
    }

    public ResponseEntity<String> getEmployeeIdAndNames() {
        try {
            List<Employee> result = employeeRepository.findAll();
            List<Map<String, Object>> responseList = new ArrayList<>();
            for (Employee employee : result) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", employee.getId().toString());
                item.put("first_name", employee.getFirstName());
                item.put("last_name", employee.getLastName());
                responseList.add(item);
            }
            String json = new ObjectMapper().writeValueAsString(responseList);

            return ResponseEntity.ok(json);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Exception: " + e);
        }
    }

    public ResponseEntity<String> getEmployeeById(String employeeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User authUser = (User) authentication.getPrincipal();
        try {
            //Long employee_id = employeeId != null ? (employeeId.matches("\\d+") ? Long.parseLong(employeeId) : null) : authUser.getUserType()== UserType.EMPLOYEE ? authUser.getUserRefId() : null;
            Long employee_id;
            if (employeeId != null && employeeId.matches("\\d+")) {
                employee_id = Long.parseLong(employeeId);
            } else if (authUser.getUserType() == UserType.EMPLOYEE) {
                employee_id = authUser.getUserRefId();
            } else {
                return ResponseEntity.internalServerError().body("Cannot digest employee id.");
                //employee_id = null;
            }

            Employee employee = employeeRepository.findEmployeeById(employee_id).get();

            String json = new ObjectMapper().writeValueAsString(mapEmployeeToDTO(employee, authUser));

            return ResponseEntity.ok(json);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Exception: " + e);
        }
    }

    public String addNewEmployee(Employee employee) {
        Optional<Employee> employeeOptional = employeeRepository.findEmployeeByEmail(employee.getEmail());
        if(employeeOptional.isPresent()) {
            throw new IllegalStateException("Email taken");
        }
        employeeRepository.save(employee);
        return employee.getEUUID();
    }

    public ResponseEntity<String> editEmployeeById(String employeeId, Map<String, String> body) {
        User authUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long employee_id = null;
        if(employeeId == null || employeeId.isBlank()) {
            employee_id = employeeRepository.findEmployeeById(authUser.getUserType() == UserType.EMPLOYEE ? authUser.getUserRefId() : null).get().getId();
            if (employee_id == null)
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Employee id must not be null.\"}");
        } else try {
            employee_id = Long.parseLong(employeeId);
        } catch (Exception exception) {
            if(exception instanceof NumberFormatException) return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("{\"message\":\"Employee id cannot be digested.\"}");
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("{\"message\":\"" + exception + "\"}");
        }
        Optional<Employee> employeeOptional = employeeRepository.findEmployeeById(employee_id);
        if(!employeeOptional.isPresent()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\":\"Employee not found by given id.\"}");
        Employee employee = employeeOptional.get();
        String errors ="";
        List<String> perms = authUser.getPermissions().stream()
                .map(Permission::getPermission)
                .toList();
        if(body.get("first_name") != null && !body.get("first_name").isBlank())
            if(body.get("first_name").matches("^(?=.{3,}$)[A-ZĂÂÎȘȚÉÈ][a-zăâîșțéè]+(?:[-'][A-ZĂÂÎȘȚÉÈ][a-zăâîșțéè]+)*$")) {
                if((perms.contains("employee:edit") || perms.contains("employee:editName") || (authUser.getUserType() == UserType.EMPLOYEE && authUser.getUserRefId() == employee.getId())))
                    employee.setFirstName(body.get("first_name"));
            } else errors += "First name is incorrect_";
        if(body.get("last_name") != null && !body.get("last_name").isBlank())
            if(body.get("last_name").matches("^(?=.{3,}$)[A-ZĂÂÎȘȚÉÈ][a-zăâîșțéè]+(?:[-'][A-ZĂÂÎȘȚÉÈ][a-zăâîșțéè]+)*$")) {
                if (perms.contains("employee:edit") || perms.contains("employee:editName") || (authUser.getUserType() == UserType.EMPLOYEE && authUser.getUserRefId() == employee.getId()))
                    employee.setLastName(body.get("last_name"));
            } else errors += "Last name is incorrect_";
        if(body.get("email") != null && !body.get("email").isBlank())
            if(body.get("email").matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
                if (perms.contains("employee:edit") || perms.contains("employee:editEmail") || (authUser.getUserType() == UserType.EMPLOYEE && authUser.getUserRefId() == employee.getId()))
                    employee.setEmail(body.get("email"));
            } else errors += "Email is incorrect_";
        if(body.get("phone") != null && !body.get("phone").isBlank())
            if(body.get("phone").matches("^(?:\\+4|004)?0\\d{9}$")) {
                if (perms.contains("employee:edit") || perms.contains("employee:editPhone") || (authUser.getUserType() == UserType.EMPLOYEE && authUser.getUserRefId() == employee.getId()))
                    employee.setPhone(body.get("phone"));
            } else errors += "Phone is incorrect_";
        if(body.get("position") != null && !body.get("position").isBlank())
            if(perms.contains("employee:edit") || perms.contains("employee:editPosition"))
                employee.setPosition(body.get("position"));
        if(body.get("department_id") != null && !body.get("department_id").isBlank()) {
            try {
                Long dep_id = Long.parseLong(body.get("department_id"));
                if(perms.contains("employee:edit") || perms.contains("employee:editDepartmentId"))
                    employee.setDepartmentId(dep_id);
            } catch (Exception e) {
                errors +="Department ID is incorrect_";
            }
        }
        if(body.get("working_hours") != null && !body.get("working_hours").isBlank())
            if (body.get("working_hours").matches("^\\d{2}:\\d{2}-\\d{2}:\\d{2}$")) {
                if (perms.contains("employee:edit") || perms.contains("employee:editWorkHours"))
                    employee.setWorking_hours(body.get("working_hours"));
            } else errors +="Working hours is incorrect_";
        if(body.get("hire_date") != null && !body.get("hire_date").isBlank()) {
            try {
                if(perms.contains("employee:edit") || perms.contains("employee:editHireDate"))
                    employee.setHireDate(LocalDate.parse(body.get("hire_date")));
            } catch (Exception exception) {
                errors += "Hire date is incorrect_";
            }
        }
        if(body.get("break_time") != null && !body.get("break_time").isBlank()) {
            try {
                if(perms.contains("employee:edit") || perms.contains("employee:editBreak"))
                    employee.setBreak_time(LocalTime.parse(body.get("break_time")));
            } catch (Exception exception) {
                errors += "Break time is incorrect_";
            }
        }
        employeeRepository.save(employee);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(errors.length() != 0 ? "{\"message\":\"Employee might be updated.\",\n\"error\":\"" + errors + "\"}" : "{\"message\":\"Employee updated.\"}");
    }
}

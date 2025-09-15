package AmicuLL.CoMaS.employee;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(path = "api/v1/employee")
public class EmployeeController {
    private final EmployeeService employeeService;
    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping(path = "/all")
    public List<Employee> getEmployees(){
        return employeeService.getEmployees();
    }

    @PostMapping(path = "/add")
    public String registerNewEmployee(@RequestBody Employee employee) {
        return employeeService.addNewEmployee(employee);
    }

    @GetMapping(path = "/names")
    public ResponseEntity<String> getEmployeeNames() {return employeeService.getEmployeeIdAndNames();}

    @GetMapping
    public ResponseEntity<String> getEmployee(@RequestParam(name = "employee_id", required = false) String employeeId) {
        return employeeService.getEmployeeById(employeeId);
    }
    @PatchMapping()
    public ResponseEntity<String> editEmployee(@RequestParam(name ="employee_id", required = false) String employeeId, @RequestBody Map<String, String> body) {
        return employeeService.editEmployeeById(employeeId, body);
    }

}

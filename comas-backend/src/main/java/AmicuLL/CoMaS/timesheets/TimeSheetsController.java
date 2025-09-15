package AmicuLL.CoMaS.timesheets;

import AmicuLL.CoMaS.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping(path = "api/v1/timesheet")
public class TimeSheetsController {
    private final TimeSheetsService timeSheetsService;
    @Autowired
    public TimeSheetsController(TimeSheetsService timeSheetsService) {
        this.timeSheetsService = timeSheetsService;
    }

    @GetMapping(path = "/employee")
    public ResponseEntity<String> getWorkHour(@RequestBody Map<String, String> body){
        try {
            User authUser = timeSheetsService.getAuthUser();
            Long employeeId = body.get("employee_id") != null ? Long.parseLong(body.get("employee_id")) : authUser.getUserRefId();
            if(employeeId != authUser.getUserRefId() && !timeSheetsService.hasPermission("timesheet:viewWorkHours")){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Insufficient permissions");
            }
            LocalDate workDay = LocalDate.parse(body.get("work_day"));
            LocalTime workTime = timeSheetsService.getWorkTime(employeeId, workDay);
            return ResponseEntity.ok(workTime.toString());

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated. " + e);
        }
    }
    @PostMapping(path = "/employee")
    public ResponseEntity<String> setClockInOut(@RequestBody Map<String, String> body ){
        String employee_id;
        employee_id = (body.get("employee_uuid") != null && !body.get("employee_uuid").isBlank()) ? body.get("employee_uuid") : timeSheetsService.getCurrentEmployeeId();
        if(employee_id == null && body.get("employee_uuid") == null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Employee id is null\"}");
        if (body.get("clock_in") != null && body.get("clock_in").isBlank()) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Clock in is blank.\"}");}
        if (body.get("clock_out") != null && body.get("clock_out").isBlank()) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Clock out is blank.\"}");}

        LocalTime clockIn = body.get("clock_in") != null ? LocalTime.parse(body.get("clock_in"), DateTimeFormatter.ofPattern("H:mm")) : null;
        LocalTime clockOut = body.get("clock_out") != null ? LocalTime.parse(body.get("clock_out"), DateTimeFormatter.ofPattern("H:mm")) : null;
        if(clockIn == null && clockOut == null) return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"Time is not a valid value.\"}");
        if(employee_id == null) {
            employee_id = !body.get("employee_uuid").isBlank() ? body.get("employee_uuid") : null;
        }



        return clockIn != null ? timeSheetsService.setClockIn(employee_id, clockIn)
                : clockOut != null ? timeSheetsService.setClockOut(employee_id, clockOut) : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"500 Internal Server Error – Possible cause: empty request body.\"}");
    }
    @PostMapping
    public ResponseEntity<String> getAllWorkHours(@RequestBody Map<String, String> body) {
        String key = body.get("employee_id") != null ? body.get("employee_id") : body.get("date") != null ? body.get("date") : null;
        String duration = body.get("duration");

        return timeSheetsService.getWorkHours(key, duration);
    }
}

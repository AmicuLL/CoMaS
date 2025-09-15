package AmicuLL.CoMaS.timesheets;

import AmicuLL.CoMaS.employee.Employee;
import AmicuLL.CoMaS.employee.EmployeeRepository;
import AmicuLL.CoMaS.user.User;
import AmicuLL.CoMaS.user.UserType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class TimeSheetsService {
    private final EmployeeRepository employeeRepository;
    private final TimeSheetsRepository timeSheetsRepository;

    private LocalTime roundUpToNearestQuarter(LocalTime time) {
        int tolerance = 5;  // if 8:05 => 8:00. if 8:06 => 8:15
        int minute = time.getMinute();
        int remainder = minute % 15;

        if (remainder == 0) {
            return time.withSecond(0).withNano(0);
        }

        if (remainder <= tolerance) {
            return time.minusMinutes(remainder).withSecond(0).withNano(0);
        } else {
            return time.plusMinutes(15 - remainder).withSecond(0).withNano(0);
        }
    }
    private LocalTime roundDownToNearestQuarter(LocalTime time) {
        int tolerance = 5;  // if 16:55 => 17:00. if 16:54 => 16:45
        int minute = time.getMinute();
        int remainder = minute % 15;
        int toNextQuarter = 15 - remainder;

        if (remainder == 0) {
            return time.withSecond(0).withNano(0);
        }

        if (toNextQuarter <= tolerance) {
            LocalTime rounded = time.plusMinutes(toNextQuarter).withSecond(0).withNano(0);
            if (rounded.equals(LocalTime.MIDNIGHT)) {
                return LocalTime.of(23, 59); // maxim 23:59
            }
            return rounded;
        } else {
            return time.minusMinutes(remainder).withSecond(0).withNano(0);
        }

    }


    public TimeSheetsService(TimeSheetsRepository timeSheetsRepository, EmployeeRepository employeeRepository) {
        this.timeSheetsRepository = timeSheetsRepository;
        this.employeeRepository = employeeRepository;
    }
    public boolean hasPermission(String permission) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(permission));
    }
    public User getAuthUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    public String getCurrentEmployeeId() {
        User user = getAuthUser();
        return user.getUserType() == UserType.EMPLOYEE ? user.getUserRefId().toString() : null;
    }

    public LocalTime getWorkTime(Long employeeId, LocalDate workDay) {
        TimeSheets timesheet = timeSheetsRepository.findTimeSheetByEmployeeIdAndWorkDay(employeeId, workDay).orElseThrow(() -> new RuntimeException("Timesheet not found"));
        Employee employee = employeeRepository.findEmployeeById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
        LocalTime workTime = (timesheet.getClockOut().toSecondOfDay() > timesheet.getClockIn().toSecondOfDay()) ? LocalTime.ofSecondOfDay((timesheet.getClockOut().toSecondOfDay() - timesheet.getClockIn().toSecondOfDay()) - employee.getBreak_time().toSecondOfDay()) : LocalTime.ofSecondOfDay(0);
        // Time cannot be negative. If the worker has clocked out, they may have skipped the lunch break.
        // Regardless, clocking out earlier shouldn't be possible — this is just a safeguard.

        return workTime.toSecondOfDay() != 0 ? workTime : LocalTime.ofSecondOfDay(0);
    }
    //TODO Front end: Admins (or based by perm) may have the option to set timesheet. Edit timesheet?
    public String setWorkTime(Long employeeId, LocalTime clockIn, LocalTime clockOut) {
        Optional<TimeSheets> timesheet = timeSheetsRepository.findTimeSheetByEmployeeIdAndWorkDay(employeeId, LocalDate.now());
        if(timesheet.isPresent()) {
            return "Already exists an entry";
        } else {
            timeSheetsRepository.save(new TimeSheets(employeeId, LocalDate.now(), clockIn, clockOut));
            return  "Entry registered";
        }
    }
    public ResponseEntity<String> setClockIn(String employeeId, LocalTime clockIn) {
        Long employee_id;
        try {
            employee_id = Long.parseLong(employeeId);
        } catch (Exception exception){
            employee_id = employeeRepository.findEmployeeByEUUID(employeeId).get().getId();
        }
        Optional<TimeSheets> timesheet = timeSheetsRepository.findTimeSheetByEmployeeIdAndWorkDay(employee_id, LocalDate.now());
        if(timesheet.isPresent() && timesheet.get().getClockIn() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("{\"message\": \"Entry already exists.\"}");
        }
        timeSheetsRepository.save(new TimeSheets(employee_id, LocalDate.now(), roundUpToNearestQuarter(clockIn), null));
        return ResponseEntity.status(HttpStatus.CREATED).body("{\"message\": \"Entry registered.\"}");
    }

    public ResponseEntity<String> setClockOut(String employeeId, LocalTime clockOut) {
        Long employee_id;
        if(employeeId.matches("\\d+")) {
            employee_id = Long.parseLong(employeeId);
        } else {
            employee_id = employeeRepository.findEmployeeByEUUID(employeeId).get().getId();
        }
        Optional<TimeSheets> timesheet = timeSheetsRepository.findTimeSheetByEmployeeIdAndWorkDay(employee_id, LocalDate.now());
        TimeSheets sheet;
        if(timesheet.isPresent()) {
            sheet = timesheet.get();
            if(sheet.getClockIn() == null)
                return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("{\"message\": \"Entry rejected. Can't clock out => \"Clock in\" null\"}");
            if(sheet.getClockOut() != null)
                return ResponseEntity.status(HttpStatus.CONFLICT).body("{\"message\": \"Entry already exist.\"}");
            if(clockOut.toSecondOfDay() < sheet.getClockIn().toSecondOfDay()) //this is just if clocked manual. If used with Time.now() (perhaps done with esp32 project) or the time extracted from employee work_time data from db that backend fetched to front, it should be fine. We can set as read-only on frontend
                //Or we can limit the clock out after end work time and clock in max 2 hours passed? Too strict?
                //Or we can: sheet.setClockOut(sheet.getClockIn) and put clock in the current clock out. Work time = 0
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Clocking out earlier than you clocked in?! You must be Jesus or a time traveler!\"}"); //TODO remove this bad joke afterward :D When I''m done messing around, I'll check the code again, right? You're welcome from the past me and i know i'll thank me from the future me xD
            sheet.setClockOut(roundDownToNearestQuarter(clockOut));
            timeSheetsRepository.save(sheet);
            return ResponseEntity.status(HttpStatus.CREATED).body("{\"message\": \"Entry registered.\"}");
        }
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("{\"message\": \"Entry rejected. Clock in first.\"}");
    }

    //TODO If implemented teams, team leader may have the permission to set a penalization.
    //TODO The penalization should be as % or time? Or both? if(body.get("\d+%)") => (worktime.seconds * number/100) else we assume data is as time type.
    public ResponseEntity<String> setPenalization(String employeeId, String penalization) {
        Long employee_id = Long.parseLong(employeeId);
        if(employeeId.matches("\\d+")) {
            employee_id = Long.parseLong(employeeId);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body("{\"message\":\"Penalizat\"}");
    }

    public ResponseEntity<String> getWorkHours(String employeeId, String duration) {
        try {
            LocalDate startDate;
            LocalDate endDate;
            if(duration == null || duration.isBlank()) {
                startDate = LocalDate.now().withDayOfMonth(1);
                endDate = LocalDate.now();
            } else {
                if (duration.contains("_")) {
                    String[] parts = duration.split("_");
                    startDate = LocalDate.parse(parts[0].trim());
                    endDate = LocalDate.parse(parts[1].trim());
                } else {
                    startDate = endDate = LocalDate.parse(duration.trim());
                }
            }
            Long employee_id = employeeId != null ? (employeeId.matches("\\d+") ? Long.parseLong(employeeId) : null) : null;
            List<TimeSheets> result;

            if (employee_id != null && (hasPermission("timesheets:view") || (getAuthUser().getUserType()==UserType.EMPLOYEE) && getAuthUser().getUserRefId() == employee_id)) {
                result = timeSheetsRepository.findByEmployeeIdAndWorkDayBetween(employee_id, startDate, endDate);
            } else {
                result = hasPermission("timesheets:view") ?
                        timeSheetsRepository.findByWorkDayBetween(startDate, endDate) :
                        timeSheetsRepository.findByEmployeeIdAndWorkDayBetween(getAuthUser().getUserType()==UserType.EMPLOYEE ? getAuthUser().getUserRefId() : null, startDate, endDate); //that null should be never reached
            }
            if (result.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\":\"No timesheets found / Unauthorized\"}");
            }
            List<Map<String, Object>> responseList = new ArrayList<>();
            for (TimeSheets ts : result) {
                Employee employee = employeeRepository.findEmployeeById(ts.getEmployeeId()).get();
                Map<String, Object> item = new HashMap<>();
                if (hasPermission("timesheets:view")) item.put("id", ts.getId().toString());
                item.put("date", ts.getWorkDay().toString());
                item.put("employee_id", ts.getEmployeeId());
                if (hasPermission("timesheets:view"))
                    item.put("employee_name", employee.getFirstName() + " " + employee.getLastName()); //otherwise, it will be shown your timesheet, so it doesn't matter
                item.put("clock_in", ts.getClockIn() != null ? ts.getClockIn().toString() : "N/A");
                item.put("clock_out", ts.getClockOut() != null ? ts.getClockOut().toString() : "N/A");
                LocalTime workTime = LocalTime.ofSecondOfDay(0);

                if (ts.getClockOut() != null && ts.getClockIn() != null && ts.getClockOut().toSecondOfDay() > ts.getClockIn().toSecondOfDay()) {
                   workTime = LocalTime.ofSecondOfDay(ts.getClockOut().toSecondOfDay() - ts.getClockIn().toSecondOfDay());
                    if (workTime.toSecondOfDay() > employee.getBreak_time().toSecondOfDay()) {
                       workTime = LocalTime.ofSecondOfDay(workTime.toSecondOfDay()- employee.getBreak_time().toSecondOfDay());
                        if(ts.getClockOut().toSecondOfDay() - ts.getClockIn().toSecondOfDay() - employee.getBreak_time().toSecondOfDay() > ts.getPenalization().toSecondOfDay()) {
                           workTime = LocalTime.ofSecondOfDay(ts.getClockOut().toSecondOfDay() - ts.getClockIn().toSecondOfDay() - employee.getBreak_time().toSecondOfDay() - ts.getPenalization().toSecondOfDay());
                       }
                        if((LocalTime.parse(employee.getWorking_hours().split("-")[1].trim()).toSecondOfDay() - LocalTime.parse(employee.getWorking_hours().split("-")[0].trim()).toSecondOfDay()) / 2 > workTime.toSecondOfDay() + employee.getBreak_time().toSecondOfDay())
                            workTime=LocalTime.ofSecondOfDay(workTime.toSecondOfDay() + employee.getBreak_time().toSecondOfDay());
                        //if working less than half work time, no break needed. We assume that the employee didn't take the break.
                        //Anyway over-exaggerated function :(
                   }
                }


                item.put("penalization", ts.getPenalization().toString());
                item.put("work_time", workTime.toString());
                responseList.add(item);
            }
            String json = new ObjectMapper().writeValueAsString(responseList);

            return ResponseEntity.ok(json);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Invalid format. E:" + e + "\"}");
        }
    }
}

package AmicuLL.CoMaS.timesheets;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;
@Entity
@Table(name = "timesheets")
public class TimeSheets {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private long employeeId;
    private LocalDate workDay;
    private LocalTime clockIn;
    private LocalTime clockOut;
    private LocalTime penalization = LocalTime.ofSecondOfDay(0); //no penalization from start.
    //Or should be %? Could convert it to hours anyway => 25% * 8 = 2 hours. work_hours - 2.

    public TimeSheets(){}
    public TimeSheets(long employeeId, LocalDate workDay, LocalTime clockIn, LocalTime clockOut) {
        this.employeeId = employeeId;
        this.workDay = workDay;
        this.clockIn = clockIn;
        this.clockOut = clockOut;
    }
    public Long getId() {return id;}
    public long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getWorkDay() {
        return workDay;
    }

    public void setWorkDay(LocalDate workDay) {
        this.workDay = workDay;
    }

    public LocalTime getClockIn() {
        return clockIn;
    }

    public void setClockIn(LocalTime clockIn) {
        this.clockIn = clockIn;
    }

    public LocalTime getClockOut() {
        return clockOut;
    }

    public void setClockOut(LocalTime clockOut) {
        this.clockOut = clockOut;
    }

    public LocalTime getPenalization() {
        return penalization;
    }

    public void setPenalization(LocalTime penalization) {
        this.penalization = penalization;
    }
}

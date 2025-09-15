package AmicuLL.CoMaS.timesheets;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSheetsRepository extends JpaRepository<TimeSheets, Long> {
    List<TimeSheets> findByEmployeeIdAndWorkDayBetween(Long employeeId, LocalDate start, LocalDate end);
    List<TimeSheets> findByWorkDayBetween(LocalDate start, LocalDate end);
    Optional<TimeSheets> findTimeSheetByEmployeeIdAndWorkDay(Long employeeId, LocalDate workDay);
}

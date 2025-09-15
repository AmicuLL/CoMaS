import TimeSheets from "../components/TimeSheets";

function TimeSheet() {
  return (
    <TimeSheets
      TABLE_MAX_HEIGHT={"70dvh"}
      PAGE_SIZE={10}
      KEY="Pontaj"
      key={"TABLE_TIMESHEET"}
    />
  );
}

export default TimeSheet;

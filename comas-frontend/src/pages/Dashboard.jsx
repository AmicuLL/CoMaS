import { Center, Grid, Space, Text } from "@mantine/core";
import { useState } from "react";
import Users from "../components/Users";
import TimeSheets from "../components/TimeSheets";
import Clocking from "../components/Clocking";

function Dashboard() {
  const [timeSheetsKey, setTimeSheetsKey] = useState(Date.now());
  return (
    <>
      <Center>
        <Text>Dashboard</Text>
      </Center>
      <Space h="md" />
      <Clocking onClockAction={() => setTimeSheetsKey(Date.now())} />
      <Grid justify="space-between" overflow="hidden">
        <Grid.Col
          span={{ base: 12, md: 12, lg: 6 }}
          style={{ overflow: "hidden" }}
        >
          <TimeSheets
            DATEPICKER={false}
            EMPLOYEE_FINDER={false}
            TABLE_MAX_HEIGHT={"50dvh"}
            TABLE_BORDER={true}
            COLUMN_BORDER={true}
            SCROLLABLE={false}
            PIN_LAST={false}
            PAGE_SIZE={10}
            KEY="Pontaj"
            key={timeSheetsKey}
          />
        </Grid.Col>
        <Grid.Col
          span={{ base: 12, md: 12, lg: 6 }}
          style={{ overflow: "hidden" }}
        >
          <Users
            TABLE_MAX_HEIGHT={1000}
            TABLE_HEIGHT={"50dvh"}
            TABLE_BORDER={true}
            COLUMN_BORDER={true}
            SCROLLABLE={false}
            PIN_LAST={false}
            PAGE_SIZE={10}
            KEY="Dispare_din_dashboard"
          />
        </Grid.Col>
      </Grid>
    </>
  );
}

export default Dashboard;

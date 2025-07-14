import React from "react";
import PayrollCalculatorContent from "../../components/payroll/PayrollCalculatorButton";
import PayslipTab from "../../components/payroll/PayslipTab";
import ThirteenthMonthPay from "../../components/payroll/ThirteenthMonthPay";
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

// Assuming you'll create these components for Payslip and 13th Month Payslip content
// For now, they'll be simple placeholders.
const PayslipContent = () => (
  <Box p={4}>
    {/* Your Payslip content goes here */}
    <p>This is where your detailed payslip information will be displayed.</p>
  </Box>
);

const ThirteenthMonthPayslipContent = () => (
  <Box p={4}>
    {/* Your 13th Month Payslip content goes here */}
    <p>This section will show the 13th month payslip details.</p>
  </Box>
);

const Payroll = () => {
  return (
    <Box>
      <PayrollCalculatorContent />
      <Tabs isFitted variant="enclosed">
        <TabList>
          <Tab>Payslip</Tab>
          <Tab>13th Month Payslip</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <PayslipTab />
          </TabPanel>
          <TabPanel>
            <ThirteenthMonthPay />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Payroll;

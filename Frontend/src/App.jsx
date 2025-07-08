import { Box, Flex } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
const Maincomponent = lazy(() => import("./components/Maincomponent"));
const SideNavigation = lazy(() => import("./components/SideNavigation"));
const TopNavigations = lazy(() => import("./components/TopNavigations"));
const EmployeeTracker = lazy(() => import("./components/EmployeeTracker"));
const App = () => {
  return (
    <Box>
      <Maincomponent>
        <Flex minH="100vh">
          <SideNavigation />
          <Box flex="1" p={8}>
            <TopNavigations />
            <EmployeeTracker />
          </Box>
        </Flex>
      </Maincomponent>
    </Box>
  );
};

export default App;

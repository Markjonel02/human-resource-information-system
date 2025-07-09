import { Box, Flex } from "@chakra-ui/react";
import { lazy, Suspense } from "react";
const Maincomponent = lazy(() => import("./components/Maincomponent"));
const SideNavigation = lazy(() => import("./components/SideNavigation"));
const TopNavigations = lazy(() => import("./components/TopNavigations"));
const EmployeeTracker = lazy(() => import("./components/EmployeeTracker"));
const UpcomingSchcedule = lazy(() => import("./components/UpcomingSchcedule"));
const Announcements = lazy(() => import("./components/Announcements"));
const App = () => {
  return (
    <Box>
      <Maincomponent>
        <Flex minH="100vh">
          <SideNavigation />
          <Box flex="3" p={4}>
            <TopNavigations />

            {/* Constrain the scrollable area */}
            <Box
              maxH="calc(100vh - 100px)"
              overflowY="auto"
              className="scroll"
              sx={{
                scrollBehavior: "smooth",
                "::-webkit-scrollbar": { width: "6px" },
                "::-webkit-scrollbar-track": { background: "transparent" },
                "::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(100, 100, 100, 0.4)",
                  borderRadius: "4px",
                  display: "none !important",
                },
              }}
            >
              <Flex
                direction={{ base: "column", lg: "row" }}
                align="flex-start"
                gap={6}
              >
                {/* Employee Tracker always comes first */}
                <Box w={{ base: "100%", md: "75%" }}>
                  <EmployeeTracker />
                </Box>

                {/* Right-side content */}
                <Box
                  width={{ base: "100%", md: "30%" }}
                  mt={{ base: 4, lg: 4 }}
                >
                  <Announcements />
                  <Box mt={4}>
                    <UpcomingSchcedule />
                  </Box>
                </Box>
              </Flex>
            </Box>
          </Box>
        </Flex>
      </Maincomponent>
    </Box>
  );
};

export default App;

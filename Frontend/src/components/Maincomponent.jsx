import { Box } from "@chakra-ui/react";
import useInactivityLogout from "../hooks/useInActivityLogout";
const Maincomponent = ({ children }) => {
  useInactivityLogout();
  return <Box>{children}</Box>;
};

export default Maincomponent;

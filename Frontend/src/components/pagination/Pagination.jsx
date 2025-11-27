// components/Pagination.js
import React from "react";
import { Flex, Button, IconButton } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
}) => {
  if (totalPages <= 1) return null;

  return (
    <Flex justify="center" align="center" mt={6} gap={2}>
      {showFirstLast && (
        <Button
          onClick={() => onPageChange(1)}
          isDisabled={currentPage === 1}
          colorScheme="blue"
          variant="outline"
        >
          First
        </Button>
      )}

      <IconButton
        icon={<ChevronLeftIcon />}
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        colorScheme="blue"
        variant="outline"
      />

      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        return (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            colorScheme={currentPage === page ? "blue" : "gray"}
            variant={currentPage === page ? "solid" : "outline"}
          >
            {page}
          </Button>
        );
      })}

      <IconButton
        icon={<ChevronRightIcon />}
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        colorScheme="blue"
        variant="outline"
      />

      {showFirstLast && (
        <Button
          onClick={() => onPageChange(totalPages)}
          isDisabled={currentPage === totalPages}
          colorScheme="blue"
          variant="outline"
        >
          Last
        </Button>
      )}
    </Flex>
  );
};

export default Pagination;

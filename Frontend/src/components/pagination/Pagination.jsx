import React from "react";
import { Flex, Button, IconButton } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

/**
 * Pagination Component - Global Reusable Component
 *
 * @param {number} currentPage - Current active page
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {boolean} showFirstLast - Show first/last buttons (default: true)
 * @param {string} colorScheme - Color theme (default: "blue")
 * @param {string} size - Size variant (default: "md")
 *
 * @example
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   showFirstLast={true}
 *   colorScheme="blue"
 *   size="md"
 * />
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  colorScheme = "blue",
  size = "md",
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination: show first, last, and pages around current
      const leftBound = Math.max(1, currentPage - 1);
      const rightBound = Math.min(totalPages, currentPage + 1);

      if (leftBound > 2) {
        pages.push(1);
        if (leftBound > 3) pages.push("...");
      } else {
        for (let i = 1; i < leftBound; i++) {
          pages.push(i);
        }
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < totalPages - 1) {
        if (rightBound < totalPages - 2) pages.push("...");
        pages.push(totalPages);
      } else {
        for (let i = rightBound + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  // Don't render if only 1 or 0 pages
  if (totalPages <= 1) return null;

  return (
    <Flex justify="center" align="center" mt={6} gap={2} flexWrap="wrap">
      {/* First Page Button */}
      {showFirstLast && (
        <Button
          onClick={() => handlePageChange(1)}
          isDisabled={currentPage === 1}
          colorScheme={colorScheme}
          variant="outline"
          size={size}
        >
          First
        </Button>
      )}

      {/* Previous Button */}
      <IconButton
        icon={<ChevronLeftIcon />}
        onClick={() => handlePageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        colorScheme={colorScheme}
        variant="outline"
        size={size}
        aria-label="Previous page"
      />

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === "...") {
          return (
            <Button
              key={`ellipsis-${index}`}
              isDisabled
              variant="ghost"
              size={size}
            >
              ...
            </Button>
          );
        }

        return (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            colorScheme={currentPage === page ? colorScheme : "gray"}
            variant={currentPage === page ? "solid" : "outline"}
            size={size}
          >
            {page}
          </Button>
        );
      })}

      {/* Next Button */}
      <IconButton
        icon={<ChevronRightIcon />}
        onClick={() => handlePageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        colorScheme={colorScheme}
        variant="outline"
        size={size}
        aria-label="Next page"
      />

      {/* Last Page Button */}
      {showFirstLast && (
        <Button
          onClick={() => handlePageChange(totalPages)}
          isDisabled={currentPage === totalPages}
          colorScheme={colorScheme}
          variant="outline"
          size={size}
        >
          Last
        </Button>
      )}
    </Flex>
  );
};

export default Pagination;

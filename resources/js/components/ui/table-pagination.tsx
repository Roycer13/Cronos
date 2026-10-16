import * as React from "react"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

type Props = {
  pagination: {
    current_page: number
    last_page: number
    per_page?: number
    total?: number
  }
  onPageChange: (page: number) => void
  maxPagesDisplayed?: number
}

export default function TablePagination({
  pagination,
  onPageChange,
  maxPagesDisplayed = 5,
}: Props) {
  const { current_page, last_page } = pagination

  const getPages = () => {
    const pages: number[] = []

    let startPage = Math.max(current_page - Math.floor(maxPagesDisplayed / 2), 1)
    let endPage = startPage + maxPagesDisplayed - 1
    if (endPage > last_page) {
      endPage = last_page
      startPage = Math.max(endPage - maxPagesDisplayed + 1, 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  const pages = getPages()

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            hidden={current_page === 1}
            onClick={() => current_page > 1 && onPageChange(current_page - 1)}
          />
        </PaginationItem>

        {/* Pages */}
        {pages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
            </PaginationItem>
            {pages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={page === current_page}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {pages[pages.length - 1] < last_page && (
          <>
            {pages[pages.length - 1] < last_page - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(last_page)}>
                {last_page}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            hidden={current_page === last_page}
            onClick={() => current_page < last_page && onPageChange(current_page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

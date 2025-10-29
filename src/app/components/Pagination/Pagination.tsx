import React from "react";
import "./Pagination.css";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (!totalPages || totalPages < 1) return null;

    const goToFirst = () => onPageChange(1);
    const goToLast = () => onPageChange(totalPages);
    const goToPrev = () => onPageChange(Math.max(currentPage - 1, 1));
    const goToNext = () => onPageChange(Math.min(currentPage + 1, totalPages));

    // Hiển thị tối đa 3 trang
    const getPageNumbers = () => {
        if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage === 1) return [1, 2, 3];
        if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
        return [currentPage - 1, currentPage, currentPage + 1];
    };

    return (
        <div className="pagination">
            <button onClick={goToFirst} disabled={currentPage === 1}>
                ⏮ First
            </button>
            <button onClick={goToPrev} disabled={currentPage === 1}>
                ◀ Prev
            </button>

            {getPageNumbers().map((num) => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    className={num === currentPage ? "active" : ""}
                >
                    {num}
                </button>
            ))}

            <button onClick={goToNext} disabled={currentPage === totalPages}>
                Next ▶
            </button>
            <button onClick={goToLast} disabled={currentPage === totalPages}>
                Last ⏭
            </button>
        </div>
    );
};

export default Pagination;
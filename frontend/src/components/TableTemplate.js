import React, { useState } from 'react'
import { StyledTableCell, StyledTableRow } from './styles';
import { Table, TableBody, TableContainer, TableHead, TablePagination } from '@mui/material';

const TableTemplate = ({
    buttonHaver: ButtonHaver,
    columns,
    rows,
    showPagination = true,
    headerFontSize = '1.1rem',
    bodyFontSize = '1.06rem',
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const visibleRows = showPagination
        ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        : rows;

    return (
        <>
            <TableContainer>
                <Table
                    stickyHeader
                    aria-label="sticky table"
                    sx={{
                        '& .MuiTableCell-root': {
                            verticalAlign: 'middle',
                        },
                    }}
                >
                    <TableHead>
                        <StyledTableRow>
                            {columns.map((column) => (
                                <StyledTableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                    sx={{ fontSize: headerFontSize }}
                                >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                            <StyledTableCell align="center" sx={{ fontSize: headerFontSize }}>
                                Actions
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {visibleRows.map((row) => {
                                return (
                                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <StyledTableCell key={column.id} align={column.align} sx={{ fontSize: bodyFontSize }}>
                                                    {
                                                        column.format && typeof value === 'number'
                                                            ? column.format(value)
                                                            : value
                                                    }
                                                </StyledTableCell>
                                            );
                                        })}
                                        <StyledTableCell align="center" sx={{ fontSize: bodyFontSize }}>
                                            <ButtonHaver row={row} />
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            {showPagination && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    sx={{
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select': {
                            fontSize: '1rem',
                            fontWeight: 600,
                        }
                    }}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 5));
                        setPage(0);
                    }}
                />
            )}
        </>
    )
}

export default TableTemplate
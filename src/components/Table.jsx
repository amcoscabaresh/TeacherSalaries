import { useState } from 'react';
import { createStyles, Table, ScrollArea, rem } from '@mantine/core';
import { Pagination } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
        }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

export default function SalaryTable({ data }) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const [activePage, setPage] = useState(1);

  const rows = data.slice(100 * (activePage - 1), 100 * (activePage)).map((row, idx) => (
    <tr key={`${row['Name']}-${idx}`}>
      <td>{row['DistrictName']}</td>
      <td>{row['Duty']}</td>
      <td>{`$ ${row['SY2122'].toLocaleString()}`}</td>
    </tr>
  ));

  const numPages = Math.ceil(data.length / 100)
  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Individual Salaries</h2>
      <ScrollArea h={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
        <Table miw={700}>
          <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
            <tr>
              <th>District</th>
              <th>Position</th>
              <th>21-22 School Year Salary</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
      <Pagination value={activePage} onChange={setPage} total={numPages} />
    </div>
  );
}
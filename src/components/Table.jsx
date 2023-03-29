import { useState } from 'react';
import { createStyles, Table, ScrollArea, rem } from '@mantine/core';

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
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

// interface TableScrollAreaProps {
//   data: { name: string; email: string; company: string }[];
// }

export default function SalaryTable({ data }) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);

  const rows = data.slice(0,100).map((row, idx) => (
    <tr key={`${row['Name']}-${idx}`}>
      <td>{row['DistrictName']}</td>
      <td>{row['Duty']}</td>
      <td>{`$ ${row['SY2122'].toLocaleString()}`}</td>
    </tr>
  ));

  return (
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
  );
}
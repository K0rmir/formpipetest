import { useState, FC, ReactNode } from 'react';
import {
  Image,
  Table,
  NavLink,
  Group,
  Text,
  Button,
  Pagination,
  Paper,
  Select,
  Stack,
  LoadingOverlay,
  Tooltip,
} from '@mantine/core';
import { IconEye, IconArrowUp, IconArrowDown, IconEdit } from '@tabler/icons-react';
import { useUsersStore } from '../store/usersStore';
import { User } from '@/lib/interfaces.ts';

export function UsersTable() {
  const users = useUsersStore((state) => state.users);
  const visible = useUsersStore((state) => state.visible); // visible state from Zustand

  // Component specific state //
  const [active, setActive] = useState<number>(); // state for index of current active row expansion
  const [currentPage, setCurrentPage] = useState<number>(1); // active page for pagination, initialised at 1
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [usersPerPage, setUsersPerPage] = useState<string>('5');

  function sortUsers(usersToSort: User[], field: keyof User, direction: 'asc' | 'desc') {
    return [...users].sort((a, b) => {
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function handleSort(field: keyof User) {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortField(field);
    setSortDirection(isAsc ? 'desc' : 'asc');
  }

  const SortableTableHeader: FC<{ field: keyof User; children: ReactNode }> = ({
    field,
    children,
  }) => (
    <Table.Th onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
      {children}
      {sortField === field && (sortDirection === 'asc' ? <IconArrowUp /> : <IconArrowDown />)}
    </Table.Th>
  );

  let sortedUsers = users;
  if (sortField) {
    sortedUsers = sortUsers(users, sortField, sortDirection);
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  function handleUsersPerPage(value: string | null) {
    if (value) {
      setUsersPerPage(value);
    }
  }

  const lastUserIndex = currentPage * parseInt(usersPerPage, 10);
  const firstUserIndex = lastUserIndex - parseInt(usersPerPage, 10);
  const currentUsers = sortedUsers.slice(firstUserIndex, lastUserIndex);

  // Lines 65-73 > This implementation of pagination is fine for small datasets, however if working with a lot more data,
  // having the data paginated directly from the API would be better.
  // Values such as page num & users per page could be passed directly to api to fetch specific page data

  const rows = currentUsers.map((user, index) => (
    <Table.Tr key={user.name}>
      <Table.Td>
        <NavLink
          href="#"
          label={user.name}
          active={index === active}
          color="grape"
          onClick={() => setActive(index)}
        >
          <Group justify="center">
            <Text tt="capitalize">
              <Text component="span" fw={700}>
                Gender:{' '}
              </Text>
              {user.gender}
            </Text>
            <Text tt="capitalize">
              <Text component="span" fw={700}>
                Hair Colour:{' '}
              </Text>
              {user.hair}
            </Text>
            <Text tt="capitalize">
              <Text component="span" fw={700}>
                Eye Colour:{' '}
              </Text>
              {user.eyes}
            </Text>
            <Text tt="capitalize">
              <Text component="span" fw={700}>
                Glasses:{' '}
              </Text>
              {user ? (user.glasses ? 'Yes' : 'No') : 'Loading...'}
            </Text>
            <Image
              h={100}
              w={100}
              radius={'75%'}
              mr={75}
              src={`/uploads/${user.avatar}`}
              alt={`Avatar for ${user.name}`}
            />
            <Group>
              <Button
                variant="light"
                color="grape"
                size="md"
                radius="md"
                rightSection={<IconEye size={20} />}
                component="a"
                href={`/users/${user.id}`}
              >
                View User
              </Button>
              <Tooltip label="Currently Unavailable">
                <Button
                  variant="light"
                  color="grape"
                  size="md"
                  radius="md"
                  rightSection={<IconEdit size={20} />}
                  component="a"
                  disabled
                >
                  Edit User
                </Button>
              </Tooltip>
            </Group>
          </Group>
        </NavLink>
      </Table.Td>
      <Table.Td>{user.roles.join(' & ')}</Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Paper shadow="xl" radius="md" p="xl" pos={'relative'}>
        <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <Group justify="center">
          <Table horizontalSpacing="xl">
            <Table.Thead>
              <Table.Tr>
                <SortableTableHeader field="name">Name</SortableTableHeader>
                <Table.Th>Role</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <>{rows}</>
            </Table.Tbody>
          </Table>
          <Pagination.Root
            total={Math.ceil(users.length / parseInt(usersPerPage, 10))}
            onChange={handlePageChange}
            color="grape"
          >
            <Stack>
              <Select
                label="Users per page"
                data={['5', '10', '15']}
                defaultValue={'5'}
                value={usersPerPage}
                onChange={handleUsersPerPage}
                comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
              />
              <Group gap={5} justify="center">
                <Pagination.First />
                <Pagination.Previous />
                <Pagination.Items />
                <Pagination.Next />
                <Pagination.Last />
              </Group>
            </Stack>
          </Pagination.Root>
        </Group>
      </Paper>
    </>
  );
}

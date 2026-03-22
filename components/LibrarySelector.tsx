"use client";

import { Menu, UnstyledButton, Group, Text } from "@mantine/core";
import { IconChevronDown, IconLibrary } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LibraryDefinition } from "@/data/library-config";
import classes from "./LibrarySelector.module.css";

type LibrarySelectorProps = {
  libraries: LibraryDefinition[];
  currentLibraryId: string;
  defaultLibraryId: string;
};

export function LibrarySelector({
  libraries,
  currentLibraryId,
  defaultLibraryId,
}: LibrarySelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Don't show selector if only one library
  if (libraries.length <= 1) {
    return null;
  }

  const currentLibrary = libraries.find((lib) => lib.id === currentLibraryId);
  const displayName = currentLibrary?.name ?? currentLibrary?.id ?? "Library";

  const handleLibrarySelect = (libraryId: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (libraryId === defaultLibraryId) {
      params.delete("library");
    } else {
      params.set("library", libraryId);
    }

    const queryString = params.toString();
    const newPath = queryString ? `/?${queryString}` : "/";
    router.push(newPath);
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton className={classes.trigger}>
          <Group gap="xs">
            <IconLibrary size={16} stroke={1.5} />
            <Text size="sm" fw={500} truncate>
              {displayName}
            </Text>
            <IconChevronDown size={12} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Libraries</Menu.Label>
        {libraries.map((lib) => (
          <Menu.Item
            key={lib.id}
            onClick={() => handleLibrarySelect(lib.id)}
            className={lib.id === currentLibraryId ? classes.activeItem : undefined}
          >
            {lib.name ?? lib.id}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

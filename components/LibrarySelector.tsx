"use client";

import { ActionIcon, Group, Loader, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconRefresh } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { reloadLibrary } from "@/actions/reloadLibrary";
import { getLibraryImportErrorMessageKey } from "@/data/errors";
import type { LibraryDefinition } from "@/data/library-config";
import { useCurrentLibraryId } from "@/hooks/useCurrentLibrary";
import { useTranslations } from "@/i18n/client";
import { resolveErrorMessage } from "@/utils/resolve-error-message";

type LibrarySelectorProps = {
  libraries: LibraryDefinition[];
  defaultLibraryId: string;
};

export function LibrarySelector({
  libraries,
  defaultLibraryId,
}: LibrarySelectorProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isReloading, startReload] = useTransition();
  const urlLibraryId = useCurrentLibraryId();
  const currentLibraryId = urlLibraryId ?? defaultLibraryId;

  // Don't show selector if only one library
  if (libraries.length <= 1) {
    return null;
  }

  const handleLibrarySelect = (libraryId: string | null) => {
    if (!libraryId) return;
    router.push(`/library/${libraryId}`);
  };

  const handleReload = () => {
    startReload(async () => {
      try {
        const result = await reloadLibrary(currentLibraryId);

        if (result.ok) {
          router.refresh();
          return;
        }

        notifications.show({
          color: "red",
          title: t("common.notifications.librarySyncFailedTitle"),
          message: t(getLibraryImportErrorMessageKey(result.code)),
        });
      } catch (error) {
        notifications.show({
          color: "red",
          title: t("common.notifications.librarySyncFailedTitle"),
          message: resolveErrorMessage(
            error,
            t("common.notifications.librarySyncFailedMessage"),
          ),
        });
      }
    });
  };

  const reloadLabel = isReloading
    ? t("common.library.reloading")
    : t("common.library.reload");

  return (
    <Group gap={4} wrap="nowrap">
      <Select
        value={currentLibraryId}
        onChange={handleLibrarySelect}
        data={libraries.map((lib) => ({
          value: lib.id,
          label: lib.name ?? lib.id,
        }))}
        size="xs"
        w={140}
      />
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={handleReload}
        disabled={isReloading}
        aria-label={reloadLabel}
      >
        {isReloading ? (
          <Loader size={14} color="gray" />
        ) : (
          <IconRefresh size={14} stroke={1.5} />
        )}
      </ActionIcon>
    </Group>
  );
}

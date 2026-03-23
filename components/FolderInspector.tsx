"use client";

import { Table, Text } from "@mantine/core";
import type { Folder } from "@/data/types";
import { useTranslations } from "@/i18n/client";
import { formatFileSize } from "@/utils/item-details";
import classes from "./FolderInspector.module.css";

type FolderInspectorProps = {
  folder: Folder;
  totalSize: number;
};

export function FolderInspector({ folder, totalSize }: FolderInspectorProps) {
  const t = useTranslations("inspector");
  const sizeValue = formatFileSize(totalSize);

  return (
    <div className={classes.root}>
      <div className={classes.section}>
        <div className={classes.subsection}>
          <Text style={{ wordBreak: "break-all" }}>{folder.name}</Text>
        </div>

        {folder.description && (
          <div className={classes.subsection}>
            <Text className={classes.sectionTitle}>
              {t("folderProperties.description")}
            </Text>
            <div className={classes.description}>{folder.description}</div>
          </div>
        )}
      </div>

      <div className={classes.section}>
        <Text className={classes.sectionTitle}>{t("sections.properties")}</Text>
        <Table
          verticalSpacing="sm"
          horizontalSpacing="xs"
          className={classes.properties}
        >
          <tbody>
            <tr>
              <td className={classes.propertyLabel}>
                {t("folderProperties.items")}
              </td>
              <td className={classes.propertyValue}>{folder.itemCount}</td>
            </tr>
            {sizeValue && (
              <tr>
                <td className={classes.propertyLabel}>
                  {t("folderProperties.size")}
                </td>
                <td className={classes.propertyValue}>{sizeValue}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

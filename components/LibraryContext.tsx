"use client";

import { useSearchParams } from "next/navigation";
import React, {
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";

type LibraryContextType = {
  libraryId: string | null;
  defaultLibraryId: string | null;
  setLibraryId: (id: string) => void;
};

const LibraryContext = React.createContext<LibraryContextType | null>(null);

type LibraryProviderProps = {
  children: ReactNode;
  defaultLibraryId: string;
};

export function LibraryProvider({ children, defaultLibraryId }: LibraryProviderProps) {
  const searchParams = useSearchParams();
  const [libraryId, setLibraryId] = useState<string | null>(null);

  useEffect(() => {
    const libraryParam = searchParams.get("library");
    setLibraryId(libraryParam ?? defaultLibraryId);
  }, [searchParams, defaultLibraryId]);

  return (
    <LibraryContext.Provider value={{ libraryId, defaultLibraryId, setLibraryId }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return context;
}

export function useCurrentLibraryId(): string {
  const { libraryId, defaultLibraryId } = useLibrary();
  return libraryId ?? defaultLibraryId ?? "";
}

export function useIsDefaultLibrary(): boolean {
  const { libraryId, defaultLibraryId } = useLibrary();
  return libraryId === defaultLibraryId;
}

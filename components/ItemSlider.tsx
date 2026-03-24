"use client";

import { Keyboard, Virtual, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/virtual";
import "swiper/css/keyboard";
import { Anchor, CloseButton, Text } from "@mantine/core";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
} from "@tabler/icons-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ItemDetails, ItemPreview } from "@/data/types";
import { useInspectorState } from "@/stores/inspector-state";
import { classifyItemMedia } from "@/utils/item";
import AppHeader from "./AppHeader";
import { ItemSlideMedia } from "./item-media/ItemSlideMedia";
import classes from "./ItemSlider.module.css";

interface ItemSliderProps {
  initialItemId: string;
  libraryPath: string;
  items: ItemPreview[];
  dismiss: () => void;
}

export function ItemSlider({
  initialItemId,
  libraryPath,
  items,
  dismiss,
}: ItemSliderProps) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const initialIndex = useMemo(
    () => Math.max(itemIds.indexOf(initialItemId), 0),
    [initialItemId, itemIds],
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const swiperRef = useRef<SwiperType | null>(null);

  // ESC to dismiss
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dismiss]);

  const { inspectItem } = useInspectorState();
  // biome-ignore lint/correctness/useExhaustiveDependencies: depend on lifecycle
  useEffect(() => {
    return () => inspectItem(undefined);
  }, []);

  // Auto-inspect current item
  useEffect(() => {
    inspectItem(items[activeIndex].id);
  }, [inspectItem, items, activeIndex]);

  const playAndPauseVideo = useCallback(
    (swiper: SwiperType) => {
      if (!swiper.slides) return;
      for (const slide of swiper.slides) {
        const index = parseInt(slide.dataset.swiperSlideIndex ?? "", 10);
        if (Number.isNaN(index)) continue;
        const item = items[index];
        if (!item || item.duration === 0) continue;
        const video = slide.querySelector("video");
        if (video) {
          if (index === swiper.activeIndex) {
            video.play();
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      }
    },
    [items],
  );

  const handlePrevious = useCallback(() => {
    if (activeIndex === 0) return;
    swiperRef.current?.slidePrev();
  }, [activeIndex]);

  const handleNext = useCallback(() => {
    if (activeIndex === items.length - 1) return;
    swiperRef.current?.slideNext();
  }, [activeIndex, items.length]);

  const slides = useMemo(
    () =>
      items.map((item, index) => (
        <SwiperSlide key={item.id} virtualIndex={index}>
          <ItemSlideMedia
            item={item}
            libraryPath={libraryPath}
            classes={{
              urlContent: classes.urlContent,
              urlImage: classes.urlImage,
              urlMeta: classes.urlMeta,
              urlText: classes.urlText,
              video: classes.video,
              videoContent: classes.videoContent,
              videoFitbox: classes.videoFitbox,
            }}
          />
        </SwiperSlide>
      )),
    [items, libraryPath],
  );

  return (
    <>
      <AppHeader>
        <CloseButton icon={<IconArrowLeft stroke={1.2} />} onClick={dismiss} />
        <Text size="sm">
          {activeIndex + 1} / {items.length}
        </Text>
        <div className={classes.headerTrailing}>
          <CloseButton
            icon={<IconChevronLeft stroke={1.2} />}
            disabled={activeIndex === 0}
            onClick={handlePrevious}
            aria-label="Prev"
          />
          <CloseButton
            icon={<IconChevronRight stroke={1.2} />}
            disabled={activeIndex === items.length - 1}
            onClick={handleNext}
            aria-label="Next"
          />
        </div>
      </AppHeader>

      <Swiper
        modules={[Zoom, Virtual, Keyboard]}
        zoom={true}
        virtual
        keyboard={{
          enabled: true,
        }}
        spaceBetween={16}
        initialSlide={initialIndex}
        className={classes.swiper}
        tabIndex={0}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onActiveIndexChange={(swiper) => {
          const nextIndex = swiper.activeIndex;
          const nextItem = items[nextIndex];
          if (nextItem) {
            setActiveIndex(nextIndex);
          }
        }}
        onAfterInit={(swiper) => {
          swiperRef.current = swiper;
          requestAnimationFrame(() => {
            playAndPauseVideo(swiper);
          });
        }}
        onSlideChange={playAndPauseVideo}
      >
        {slides}
      </Swiper>
    </>
  );
}

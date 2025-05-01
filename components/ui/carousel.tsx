"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "size-8 rounded-full",
        // Remove absolute positioning when className is provided
        !className && orientation === "horizontal"
          ? "absolute top-1/2 -left-12 -translate-y-1/2"
          : !className && "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "size-8 rounded-full",
        // Remove absolute positioning when className is provided
        !className && orientation === "horizontal"
          ? "absolute top-1/2 -right-12 -translate-y-1/2"
          : !className && "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    // Force a more reliable slide count detection
    const updateSlideCount = () => {
      // Get the actual number of slides from DOM if API method fails
      const slides = document.querySelectorAll('[data-slot="carousel-item"]');
      setSlideCount(slides.length || api.slideNodes().length || 3);
    };

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    updateSlideCount();
    api.on("select", onSelect);
    api.on("reInit", updateSlideCount);
    onSelect(); // Initialize with current selection

    return () => {
      api.off("select", onSelect);
      api.off("reInit", updateSlideCount);
    };
  }, [api]);

  const handleDotClick = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  // Ensure we always render at least the number of carousel items we know we have
  const dotsToRender = Math.max(slideCount, 3); // You have 3 slides

  return (
    <div
      className={cn("flex justify-center items-center gap-2", className)}
      {...props}
    >
      {Array.from({ length: dotsToRender }).map((_, index) => (
        <button
          key={index}
          className={cn(
            "transition-all flex items-center",
            selectedIndex === index
              ? "h-2 w-8 rounded-full bg-green-600" // Updated height to match inactive dots
              : "h-2 w-2 rounded-full bg-[#898989]"
          )}
          onClick={() => handleDotClick(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

function CarouselDotsResponsive({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [is2XL, setIs2XL] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;

    // Function to update the selected index
    const updateSelectedIndex = () => {
      const currentIndex = api.selectedScrollSnap();
      setSelectedIndex(currentIndex);
    };

    // Function to check screen size
    const updateScreenSize = () => {
      setIs2XL(window.innerWidth >= 1536);
    };

    // Initial setup
    updateScreenSize();
    updateSelectedIndex();

    // Create a more robust event handler system
    const onSelectHandler = () => {
      window.requestAnimationFrame(updateSelectedIndex);
    };

    const onResizeHandler = () => {
      updateScreenSize();
    };

    // Listen to ALL relevant events
    api.on("select", onSelectHandler);
    api.on("settle", onSelectHandler);
    window.addEventListener("resize", onResizeHandler);

    return () => {
      api.off("select", onSelectHandler);
      api.off("settle", onSelectHandler);
      window.removeEventListener("resize", onResizeHandler);
    };
  }, [api]);

  // Click handler
  const handleDotClick = React.useCallback(
    (index: number) => {
      if (!api) return;

      // If 2XL screen and clicking second dot, go to slide 3
      const targetIndex = is2XL && index === 1 ? 3 : index;
      api.scrollTo(targetIndex);
    },
    [api, is2XL]
  );

  // Determine which indicators to show based on screen size
  const indicators = is2XL ? [0, 1, 2] : [0, 1, 2, 3, 4];

  // Calculate active indicator based on current slide
  const activeIndicatorIndex = React.useMemo(() => {
    // if (is2XL) {
    //   // On 2XL screens: 0 for slides 0-2, 1 for slide 3
    //   const result = selectedIndex >= 3 ? 1 : 0;
    //   console.log(`[2XL Mode] Selected slide: ${selectedIndex}, Active indicator: ${result}`);
    //   return result;
    // }
    // On smaller screens: direct mapping
    console.log(
      `[Regular Mode] Selected slide: ${selectedIndex}, Active indicator: ${selectedIndex}`
    );
    return selectedIndex;
  }, [selectedIndex, is2XL]);

  // Log when the component renders
  console.log(
    `Rendering indicators - selectedIndex: ${selectedIndex}, is2XL: ${is2XL}, activeIndicatorIndex: ${activeIndicatorIndex}`
  );

  return (
    <div
      className={cn("flex justify-center items-center gap-2", className)}
      {...props}
    >
      {indicators.map((_, index) => {
        // Log for each indicator during render
        console.log(
          `  Rendering indicator ${index}, active: ${
            index === activeIndicatorIndex
          }`
        );

        return (
          <button
            key={index}
            className={cn(
              "transition-all flex items-center",
              index === activeIndicatorIndex
                ? "h-2 w-8 rounded-full bg-green-600" // Updated height to match inactive dots
                : "h-2 w-2 rounded-full bg-[#898989]"
            )}
            onClick={() => {
              console.log(
                `Clicked indicator ${index}, will scroll to: ${
                  is2XL && index === 1 ? 3 : index
                }`
              );
              handleDotClick(index);
            }}
            aria-label={`Go to ${
              is2XL && index === 1 ? "card 4" : `slide ${index + 1}`
            }`}
          />
        );
      })}
    </div>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselDotsResponsive, // Add the new component to exports
};

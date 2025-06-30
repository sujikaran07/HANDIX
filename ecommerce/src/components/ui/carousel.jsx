import * as React from "react";
import { cn } from "../../lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Carousel root container
const Carousel = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("carousel", className)} {...props}>
    <div className="carousel-content">{children}</div>
  </div>
));
Carousel.displayName = "Carousel";

// Carousel content wrapper
const CarouselContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("carousel-content-wrapper", className)} {...props}>
    {children}
  </div>
));
CarouselContent.displayName = "CarouselContent";

// Carousel single item
const CarouselItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("carousel-item", className)} {...props}>
    {children}
  </div>
));
CarouselItem.displayName = "CarouselItem";

// Previous navigation button
const CarouselPrevious = ({ className, ...props }) => (
  <button className={cn("carousel-previous", className)} {...props}>
    <ChevronLeft className="h-5 w-5" />
    <span className="sr-only">Previous</span>
  </button>
);

// Next navigation button
const CarouselNext = ({ className, ...props }) => (
  <button className={cn("carousel-next", className)} {...props}>
    <ChevronRight className="h-5 w-5" />
    <span className="sr-only">Next</span>
  </button>
);

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
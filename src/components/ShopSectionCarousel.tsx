import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import ProductCard from "@/components/ProductCard";
import type { ProductSection } from "@/lib/productSections";

const ShopSectionCarousel = ({ section }: { section: ProductSection }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollState();
    api.on("select", updateScrollState);
    api.on("reInit", updateScrollState);

    return () => {
      api.off("select", updateScrollState);
      api.off("reInit", updateScrollState);
    };
  }, [api]);

  const productCountLabel = `${section.products.length} ${
    section.products.length === 1 ? "product" : "products"
  }`;
  const productKey = section.products.map((product) => product.id).join("|");

  useEffect(() => {
    if (!api) return;
    api.scrollTo(0, true);
  }, [api, productKey]);

  return (
    <section
      id={`shop-${section.id}`}
      aria-labelledby={`shop-${section.id}-heading`}
      className="scroll-mt-28"
    >
      <div className="mb-4 border-b border-border/70 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">{section.eyebrow}</p>
            <h3
              id={`shop-${section.id}-heading`}
              className="font-brand text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-[2rem]"
            >
              {section.title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden sm:block">
              <span className="meta-chip mt-0.5">{productCountLabel}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-border/80 bg-card/80 text-foreground shadow-sm hover:bg-primary/5 sm:h-8 sm:w-8"
                onClick={() => api?.scrollPrev()}
                disabled={!canScrollPrev}
                aria-label={`Previous ${section.title} products`}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-border/80 bg-card/80 text-foreground shadow-sm hover:bg-primary/5 sm:h-8 sm:w-8"
                onClick={() => api?.scrollNext()}
                disabled={!canScrollNext}
                aria-label={`Next ${section.title} products`}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-1 font-body text-sm leading-relaxed text-muted-foreground">
          {section.description}
          <span className="sr-only"> {productCountLabel}.</span>
        </p>
      </div>

      <Carousel
        setApi={setApi}
        opts={{ align: "start", containScroll: "trimSnaps" }}
        className="w-full"
        tabIndex={0}
        aria-label={`${section.title} products carousel`}
      >
        <CarouselContent className="-ml-3 sm:-ml-4">
          {section.products.map((product, index) => (
            <CarouselItem
              key={product.id}
              className="basis-[82%] pl-3 sm:basis-[46%] sm:pl-4 lg:basis-1/3"
              aria-label={`${index + 1} of ${section.products.length}`}
            >
              <ProductCard
                {...product}
                badgeLabel={section.badgeLabel}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default ShopSectionCarousel;

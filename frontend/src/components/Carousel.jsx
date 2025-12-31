import React, { useState, useEffect, useCallback } from "react";

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1544691560-fc2053d97726?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Luxury Furniture Auction",
      caption: "Exclusive Timepieces: Bidding Starts Soon",
    },
    {
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
      alt: "Modern Electronics",
      caption: "Upgrade Your Workspace: Top Tech Deals",
    },
    {
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      alt: "Fashion Collection",
      caption: "Designer Apparel: Rare Finds",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div id="default-carousel" className="relative max-w-7xl mx-auto py-4">
      {/* Carousel wrapper */}
      <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              className="w-full h-full object-cover"
              alt={slide.alt}
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Caption overlay with gradient */}
            <div
              className="absolute inset-0 flex items-end justify-center pb-8"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)",
              }}
            >
              <p className="text-white text-xl md:text-2xl font-semibold px-4 text-center">
                {slide.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Slider controls */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute top-1/2 -translate-y-1/2 left-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-gray-100 cursor-pointer group focus:outline-none shadow-lg"
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6 text-gray-800"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m15 19-7-7 7-7"
          />
        </svg>
        <span className="sr-only">Previous</span>
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="absolute top-1/2 -translate-y-1/2 right-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-gray-100 cursor-pointer group focus:outline-none shadow-lg"
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6 text-gray-800"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m9 5 7 7-7 7"
          />
        </svg>
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
};

export default Carousel;

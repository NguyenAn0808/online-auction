import React, { useState, useEffect } from "react";

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [
    "/images/sample.jpg",
    "/images/sample.jpg",
    "/images/sample.jpg",
    "/images/sample.jpg",
    "/images/sample.jpg",
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div id="default-carousel" className="relative max-w-7xl mx-auto py-4">
        {/* Carousel wrapper */}
        <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
          {images.map((image, index) => (
            <div
              key={index}
              className={`${
                index === currentSlide ? "block" : "hidden"
              } duration-700 ease-in-out`}
            >
              <img
                src={image}
                className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                alt={`Slide ${index + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Slider controls */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute top-1/2 -translate-y-1/2 left-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-gray-100 cursor-pointer group focus:outline-none"
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
          className="absolute top-1/2 -translate-y-1/2 right-4 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-gray-100 cursor-pointer group focus:outline-none"
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
    </>
  );
};

export default Carousel;

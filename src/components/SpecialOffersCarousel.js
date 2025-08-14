import React from "react";
import Slider from "react-slick";

export default function SpecialOffersCarousel({ theme }) {
  const offers = [
    {
      id: 1,
      title: "Buy 1 Get 1 Free",
      description: "On all cappuccinos this weekend!",
      img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
    },
    {
      id: 2,
      title: "20% Off Breakfast",
      description: "Enjoy fresh croissants and coffee for less.",
      img: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800",
    },
    {
      id: 3,
      title: "Free Dessert",
      description: "With any dinner meal ordered this Friday.",
      img: "https://t3.ftcdn.net/jpg/00/96/19/86/360_F_96198695_oyJg0I7ELpXI6608FI942PX9LlRRyEnd.jpg",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    swipeToSlide: true,
    speed: 800,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  // Determine theme styles
  const isDark = theme === "dark";
  const sectionBg = isDark ? "bg-gray-900" : "bg-amber-50";
  const headingText = isDark ? "text-white" : "text-gray-900";
  const overlayBg = isDark
    ? "bg-black bg-opacity-50"
    : "bg-black bg-opacity-40";

  return (
    <section className={`${sectionBg} py-8`} id="special-offers">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className={`text-3xl font-bold mb-6 text-center ${headingText}`}>
          Special Offers & Discounts
        </h2>
        <Slider {...settings}>
          {offers.map((offer) => (
            <div key={offer.id} className="p-4">
              <div className="relative rounded-lg overflow-hidden shadow-lg group">
                <img
                  src={offer.img}
                  alt={offer.title}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 ${overlayBg} flex flex-col items-center justify-center text-white text-center p-4`}
                >
                  <h3 className="text-2xl font-bold">{offer.title}</h3>
                  <p className="mt-2 text-lg">{offer.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

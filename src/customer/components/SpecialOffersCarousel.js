
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { fetchSpecialOffers } from "../../service/supabaseApi";


export default function SpecialOffersCarousel({ theme, userProfile }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      if (!userProfile) return;
      const today = new Date();
      const isBirthday =
        userProfile?.dob &&
        new Date(userProfile.dob).getDate() === today.getDate() &&
        new Date(userProfile.dob).getMonth() === today.getMonth();
      // Use tier system from ProfileModal logic
      const loyaltyPoints = userProfile.loyaltyPoints || 0;
      const loyaltyTiers = [
        { name: "Bronze", minPoints: 0 },
        { name: "Silver", minPoints: 500 },
        { name: "Gold", minPoints: 2000 },
        { name: "Diamond", minPoints: 5000 },
        { name: "Platinum", minPoints: 10000 },
      ];
      const currentTier =
        loyaltyTiers
          .slice()
          .reverse()
          .find((tier) => loyaltyPoints >= tier.minPoints) || loyaltyTiers[0];
      const fetched = await fetchSpecialOffers({
        userTier: currentTier.name,
        isBirthday,
      });
      setOffers(fetched);
      setLoading(false);
    }
    loadOffers();
  }, [userProfile]);

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

  if (loading) {
    return (
      <section className={`${sectionBg} py-8`} id="special-offers">
        <div className="max-w-5xl mx-auto px-6 text-center text-lg text-gray-400">Loading offers...</div>
      </section>
    );
  }

  if (!offers.length) {
    return (
      <section className={`${sectionBg} py-8`} id="special-offers">
        <div className="max-w-5xl mx-auto px-6 text-center text-lg text-gray-400">No special offers available right now.</div>
      </section>
    );
  }

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
                  src={offer.image}
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

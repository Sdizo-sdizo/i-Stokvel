import React, { useState } from "react";

export const IDEALS = [
  {
    id: 1,
    category: "Travel",
    title: "Durban Beach Holiday",
    image: "/ideals/durban.jpg",
    description: "Save R500 per member on group bookings for 5+ people.",
    price: "From R2,999 pp",
    partner: "UCount Travel",
    link: "/i-deals/1"
  },
  // ... more deals ...
];

const categories = ["All", ...Array.from(new Set(IDEALS.map(d => d.category)))];

const IDeals: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredDeals =
    selectedCategory === "All"
      ? IDEALS
      : IDEALS.filter(d => d.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Render your deals UI here */}
      <h1 className="text-2xl font-bold mb-4">i-Deals</h1>
      <div className="mb-4">
        {categories.map(category => (
          <button
            key={category}
            className={`mr-2 px-4 py-2 rounded ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredDeals.map(deal => (
          <div key={deal.id} className="bg-white rounded shadow p-4">
            <img src={deal.image} alt={deal.title} className="w-full h-40 object-cover rounded mb-2" />
            <h2 className="text-lg font-semibold">{deal.title}</h2>
            <p className="text-gray-600">{deal.description}</p>
            <div className="mt-2 text-sm text-blue-700">{deal.price}</div>
            <div className="text-xs text-gray-500">Partner: {deal.partner}</div>
            <a href={deal.link} className="inline-block mt-2 text-blue-600 hover:underline">
              View Deal
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IDeals;
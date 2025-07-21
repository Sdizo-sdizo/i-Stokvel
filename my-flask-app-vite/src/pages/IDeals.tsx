import React, { useState } from "react";
// import DealDetailModal from "../components/DealDetailModal"; // Remove if not used

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

// Optionally, define a type for better type safety
// type Deal = typeof IDEALS[number];
// const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

const IDeals: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  const filteredDeals =
    selectedCategory === "All"
      ? IDEALS
      : IDEALS.filter(d => d.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* ...rest of your UI remains unchanged... */}
    </div>
  );
};

export default IDeals;
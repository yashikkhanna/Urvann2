import { useState } from "react";
import categories from "../data/categories";
import "./FilterForm.css";

export default function FilterForm({ onApply }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply({ search, category, minPrice, maxPrice });
  };

  return (
    <form onSubmit={handleSubmit} className="filter-form">
      <h2 className="filter-heading">Filters</h2>

      <input
        type="text"
        placeholder="Search plants..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-input"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="filter-select"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Min Price"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className="filter-input"
      />

      <input
        type="number"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="filter-input"
      />

      <button type="submit" className="apply-btn">
        Apply Filters
      </button>
    </form>
  );
}

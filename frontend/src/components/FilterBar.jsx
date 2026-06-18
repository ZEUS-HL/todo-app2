import React from 'react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

function FilterBar({ filter, onChange }) {
  return (
    <div className="filter-bar">
      {FILTERS.map(f => (
        <button
          key={f.key}
          className={`filter-btn${filter === f.key ? ' active' : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;

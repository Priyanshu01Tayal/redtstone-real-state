import React, { useRef, useState, useEffect } from 'react';
import {
  Building2,
  Home,
  Sparkles,
  Layers,
  Store,
  Briefcase,
  Users,
  Compass,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

export const CATEGORIES = [
  { id: '', label: 'All Homes', icon: Compass, count: 'Delhi NCR' },
  { id: 'apartment', label: 'Apartments', icon: Building2, type: 'propertyType' },
  { id: 'villa', label: 'Luxury Villas', icon: Sparkles, type: 'propertyType' },
  { id: 'independent_house', label: 'Independent Houses', icon: Home, type: 'propertyType' },
  { id: 'residential_plot', label: 'Plots & Land', icon: Layers, type: 'propertyType' },
  { id: 'shop', label: 'Commercial', icon: Store, type: 'propertyType' },
  { id: 'office', label: 'Office Spaces', icon: Briefcase, type: 'propertyType' },
  { id: 'pg', label: 'PG & Co-living', icon: Users, type: 'propertyType' },
];

const CategoryBar = ({ selectedCategory, onSelectCategory, onOpenFilters, activeFilterCount = 0 }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border-b border-[#EBEBEB] sticky top-20 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Scroll Left Button (Desktop) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="hidden md:flex p-1.5 rounded-full border border-[#EBEBEB] hover:border-gray-400 bg-white shadow-sm hover:scale-105 transition shrink-0 z-10"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4 h-4 text-[#222222]" />
          </button>
        )}

        {/* Scrollable Categories List */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id || 'all'}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`group flex flex-col items-center justify-center space-y-1.5 pb-2 border-b-2 transition duration-200 shrink-0 cursor-pointer min-w-[64px] ${
                  isSelected
                    ? 'border-[#222222] text-[#222222]'
                    : 'border-transparent text-[#717171] hover:text-[#222222] hover:border-gray-300'
                }`}
              >
                <div
                  className={`p-1 transition-transform group-hover:scale-110 ${
                    isSelected ? 'text-[#C62828]' : 'text-gray-500 group-hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className={`text-[11px] whitespace-nowrap ${isSelected ? 'font-black' : 'font-semibold'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button (Desktop) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="hidden md:flex p-1.5 rounded-full border border-[#EBEBEB] hover:border-gray-400 bg-white shadow-sm hover:scale-105 transition shrink-0 z-10"
            aria-label="Next categories"
          >
            <ChevronRight className="w-4 h-4 text-[#222222]" />
          </button>
        )}

        {/* Filters Button (Airbnb Signature Pill Button) */}
        {onOpenFilters && (
          <div className="shrink-0 pl-2">
            <button
              type="button"
              onClick={onOpenFilters}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border transition text-xs font-bold ${
                activeFilterCount > 0
                  ? 'border-[#222222] bg-[#222222] text-white'
                  : 'border-[#EBEBEB] hover:border-[#222222] bg-white text-[#222222]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#C62828] text-white text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryBar;

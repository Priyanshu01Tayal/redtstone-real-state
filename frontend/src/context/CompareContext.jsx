import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [comparedProperties, setComparedProperties] = useState(() => {
    try {
      const saved = localStorage.getItem('redstone_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('redstone_compare', JSON.stringify(comparedProperties));
  }, [comparedProperties]);

  const addToCompare = (property) => {
    if (comparedProperties.some((p) => p._id === property._id)) return;
    if (comparedProperties.length >= 3) {
      alert('You can compare up to 3 properties at a time.');
      return;
    }
    setComparedProperties((prev) => [...prev, property]);
  };

  const removeFromCompare = (propertyId) => {
    setComparedProperties((prev) => prev.filter((p) => p._id !== propertyId));
  };

  const clearCompare = () => {
    setComparedProperties([]);
  };

  const isCompared = (propertyId) => {
    return comparedProperties.some((p) => p._id === propertyId);
  };

  return (
    <CompareContext.Provider
      value={{
        comparedProperties,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompared,
        isInCompare: isCompared,
        isCompareModalOpen,
        setIsCompareModalOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);

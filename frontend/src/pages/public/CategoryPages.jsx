import React from 'react';
import PropertyListingPage from './PropertyListingPage';

export const BuyPage = () => <PropertyListingPage defaultListingType="sale" title="Buy Properties" />;
export const RentPage = () => <PropertyListingPage defaultListingType="rent" title="Rent Properties" />;
export const CommercialPage = () => <PropertyListingPage defaultCategory="commercial" title="Commercial Real Estate" />;
export const ResidentialPage = () => <PropertyListingPage defaultCategory="residential" title="Residential Properties" />;

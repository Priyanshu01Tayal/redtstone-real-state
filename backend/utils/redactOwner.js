/**
 * Critical Privacy Protection Rule:
 * Public endpoints and client views MUST NEVER expose property owner personal contact info:
 * - owner name
 * - owner phone
 * - owner email
 * - owner personal address
 * - owner account details
 * 
 * Only assigned broker information should be presented.
 */
const sanitizePropertyForClient = (propertyDoc) => {
  if (!propertyDoc) return null;
  const property = propertyDoc.toObject ? propertyDoc.toObject() : { ...propertyDoc };

  // Strip owner personal details completely
  delete property.ownerId;
  delete property.ownerRequirements;

  return property;
};

const sanitizePropertiesList = (properties) => {
  return properties.map((prop) => sanitizePropertyForClient(prop));
};

module.exports = sanitizePropertyForClient;
module.exports.sanitizePropertyForClient = sanitizePropertyForClient;
module.exports.sanitizePropertiesList = sanitizePropertiesList;
module.exports.redactOwner = sanitizePropertyForClient;

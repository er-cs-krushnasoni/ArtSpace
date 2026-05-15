export const BUSINESS_TYPE_LABELS = {
  nail_art: {
    product: 'Nail Design',
    products: 'Nail Designs',
    delivery_option: 'Nail Kit Delivery',
    appointment: 'Nail Appointment',
    quiz_name: 'Nail Style Quiz',
    custom_order: 'Custom Nail Design',
    shop: 'Nail Shop',
    book_appointment: 'Book Nail Appointment',
  },
  mehendi: {
    product: 'Mehendi Design',
    products: 'Mehendi Designs',
    delivery_option: 'DIY Mehendi Kit',
    appointment: 'Artist Visit',
    quiz_name: 'Mehendi Style Quiz',
    custom_order: 'Custom Mehendi',
    shop: 'Mehendi Gallery',
    book_appointment: 'Book Artist Visit',
  },
  jewellery: {
    product: 'Jewellery Piece',
    products: 'Jewellery Collection',
    delivery_option: 'Home Delivery',
    appointment: 'Try & Buy',
    quiz_name: 'Jewellery Style Quiz',
    custom_order: 'Custom Design',
    shop: 'Jewellery Shop',
    book_appointment: 'Book Try & Buy',
  },
  cake: {
    product: 'Cake Design',
    products: 'Cake Designs',
    delivery_option: 'Home Delivery',
    appointment: 'Custom Order',
    quiz_name: null,
    custom_order: 'Custom Cake',
    shop: 'Cake Gallery',
    book_appointment: 'Place Custom Order',
  },
  generic: {
    product: 'Product',
    products: 'Products',
    delivery_option: 'Delivery',
    appointment: 'Appointment',
    quiz_name: 'Style Quiz',
    custom_order: 'Custom Order',
    shop: 'Shop',
    book_appointment: 'Book Appointment',
  },
};

/**
 * Returns the label set for the given business type.
 * Falls back to 'generic' if the type is not found.
 * @param {string} businessType
 * @returns {object}
 */
export const getLabels = (businessType) => {
  return BUSINESS_TYPE_LABELS[businessType] || BUSINESS_TYPE_LABELS.generic;
};

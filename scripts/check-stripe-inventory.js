require('dotenv').config({ path: '.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkInventory() {
  try {
    // Try to get the product
    const product = await stripe.products.retrieve('prod_limited_edition_card');
    
    console.log('Product found:');
    console.log('ID:', product.id);
    console.log('Name:', product.name);
    console.log('Metadata:', product.metadata);
    console.log('Current inventory:', product.metadata.inventory || 'Not set');
    
    // Also check for display case
    try {
      const displayCase = await stripe.products.retrieve('prod_acrylic_display_case');
      console.log('\nDisplay Case found:');
      console.log('ID:', displayCase.id);
      console.log('Name:', displayCase.name);
      console.log('Metadata:', displayCase.metadata);
      console.log('Current inventory:', displayCase.metadata.inventory || 'Not set');
    } catch (e) {
      console.log('\nDisplay case product not found');
    }
    
  } catch (error) {
    if (error.code === 'resource_missing') {
      console.log('Product not found in Stripe. It will be created with default inventory of 1000.');
      console.log('\nTo set the inventory to 472, you can either:');
      console.log('1. Let the app create it first by visiting the site');
      console.log('2. Or I can create a script to set it up with 472 inventory');
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkInventory();
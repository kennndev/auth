import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import crypto from 'crypto';

    const stripe = getStripeServer('platform'); // or 'market'


// Configuration constants
const PRODUCT_CONFIG = {
  LIMITED_EDITION_PRODUCT_ID: 'prod_limited_edition_card',
  DEFAULT_INVENTORY: 472,
  PRICE_PER_UNIT: 4900, // $49.00 in cents
  DISPLAY_CASE_PRODUCT_ID: 'prod_acrylic_display_case',
  DISPLAY_CASE_DEFAULT_INVENTORY: 5000,
  DISPLAY_CASE_PRICE_PER_UNIT: 1900, // $19.00 in cents
  CUSTOM_CARD_PRODUCT_ID: 'prod_custom_card',
  CUSTOM_CARD_PRICE_PER_UNIT: 900, // $9.00 in cents
} as const;



/**
 * Validate CSRF tokens for App Router
 */
function validateCSRFForAppRouter(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [key, value] = cookie.trim().split('=');
      return [key, value];
    })
  );
  const cookieToken = cookies['csrf_token'] || null;
  const headerToken = request.headers.get('x-csrf-token') || null;
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  if (cookieToken.length !== headerToken.length) {
    return false;
  }
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken, 'hex'),
      Buffer.from(headerToken, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * GET handler for fetching inventory and pricing information
 */
export async function GET() {
  try {
    // Get or create the limited edition product
    let product;
    
    try {
      // Try to retrieve existing product
      product = await stripe.products.retrieve(PRODUCT_CONFIG.LIMITED_EDITION_PRODUCT_ID);
    } catch {
      // Product doesn't exist, create it
      console.log('Creating limited edition product...');
      product = await stripe.products.create({
        id: PRODUCT_CONFIG.LIMITED_EDITION_PRODUCT_ID,
        name: 'Limited Edition Cardify Card',
        description: 'Exclusive limited edition collectible card',
        images: ['https://your-domain.com/card_back_1.webp'], // Update with actual domain
        metadata: {
          inventory: PRODUCT_CONFIG.DEFAULT_INVENTORY.toString(),
          price_per_unit: PRODUCT_CONFIG.PRICE_PER_UNIT.toString(),
          version: '1', // Initialize version for optimistic locking
          created_at: new Date().toISOString(),
          type: 'limited_edition'
        }
      });
    }

    // Get or create the display case product
    let displayCaseProduct;
    
    try {
      // Try to retrieve existing display case product
      displayCaseProduct = await stripe.products.retrieve(PRODUCT_CONFIG.DISPLAY_CASE_PRODUCT_ID);
    } catch {
      // Product doesn't exist, create it
      console.log('Creating display case product...');
      displayCaseProduct = await stripe.products.create({
        id: PRODUCT_CONFIG.DISPLAY_CASE_PRODUCT_ID,
        name: 'Acrylic Display Case',
        description: 'Premium acrylic display case for collectible cards',
        images: ['https://your-domain.com/display_case.webp'], // Update with actual domain
        metadata: {
          inventory: PRODUCT_CONFIG.DISPLAY_CASE_DEFAULT_INVENTORY.toString(),
          price_per_unit: PRODUCT_CONFIG.DISPLAY_CASE_PRICE_PER_UNIT.toString(),
          version: '1', // Initialize version for optimistic locking
          created_at: new Date().toISOString(),
          type: 'display_case'
        }
      });
    }

    // Extract inventory and pricing from product metadata
    const inventory = parseInt(product.metadata.inventory || PRODUCT_CONFIG.DEFAULT_INVENTORY.toString(), 10);
    const pricePerUnit = parseInt(product.metadata.price_per_unit || PRODUCT_CONFIG.PRICE_PER_UNIT.toString(), 10);
    
    // Extract display case inventory and pricing
    const displayCaseInventory = parseInt(displayCaseProduct.metadata.inventory || PRODUCT_CONFIG.DISPLAY_CASE_DEFAULT_INVENTORY.toString(), 10);
    const displayCasePricePerUnit = parseInt(displayCaseProduct.metadata.price_per_unit || PRODUCT_CONFIG.DISPLAY_CASE_PRICE_PER_UNIT.toString(), 10);
    
    // Get or create custom card product
    let customCardProduct;
    
    try {
      // Try to retrieve existing custom card product
      customCardProduct = await stripe.products.retrieve(PRODUCT_CONFIG.CUSTOM_CARD_PRODUCT_ID);
    } catch {
      // Product doesn't exist, create it
      console.log('Creating custom card product...');
      customCardProduct = await stripe.products.create({
        id: PRODUCT_CONFIG.CUSTOM_CARD_PRODUCT_ID,
        name: 'Custom Cardify Card',
        description: 'Custom trading card with your own artwork',
        images: ['https://your-domain.com/custom_card_placeholder.webp'], // Update with actual domain
        metadata: {
          price_per_unit: PRODUCT_CONFIG.CUSTOM_CARD_PRICE_PER_UNIT.toString(),
          created_at: new Date().toISOString(),
          type: 'custom_card'
        }
      });
    }
    
    // Extract custom card pricing
    const customCardPricePerUnit = parseInt(customCardProduct.metadata.price_per_unit || PRODUCT_CONFIG.CUSTOM_CARD_PRICE_PER_UNIT.toString(), 10);
    
    // Calculate pricing tiers (bulk discounts)
    const pricingTiers = [
      { quantity: 1, pricePerUnit, totalPrice: pricePerUnit, discount: 0 },
      { quantity: 5, pricePerUnit: Math.floor(pricePerUnit * 0.95), totalPrice: Math.floor(pricePerUnit * 0.95 * 5), discount: 5 },
      { quantity: 10, pricePerUnit: Math.floor(pricePerUnit * 0.90), totalPrice: Math.floor(pricePerUnit * 0.90 * 10), discount: 10 },
      { quantity: 25, pricePerUnit: Math.floor(pricePerUnit * 0.85), totalPrice: Math.floor(pricePerUnit * 0.85 * 25), discount: 15 },
    ];
    
    // Calculate custom card pricing tiers
    const customCardPricingTiers = [
      { quantity: 1, pricePerUnit: customCardPricePerUnit, totalPrice: customCardPricePerUnit, discount: 0 },
      { quantity: 5, pricePerUnit: Math.floor(customCardPricePerUnit * 0.95), totalPrice: Math.floor(customCardPricePerUnit * 0.95 * 5), discount: 5 },
      { quantity: 10, pricePerUnit: Math.floor(customCardPricePerUnit * 0.90), totalPrice: Math.floor(customCardPricePerUnit * 0.90 * 10), discount: 10 },
      { quantity: 25, pricePerUnit: Math.floor(customCardPricePerUnit * 0.85), totalPrice: Math.floor(customCardPricePerUnit * 0.85 * 25), discount: 15 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        inventory,
        pricePerUnit: pricePerUnit / 100, // Convert to dollars for display
        pricingTiers: pricingTiers.map(tier => ({
          ...tier,
          pricePerUnit: tier.pricePerUnit / 100,
          totalPrice: tier.totalPrice / 100,
        })),
        displayCases: {
          inventory: displayCaseInventory,
          pricePerUnit: displayCasePricePerUnit / 100, // Convert to dollars for display
          product: {
            id: displayCaseProduct.id,
            name: displayCaseProduct.name,
            description: displayCaseProduct.description,
            images: displayCaseProduct.images,
          }
        },
        customCard: {
          pricePerUnit: customCardPricePerUnit / 100, // Convert to dollars for display
          pricingTiers: customCardPricingTiers.map(tier => ({
            ...tier,
            pricePerUnit: tier.pricePerUnit / 100,
            totalPrice: tier.totalPrice / 100,
          })),
          product: {
            id: customCardProduct.id,
            name: customCardProduct.name,
            description: customCardProduct.description,
            images: customCardProduct.images,
          }
        },
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
        },
        lastUpdated: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch inventory data',
        code: 'INVENTORY_FETCH_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for updating inventory (admin only)
 * This would typically be protected by admin authentication
 */
export async function POST(request: NextRequest) {
  // Apply CSRF protection for write operations
  if (!validateCSRFForAppRouter(request)) {
    return NextResponse.json(
      { 
        success: false,
        error: 'CSRF validation failed',
        code: 'CSRF_INVALID'
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { inventory, pricePerUnit } = body;

    // Validate input
    if (typeof inventory !== 'number' || inventory < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid inventory value',
          code: 'INVALID_INVENTORY'
        },
        { status: 400 }
      );
    }

    if (pricePerUnit && (typeof pricePerUnit !== 'number' || pricePerUnit <= 0)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid price per unit',
          code: 'INVALID_PRICE'
        },
        { status: 400 }
      );
    }

    // Get current product to access version
    const currentProduct = await stripe.products.retrieve(PRODUCT_CONFIG.LIMITED_EDITION_PRODUCT_ID);
    const currentVersion = parseInt(currentProduct.metadata.version || '0', 10);

    // Update product metadata with version increment
    const updateData: Stripe.ProductUpdateParams = {
      metadata: {
        ...currentProduct.metadata,
        inventory: inventory.toString(),
        version: (currentVersion + 1).toString(),
        updated_at: new Date().toISOString(),
        ...(pricePerUnit && { price_per_unit: Math.floor(pricePerUnit * 100).toString() }) // Convert to cents
      }
    };

    const product = await stripe.products.update(
      PRODUCT_CONFIG.LIMITED_EDITION_PRODUCT_ID,
      updateData
    );

    return NextResponse.json({
      success: true,
      data: {
        inventory: parseInt(product.metadata.inventory, 10),
        pricePerUnit: parseInt(product.metadata.price_per_unit, 10) / 100,
        updated: true,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update inventory',
        code: 'INVENTORY_UPDATE_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for decrementing inventory (used after successful purchases)
 * Uses optimistic locking to prevent race conditions
 */
export async function PATCH(request: NextRequest) {
  // Apply CSRF protection
  if (!validateCSRFForAppRouter(request)) {
    return NextResponse.json(
      { 
        success: false,
        error: 'CSRF validation failed',
        code: 'CSRF_INVALID'
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { decrementBy } = body;

    if (typeof decrementBy !== 'number' || decrementBy <= 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid decrement value',
          code: 'INVALID_DECREMENT'
        },
        { status: 400 }
      );
    }

    // Implement optimistic locking with retry mechanism
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 100; // Start with 100ms, exponential backoff
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Get current inventory with version
        const product = await stripe.products.retrieve(PRODUCT_CONFIG.LIMITED_EDITION_PRODUCT_ID);
        const currentInventory = parseInt(product.metadata.inventory || '0', 10);
        const currentVersion = parseInt(product.metadata.version || '0', 10);

        if (currentInventory < decrementBy) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Insufficient inventory',
              code: 'INSUFFICIENT_INVENTORY',
              currentInventory
            },
            { status: 400 }
          );
        }

        const newInventory = currentInventory - decrementBy;
        const newVersion = currentVersion + 1;

        // Atomic update with version check
        // If another request modified the product, this will fail with the version mismatch
        await stripe.products.update(
          PRODUCT_CONFIG.LIMITED_EDITION_PRODUCT_ID,
          {
            metadata: {
              ...product.metadata,
              inventory: newInventory.toString(),
              version: newVersion.toString(),
              updated_at: new Date().toISOString(),
              last_decrement_by: decrementBy.toString(),
            }
          }
        );

        // Verify the update was atomic by checking if version matches expectation
        const verificationProduct = await stripe.products.retrieve(PRODUCT_CONFIG.LIMITED_EDITION_PRODUCT_ID);
        const actualVersion = parseInt(verificationProduct.metadata.version || '0', 10);
        
        if (actualVersion !== newVersion) {
          // Version mismatch detected - retry
          if (attempt < MAX_RETRIES - 1) {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));
            continue;
          } else {
            throw new Error('Failed to acquire atomic lock after retries');
          }
        }

        // Success - atomic operation completed
        return NextResponse.json({
          success: true,
          data: {
            previousInventory: currentInventory,
            newInventory,
            decrementBy,
            version: newVersion,
            attempt: attempt + 1,
            timestamp: new Date().toISOString(),
          }
        });

      } catch (retryError) {
        if (attempt < MAX_RETRIES - 1) {
          // Exponential backoff before retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));
          continue;
        } else {
          throw retryError;
        }
      }
    }

    // Should never reach here
    throw new Error('Max retries exceeded');

  } catch (error) {
    console.error('Error decrementing inventory:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to decrement inventory',
        code: 'INVENTORY_DECREMENT_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    { status: 405 }
  );
} 
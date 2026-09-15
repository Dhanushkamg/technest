import { test, expect } from '@playwright/test';

test.describe('Guest Checkout Flow', () => {
  test('should allow a guest to add a product to cart and checkout', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Ensure homepage loaded
    await expect(page.locator('text=TechNest')).toBeVisible();

    // Click on the first product card (assuming there's a product available)
    // Wait for product cards to load
    const firstProduct = page.locator('a[href^="/product/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    
    // Click on the product
    await firstProduct.click();
    
    // Wait for the product detail page to load
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
    
    // Add to cart
    await page.locator('button:has-text("Add to Cart")').click();
    
    // Wait for toast or cart update
    await expect(page.locator('text=Added to cart')).toBeVisible();

    // Navigate to Cart
    await page.goto('/cart');
    
    // Ensure cart has items
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
    await expect(page.locator('text=Checkout')).toBeVisible();
    
    // Click checkout
    await page.locator('button:has-text("Checkout")').click();
    
    // Fill out guest checkout form
    await page.fill('input[name="fullName"]', 'Test Guest');
    await page.fill('input[name="guestEmail"]', 'guest@example.com');
    await page.fill('input[name="phoneNumber"]', '1234567890');
    await page.fill('input[name="addressLine1"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="postalCode"]', '12345');
    await page.fill('input[name="country"]', 'Test Country');
    
    // We stop here so we don't actually trigger the payment gateway in E2E unless mock is set up.
    await expect(page.locator('button:has-text("Place Order")')).toBeVisible();
  });
});

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/upload');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Get current heights
  const leftPanelHeight = await page.locator('.lg\\:col-span-3').boundingBox();
  const rightPanelHeight = await page.locator('.lg\\:col-span-2').boundingBox();
  
  console.log('Left panel height:', leftPanelHeight?.height);
  console.log('Right panel height:', rightPanelHeight?.height);
  console.log('Height difference:', (rightPanelHeight?.height || 0) - (leftPanelHeight?.height || 0));
  
  // Get specific element heights
  const uploadAreaHeight = await page.locator('[data-testid="upload-area"], .space-y-4').first().boundingBox();
  const finalizeCardHeight = await page.locator('text=Finalize').locator('..').locator('..').locator('..').boundingBox();
  
  console.log('Upload area height:', uploadAreaHeight?.height);
  console.log('Finalize card height:', finalizeCardHeight?.height);
  
  await browser.close();
})();
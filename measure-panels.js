const { chromium } = require('playwright');

async function measurePanels() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the upload page
    await page.goto('http://localhost:3000/upload');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Get measurements
    const measurements = await page.evaluate(() => {
      const leftPanel = document.querySelector('.lg\\:col-span-3');
      const rightPanel = document.querySelector('.lg\\:col-span-2');
      const uploadArea = document.querySelector('[data-testid="upload-area"]') || 
                        document.querySelector('.border-dashed') ||
                        document.querySelector('.drag-drop-area');
      
      const results = {
        leftPanel: null,
        rightPanel: null,
        uploadArea: null,
        heightDifference: null,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
      
      if (leftPanel) {
        const rect = leftPanel.getBoundingClientRect();
        results.leftPanel = {
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom,
          offsetHeight: leftPanel.offsetHeight,
          scrollHeight: leftPanel.scrollHeight
        };
      }
      
      if (rightPanel) {
        const rect = rightPanel.getBoundingClientRect();
        results.rightPanel = {
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom,
          offsetHeight: rightPanel.offsetHeight,
          scrollHeight: rightPanel.scrollHeight
        };
      }
      
      if (uploadArea) {
        const rect = uploadArea.getBoundingClientRect();
        results.uploadArea = {
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom,
          offsetHeight: uploadArea.offsetHeight,
          scrollHeight: uploadArea.scrollHeight
        };
      }
      
      // Calculate height difference
      if (results.leftPanel && results.rightPanel) {
        results.heightDifference = results.leftPanel.height - results.rightPanel.height;
      }
      
      return results;
    });
    
    console.log('Panel Measurements:');
    console.log('==================');
    console.log(`Viewport: ${measurements.viewport.width}x${measurements.viewport.height}`);
    console.log('');
    
    if (measurements.leftPanel) {
      console.log('Left Panel (.lg:col-span-3):');
      console.log(`  Height: ${measurements.leftPanel.height}px`);
      console.log(`  Offset Height: ${measurements.leftPanel.offsetHeight}px`);
      console.log(`  Scroll Height: ${measurements.leftPanel.scrollHeight}px`);
      console.log(`  Top: ${measurements.leftPanel.top}px`);
      console.log(`  Bottom: ${measurements.leftPanel.bottom}px`);
    } else {
      console.log('Left Panel: NOT FOUND');
    }
    
    console.log('');
    
    if (measurements.rightPanel) {
      console.log('Right Panel (.lg:col-span-2):');
      console.log(`  Height: ${measurements.rightPanel.height}px`);
      console.log(`  Offset Height: ${measurements.rightPanel.offsetHeight}px`);
      console.log(`  Scroll Height: ${measurements.rightPanel.scrollHeight}px`);
      console.log(`  Top: ${measurements.rightPanel.top}px`);
      console.log(`  Bottom: ${measurements.rightPanel.bottom}px`);
    } else {
      console.log('Right Panel: NOT FOUND');
    }
    
    console.log('');
    
    if (measurements.uploadArea) {
      console.log('Upload Area:');
      console.log(`  Height: ${measurements.uploadArea.height}px`);
      console.log(`  Offset Height: ${measurements.uploadArea.offsetHeight}px`);
      console.log(`  Scroll Height: ${measurements.uploadArea.scrollHeight}px`);
      console.log(`  Top: ${measurements.uploadArea.top}px`);
      console.log(`  Bottom: ${measurements.uploadArea.bottom}px`);
    } else {
      console.log('Upload Area: NOT FOUND');
    }
    
    console.log('');
    
    if (measurements.heightDifference !== null) {
      console.log(`Height Difference (Left - Right): ${measurements.heightDifference}px`);
      if (measurements.heightDifference > 0) {
        console.log('Left panel is taller than right panel');
      } else if (measurements.heightDifference < 0) {
        console.log('Right panel is taller than left panel');
      } else {
        console.log('Panels are the same height');
      }
    }
    
    // Get additional element information
    const additionalInfo = await page.evaluate(() => {
      const leftPanel = document.querySelector('.lg\\:col-span-3');
      const rightPanel = document.querySelector('.lg\\:col-span-2');
      
      const info = {
        leftPanelChildren: [],
        rightPanelChildren: []
      };
      
      if (leftPanel) {
        Array.from(leftPanel.children).forEach((child, index) => {
          const rect = child.getBoundingClientRect();
          info.leftPanelChildren.push({
            index,
            tagName: child.tagName,
            className: child.className,
            height: rect.height,
            offsetHeight: child.offsetHeight
          });
        });
      }
      
      if (rightPanel) {
        Array.from(rightPanel.children).forEach((child, index) => {
          const rect = child.getBoundingClientRect();
          info.rightPanelChildren.push({
            index,
            tagName: child.tagName,
            className: child.className,
            height: rect.height,
            offsetHeight: child.offsetHeight
          });
        });
      }
      
      return info;
    });
    
    console.log('\nLeft Panel Children:');
    additionalInfo.leftPanelChildren.forEach(child => {
      console.log(`  ${child.index}: ${child.tagName} (${child.height}px) - ${child.className}`);
    });
    
    console.log('\nRight Panel Children:');
    additionalInfo.rightPanelChildren.forEach(child => {
      console.log(`  ${child.index}: ${child.tagName} (${child.height}px) - ${child.className}`);
    });
    
    // Wait a moment to see the page
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('Error measuring panels:', error);
  } finally {
    await browser.close();
  }
}

measurePanels();
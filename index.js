const express = require('express')
const puppeteer = require('puppeteer')
const fs = require('fs')

const app = express()
const port = 3000

async function scrapeData() {
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()

    // Navigate to the page
    await page.goto('https://in.tradingview.com/crypto-screener/')

    // Wait for the table to load (you might need to adjust the selector)
    await page.waitForSelector('.tv-screener-table__result-row')

    // Extract data from the page
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll('.tv-screener-table__result-row')
      const scrapedData = []

      rows.forEach((row) => {
        const name = row.querySelector('.tv-screener__symbol').innerText.trim()
        const close = row
          .querySelector('[data-field-key="close"] span')
          .innerText.trim()
        // ... extract other fields similarly

        scrapedData.push({ name, close /*, ... other fields */ })
      })

      return scrapedData
    })

    // Save the scraped data to a JSON file
    const outputFile = 'scraped-data.json'
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8')

    console.log('Scraped data saved to', outputFile)

    // Close the browser
    await browser.close()

    return data
  } catch (error) {
    console.error('Error scraping data:', error)
    throw error
  }
}

app.get('/', async (req, res) => {
  try {
    // Scrape data with Puppeteer
    const data = await scrapeData()

    // Send the scraped data as a JSON response
    res.json({ data, message: 'Scraped data successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

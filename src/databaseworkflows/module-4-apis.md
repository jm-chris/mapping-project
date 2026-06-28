---
layout: single
title: "Module 4: Calling Open Data APIs"
permalink: /databaseworkflows/module-4-apis/
toc: true
toc_sticky: true
classes: wide article-page
sidebar:
  nav: "main_sidebar"
header:
    overlay_image: /assets/images/mp_hero_grid_layered_slate.png
---

## Introduction

Much of the foundational data for China studies research—biographies, historical geography, and bibliographic records—already exists in open databases. Instead of manually searching these websites and copying results one by one, researchers can use Application Programming Interfaces (APIs) to query these databases programmatically and download structured data directly into a spreadsheet.

This module introduces the open data APIs most relevant to China studies and demonstrates how to use an LLM coding agent to write the retrieval scripts, allowing researchers to gather massive datasets without prior programming experience.

## Key APIs for China Studies

### 1. China Biographical Database (CBDB)
The [CBDB](https://cbdb.hsites.harvard.edu/) is the largest prosopographical database for the study of pre-20th century Chinese history, containing records for over 500,000 individuals [1]. Its API allows you to retrieve complete biographical profiles—including kinship networks, office holding, and social associations—on the fly.

**API Capabilities:** You can query by CBDB ID or by name (Chinese characters or Pinyin). The API returns data in either HTML or JSON format [2].
**Example Query:** `https://cbdb.fas.harvard.edu/cbdbapi/person.php?name=王安石&o=json`

### 2. China Historical Geographic Information System (CHGIS)
The [CHGIS](https://chgis.fas.harvard.edu/) provides a base GIS platform tracking the administrative geography of Chinese history from 221 BCE to 1911 CE [3]. While researchers often download the full shapefiles, the CHGIS data can also be queried to resolve historical place names to specific latitude/longitude coordinates and track their changes over time.

### 3. Wikidata and SPARQL
Wikidata is the structured data backend of Wikipedia. It contains an enormous amount of data on Chinese history, literature, and geography. Unlike standard REST APIs, Wikidata is queried using a language called SPARQL [4]. SPARQL allows for highly complex, relational queries (e.g., "Find all people born in Hangzhou during the Song dynasty who authored a book").

## Using an LLM to Write API Scripts

You do not need to know how to write Python or SPARQL to use these APIs. You can use an LLM (like ChatGPT-4o or Claude 3.5 Sonnet) as a coding agent to write the scripts for you. 

The key is writing a highly specific prompt that provides the LLM with the API documentation and your exact data requirements.

### Example Workflow: Querying CBDB for a List of Names

Suppose you have a CSV file containing 50 names of Ming dynasty officials, and you want to retrieve their birth years, index years, and native places from CBDB.

**Step 1: Write the Prompt for the LLM**
Provide the LLM with your goal, the input format, the desired output format, and the API documentation.

> **Prompt:**
> "I am a historian working with a list of Chinese names in a file called `ming_officials.csv` (column header: 'Name'). I need a Python script that reads this list, queries the China Biographical Database (CBDB) API for each name, and saves the results to a new CSV file.
> 
> Here is the CBDB API documentation for querying by name and returning JSON:
> `https://cbdb.fas.harvard.edu/cbdbapi/person.php?name=[NAME]&o=json`
> 
> The script should:
> 1. Loop through the names in the CSV.
> 2. Make a GET request to the API for each name.
> 3. Parse the JSON response to extract the 'EngName', 'ChName', 'IndexYear', and 'NativePlace'.
> 4. Handle errors gracefully (e.g., if the API returns no data for a name, write 'Not Found' in the output).
> 5. Include a 1-second delay between requests to avoid overloading the server.
> 6. Save the output to `cbdb_results.csv`.
> Please provide the complete, runnable Python code."

**Step 2: Run the Generated Code**
The LLM will generate a Python script using the `requests` and `pandas` libraries. You can run this script in your terminal or a Jupyter Notebook. The script will systematically query the database and compile your dataset in minutes.

### Example Workflow: Querying Wikidata with SPARQL

Writing SPARQL queries manually is notoriously difficult due to Wikidata's complex property (P) and item (Q) numbering system. LLMs are exceptionally good at translating natural language requests into valid SPARQL.

> **Prompt:**
> "Write a SPARQL query for the Wikidata Query Service that finds all Chinese emperors of the Ming dynasty. For each emperor, return their English name, Chinese name, date of birth, date of death, and temple name. Please provide only the SPARQL code."

You can copy the generated code directly into the [Wikidata Query Service interface](https://query.wikidata.org/), run it, and download the results as a CSV.

## Handling Romanization and Normalization

When querying APIs, particularly by name, you will inevitably encounter the normalization issues discussed in [Module 1](/databaseworkflows/module-1-script-handling/). 

*   **Pinyin vs. Wade-Giles:** If your source data uses Wade-Giles but the API expects Pinyin, you must convert your list before querying. You can ask your LLM coding agent to add a conversion step to your Python script using a lookup dictionary.
*   **Variant Characters:** If querying by Chinese characters, an API may return no results if you use a variant character (e.g., 為) while the database uses the standard form (爲). Always normalize your input data to the standard expected by the specific database before running batch API calls.

## When There is No API: Web Scraping

If a database does not offer an API but displays structured data on its web pages, you can use Python libraries like `BeautifulSoup` to "scrape" the data. 

You can use the exact same LLM-assisted workflow for scraping. Simply provide the LLM with the URL of the page and a snippet of the page's HTML source code, and ask it to write a script that extracts the specific text fields you need.

---

## References

[1] Bol, Peter. "The China Biographical Database (CBDB): An Introduction." *The Digital Orientalist*, April 30, 2024. https://digitalorientalist.com/2024/04/30/the-china-biographical-database-cbdb-an-introduction-and-conversation-with-professor-peter-bol/

[2] Harvard University. "CBDB API Documentation." Accessed June 27, 2026. https://cbdb.hsites.harvard.edu/cbdb-api

[3] Harvard University. "China Historical GIS (CHGIS)." Accessed June 27, 2026. https://chgis.fas.harvard.edu/

[4] Steinbruck, Alex. "10 useful things about Wikidata & SPARQL that I wish I knew earlier." *Medium*, January 9, 2022. https://alexasteinbruck.medium.com/10-useful-things-about-wikidata-sparql-that-i-wish-i-knew-earlier-b0e0ef63c598

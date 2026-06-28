---
layout: single
title: "Module 4: Calling Open Data APIs"
permalink: /databaseworkflows/module-4-apis/
toc: false
classes: wide article-page
sidebar:
  nav: "main_sidebar"
header:
    overlay_image: /assets/images/mp_hero_grid_layered_slate.png
---

{% include workflow_styles.html %}

<div id="toc-rail">
  <div class="toc-track"></div>
  <div class="toc-progress" id="toc-progress-bar"></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="introduction"></a><span class="toc-tooltip">Introduction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="key-apis-for-china-studies"></a><span class="toc-tooltip">Key APIs</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="1-china-biographical-database-cbdb"></a><span class="toc-tooltip">CBDB</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="2-china-historical-geographic-information-system-chgis"></a><span class="toc-tooltip">CHGIS</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="3-wikidata-and-sparql"></a><span class="toc-tooltip">Wikidata & SPARQL</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="using-an-llm-to-write-api-scripts"></a><span class="toc-tooltip">LLM Scripting</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="example-workflow-querying-cbdb-for-a-list-of-names"></a><span class="toc-tooltip">CBDB Workflow</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="example-workflow-querying-wikidata-with-sparql"></a><span class="toc-tooltip">SPARQL Workflow</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="handling-romanization-and-normalization"></a><span class="toc-tooltip">Normalization</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="when-there-is-no-api-web-scraping"></a><span class="toc-tooltip">Web Scraping</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="references"></a><span class="toc-tooltip">References</span></div>
</div>

<h2 id="introduction">Introduction</h2>

Much of the foundational data for China studies research—biographies, historical geography, and bibliographic records—already exists in open databases. Instead of manually searching these websites and copying results one by one, researchers can use Application Programming Interfaces (APIs) to query these databases programmatically and download structured data directly into a spreadsheet.

This module introduces the open data APIs most relevant to China studies and demonstrates how to use an LLM coding agent to write the retrieval scripts, allowing researchers to gather massive datasets without prior programming experience.

<h2 id="key-apis-for-china-studies">Key APIs for China Studies</h2>

<h3 id="1-china-biographical-database-cbdb">1. China Biographical Database (CBDB)</h3>
The [CBDB](https://cbdb.hsites.harvard.edu/) is the largest prosopographical database for the study of pre-20th century Chinese history, containing records for over 500,000 individuals [1]. Its API allows you to retrieve complete biographical profiles—including kinship networks, office holding, and social associations—on the fly.

**API Capabilities:** You can query by CBDB ID or by name (Chinese characters or Pinyin). The API returns data in either HTML or JSON format [2].

<div class="workflow-note">
<strong>Example Query</strong><br>
<code>https://cbdb.fas.harvard.edu/cbdbapi/person.php?name=王安石&o=json</code>
</div>

<h3 id="2-china-historical-geographic-information-system-chgis">2. China Historical Geographic Information System (CHGIS)</h3>
The [CHGIS](https://chgis.fas.harvard.edu/) provides a base GIS platform tracking the administrative geography of Chinese history from 221 BCE to 1911 CE [3]. While researchers often download the full shapefiles, the CHGIS data can also be queried to resolve historical place names to specific latitude/longitude coordinates and track their changes over time.

<h3 id="3-wikidata-and-sparql">3. Wikidata and SPARQL</h3>
Wikidata is the structured data backend of Wikipedia. It contains an enormous amount of data on Chinese history, literature, and geography. Unlike standard REST APIs, Wikidata is queried using a language called SPARQL [4]. SPARQL allows for highly complex, relational queries (e.g., "Find all people born in Hangzhou during the Song dynasty who authored a book").

<h2 id="using-an-llm-to-write-api-scripts">Using an LLM to Write API Scripts</h2>

You do not need to know how to write Python or SPARQL to use these APIs. You can use an LLM (like ChatGPT-4o or Claude 3.5 Sonnet) as a coding agent to write the scripts for you. 

The key is writing a highly specific prompt that provides the LLM with the API documentation and your exact data requirements.

<h3 id="example-workflow-querying-cbdb-for-a-list-of-names">Example Workflow: Enriching the CCVG Dataset</h3>

Suppose you want to enrich our sample CCVG dataset. You have the `ccvg_village_information.csv` file, and you want to know the precise latitude and longitude of the county seat for each village to compare it against the village's own coordinates. You can use the CHGIS API to look up the historical coordinates for each county name in your dataset.

**Step 1: Write the Prompt for the LLM**
Provide the LLM with your goal, the input format, the desired output format, and the API documentation.

<div class="workflow-note">
<strong>Prompt Template</strong><br>
"I am working with a dataset of Chinese villages in a file called <code>ccvg_village_information.csv</code>. The file contains a column called 'County_Pinyin'. I need a Python script that reads this list, queries the China Historical Geographic Information System (CHGIS) API for each county name, and saves the results to a new CSV file.<br><br>
Here is the CHGIS API documentation for querying by Pinyin name:<br>
<code>https://chgis.fas.harvard.edu/api/placenames/search?name_py=[NAME]</code><br><br>
The script should:<br>
1. Loop through the unique county names in the CSV.<br>
2. Make a GET request to the API for each name.<br>
3. Parse the JSON response to extract the first result's 'x_coord' (longitude) and 'y_coord' (latitude).<br>
4. Handle errors gracefully (e.g., if the API returns no data, write 'Not Found' in the output).<br>
5. Include a 1-second delay between requests to avoid overloading the server.<br>
6. Save the output to <code>county_coordinates.csv</code>.<br>
Please provide the complete, runnable Python code."
</div>

**Step 2: Run the Generated Code**
The LLM will generate a Python script using the `requests` and `pandas` libraries. You can run this script in your terminal or a Jupyter Notebook. The script will systematically query the database and compile your dataset in minutes.

<h3 id="example-workflow-querying-wikidata-with-sparql">Example Workflow: Querying Wikidata with SPARQL</h3>

Writing SPARQL queries manually is notoriously difficult due to Wikidata's complex property (P) and item (Q) numbering system. LLMs are exceptionally good at translating natural language requests into valid SPARQL.

<div class="workflow-note">
<strong>Prompt Template</strong><br>
"Write a SPARQL query for the Wikidata Query Service that finds all Chinese emperors of the Ming dynasty. For each emperor, return their English name, Chinese name, date of birth, date of death, and temple name. Please provide only the SPARQL code."
</div>

You can copy the generated code directly into the [Wikidata Query Service interface](https://query.wikidata.org/), run it, and download the results as a CSV.

<h2 id="handling-romanization-and-normalization">Handling Romanization and Normalization</h2>

When querying APIs, you will inevitably encounter the normalization issues discussed in <a href="/databaseworkflows/module-1-script-handling/">Module 1</a>. Look at our `ccvg_village_information.csv` sample data:

*   **Pinyin vs. Wade-Giles:** The CCVG data contains Wade-Giles romanization for some provinces (e.g., "Kwangtung" instead of "Guangdong"). If you pass "Kwangtung" to an API that expects standard Hanyu Pinyin, the query will fail. You must convert your list before querying. You can ask your LLM coding agent to add a conversion step to your Python script using a lookup dictionary.
*   **Variant Characters:** The CCVG data contains both Traditional (廣東省) and Simplified (广东省) characters. If an API expects Simplified characters, querying with Traditional characters will often return zero results. Always normalize your input data to the standard expected by the specific database before running batch API calls.

<h2 id="when-there-is-no-api-web-scraping">When There is No API: Web Scraping</h2>

If a database does not offer an API but displays structured data on its web pages, you can use Python libraries like `BeautifulSoup` to "scrape" the data. 

You can use the exact same LLM-assisted workflow for scraping. Simply provide the LLM with the URL of the page and a snippet of the page's HTML source code, and ask it to write a script that extracts the specific text fields you need.

<h2 id="references">References</h2>

[1] Bol, Peter. "The China Biographical Database (CBDB): An Introduction." *The Digital Orientalist*, April 30, 2024. https://digitalorientalist.com/2024/04/30/the-china-biographical-database-cbdb-an-introduction-and-conversation-with-professor-peter-bol/

[2] Harvard University. "CBDB API Documentation." Accessed June 27, 2026. https://cbdb.hsites.harvard.edu/cbdb-api

[3] Harvard University. "China Historical GIS (CHGIS)." Accessed June 27, 2026. https://chgis.fas.harvard.edu/

[4] Steinbruck, Alex. "10 useful things about Wikidata & SPARQL that I wish I knew earlier." *Medium*, January 9, 2022. https://alexasteinbruck.medium.com/10-useful-things-about-wikidata-sparql-that-i-wish-i-knew-earlier-b0e0ef63c598

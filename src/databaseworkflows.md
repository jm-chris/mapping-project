---
layout: single
title: "Database Workflows"
permalink: /databaseworkflows/
sidebar:
  nav: "main_sidebar"
---

<style>
.workflow-heading {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 300;
  font-size: 1.05rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1a1a1a;
  border-bottom: 1px solid #d0d0d0;
  padding-bottom: 0.5rem;
  margin: 2.5rem 0 1.2rem 0;
}
.workflow-body {
  font-size: 0.95rem;
  line-height: 1.75;
  color: #2e2e2e;
  max-width: 720px;
}
.workflow-note {
  background: #FAFAFA;
  border-left: 4px solid #2B3AA8;
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  font-size: 0.9rem;
  color: #444;
}
</style>

<h2 class="workflow-heading">Building a Digital Archive for China Studies</h2>

<p class="workflow-body">
This tutorial provides a comprehensive, step-by-step workflow for researchers in China Studies who wish to build a fully searchable digital archive from their own scanned historical documents. The workflow draws on the infrastructure of the <a href="https://www.maoistlegacy.de" target="_blank">Maoist Legacy Database</a> [1] and the <a href="https://grassrootschinesehistory.ca" target="_blank">Grassroots Chinese History Archive</a> [2], both of which successfully digitized thousands of grassroots and state documents from the post-Mao and Cultural Revolution eras.
</p>

<p class="workflow-body">
By following this guide, you will learn how to organize your scanned files, extract Chinese text using Optical Character Recognition (OCR), leverage Large Language Models (LLMs) to automate metadata extraction, set up an Omeka Classic repository, and implement a robust full-text search engine capable of handling Chinese characters.
</p>

<h2 class="workflow-heading">Phase 1: Document Preparation and Advanced OCR</h2>

<p class="workflow-body">
The foundation of any digital archive is the quality and organization of its source files. Assuming you already possess scanned copies of historical documents (such as archival dossiers, internal reports, or local gazetteers), the first step is to ensure these files are properly named and processed for text extraction.
</p>

<p class="workflow-body">
<strong>File Naming Conventions:</strong> Establish a consistent, machine-readable file naming structure before importing anything into a database. A best practice is to use a combination of the document date (in `YYYY-MM-DD` format) and a unique identifier or brief descriptive slug (e.g., `1983-11-02_Zhongbanfa_7.pdf`). Avoid using spaces or special characters in filenames.
</p>

<p class="workflow-body">
<strong>Image Pre-processing:</strong> Before running OCR, scanned images must be optimized. Ensure all scans are at least 300 DPI. Use batch image processing tools to deskew (straighten) crooked pages, increase contrast, and convert color scans to grayscale or binary (black and white). These steps drastically reduce character recognition errors, especially for faded mimeographs common in 1950s–1970s Chinese documents [3].
</p>

<p class="workflow-body">
<strong>Optical Character Recognition (OCR):</strong> To make your documents full-text searchable, the images must be converted into searchable PDFs. This means the PDF file contains the original scanned image of the document, but with an invisible layer of recognized text embedded behind it.
</p>

<p class="workflow-body">
For Chinese historical documents, standard OCR tools often struggle with the mixture of traditional and simplified characters, vertical text layouts, and poor print quality. Recommended tools include:
</p>

*   **ABBYY FineReader:** Widely considered the industry standard for commercial OCR, offering excellent support for both Simplified and Traditional Chinese, as well as complex layouts [4].
*   **PaddleOCR:** A highly accurate, open-source, GPU-accelerated OCR engine developed by Baidu, which often outperforms Tesseract on Chinese texts [5].
*   **OCRmyPDF:** A command-line tool that wraps Tesseract (or PaddleOCR via plugins) to batch-process folders of images into searchable PDFs while preserving the original image quality [6].

<div class="workflow-note">
<strong>Technical Note on Character Simplification:</strong> As noted by the Maoist Legacy project team, digital dictionaries used by search engines often struggle with documents that mix traditional and simplified characters, or those utilizing the rescinded second round of simplification from 1978 [7]. A recommended workaround is to leave the text as searchable PDFs, but manually correct the hidden OCR text layer to use standard first-round simplified characters, ensuring the document remains discoverable via standard keyboard input [7].
</div>

<h2 class="workflow-heading">Phase 2: AI-Assisted Metadata and Taxonomy Generation</h2>

<p class="workflow-body">
Manually reading thousands of documents to extract titles, dates, authors, and subjects is the most labor-intensive part of building an archive. Recent advancements in Large Language Models (LLMs) like GPT-4o and Claude 3.5 Sonnet offer a powerful way to automate this data entry [8].
</p>

<p class="workflow-body">
<strong>Automated Metadata Extraction:</strong> Once your documents have been OCR'd, you can use a Python script to pass the raw text of each document to an LLM via API. By crafting a strict prompt, you can instruct the LLM to read the Chinese text and output structured JSON data containing the document's metadata [9].
</p>

<p class="workflow-body">
A sample prompt structure for Gemini or GPT-4 might look like:
<br><em>"You are an expert archivist of modern Chinese history. Read the following OCR text from a 1960s government document. Extract the following fields and format the output strictly as JSON: 1. Title (the formal document title), 2. Date (in YYYY-MM-DD format), 3. Issuing Authority (the government organ or committee), 4. Summary (a 2-sentence English summary of the contents)."</em>
</p>

<p class="workflow-body">
<strong>Taxonomy and Subject Tagging:</strong> LLMs can also be used to build a controlled vocabulary or taxonomy. Instead of manually tagging each document, you can ask the LLM to assign 3 to 5 thematic tags (e.g., "Land Reform", "Sent-down Youth", "Self-Criticism") based on the document's content [10]. This allows you to rapidly build a structured, searchable database.
</p>

<div class="workflow-note">
<strong>Human-in-the-Loop Verification:</strong> While LLMs are highly effective at extracting metadata, OCR errors in the source text can lead to AI "hallucinations" (where the model invents missing text to fill gaps) [9]. It is critical to treat the AI-generated metadata as a first draft. A human researcher must review the generated spreadsheet against the original PDFs to correct dates, verify titles, and ensure accuracy before importing the data into your archive [8].
</div>

<h2 class="workflow-heading">Phase 3: Setting Up Omeka Classic</h2>

<p class="workflow-body">
Omeka Classic is a free, open-source web publishing platform designed specifically for scholars, librarians, and archivists to display digital collections [11]. It is the platform underlying both the Maoist Legacy Database and the Grassroots Chinese History Archive.
</p>

<p class="workflow-body">
<strong>Installation:</strong> Omeka Classic requires a standard LAMP stack (Linux, Apache, MySQL, PHP). You will need to create a MySQL database on your web host and follow the Omeka installation instructions to connect the application to your database [12].
</p>

<p class="workflow-body">
<strong>Core Plugins:</strong> Once Omeka is installed, you should immediately install and activate the following essential plugins:
</p>

| Plugin Name | Purpose in the Workflow |
|-------------|-------------------------|
| **CSV Import** | Allows you to bulk-upload hundreds of items and their associated AI-generated metadata from a single spreadsheet [13]. |
| **PDF Text** | Automatically extracts the hidden OCR text layer from uploaded PDFs and saves it to the Omeka database, enabling full-text search [14]. |
| **Search by Metadata** | Allows users to click on a metadata field (like a specific "Subject" or "Creator") and find all other documents sharing that exact value. |

<h2 class="workflow-heading">Phase 4: Metadata Schema and Bulk Import</h2>

<p class="workflow-body">
Omeka uses the Dublin Core metadata standard by default, which provides 15 basic fields (such as Title, Creator, Subject, Description, and Date) to describe items [15]. 
</p>

<p class="workflow-body">
<strong>Structuring Your Data:</strong> Take the JSON output generated by your LLM in Phase 2 and convert it into a master spreadsheet (in Excel or Google Sheets) where each row represents a single historical document. The columns should correspond to Dublin Core fields.
</p>

<p class="workflow-body">
<strong>Importing via CSV:</strong> Once your spreadsheet is verified and complete, export it as a UTF-8 encoded CSV file. Ensure that you have uploaded your searchable PDFs to a web-accessible server. In your CSV, include a column containing the direct URL to each PDF. When you run the Omeka CSV Import plugin, it will read the spreadsheet, create an item for each row, populate the Dublin Core metadata, and automatically download and attach the corresponding PDF file to the item [13].
</p>

<h2 class="workflow-heading">Phase 5: Configuring Chinese Full-Text Search</h2>

<p class="workflow-body">
The default search engine in Omeka Classic relies on MySQL full-text search, which is generally inadequate for parsing Chinese text because it relies on spaces to identify word boundaries. To replicate the powerful search capabilities of the Maoist Legacy Database, you must implement a search engine capable of Chinese tokenization.
</p>

<p class="workflow-body">
<strong>Apache Solr Integration:</strong> The Maoist Legacy Database utilizes Apache Solr equipped with Lucene’s Smart Chinese Analyzer [7]. This analyzer uses a built-in dictionary to tokenize modern Chinese text, allowing the search engine to correctly identify two-character cognates and rank results by relevance [7]. 
</p>

<p class="workflow-body">
To implement this, you will need to install Apache Solr on your server and connect it to Omeka using the Solr Search plugin. Once configured, the plugin will index the metadata from your CSV import alongside the full text extracted from your PDFs by the PDF Text plugin.
</p>

<div class="workflow-note">
<strong>Search Limitations:</strong> Be aware that dictionary-based tokenizers may struggle with historical idiosyncrasies, atypical political jargon, or single-character searches [7]. It is highly recommended to provide users with an "Advanced Search" option that performs exact-match character string searches as a fallback for complex queries [7].
</div>

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0 2rem 0;">

<p class="workflow-body" style="font-size: 0.85rem; color: #666;">
<strong>References:</strong><br>
[1] The Maoist Legacy Database. "About." Accessed April 16, 2026. https://www.maoistlegacy.de/db/about<br>
[2] Grassroots Chinese History Archive. "About." Accessed April 16, 2026. https://grassrootschinesehistory.ca/about<br>
[3] Tech for Humans. "Image Pre-Processing Techniques for OCR." Medium, April 2, 2025.<br>
[4] ABBYY. "Supported OCR and document comparison languages." Accessed April 16, 2026.<br>
[5] Koncile. "PaddleOCR: analysis, benefits and open source alternatives." March 19, 2026.<br>
[6] OCRmyPDF. "Documentation." Accessed April 16, 2026. https://ocrmypdf.readthedocs.io/<br>
[7] The Maoist Legacy Database. "User Guide." Accessed April 16, 2026. https://www.maoistlegacy.de/db/how-to<br>
[8] Huang, Abigail Yongping, et al. "Web Archives Metadata Generation with gpt-4o: Challenges and Insights." arXiv preprint arXiv:2411.05409 (2024).<br>
[9] Chow, Eric H. C. "An Experiment with Gemini Pro LLM for Chinese OCR and Metadata Extraction." The Digital Orientalist, April 5, 2024.<br>
[10] LlamaIndex. "AI Document Classification: A Practical Guide." March 31, 2026.<br>
[11] Omeka. "Omeka Classic." Accessed April 16, 2026. https://omeka.org/classic/<br>
[12] Omeka Classic User Manual. "Installation." Accessed April 16, 2026. https://omeka.org/classic/docs/Installation/Installing/<br>
[13] Omeka Classic User Manual. "CSV Import." Accessed April 16, 2026. https://omeka.org/classic/docs/Plugins/CSV_Import/<br>
[14] Omeka Classic User Manual. "PDF Text." Accessed April 16, 2026. https://omeka.org/classic/docs/Plugins/PdfText/<br>
[15] Omeka Classic User Manual. "Working with Dublin Core." Accessed April 16, 2026. https://omeka.org/classic/docs/Content/Working_with_Dublin_Core/
</p>

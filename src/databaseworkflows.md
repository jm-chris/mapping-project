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
This tutorial provides a comprehensive, step-by-step workflow for researchers in China Studies who wish to build a fully searchable digital archive from their own scanned historical documents. The workflow is modeled closely on the infrastructure of the <a href="https://www.maoistlegacy.de" target="_blank">Maoist Legacy Database</a>, a project directed by Daniel Leese at the University of Freiburg that successfully digitized thousands of party and state guidelines concerning "lingering historical issues" from the post-Mao era [1].
</p>

<p class="workflow-body">
By following this guide, you will learn how to organize your scanned files, extract Chinese text using Optical Character Recognition (OCR), set up an Omeka Classic repository, configure metadata schemas, and implement a robust full-text search engine capable of handling Chinese characters.
</p>

<h2 class="workflow-heading">Phase 1: Document Preparation and OCR</h2>

<p class="workflow-body">
The foundation of any digital archive is the quality and organization of its source files. Assuming you already possess scanned copies of historical documents (such as archival dossiers, internal reports, or local gazetteers), the first step is to ensure these files are properly named and processed for text extraction.
</p>

<p class="workflow-body">
<strong>File Naming Conventions:</strong> Establish a consistent, machine-readable file naming structure before importing anything into a database. A best practice is to use a combination of the document date (in `YYYY-MM-DD` format) and a unique identifier or brief descriptive slug (e.g., `1983-11-02_Zhongbanfa_7.pdf`). Avoid using spaces or special characters in filenames, as these can cause errors during bulk web uploads.
</p>

<p class="workflow-body">
<strong>Optical Character Recognition (OCR):</strong> To make your documents full-text searchable, the images must be converted into searchable PDFs. This means the PDF file contains the original scanned image of the document, but with an invisible layer of recognized text embedded behind it. For Chinese historical documents, particularly those from the 1950s through the 1970s, OCR can be challenging due to the mixture of traditional and simplified characters, poor print quality, or mimeograph artifacts.
</p>

<div class="workflow-note">
<strong>Technical Note on Character Simplification:</strong> As noted by the Maoist Legacy project team, digital dictionaries used by search engines often struggle with documents that mix traditional and simplified characters, or those utilizing the rescinded second round of simplification from 1978 [2]. A recommended workaround is to leave the text as searchable PDFs, but manually correct the hidden OCR text layer to use standard first-round simplified characters, ensuring the document remains discoverable via standard keyboard input [2].
</div>

<h2 class="workflow-heading">Phase 2: Setting Up Omeka Classic</h2>

<p class="workflow-body">
Omeka Classic is a free, open-source web publishing platform designed specifically for scholars, librarians, and archivists to display digital collections [3]. It is the platform underlying the Maoist Legacy Database and is highly recommended for its flexibility and robust metadata handling.
</p>

<p class="workflow-body">
<strong>Installation:</strong> Omeka Classic requires a standard LAMP stack (Linux, Apache, MySQL, PHP). You will need to create a MySQL database on your web host and follow the Omeka installation instructions to connect the application to your database [4].
</p>

<p class="workflow-body">
<strong>Core Plugins:</strong> Once Omeka is installed, you should immediately install and activate the following essential plugins:
</p>

| Plugin Name | Purpose in the Workflow |
|-------------|-------------------------|
| **CSV Import** | Allows you to bulk-upload hundreds of items and their associated metadata from a single spreadsheet, rather than entering them one by one [5]. |
| **PDF Text** | Automatically extracts the hidden OCR text layer from uploaded PDFs and saves it to the Omeka database, enabling full-text search across all your documents [6]. |
| **Search by Metadata** | Allows users to click on a metadata field (like a specific "Subject" or "Creator") and find all other documents sharing that exact value. |

<h2 class="workflow-heading">Phase 3: Metadata Schema and Bulk Import</h2>

<p class="workflow-body">
Omeka uses the Dublin Core metadata standard by default, which provides 15 basic fields (such as Title, Creator, Subject, Description, and Date) to describe items [7]. 
</p>

<p class="workflow-body">
<strong>Structuring Your Data:</strong> Create a master spreadsheet (in Excel or Google Sheets) where each row represents a single historical document. The columns should correspond to Dublin Core fields. For a China Studies archive, you might utilize the fields as follows:
</p>

*   **Title:** The formal title of the document (e.g., 中共中央办公厅国务院办公厅转发《关于落实华侨私房政策的补充意见》的通知).
*   **Identifier:** The document's formal archival number or issue number (e.g., 中办发（1987）7号).
*   **Subject:** Broad thematic categories (e.g., Compensation and restitution, Historiography).
*   **Date:** The date the document was issued, formatted consistently (e.g., 1987-05-23).
*   **Relation:** Links or references to other related documents within the archive.

<p class="workflow-body">
<strong>Importing via CSV:</strong> Once your spreadsheet is complete, export it as a UTF-8 encoded CSV file. Ensure that you have uploaded your searchable PDFs to a web-accessible server. In your CSV, include a column containing the direct URL to each PDF. When you run the Omeka CSV Import plugin, it will read the spreadsheet, create an item for each row, populate the Dublin Core metadata, and automatically download and attach the corresponding PDF file to the item [5].
</p>

<h2 class="workflow-heading">Phase 4: Configuring Chinese Full-Text Search</h2>

<p class="workflow-body">
The default search engine in Omeka Classic relies on MySQL full-text search, which is generally inadequate for parsing Chinese text because it relies on spaces to identify word boundaries. To replicate the powerful search capabilities of the Maoist Legacy Database, you must implement a search engine capable of Chinese tokenization.
</p>

<p class="workflow-body">
<strong>Apache Solr Integration:</strong> The Maoist Legacy Database utilizes Apache Solr equipped with Lucene’s Smart Chinese Analyzer [2]. This analyzer uses a built-in dictionary to tokenize modern Chinese text, allowing the search engine to correctly identify two-character cognates and rank results by relevance [2]. 
</p>

<p class="workflow-body">
To implement this, you will need to install Apache Solr on your server and connect it to Omeka using the Solr Search plugin. Once configured, the plugin will index the metadata from your CSV import alongside the full text extracted from your PDFs by the PDF Text plugin.
</p>

<div class="workflow-note">
<strong>Search Limitations:</strong> Be aware that dictionary-based tokenizers may struggle with historical idiosyncrasies, atypical political jargon, or single-character searches [2]. It is highly recommended to provide users with an "Advanced Search" option that performs exact-match character string searches as a fallback for complex queries [2].
</div>

<h2 class="workflow-heading">Phase 5: Curation and User Experience</h2>

<p class="workflow-body">
With the documents imported and the search engine functioning, the final phase involves curating the user experience.
</p>

<p class="workflow-body">
<strong>Collections and Exhibits:</strong> Group related items into Omeka "Collections" (e.g., documents pertaining to a specific political campaign or geographic region). You can also use the Exhibit Builder plugin to create narrative essays that guide users through a curated selection of documents, providing historical context and analysis [1].
</p>

<p class="workflow-body">
<strong>Translations and Relations:</strong> If you possess English translations of key documents, upload them as separate items. You can link the Chinese original and the English translation using Omeka's "Item Relations" plugin, allowing users to toggle between the two versions seamlessly [2].
</p>

<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 3rem 0 2rem 0;">

<p class="workflow-body" style="font-size: 0.85rem; color: #666;">
<strong>References:</strong><br>
[1] The Maoist Legacy Database. "About." Accessed April 16, 2026. https://www.maoistlegacy.de/db/about<br>
[2] The Maoist Legacy Database. "User Guide." Accessed April 16, 2026. https://www.maoistlegacy.de/db/how-to<br>
[3] Omeka. "Omeka Classic." Accessed April 16, 2026. https://omeka.org/classic/<br>
[4] Omeka Classic User Manual. "Installation." Accessed April 16, 2026. https://omeka.org/classic/docs/Installation/Installing/<br>
[5] Omeka Classic User Manual. "CSV Import." Accessed April 16, 2026. https://omeka.org/classic/docs/Plugins/CSV_Import/<br>
[6] Omeka Classic User Manual. "PDF Text." Accessed April 16, 2026. https://omeka.org/classic/docs/Plugins/PdfText/<br>
[7] Omeka Classic User Manual. "Working with Dublin Core." Accessed April 16, 2026. https://omeka.org/classic/docs/Content/Working_with_Dublin_Core/
</p>

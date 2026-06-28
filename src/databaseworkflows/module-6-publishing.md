---
layout: single
title: "Module 6: Building and Publishing a Searchable Archive"
permalink: /databaseworkflows/module-6-publishing/
toc: false
classes: wide article-page
sidebar:
  nav: "main_sidebar"
header:
    overlay_image: /assets/images/mp_hero_grid_layered_slate.png
---

{% include workflow_styles.html %}

<div class="module-header">
  <div class="module-header-meta">
    <span>DIFFICULTY</span>
    <strong>Advanced</strong>
  </div>
  <div class="module-header-meta">
    <span>ESTIMATED TIME</span>
    <strong>90 Minutes</strong>
  </div>
  <div class="module-header-meta">
    <span>PREREQUISITES</span>
    <strong><a href="/databaseworkflows/module-5-segmentation/">Module 5: Segmentation</a></strong>
  </div>
  <div class="module-header-meta">
    <span>DATASET</span>
    <span class="module-badge badge-dataset">CCVG Gazetteer Data</span>
  </div>
</div>

<div id="toc-rail">
  <div class="toc-track"></div>
  <div class="toc-progress" id="toc-progress-bar"></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="introduction"></a><span class="toc-tooltip">Introduction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="prerequisites"></a><span class="toc-tooltip">Prerequisites</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="designing-the-metadata-schema"></a><span class="toc-tooltip">Metadata Schema</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="structuring-your-master-csv"></a><span class="toc-tooltip">Master CSV</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="setting-up-omeka-classic"></a><span class="toc-tooltip">Omeka Setup</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="installation"></a><span class="toc-tooltip">Installation</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="installing-core-plugins"></a><span class="toc-tooltip">Core Plugins</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="running-the-bulk-import"></a><span class="toc-tooltip">Bulk Import</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="configuring-chinese-full-text-search"></a><span class="toc-tooltip">Chinese Search</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="apache-solr-and-the-smart-chinese-analyzer"></a><span class="toc-tooltip">Apache Solr</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="advanced-search-as-a-fallback"></a><span class="toc-tooltip">Advanced Search</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="further-reading"></a><span class="toc-tooltip">Further Reading</span></div>
</div>

<h2 id="introduction">Introduction</h2>

This final module brings together the techniques from the previous sections into a concrete implementation. It walks through the complete pipeline of taking raw, OCR-processed PDFs and a normalized metadata spreadsheet, and publishing them as a live, fully searchable digital archive.

We will use **Omeka Classic**, a free, open-source web publishing platform designed specifically for scholars and archivists. It is the platform underlying major China studies repositories like the Maoist Legacy Database and the Grassroots Chinese History Archive. As noted in a *Programming Historian* lesson by Miriam Posner, Omeka is particularly well-suited to humanities archivists because it uses the Dublin Core metadata standard familiar to librarians, and requires no programming knowledge to operate [1].

<div class="module-toc">
  <h4>In this module</h4>
  <ul>
    <li><a href="#designing-the-metadata-schema">Designing the Metadata Schema</a></li>
    <li><a href="#setting-up-omeka-classic">Setting Up Omeka Classic</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#installing-core-plugins">Installing Core Plugins</a></li>
        <li><a href="#running-the-bulk-import">Running the Bulk Import</a></li>
      </ul>
    </li>
    <li><a href="#configuring-chinese-full-text-search">Configuring Chinese Full-Text Search</a></li>
  </ul>
</div>

<h2 id="prerequisites">Prerequisites</h2>

Before beginning this module, you should:
* Have a normalized metadata spreadsheet ready (covered in Module 5).
* Have your OCR-processed PDF files hosted on a publicly accessible web server.
* Have access to a server with a LAMP stack (Linux, Apache, MySQL, PHP) — most university web hosting services provide this.

<h2 id="designing-the-metadata-schema">Designing the Metadata Schema</h2>

Before importing anything into a database, your data must be structured according to a recognized schema. Omeka Classic uses the **Dublin Core** metadata standard by default, which provides 15 universal fields for describing digital objects [2].

<h3 id="structuring-your-master-csv">Structuring Your Master CSV</h3>

Take the normalized data we built from the CCVG dataset and convert it into a master spreadsheet. The column headers must follow the exact format expected by Omeka's CSV Import plugin: `Dublin Core:FieldName`.

<blockquote class="workflow-example">
  <span class="callout-label">Example: Publishing the CCVG Data</span>
  <table>
    <thead>
      <tr>
        <th>Dublin Core:Title</th>
        <th>Dublin Core:Coverage</th>
        <th>Dublin Core:Date</th>
        <th>Dublin Core:Subject</th>
        <th>file</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>三秦村 (Sanqin Village)</td>
        <td>广东省 (Guangdong)</td>
        <td>1978</td>
        <td>Population; Agriculture</td>
        <td>https://yourserver.edu/files/sanqin.pdf</td>
      </tr>
    </tbody>
  </table>
</blockquote>

**Multiple values in a single field:** To assign multiple subject tags to a single item, separate each value with a semicolon (`;`). Omeka will split these into separate Subject entries, which is essential for faceted browsing.

<h2 id="setting-up-omeka-classic">Setting Up Omeka Classic</h2>

<h3 id="installation">Installation</h3>

Omeka Classic requires a standard LAMP stack (Linux, Apache, MySQL, PHP). Most university web hosting services offer one-click Omeka installation. If setting up your own server, follow the [official installation guide](https://omeka.org/classic/docs/Installation/Installing/) [3].

<h3 id="installing-core-plugins">Installing Core Plugins</h3>

Navigate to **Plugins** in the Omeka admin panel and install the following three plugins from the official directory:

<ol class="workflow-steps">
  <li><strong>CSV Import:</strong> Bulk-uploads hundreds of items and their metadata from your master spreadsheet, and automatically downloads and attaches the PDF files from the URLs provided in the <code>file</code> column [4].</li>
  <li><strong>PDF Text:</strong> Extracts the invisible OCR text layer from uploaded PDFs and saves it to the Omeka database, enabling full-text search across document contents [5].</li>
  <li><strong>Search by Metadata:</strong> Allows users to click any metadata value (e.g., a Subject tag) to find all other items sharing that value.</li>
</ol>

<h3 id="running-the-bulk-import">Running the Bulk Import</h3>

<ol class="workflow-steps">
  <li>Upload all your searchable PDFs to a publicly accessible web server. Ensure the <code>file</code> column in your CSV contains the direct URL to each PDF.</li>
  <li>Navigate to <strong>Plugins → CSV Import → Import Items</strong>.</li>
  <li>Upload your CSV file, set the character encoding to <strong>UTF-8</strong>, map the columns, and click <strong>Import</strong>.</li>
</ol>

<blockquote class="workflow-warning">
  <span class="callout-label">Warning: UTF-8 Encoding</span>
  <p>Always verify that your CSV is saved as UTF-8 <em>without</em> a BOM (Byte Order Mark) before importing. A BOM will corrupt the first column header and cause the import to fail silently. See <a href="/databaseworkflows/module-1-script-handling/">Module 1</a> for instructions on how to check and fix this.</p>
</blockquote>

<h2 id="configuring-chinese-full-text-search">Configuring Chinese Full-Text Search</h2>

The default search engine in Omeka Classic relies on MySQL full-text search. This is generally inadequate for parsing Chinese text because it relies on spaces to identify word boundaries—a system that works for English but fails for Chinese.

<h3 id="apache-solr-and-the-smart-chinese-analyzer">Apache Solr and the Smart Chinese Analyzer</h3>

To enable accurate full-text search for Chinese historical documents, you must replace the default search engine with Apache Solr, equipped with a Chinese-specific tokenizer. The Maoist Legacy Database utilizes this exact setup [6].

Solr's **Smart Chinese Analyzer** uses a built-in dictionary to segment modern Chinese text into meaningful word units (similar to the Jieba library discussed in <a href="/databaseworkflows/module-5-segmentation/">Module 5</a>). This allows the search engine to correctly identify two-character cognates and rank results by relevance [7].

**Implementation Steps:**

<ol class="workflow-steps">
  <li>Install Apache Solr on your server.</li>
  <li>Add the <code>lucene-analyzers-smartcn</code> JAR file to your Solr configuration to enable the Smart Chinese Analyzer [7].</li>
  <li>Install the <strong>SolrSearch plugin</strong> for Omeka.</li>
  <li>Configure the plugin to point to your Solr instance URL and click <strong>Reindex</strong>.</li>
</ol>

The plugin will index the metadata from your CSV alongside the full text extracted from your PDFs, making every word in every document searchable.

<h3 id="advanced-search-as-a-fallback">Advanced Search as a Fallback</h3>

Even with Solr, certain searches will fail—particularly for rare political jargon not in the standard dictionary, or for the second-round simplified characters (二简字) discussed in <a href="/databaseworkflows/module-1-script-handling/">Module 1</a> [6].

Ensure users have access to Omeka's built-in **Advanced Search** interface. This performs exact-match character string searches across specific Dublin Core fields, bypassing the tokenizer entirely and allowing researchers to search for unusual terms or specific character combinations.

<div class="further-reading">
  <h3>Further Reading</h3>
  <ul>
    <li><a href="https://programminghistorian.org/en/lessons/up-and-running-with-omeka">Up and Running with Omeka.net</a> (Programming Historian)</li>
    <li><a href="https://programminghistorian.org/en/lessons/creating-an-omeka-exhibit">Creating an Omeka Exhibit</a> (Programming Historian)</li>
  </ul>
  <div class="dataset-cite">
    <strong>Dataset Used in This Module</strong>
    East Asian Library, University Library System, University of Pittsburgh. <em>Contemporary Chinese Village Gazetteer Data (CCVG Data)</em>. Accessed June 2026. <a href="https://www.chinesevillagedata.library.pitt.edu/">https://www.chinesevillagedata.library.pitt.edu/</a>
  </div>
</div>

<div class="module-nav-footer">
  <a href="/databaseworkflows/module-5-segmentation/" class="module-nav-btn">
    <span class="nav-label">← Previous</span>
    <span class="nav-title">Module 5: Segmentation</span>
  </a>
  <a href="/databaseworkflows/" class="module-nav-btn">
    <span class="nav-label">← Back to</span>
    <span class="nav-title">All Modules</span>
  </a>
</div>

<h2 id="references">References</h2>

[1] Posner, Miriam. "Up and Running with Omeka.net." *Programming Historian* 2 (2013). https://doi.org/10.46430/phen0021

[2] Omeka. "Working with Dublin Core." Accessed June 27, 2026. https://omeka.org/classic/docs/Content/Working_with_Dublin_Core/

[3] Omeka. "Installation." Accessed June 27, 2026. https://omeka.org/classic/docs/Installation/Installing/

[4] Omeka. "CSV Import." Accessed June 27, 2026. https://omeka.org/classic/docs/Plugins/CSV_Import/

[5] Omeka. "PDF Text." Accessed June 27, 2026. https://omeka.org/classic/docs/Plugins/PdfText/

[6] The Maoist Legacy Database. "User Guide." Accessed June 27, 2026. https://www.maoistlegacy.de/db/how-to

[7] Apache Lucene. "Package org.apache.lucene.analysis.cn.smart." Accessed June 27, 2026. https://lucene.apache.org/core/8_0_0/analyzers-smartcn/org/apache/lucene/analysis/cn/smart/package-summary.html

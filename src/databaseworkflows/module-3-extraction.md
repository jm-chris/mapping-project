---
layout: single
title: "Module 3: Extracting Structured Data: NER and Metadata"
permalink: /databaseworkflows/module-3-extraction/
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
    <strong>Intermediate</strong>
  </div>
  <div class="module-header-meta">
    <span>ESTIMATED TIME</span>
    <strong>45 Minutes</strong>
  </div>
  <div class="module-header-meta">
    <span>PREREQUISITES</span>
    <strong><a href="/databaseworkflows/module-2-ocr/">Module 2: OCR</a></strong>
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
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="document-level-extraction-ai-assisted-metadata"></a><span class="toc-tooltip">Metadata Extraction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="extracting-metadata-with-an-llm-via-api"></a><span class="toc-tooltip">LLM Prompting</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="building-a-taxonomy-from-ai-tags"></a><span class="toc-tooltip">Taxonomy Building</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="entity-level-extraction-named-entity-recognition-ner"></a><span class="toc-tooltip">NER for Chinese</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="1-spacy-for-modern-chinese"></a><span class="toc-tooltip">spaCy (Modern)</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="2-markus-for-classical-chinese"></a><span class="toc-tooltip">MARKUS (Classical)</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="3-the-wyd-platform-pkudh"></a><span class="toc-tooltip">WYD Platform</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="using-llms-for-triple-extraction-linked-data"></a><span class="toc-tooltip">Linked Data Extraction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="further-reading"></a><span class="toc-tooltip">Further Reading</span></div>
</div>

<h2 id="introduction">Introduction</h2>

Once you have machine-readable text (whether from OCR, as covered in <a href="/databaseworkflows/module-2-ocr/">Module 2</a>, or from existing digital corpora), the next challenge is pulling structured information out of it. 

This module covers two scales of extraction that use similar underlying logic:
1. **Document-level Extraction (Metadata):** Extracting titles, dates, issuing authorities, and subject tags from a whole document.
2. **Entity-level Extraction (NER):** Identifying specific people, places, organizations, and dates within the text.

We will explore how to use Large Language Models (LLMs) and specialized tools like spaCy, WYD, and MARKUS to automate these processes for both modern and classical Chinese sources.

<div class="module-toc">
  <h4>In this module</h4>
  <ul>
    <li><a href="#document-level-extraction-ai-assisted-metadata">Document-Level Extraction: AI-Assisted Metadata</a></li>
    <li><a href="#entity-level-extraction-named-entity-recognition-ner">Entity-Level Extraction: Named Entity Recognition (NER)</a></li>
    <li><a href="#using-llms-for-triple-extraction-linked-data">Using LLMs for Triple Extraction (Linked Data)</a></li>
  </ul>
</div>

<h2 id="prerequisites">Prerequisites</h2>

Before beginning this module, you should:
* Understand how to generate machine-readable text from scans (covered in Module 2).
* Have a basic familiarity with Python if you intend to run the LLM extraction scripts.
* Have an API key for an LLM provider (OpenAI, Anthropic, Baidu, or Alibaba) to run the code examples.

<h2 id="document-level-extraction-ai-assisted-metadata">Document-Level Extraction: AI-Assisted Metadata</h2>

Manually reading thousands of documents to extract basic cataloging information is the most labor-intensive part of building an archive. Recent advancements in LLMs offer a powerful way to automate this data entry, reducing weeks of manual cataloging to hours.

<h3 id="extracting-metadata-with-an-llm-via-api">Extracting Metadata with an LLM via API</h3>

You can use a Python script to pass the raw text of each document to an LLM via its API. By crafting a strict prompt, you instruct the LLM to read the Chinese text and output structured JSON data.

<blockquote class="workflow-example">
  <span class="callout-label">Example: Extracting CCVG Village Data</span>
  <p>Imagine you only had the raw scanned pages of the village gazetteers, rather than the structured CCVG dataset. You could use an LLM to generate the <code>ccvg_village_information.csv</code> table directly from the text. Your prompt would look like this:</p>
  <p>"You are an expert archivist. Read the following OCR text from a Chinese village gazetteer. Extract the following fields and return them as a JSON object only, with no other text:<br>
  - <strong>Village_Name_Chinese:</strong> the name of the village<br>
  - <strong>Province_Chinese:</strong> the province it belongs to<br>
  - <strong>Total_Area_mu:</strong> the total area of the village in mu (number only)<br>
  - <strong>Distance_to_County_km:</strong> distance to the county seat in km (number only)"</p>
</blockquote>

The following Python script demonstrates how to loop through a folder of searchable gazetteer PDFs, extract the text layer using `pdfplumber`, send it to the OpenAI API, and save the returned metadata to a JSON file:

```python
import os
import json
import pdfplumber
from openai import OpenAI

client = OpenAI()  # Assumes OPENAI_API_KEY is set in your environment

def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)

# ... loop over files, call client.chat.completions.create(), and save JSON ...
```

<h3 id="building-a-taxonomy-from-ai-tags">Building a Taxonomy from AI Tags</h3>

If you asked the LLM to generate subject tags for the gazetteer texts, it would produce a wide variety of thematic subjects. To make these useful for a database, you must review the full list, consolidate synonyms, and formalize them into a controlled vocabulary.

For example, when reading the population sections of the CCVG gazetteers, the LLM might generate tags like "Out-migration", "Urbanization", "Labor migration", and "Going to Shenzhen". You should standardize these to a single preferred term (e.g., "Labor Migration") across your dataset.

<blockquote class="workflow-warning">
  <span class="callout-label">Warning: Hallucination Risk</span>
  <p>While LLMs are highly effective at extracting metadata, OCR errors in the source text can cause the model to "hallucinate"—generating plausible-sounding but incorrect metadata to fill gaps in degraded text. It is critical to treat all AI-generated metadata as a first draft. A human researcher must review the generated spreadsheet against the original PDFs before importing the data into an archive [1].</p>
</blockquote>

<h2 id="entity-level-extraction-named-entity-recognition-ner">Entity-Level Extraction: Named Entity Recognition (NER)</h2>

Named Entity Recognition (NER) aims to identify and extract pre-defined classifications of specific objects within a text, such as people, locations, official titles, or books.

<h3 id="1-spacy-for-modern-chinese">1. spaCy (For Modern Chinese)</h3>
For modern Chinese texts, [spaCy](https://spacy.io/) is an industrial-strength Natural Language Processing library in Python that excels at NER. As outlined in a *Programming Historian* lesson by William J.B. Mattingly, spaCy can process large corpora to extract linguistic annotations and named entities efficiently [2]. While spaCy's pre-trained Chinese models (`zh_core_web_sm`) are highly effective for modern vernacular Chinese (like news articles or modern gazetteers), they fail completely on classical Chinese.

<h3 id="2-markus-for-classical-chinese">2. MARKUS (For Classical Chinese)</h3>
Classical Chinese presents severe challenges for standard NER tools because it lacks punctuation, spaces between words, and capitalization. [MARKUS](https://dh.chinese-empires.eu/) is a widely used, free online reading and text analysis platform designed specifically to address this. It allows researchers to upload classical Chinese texts and apply automated, semi-automated, and manual markup to identify personal names, place names, temporal references, and bureaucratic offices [3]. 

MARKUS is particularly powerful because it links directly to external authority databases like the China Biographical Database (CBDB) and the China Historical Geographic Information System (CHGIS), allowing you to verify the extracted entities immediately.

<h3 id="3-the-wyd-platform-pkudh">3. The WYD Platform (PKUDH)</h3>
Developed by Peking University’s Research Center for Digital Humanities, the [WYD platform](https://wyd.pkudh.net/) ("Widen Your Data") represents the next generation of classical Chinese NLP. 

Unlike older rule-based systems, WYD integrates a deep learning model trained on 3.3 billion characters of Classical Chinese. It performs automated punctuation prediction, word segmentation, and NER for people, dates, locations, official titles, and books [4]. The newest version also allows users to apply industry-strength LLMs (like GPT-4 or Baidu's ERNIE) directly within the platform interface to assist with extraction [4].

<h2 id="using-llms-for-triple-extraction-linked-data">Using LLMs for Triple Extraction (Linked Data)</h2>

For researchers building Linked Open Data (LOD) or prosopographical networks, you often need more than just a list of names; you need *relationships* (triples: Subject-Predicate-Object).

Recent studies have evaluated the ability of LLMs to extract these complex triples from historical Chinese source notes. 

<blockquote class="workflow-tip">
  <span class="callout-label">Key Findings for LLM Extraction in Chinese [1]</span>
  <ul>
    <li><strong>Prompt in Chinese:</strong> When working with Chinese texts, instructing the LLM using Chinese-language prompts generally yields higher accuracy than using English prompts.</li>
    <li><strong>Model Selection:</strong> In recent evaluations extracting historical geographic data, models developed by Chinese companies (such as Baidu’s ERNIE 3.5 and Alibaba’s Qwen-Max) demonstrated significantly lower error rates and fewer hallucinations than Western models like Claude 3.5 Sonnet or ChatGPT-4 when processing classical Chinese texts.</li>
    <li><strong>Few-Shot Prompting:</strong> Always provide the LLM with 2-3 examples of the exact JSON input/output format you expect within the prompt itself.</li>
  </ul>
</blockquote>

**Best Practice:** Use WYD or MARKUS for broad, exploratory reading and markup of classical texts. Use custom Python scripts calling LLM APIs (like ERNIE or Qwen) when you need to extract highly structured, custom relationship data across thousands of documents.

<div class="further-reading">
  <h3>Further Reading</h3>
  <ul>
    <li><a href="https://programminghistorian.org/en/lessons/corpus-analysis-with-spacy">Corpus Analysis with spaCy</a> (Programming Historian)</li>
    <li><a href="https://programminghistorian.org/en/lessons/analyzing-multilingual-text-nltk-spacy-stanza">Analyzing Multilingual French and Russian Text using NLTK, spaCy, and Stanza</a> (Programming Historian)</li>
  </ul>
  <div class="dataset-cite">
    <strong>Dataset Used in This Module</strong>
    East Asian Library, University Library System, University of Pittsburgh. <em>Contemporary Chinese Village Gazetteer Data (CCVG Data)</em>. Accessed June 2026. <a href="https://www.chinesevillagedata.library.pitt.edu/">https://www.chinesevillagedata.library.pitt.edu/</a>
  </div>
</div>

<div class="module-nav-footer">
  <a href="/databaseworkflows/module-2-ocr/" class="module-nav-btn">
    <span class="nav-label">← Previous</span>
    <span class="nav-title">Module 2: OCR</span>
  </a>
  <a href="/databaseworkflows/module-4-apis/" class="module-nav-btn">
    <span class="nav-label">Next →</span>
    <span class="nav-title">Module 4: APIs</span>
  </a>
</div>

<h2 id="references">References</h2>

[1] Chow, Eric H. C., and Greta Heng. "Evaluating LLMs for Linked Data Extraction from Chinese Texts: A Comparative Analysis." *The Digital Orientalist*, January 24, 2025. https://digitalorientalist.com/2025/01/24/evaluating-llms-for-linked-data-extraction-from-chinese-texts-a-comparative-analysis/

[2] Mattingly, William J.B. "Corpus Analysis with spaCy." *Programming Historian* 12 (2023). https://doi.org/10.46430/phen0110

[3] The Digital Orientalist. "A Review of MARKUS: More than Marking Up Classical Chinese." May 5, 2023. https://digitalorientalist.com/2023/05/05/a-review-of-markus-more-than-marking-up-classical-chinese/

[4] The Digital Orientalist. "NLP Tools for Sinology: Introducing the WYD Platform." May 10, 2024. https://digitalorientalist.com/2024/05/10/nlp-tools-for-sinology-introducing-the-wyd-platform/

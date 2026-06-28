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

<div id="toc-rail">
  <div class="toc-track"></div>
  <div class="toc-progress" id="toc-progress-bar"></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="introduction"></a><span class="toc-tooltip">Introduction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="document-level-extraction-ai-assisted-metadata"></a><span class="toc-tooltip">Metadata Extraction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="extracting-metadata-with-an-llm-via-api"></a><span class="toc-tooltip">LLM Prompting</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="building-a-taxonomy-from-ai-tags"></a><span class="toc-tooltip">Taxonomy Building</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="entity-level-extraction-named-entity-recognition-ner"></a><span class="toc-tooltip">NER for Classical Chinese</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="1-markus"></a><span class="toc-tooltip">MARKUS Platform</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="2-the-wyd-platform-pkudh"></a><span class="toc-tooltip">WYD Platform</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="using-llms-for-triple-extraction-linked-data"></a><span class="toc-tooltip">Linked Data Extraction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="references"></a><span class="toc-tooltip">References</span></div>
</div>

<h2 id="introduction">Introduction</h2>

Once you have machine-readable text (whether from OCR, as covered in <a href="/databaseworkflows/module-2-ocr/">Module 2</a>, or from existing digital corpora), the next challenge is pulling structured information out of it. 

This module covers two scales of extraction that use similar underlying logic:
1.  **Document-level Extraction (Metadata):** Extracting titles, dates, issuing authorities, and subject tags from a whole document.
2.  **Entity-level Extraction (NER):** Identifying specific people, places, organizations, and dates within the text.

We will explore how to use Large Language Models (LLMs) and specialized tools like WYD and MARKUS to automate these processes for both modern and classical Chinese sources.

<h2 id="document-level-extraction-ai-assisted-metadata">Document-Level Extraction: AI-Assisted Metadata</h2>

Manually reading thousands of documents to extract basic cataloging information is the most labor-intensive part of building an archive. Recent advancements in LLMs offer a powerful way to automate this data entry, reducing weeks of manual cataloging to hours.

<h3 id="extracting-metadata-with-an-llm-via-api">Extracting Metadata with an LLM via API</h3>

You can use a Python script to pass the raw text of each document to an LLM via its API. By crafting a strict prompt, you instruct the LLM to read the Chinese text and output structured JSON data.

<div class="workflow-note">
<strong>Example Prompt Structure</strong><br>
"You are an expert archivist of modern Chinese history. Read the following OCR text from a historical Chinese government document. Extract the following fields and return them as a JSON object only, with no other text:<br>
- <strong>title:</strong> the formal document title in Chinese<br>
- <strong>date:</strong> the document's date of issuance (YYYY-MM-DD format)<br>
- <strong>issuing_authority:</strong> the government organ or committee that issued the document<br>
- <strong>summary:</strong> a 2-sentence English summary of the document's contents<br>
- <strong>tags:</strong> a list of 3-5 thematic subject tags in English (e.g. 'Land Reform', 'Sent-down Youth')"
</div>

The following Python script demonstrates how to loop through a folder of searchable PDFs, extract the text layer using `pdfplumber`, send it to the OpenAI API, and save the returned metadata to a JSON file:

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

The `tags` field in the prompt above will generate a wide variety of thematic subjects. To make these useful for a database, you must review the full list, consolidate synonyms, and formalize them into a controlled vocabulary.

For example, the LLM might generate "Sent-down Youth", "Rustication", "Xiaxiang Movement", and "Youth Resettlement". You should standardize these to a single preferred term (e.g., "Sent-down Youth") across your dataset.

<div class="workflow-warning">
<strong>The Hallucination Warning</strong><br>
While LLMs are highly effective at extracting metadata, OCR errors in the source text can cause the model to "hallucinate"—generating plausible-sounding but incorrect metadata to fill gaps in degraded text. It is critical to treat all AI-generated metadata as a first draft. A human researcher must review the generated spreadsheet against the original PDFs before importing the data into an archive [1].
</div>

<h2 id="entity-level-extraction-named-entity-recognition-ner">Entity-Level Extraction: Named Entity Recognition (NER)</h2>

Named Entity Recognition (NER) aims to identify and extract pre-defined classifications of specific objects within a text, such as people, locations, official titles, or books.

Classical Chinese presents severe challenges for standard NER tools because it lacks punctuation, spaces between words, and capitalization. Two specialized platforms have been developed specifically to address this for humanities researchers:

<h3 id="1-markus">1. MARKUS</h3>
[MARKUS](https://dh.chinese-empires.eu/) is a widely used, free online reading and text analysis platform. It allows researchers to upload classical Chinese texts and apply automated, semi-automated, and manual markup to identify personal names, place names, temporal references, and bureaucratic offices [2]. 

MARKUS is particularly powerful because it links directly to external authority databases like the China Biographical Database (CBDB) and the China Historical Geographic Information System (CHGIS), allowing you to verify the extracted entities immediately.

<h3 id="2-the-wyd-platform-pkudh">2. The WYD Platform (PKUDH)</h3>
Developed by Peking University’s Research Center for Digital Humanities, the [WYD platform](https://wyd.pkudh.net/) ("Widen Your Data") represents the next generation of classical Chinese NLP. 

Unlike older rule-based systems, WYD integrates a deep learning model trained on 3.3 billion characters of Classical Chinese. It performs automated punctuation prediction, word segmentation, and NER for people, dates, locations, official titles, and books [3]. The newest version also allows users to apply industry-strength LLMs (like GPT-4 or Baidu's ERNIE) directly within the platform interface to assist with extraction [3].

<h2 id="using-llms-for-triple-extraction-linked-data">Using LLMs for Triple Extraction (Linked Data)</h2>

For researchers building Linked Open Data (LOD) or prosopographical networks, you often need more than just a list of names; you need *relationships* (triples: Subject-Predicate-Object).

Recent studies have evaluated the ability of LLMs to extract these complex triples from historical Chinese source notes. 

<div class="workflow-tip">
<strong>Key Findings for LLM Extraction in Chinese [1]</strong>
<ul>
<li><strong>Prompt in Chinese:</strong> When working with Chinese texts, instructing the LLM using Chinese-language prompts generally yields higher accuracy than using English prompts.</li>
<li><strong>Model Selection:</strong> In recent evaluations extracting historical geographic data, models developed by Chinese companies (such as Baidu’s ERNIE 3.5 and Alibaba’s Qwen-Max) demonstrated significantly lower error rates and fewer hallucinations than Western models like Claude 3.5 Sonnet or ChatGPT-4 when processing classical Chinese texts.</li>
<li><strong>Few-Shot Prompting:</strong> Always provide the LLM with 2-3 examples of the exact JSON input/output format you expect within the prompt itself.</li>
</ul>
</div>

**Best Practice:** Use WYD or MARKUS for broad, exploratory reading and markup of classical texts. Use custom Python scripts calling LLM APIs (like ERNIE or Qwen) when you need to extract highly structured, custom relationship data across thousands of documents.

<h2 id="references">References</h2>

[1] Chow, Eric H. C., and Greta Heng. "Evaluating LLMs for Linked Data Extraction from Chinese Texts: A Comparative Analysis." *The Digital Orientalist*, January 24, 2025. https://digitalorientalist.com/2025/01/24/evaluating-llms-for-linked-data-extraction-from-chinese-texts-a-comparative-analysis/

[2] The Digital Orientalist. "A Review of MARKUS: More than Marking Up Classical Chinese." May 5, 2023. https://digitalorientalist.com/2023/05/05/a-review-of-markus-more-than-marking-up-classical-chinese/

[3] The Digital Orientalist. "NLP Tools for Sinology: Introducing the WYD Platform." May 10, 2024. https://digitalorientalist.com/2024/05/10/nlp-tools-for-sinology-introducing-the-wyd-platform/

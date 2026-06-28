---
layout: single
title: "Module 5: Segmentation, Tokenization, and Normalization"
permalink: /databaseworkflows/module-5-segmentation/
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
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="segmentation-and-tokenization"></a><span class="toc-tooltip">Segmentation</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="modern-chinese-jieba"></a><span class="toc-tooltip">Jieba (Modern)</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="classical-chinese-wyd-and-specialized-tools"></a><span class="toc-tooltip">WYD (Classical)</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="text-normalization-as-data-cleaning"></a><span class="toc-tooltip">Data Cleaning</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="reconciling-romanization-variants"></a><span class="toc-tooltip">Romanization</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="standardizing-character-forms"></a><span class="toc-tooltip">Character Forms</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="deduplication-and-date-standardization"></a><span class="toc-tooltip">Date Standardization</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="references"></a><span class="toc-tooltip">References</span></div>
</div>

<h2 id="introduction">Introduction</h2>

Before Chinese-language text can be analyzed computationally—whether for word frequency counts, topic modeling, or full-text search indexing—it must be broken down into meaningful units. Because Chinese text lacks spaces between words, a computer sees only a continuous string of characters. 

This module covers the processes of **segmentation** (identifying word boundaries) and **tokenization** (breaking text into units for a search engine or model), as well as the crucial data cleaning step of **normalization**.

<h2 id="segmentation-and-tokenization">Segmentation and Tokenization</h2>

The process of inserting spaces between words in Chinese text is called segmentation. The tools required for this task differ fundamentally depending on whether the text is modern or classical.

<h3 id="modern-chinese-jieba">Modern Chinese: Jieba</h3>
For modern, vernacular Chinese (baihua), the open-source Python library **Jieba** (结巴, meaning "to stutter") has been the industry standard for years [1]. Jieba uses a combination of a built-in dictionary and statistical probabilities (Hidden Markov Models) to identify word boundaries.

**Why it matters:** If you want to count the most frequent terms in a corpus of 1950s government reports, you must run the text through Jieba first. Otherwise, the computer will only count individual characters, missing multi-character concepts like "revolution" (革命) or "socialism" (社会主义).

<div class="workflow-tip">
<strong>Custom Dictionaries</strong><br>
Jieba allows you to add your own words to its dictionary. This is essential for historical research, as modern segmenters often misidentify historical jargon, political slogans, or proper names [1].
</div>

<h3 id="classical-chinese-wyd-and-specialized-tools">Classical Chinese: WYD and Specialized Tools</h3>
Jieba fails completely when applied to classical Chinese (wenyanwen), as the grammar, vocabulary, and character frequencies are entirely different. Furthermore, classical Chinese relies heavily on single-character words, whereas modern Chinese favors two-character compounds.

Recent advancements have produced tools specifically trained on classical corpora:
*   **The WYD Platform:** As discussed in <a href="/databaseworkflows/module-3-extraction/">Module 3</a>, the PKUDH WYD platform provides highly accurate automated word segmentation for classical Chinese based on a massive premodern training corpus [2].
*   **LLM Assistance:** For transitional texts (e.g., late Qing/early Republican era) that mix classical and vernacular styles, recent studies show that LLMs (like GPT-4) can outperform traditional NLP tools in segmentation accuracy when provided with appropriate prompts [3].

*(Note: Currently, there are no robust, widely available open-source segmentation tools for Tibetan or Manchu that match the ease of use of Jieba for Chinese.)*

<h2 id="text-normalization-as-data-cleaning">Text Normalization as Data Cleaning</h2>

Once text is segmented or extracted into a dataset, it must be normalized. Normalization is the process of resolving inconsistencies so that a computer recognizes identical concepts as identical data points.

<h3 id="reconciling-romanization-variants">Reconciling Romanization Variants</h3>
When combining datasets from different eras or institutions, you will frequently encounter competing romanization systems for the same names or places. Look at the `Province_Pinyin` column in our sample `ccvg_village_information.csv` data: you will see "Kwangtung" (Wade-Giles) alongside "Guangdong" (Pinyin).

To normalize a dataset programmatically, you can use an LLM or a Python script with a lookup dictionary to convert Wade-Giles, Yale, or EFEO spellings to standard Hanyu Pinyin [4]. For Tibetan, ensure all transliterated fields conform strictly to the Extended Wylie standard [5].

<h3 id="standardizing-character-forms">Standardizing Character Forms</h3>
As detailed in <a href="/databaseworkflows/module-1-script-handling/">Module 1</a>, the mixture of Traditional and Simplified characters will fracture your data. Our sample dataset intentionally contains both 广东省 and 廣東省 in the `Province_Chinese` column. If you sort or group by this column in a database, the two will be treated as entirely different provinces.

You can use the Python library `OpenCC` (Open Chinese Convert) to batch-convert the entire column to a single standard (either Traditional or Simplified) in seconds:

```python
import opencc
import pandas as pd

# Initialize converter (Traditional to Simplified)
converter = opencc.OpenCC('t2s.json')

df = pd.read_csv('messy_data.csv')
# Apply conversion to the 'Name' column
df['Name_Normalized'] = df['Name'].apply(lambda x: converter.convert(str(x)))
df.to_csv('clean_data.csv', index=False)
```

<h3 id="deduplication-and-date-standardization">Date Standardization</h3>
Historical datasets often contain dates written in varying formats. Look at the `Year` column in our sample `ccvg_population.csv` data: while most entries are standard four-digit years (e.g., "1978"), one entry uses Republican era notation ("民国三十八年"). If you attempt to graph population over time, this non-numeric string will break your visualization.

<div class="workflow-note">
<strong>Using an LLM Agent for Normalization</strong><br>
You can use an LLM via API to clean and standardize messy columns in a CSV.<br><br>
<em>Example Prompt:</em><br>
"The following is a list of historical dates and years extracted from the CCVG dataset. They are in various formats, including Chinese era names. Please convert every date into a standard four-digit Gregorian year (YYYY). For example, '民国三十八年' should become '1949'. If the date is invalid or unclear, return 'Unknown'. Return only the standardized list."
</div>

By running this normalization pass, you ensure that your dataset can be sorted chronologically and queried accurately when you publish it to a database or archive platform.

<h2 id="references">References</h2>

[1] Breeze Geography. "How to Segment Chinese Texts: Putting in Spaces with Jieba." January 25, 2018. https://breezegeography.wordpress.com/2018/01/25/how-to-segment-chinese-texts-putting-in-spaces-with-jieba/

[2] The Digital Orientalist. "NLP Tools for Sinology: Introducing the WYD Platform." May 10, 2024. https://digitalorientalist.com/2024/05/10/nlp-tools-for-sinology-introducing-the-wyd-platform/

[3] arXiv. "A Comparative Analysis of Word Segmentation, Part-of-Speech Tagging, and Named Entity Recognition in Transitional-Era Chinese Texts." March 25, 2025. https://arxiv.org/html/2503.19844v1

[4] ChinaKnowledge. "Wade-Giles/Pinyin Conversion Table." Accessed June 27, 2026. http://www.chinaknowledge.de/Literature/Script/wadegilespinyin.html

[5] Wikipedia. "Wylie transliteration." Accessed June 27, 2026. https://en.wikipedia.org/wiki/Wylie_transliteration

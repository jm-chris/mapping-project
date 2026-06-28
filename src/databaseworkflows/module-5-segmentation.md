---
layout: single
title: "Module 5: Segmentation, Tokenization, and Normalization"
permalink: /databaseworkflows/module-5-segmentation/
toc: true
toc_sticky: true
classes: wide article-page
sidebar:
  nav: "main_sidebar"
header:
    overlay_image: /assets/images/mp_hero_grid_layered_slate.png
---

## Introduction

Before Chinese-language text can be analyzed computationally—whether for word frequency counts, topic modeling, or full-text search indexing—it must be broken down into meaningful units. Because Chinese text lacks spaces between words, a computer sees only a continuous string of characters. 

This module covers the processes of **segmentation** (identifying word boundaries) and **tokenization** (breaking text into units for a search engine or model), as well as the crucial data cleaning step of **normalization**.

## Segmentation and Tokenization

The process of inserting spaces between words in Chinese text is called segmentation. The tools required for this task differ fundamentally depending on whether the text is modern or classical.

### Modern Chinese: Jieba
For modern, vernacular Chinese (baihua), the open-source Python library **Jieba** (结巴, meaning "to stutter") has been the industry standard for years [1]. Jieba uses a combination of a built-in dictionary and statistical probabilities (Hidden Markov Models) to identify word boundaries.

**Why it matters:** If you want to count the most frequent terms in a corpus of 1950s government reports, you must run the text through Jieba first. Otherwise, the computer will only count individual characters, missing multi-character concepts like "revolution" (革命) or "socialism" (社会主义).

**Custom Dictionaries:** Jieba allows you to add your own words to its dictionary. This is essential for historical research, as modern segmenters often misidentify historical jargon, political slogans, or proper names [1].

### Classical Chinese: WYD and Specialized Tools
Jieba fails completely when applied to classical Chinese (wenyanwen), as the grammar, vocabulary, and character frequencies are entirely different. Furthermore, classical Chinese relies heavily on single-character words, whereas modern Chinese favors two-character compounds.

Recent advancements have produced tools specifically trained on classical corpora:
*   **The WYD Platform:** As discussed in [Module 3](/databaseworkflows/module-3-extraction/), the PKUDH WYD platform provides highly accurate automated word segmentation for classical Chinese based on a massive premodern training corpus [2].
*   **LLM Assistance:** For transitional texts (e.g., late Qing/early Republican era) that mix classical and vernacular styles, recent studies show that LLMs (like GPT-4) can outperform traditional NLP tools in segmentation accuracy when provided with appropriate prompts [3].

*(Note: Currently, there are no robust, widely available open-source segmentation tools for Tibetan or Manchu that match the ease of use of Jieba for Chinese.)*

## Text Normalization as Data Cleaning

Once text is segmented or extracted into a dataset, it must be normalized. Normalization is the process of resolving inconsistencies so that a computer recognizes identical concepts as identical data points.

### Reconciling Romanization Variants
When combining datasets from different eras or institutions, you will frequently encounter competing romanization systems for the same names or places (e.g., "Peking" vs. "Beijing", "Mao Tse-tung" vs. "Mao Zedong").

To normalize a dataset programmatically, you can use an LLM or a Python script with a lookup dictionary to convert Wade-Giles, Yale, or EFEO spellings to standard Hanyu Pinyin [4]. For Tibetan, ensure all transliterated fields conform strictly to the Extended Wylie standard [5].

### Standardizing Character Forms
As detailed in [Module 1](/databaseworkflows/module-1-script-handling/), the mixture of Traditional and Simplified characters, as well as historical variants, will fracture your data. 

If you have a column of names in a spreadsheet, you can use the Python library `OpenCC` (Open Chinese Convert) to batch-convert the entire column to a single standard (either Traditional or Simplified) in seconds:

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

### Deduplication and Date Standardization
Historical datasets often contain duplicate entries with slight variations, or dates written in varying formats (e.g., "1966年5月16日", "May 16, 1966", "1966-05-16").

**Using an LLM Agent for Normalization:**
You can use an LLM via API to clean and standardize messy columns in a CSV. 

> **Example Prompt:**
> "The following is a list of historical dates extracted from Chinese documents. They are in various formats. Please convert every date into the ISO 8601 standard format (YYYY-MM-DD). If a date only contains a year and month, format it as YYYY-MM. If the date is invalid or unclear, return 'Unknown'. Return only the standardized list."

By running this normalization pass, you ensure that your dataset can be sorted chronologically and queried accurately when you publish it to a database or archive platform.

---

## References

[1] Breeze Geography. "How to Segment Chinese Texts: Putting in Spaces with Jieba." January 25, 2018. https://breezegeography.wordpress.com/2018/01/25/how-to-segment-chinese-texts-putting-in-spaces-with-jieba/

[2] The Digital Orientalist. "NLP Tools for Sinology: Introducing the WYD Platform." May 10, 2024. https://digitalorientalist.com/2024/05/10/nlp-tools-for-sinology-introducing-the-wyd-platform/

[3] arXiv. "A Comparative Analysis of Word Segmentation, Part-of-Speech Tagging, and Named Entity Recognition in Transitional-Era Chinese Texts." March 25, 2025. https://arxiv.org/html/2503.19844v1

[4] ChinaKnowledge. "Wade-Giles/Pinyin Conversion Table." Accessed June 27, 2026. http://www.chinaknowledge.de/Literature/Script/wadegilespinyin.html

[5] Wikipedia. "Wylie transliteration." Accessed June 27, 2026. https://en.wikipedia.org/wiki/Wylie_transliteration

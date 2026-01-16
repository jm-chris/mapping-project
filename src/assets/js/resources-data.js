---
layout: none
---
// Generated resources data for faceted search
// Total resources: {{ site.resources.size }}
const resourcesData = [{% for resource in site.resources %}
  {
    objectid: {{ resource.objectid | jsonify }},
    title: {{ resource.title | jsonify }},
    alternatetitle: {{ resource.alternatetitle | jsonify }},
    url: "{{ resource.url }}",
    externalurl: {{ resource.externalurl | jsonify }},
    category: {{ resource.category | jsonify }},
    institution: {{ resource.institution | jsonify }},
    access: {{ resource.access | jsonify }},
    sourcelist: {{ resource.sourcelist | jsonify }},
    tags: {{ resource.tags | jsonify }},
    description: {{ resource.description | jsonify }},
    lastmodified: {{ resource.lastmodified | jsonify }}
  }{% unless forloop.last %},{% endunless %}{% endfor %}
];

// Verify data loaded
if (typeof resourcesData !== 'undefined') {
  console.log('Resources data loaded:', resourcesData.length, 'items');
}
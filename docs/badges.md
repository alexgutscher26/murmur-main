# "Made with local dictation" Badge & Template Directory

Showcase your local, private AI dictation workflow in your open-source repositories, pull requests, issue templates, and documentation.

---

## 1. Quick Badges (Shields.io)

### Flat Square (Recommended for GitHub READMEs & PRs)

```markdown
[![Dictated with Murmur](https://img.shields.io/badge/dictated%20with-Murmur-5865F2?style=flat-square&logo=soundcharts&logoColor=white)](https://murmur.app)
```

**Preview:**  
[![Dictated with Murmur](https://img.shields.io/badge/dictated%20with-Murmur-5865F2?style=flat-square&logo=soundcharts&logoColor=white)](https://murmur.app)

---

### Privacy Badge (Local & Zero Egress)

```markdown
[![100% Local Dictation](https://img.shields.io/badge/voice-100%25%20Local-10B981?style=flat-square&logo=shield&logoColor=white)](https://murmur.app/privacy)
```

**Preview:**  
[![100% Local Dictation](https://img.shields.io/badge/voice-100%25%20Local-10B981?style=flat-square&logo=shield&logoColor=white)](https://murmur.app/privacy)

---

### Minimalist Monochrome

```markdown
[![Murmur](https://img.shields.io/badge/dictation-local%20whisper-18181B?style=flat-square)](https://murmur.app)
```

**Preview:**  
[![Murmur](https://img.shields.io/badge/dictation-local%20whisper-18181B?style=flat-square)](https://murmur.app)

---

## 2. Pull Request & Issue Footer Templates

Paste or speak these triggers directly in your editor:

### Subtle Markdown Footer (Voice Trigger: `"dictated with murmur"` or `"made with local dictation"`)

```markdown
---

_Dictated privately on-device with [Murmur](https://murmur.app)_
```

### Developer PR Template with Footer Badge

```markdown
### 🚀 Pull Request

**Summary:**
<!-- Brief summary of changes -->

**Key Changes:**
-

**Testing Checklist:**

- [ ] Unit tests pass
- [ ] Manual verification completed

---

[![Dictated with Murmur](https://img.shields.io/badge/dictated%20with-Murmur-5865F2?style=flat-square&logo=soundcharts&logoColor=white)](https://murmur.app)
```

---

## 3. HTML Embed Format

For documentation sites (VitePress, Docusaurus, Nextra, Astro Starlight):

```html
<a href="https://murmur.app" target="_blank" rel="noopener noreferrer">
  <img
    src="https://img.shields.io/badge/dictated%20with-Murmur-5865F2?style=flat-square&logo=soundcharts&logoColor=white"
    alt="Dictated with Murmur"
  />
</a>
```

---

## 4. Voice-Triggered Text Expansion

When dictating in Murmur, simply speak the following trigger phrases:

- `"badge template"` -> Inserts the Shields.io badge link.
- `"dictated with murmur"` -> Inserts the subtle italicized footer.
- `"pr template"` -> Inserts the full Pull Request schema.
- `"bug template"` -> Inserts the structured Bug Report schema.
- `"status update"` -> Inserts the daily standup checklist.

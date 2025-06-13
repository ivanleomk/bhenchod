# Dongyo

A GitHub Action for activating and using various coding agents like Amp and Claude with configurable models and trigger words.

## Quick Start

1. Create `.github/workflows/dongyo.yml` in your repository:

```yaml
name: Benchod AI Assistant

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  dongyo:
    if: contains(github.event.comment.body, '@bhenchod')
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Code
        uses: ivanleomk/bhenchod@0.0.1
        with:
          agent: 'claude'
          model: 'claude-3-sonnet'
          trigger-word: '@amp'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

2. Add your API keys to repository secrets:

   - Go to Settings → Secrets and variables → Actions
   - Add `ANTHROPIC_API_KEY` with your Anthropic API key

3. Comment `@benchod` on any issue or PR to activate!

# gstack Configuration

This project uses gstack skills for enhanced AI-assisted development.

## Web Browsing
Use the `/browse` skill from gstack for all web browsing needs. Never use `mcp__claude-in-chrome__*` tools.

## Available gstack Skills
- `/office-hours` - Describe what you're building
- `/plan-ceo-review` - Review feature ideas
- `/plan-eng-review` - Engineering review
- `/plan-design-review` - Design review
- `/design-consultation` - Design consultation
- `/design-shotgun` - Rapid design exploration
- `/design-html` - HTML design work
- `/review` - Code review
- `/ship` - Release preparation
- `/land-and-deploy` - Deployment workflow
- `/canary` - Canary releases
- `/benchmark` - Performance benchmarking
- `/browse` - Web browsing and research
- `/connect-chrome` - Connect to Chrome browser
- `/qa` - Quality assurance testing
- `/qa-only` - QA only mode
- `/design-review` - Design review
- `/setup-browser-cookies` - Browser cookie setup
- `/setup-deploy` - Deployment setup
- `/setup-gbrain` - GBRAIN setup
- `/retro` - Retrospectives
- `/investigate` - Investigations
- `/document-release` - Release documentation
- `/document-generate` - Document generation
- `/codex` - Codex agent
- `/cso` - Chief Security Officer
- `/autoplan` - Automatic planning
- `/plan-devex-review` - Developer experience review
- `/devex-review` - Developer experience
- `/careful` - Careful implementation
- `/freeze` - Freeze specifications
- `/guard` - Security guard
- `/unfreeze` - Unfreeze work
- `/gstack-upgrade` - Upgrade gstack
- `/learn` - Learning mode

## Usage
To use any skill, simply type the skill name (e.g., `/office-hours`) followed by your description or request.

## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
_GS=""
for _D in "${GSTACK_ROOT:-}" "$HOME/.claude/skills/gstack" "$HOME/.codex/skills/gstack" "$HOME/.factory/skills/gstack" "$HOME/.kiro/skills/gstack" "$HOME/.config/opencode/skills/gstack" "$HOME/.slate/skills/gstack" "$HOME/.cursor/skills/gstack" "$HOME/.openclaw/skills/gstack" "$HOME/.hermes/skills/gstack" "$HOME/.gbrain/skills/gstack" "$HOME/.gstack/repos/gstack"; do
  [ -z "$_GS" ] && [ -n "$_D" ] && [ -d "$_D/bin" ] && _GS="$_D"
done
[ -n "$_GS" ] && echo "GSTACK_OK: $_GS" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use the resolved install path above for gstack file paths
(default: ~/.claude/skills/gstack).

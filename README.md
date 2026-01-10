# MainWP Documentation

Official documentation for MainWP - the self-hosted WordPress site management platform.

**Live site:** https://docs.mainwp.com/

## About

This repository contains the source files for MainWP's documentation, built with [Mintlify](https://mintlify.com). The documentation covers:

- Getting started with MainWP
- Dashboard and site management
- Extensions and add-ons
- REST API and Abilities API
- Troubleshooting and customization

## Content Structure

- `/getting-started/` - Introduction and setup guides
- `/dashboard/` - Dashboard features and configuration
- `/sites/` - Site management (plugins, themes, updates, backups)
- `/clients/` - Client management features
- `/add-ons/` - Extension documentation (100+ extensions)
- `/troubleshooting/` - Common issues and solutions
- `/customization/` - Dashboard customization
- `/advanced/` - Advanced topics, security, integrations
- `/api-reference/` - REST API and Abilities API documentation
- `/resources/` - Additional resources

## Local Development

```bash
# Install Mintlify CLI
npm i -g mint

# Start development server
mint dev

# View at http://localhost:3000
```

## Configuration

- `docs.json` - Navigation structure, theme, and site settings
- Navigation uses two tabs: Documentation and Add-Ons

## Contributing

- Follow existing content patterns
- Use MDX format with YAML frontmatter
- Test locally before submitting changes
- See CLAUDE.md for detailed content guidelines

## Resources

- [MainWP Website](https://mainwp.com/)
- [MainWP Support](https://mainwp.com/support/)

### Mintlify Platform

- [Mintlify Documentation](https://mintlify.com/docs) - General docs
- [Components & API](https://mintlify.com/docs/api/introduction) - MDX components
- [Guides](https://mintlify.com/docs/guides) - How-to guides

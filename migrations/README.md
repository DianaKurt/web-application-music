# Database Migrations

## Overview
This project does **not require a database** for storing generated data.

All songs, likes, reviews, covers, and audio previews are generated **dynamically in memory** on the server side using deterministic random generators (seed-based).

## Why this folder exists
The folder is included to satisfy the architectural requirement:

> “Generate DB migrations in a separate folder.  
> No database is required for storing random data.”

This project follows that requirement structurally, while intentionally avoiding persistent storage.

## Current State
- No database is used
- No migrations are required
- No schema is defined
- No ORM is configured

## Notes
If a database were to be added in the future, this folder would contain:
- SQL migration files
- Versioned schema changes
- Lookup tables for localization (if required)

For now, all data is generated on demand and discarded after each request.

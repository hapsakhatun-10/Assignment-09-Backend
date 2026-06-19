# PetHome — Server

REST API backend for the PetHome pet adoption platform. Built with Express and MongoDB.

## Live URL
https://assignment-09-backend.vercel.app/

## Features

- CRUD endpoints for pet listings (create, read, update, delete)
- Adoption request management with approval/rejection workflow
- JWT-based authentication middleware
- Search and filter pets by species and keyword
- Owner-specific and requester-specific data retrieval
- Marks pets as adopted when a request is approved

## NPM Packages Used

- **express** — Web framework for routing and middleware
- **mongodb** — MongoDB database driver
- **cors** — Cross-origin resource sharing
- **dotenv** — Environment variable management
- **jose-cjs** — JWT token verification

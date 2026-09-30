# CivicConnect - Backend API

## Purpose & Current Implementation Status
CivicConnect is a digital service-request management platform designed to replace manual fault-reporting workflows with a controlled digital lifecycle. 
**Current Status:** Milestone 2 (M2) Initial Design Baseline. The backend repository is bootstrapped using Node.js and Express.

## Prerequisites
* Node.js (v24.x)
* npm
* PostgreSQL

## Setup and Run Instructions for project
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and configure local database credentials.
4. Run `npm run dev` to start the local development server.

## Repository Architecture Map
* `/src/api` - Presentation layer handling HTTP requests and REST boundaries.
* `/src/middleware` - Security boundaries enforcing JWT validation and RBAC.
* `/src/services` - Business logic layer containing request state transitions.
* `/src/models` - Data persistence layer defining database entities.

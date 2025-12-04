# Contributing to Platform Mesh IAM UI

We want to make contributing to this project as easy and transparent as possible.

## Project Overview

This is the Platform Mesh IAM (Identity and Access Management) UI, an Angular-based web application that provides a user interface for user and role management. The application integrates with the Platform Mesh IAM Service via GraphQL and offers both a standalone UI and web components for flexible integration into different environments. It uses SAP Fundamental for UI components and SAP Luigi for micro-frontend orchestration.

## Development Setup

### Prerequisites
1. Node.js (check [package.json](package.json) for exact version)
2. npm package manager
3. Platform Mesh IAM Service (for GraphQL API)

### Environment Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the GraphQL endpoint and any required environment variables

## Development Commands

### Building
```bash
# Build the library project (required first)
npm run build:lib

# Build library in watch mode for development
npm run build:lib:watch

# Build all projects (lib, ui, and wc)
npm run build

# Build UI only
npm run build:ui

# Build web components only
npm run build:wc
```

### Running Locally
```bash
# Run UI application
npm run start:ui

# Run UI with library watch mode (recommended for development)
npm run start:ui:watch

# Run web components
npm run start:wc
```

### Testing
```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run tests with coverage
npm run test:cov

# Run UI tests with coverage
npm run test:ui:cov

# Run web components tests with coverage
npm run test:wc:cov
```

### Code Quality
```bash
# Format code with Prettier
npm run format

# Check code formatting
npm run check-format

# Run linting
npm run lint

# Run linting with auto-fix
npm run lint:fix

# Lint UI only
npm run lint:ui

# Lint web components only
npm run lint:wc

# Full validation pipeline (format check + lint)
npm run pipeline
```

## Architecture

### High-Level Structure
- **projects/lib**: Shared library with common components, services, and utilities
- **projects/ui**: Standalone UI application
- **projects/wc**: Web components for integration

### Project Structure
```
iam-ui/
├── projects/
│   ├── lib/          # Shared library
│   ├── ui/           # Standalone UI application
│   └── wc/           # Web components
├── package.json
└── angular.json
```

## Development Patterns

### Component Development
- Use SAP Fundamental NGX components for consistent UI
- Follow Angular style guide and best practices
- Implement reactive patterns with RxJS
- Use NgRx for state management where appropriate

### GraphQL Integration
- Apollo Client is configured for GraphQL communication
- Use typed GraphQL queries and mutations
- Handle loading, error, and success states appropriately

### Multi-tenancy
- Tenant information should be handled through the authentication context
- Ensure all API calls include proper tenant context

## Common Development Tasks

### Adding New Features
1. Start with the shared library (`projects/lib`) for reusable components
2. Implement feature in UI or WC projects as needed
3. Add appropriate tests
4. Update documentation

### Working with Web Components
1. Make changes in `projects/wc`
2. Test integration with Luigi framework
3. Ensure proper event handling and communication

## Pull Requests

You are welcome to contribute with your pull requests. These steps explain the contribution process:

1. Fork the repository and create your branch from `main`.
2. [Add tests](#testing) for your code.
3. If you've changed APIs or components, update the documentation.
4. Make sure the tests pass and code is properly formatted.
5. Run `npm run lint` to ensure code quality.
6. Sign the Developer Certificate of Origin (DCO).

## Testing Strategy

- Unit tests for all components and services (`*.spec.ts`)
- Use Jest for testing framework
- Mock external dependencies (GraphQL API, Luigi, etc.)
- Test both UI and web component variants
- Maintain high test coverage

> **NOTE:** You should always add tests when adding code to our repository.

## Technology Stack
- **Framework**: Angular 20
- **UI Components**: SAP Fundamental NGX
- **Micro-frontend**: SAP Luigi
- **GraphQL**: Apollo Client (Angular)
- **State Management**: NgRx Effects
- **Testing**: Jest with Jest-Preset-Angular
- **Linting**: ESLint with Angular ESLint
- **Formatting**: Prettier
- **Build**: Angular CLI with esbuild
- **Package Manager**: npm (enforced via preinstall hook)

## Code Style

This project uses:
- **Prettier** for code formatting
- **ESLint** with Angular-specific rules for linting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

The pre-commit hook will automatically:
- Format code with Prettier
- Run ESLint on TypeScript files
- Prevent commits if checks fail

## Issues
We use GitHub issues to track bugs. Please ensure your description is
clear and includes sufficient instructions to reproduce the issue.
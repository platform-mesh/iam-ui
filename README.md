> [!WARNING]
> This Repository is under development and not ready for productive use. It is in an alpha stage. That means APIs and concepts may change on short notice including breaking changes or complete removal of apis.

# Platform Mesh - iam-ui
![Build Status](https://github.com/platform-mesh/iam-ui/actions/workflows/pipeline.yml/badge.svg)

## Description

The platform-mesh iam-ui provides the user interface for managing users and roles within the Platform Mesh ecosystem. It offers both a standalone UI and web components for flexible integration. The application is based on [Angular](https://github.com/angular), uses [SAP Fundamental](https://github.com/SAP/fundamental-ngx) for UI components, and [SAP Luigi](https://github.com/SAP/luigi) for micro-frontend orchestration.

## Features
- User management interface with GraphQL API integration
- Role and permission management
- Multi-tenant support
- Web components for modular integration
- Luigi micro-frontend support
- SAP Fundamental design system

## Getting Started
- For running and building the iam-ui, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file in this repository.
- To deploy the iam-ui to kubernetes, please refer to the [helm-charts](https://github.com/platform-mesh/helm-charts) repository.

## Releasing

The release is performed automatically through a GitHub Actions Workflow.
All the released versions will be available through access to GitHub.

## Requirements

The iam-ui requires an installation of Node.js and npm. Checkout the [package.json](package.json) for the required Node.js version and dependencies.

## Contributing

Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file in this repository for instructions on how to contribute to Platform Mesh.

## Code of Conduct

Please refer to our [Code of Conduct](https://github.com/platform-mesh/.github/blob/main/CODE_OF_CONDUCT.md) for information on the expected conduct for contributing to Platform Mesh.

<p align="center"><img alt="Bundesministerium für Wirtschaft und Energie (BMWE)-EU funding logo" src="https://apeirora.eu/assets/img/BMWK-EU.png" width="400"/></p>

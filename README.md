# Evidence Handling Service

This repository contains a Node.js service built to receive webhooks from GitHub, GitLab, and Qase IO. The processed data is then formatted into evidence reports for integration with the Digiteam application.

## Table of Contents
- [Introduction](#introduction)
- [Usage](#usage)
- [Format for Evidence in Description](#format-for-evidence-in-description)
- [Tech Stack](#tech-stack)
- [External Services](#external-services)
- [Setup](#setup)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Evidence Handling Service is designed to streamline the process of generating evidence reports for the Digiteam application. It accepts webhooks from GitHub, GitLab, and Qase IO, processes the data, and creates reports based on a specified format.

## Usage

To use this service, follow the instructions outlined in the [Format for Evidence in Description](#format-for-evidence-in-description) section. Ensure that your webhook descriptions adhere to the specified format to generate accurate evidence reports.

## Format for Evidence in Description

Add the following format to your webhook description:

```markdown
# Evidence
- title: [Judul Laporan]
- project: [Nama Project]
- participants: [Nama Anggota 1], [Nama Anggota 2], ...
- screenshot: [URL Screenshot]
- date: [Tanggal (optional, format: yyyy-mm-dd)]
- attachment: [URL Lampiran 1], [URL Lampiran 2], ...
```

Replace the placeholders with the relevant information for your evidence report.

## Tech Stack

- Node.js v14
- TypeScript
- Docker
- Express (HTTP framework)
- Redis

## External Services

- Screenshot Service
- Telegram
- Telegram User (containing Digiteam members list)

## Setup

Follow these steps to set up and run the Evidence Handling Service:

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Configure environment variables (e.g., GitHub, GitLab, Qase IO credentials, Redis connection).
4. Build the TypeScript code using `npm run build`.
5. Run the service using `npm start`.

## Contributing

Contributions are welcome! Please follow the guidelines outlined in the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

This project is licensed under the [MIT License](LICENSE).
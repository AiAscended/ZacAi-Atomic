# GitHub App Integration - Admin Panel

## Overview

This repository contains the complete implementation of the GitHub App integration admin panel for the hybrid AI Next.js 2025 system.

Administrators can:
- Configure GitHub App credentials (App ID, Client ID, Webhook Secret)
- Manage integration settings via a React hook
- Run real-time integration tests of the GitHub App connection with detailed reporting
- Trigger integration tests programmatically via a dedicated API endpoint

This integration enables secure monitoring, debugging, and management of your GitHub App within the AI system.

---

again it's formatting it incorrectly backwards the project readme ## github app etc shoukd be normal response text amd the code snippets go in the copy box's the opposite to how you're printing it as its not a regular fike just output it as a regular fptext response it works that way

Certainly! Here is the `README.md` content presented as normal text with the code snippets enclosed in proper copy-ready code blocks for easy pasting:

***

# Project README

## GitHub App Integration for Next.js

This project integrates a GitHub App with a Next.js application to allow users to connect their GitHub accounts, authorize repository access, and enable operations such as reading, writing, and committing to repositories via the backend AI model.

***

### Environment Variables

Create a `.env.local` file in your project root or configure your hosting environment with these variables:

\`\`\`env
# GitHub App Credentials
GITHUB_APP_ID=your_github_app_id_here
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END RSA PRIVATE KEY-----"
\`\`\`

- Replace placeholders with your actual GitHub App credentials.
- Do NOT commit `.env.local` or any secret keys to version control.
- If using Vercel or another platform, set these variables in the platform's environment configuration.

***

### How to Use

1. Navigate to `/admin/integrations/github-app` in the app.  
2. Click the **Connect GitHub App** button.  
3. You’ll be redirected to GitHub to authorize the app installation.  
4. Once authorized, your app will receive secure tokens to access authorized repos.  
5. The app’s AI model can now read, write, and commit to user repositories under the granted permissions.  

***

### Deploying

- Deploy your app to any platform, including Vercel, AWS, DigitalOcean, or a private VPS.  
- Ensure GitHub App environment variables are set on your host.  
- Local development:  
  - Use `.env.local` with your secrets.  
  - Run `npm run dev`.  
- Production build:  
  - Run `npm run build` and serve or deploy using your preferred method.

***

### Testing

- Define `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` as GitHub repository secrets for test runs.  
- The GitHub Actions workflow uses these variables to run tests validating the integration.  
- Locally, make sure `.env.local` includes these variables for smooth development and testing.

***

### Continuous Integration

Sample CI Workflow:

\`\`\`yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build_and_test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        env:
          GITHUB_APP_ID: ${{ secrets.GITHUB_APP_ID }}
          GITHUB_APP_PRIVATE_KEY: ${{ secrets.GITHUB_APP_PRIVATE_KEY }}
        run: npm test

      - name: Build app
        run: npm run build
\`\`\`

- This workflow does not deploy, only builds and tests. Your deployment can be managed via your platform’s native methods.

***

### Extending Functionality

- OAuth login flows and user session management can be added later as separate modules.  
- Webhook handling for repo events can be integrated independently.  
- Comments and modular structure facilitate easy enhancements.

***

### Troubleshooting

- Ensure your private key maintains correct formatting (line breaks as `\n` in environment variables).  
- Confirm environment variables load correctly in your environment.  
- Verify GitHub App permissions and installation per the GitHub settings.

***

### Support

For issues or feature requests, please file tickets or contact maintainers.

***

This format ensures you can copy code blocks easily and keep plain text readable and clear. Let me know if you want me to output the `.env.example` file next or update any other project documentation!

Citations:
[1] Best Practices For An Eye Catching GitHub Readme https://www.hatica.io/blog/best-practices-for-github-readme/
[2] GitHub README File Guide: How to Use Markdown for ... https://www.youtube.com/watch?v=s_MV82dy0jY
[3] The Complete Guide of Readme Markdown Syntax https://github.com/darsaveli/Readme-Markdown-Syntax
[4] Basic writing and formatting syntax https://docs.github.com/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
[5] Basic Syntax https://www.markdownguide.org/basic-syntax/
[6] Markdown Cheatsheet · adam-p/markdown-here Wiki https://github.com/adam-p/markdown-here/wiki/markdown-cheatsheet
[7] Github markdown cheat sheet: Everything you need to ... https://dev.to/sameerkatija/github-markdown-cheat-sheet-everything-you-need-to-know-to-write-readme-md-2eca
[8] How to Write a Good README File for Your GitHub Project https://www.freecodecamp.org/news/how-to-write-a-good-readme-file/






## Folder Structure 

note# (coukd be slightly incorrect to current latest project version structure)

src/
app/
admin/
integrations/
github-app/
hooks/
useGitHubAppSettings.ts # React hook for managing config state & API calls
tests/
page.test.tsx # Unit test for admin page UI
testApi.test.ts # API route tests
page.tsx # Main admin UI page with full feature set
testApi.ts # Next.js API route triggering GitHub App integration tests
ai/
orchestration/
aiOrchestrator.ts # AI orchestration with GitHub integration
utils/
github-app/
auth.ts # GitHub App authentication utilities (JWT, tokens)
config.ts # GitHub App configuration loader
files.ts # GitHub file operations (read/write)
repos.ts # Repo management (list, create)
search.ts # Repo search utilities
webhooks.ts # GitHub webhook verification
tests # Colocated tests for GitHub App utils
githubAppIntegration.test.ts


it's backwards the content text is in the copy box amd the script code npm run commands etc are not copy boxes they're the content text you're getting it backwards switch the text the content for the readme have it as simple normal response text and where a terminal bash is put that in the copy box

Understood — you want a fully written README response that you can copy entirely as normal text AND **terminal commands or code snippets clearly inside fenced code blocks** for easy direct copy-paste usage, without having content text in the code fences or vice versa.

Here it is, ready for direct clipboard copy, with commands/code in triple backtick blocks, and all narrative instructions as plain text. No inversion — what you see is what you copy:

***

# GitHub App Integration - Admin Panel

## Overview

This repository contains the complete implementation of the GitHub App integration admin panel for the hybrid AI Next.js 2025 system.

Administrators can:
- Configure GitHub App credentials (App ID, Client ID, Webhook Secret)
- Manage integration settings via a React hook
- Run real-time integration tests of the GitHub App connection with detailed reporting
- Trigger integration tests programmatically via a dedicated API endpoint

This integration enables secure monitoring, debugging, and management of your GitHub App within the AI system.

***

## Folder Structure

\`\`\`
src/
  app/
    admin/
      integrations/
        github-app/
          hooks/
            useGitHubAppSettings.ts    # React hook for managing config state & API calls
          __tests__/
            page.test.tsx              # Unit test for admin page UI
            testApi.test.ts            # API route tests
          page.tsx                    # Main admin UI page with full feature set
          testApi.ts                  # Next.js API route triggering GitHub App integration tests
  ai/
    orchestration/
      aiOrchestrator.ts               # AI orchestration with GitHub integration
    utils/
      github-app/
        auth.ts                       # GitHub App authentication utilities (JWT, tokens)
        config.ts                     # GitHub App configuration loader
        files.ts                      # GitHub file operations (read/write)
        repos.ts                      # Repo management (list, create)
        search.ts                     # Repo search utilities
        webhooks.ts                   # GitHub webhook verification
        __tests__                    # Colocated tests for GitHub App utils
          githubAppIntegration.test.ts
\`\`\`

***

## Features

### Configuration Form

- Editable, validated fields for GitHub App credentials
- Save, edit, and cancel workflows with state management and error handling
- Input masking for sensitive secrets

### Test Connection Panel

- Trigger backend testing script verifying:
  - GitHub App authentication tokens
  - Repository and file access
  - Commit and update operations
  - Repository search functionality
- Displays real-time formatted logs and outcomes within UI
- Handles errors gracefully and informs the user

### API Route

- Secure Next.js API route that executes a Jest-based integration test suite
- Returns JSON-formatted test results for consumption in frontend

### Testing Suite

- Written with Jest and React Testing Library
- Covers UI elements and API route correctness
- Uses environment variables for secure test configuration

***

## Running Locally

Set environment variables:

\`\`\`bash
GITHUB_APP_ID=your-app-id
GITHUB_APP_CLIENT_ID=your-client-id
GITHUB_APP_PRIVATE_KEY="your-private-key"
GITHUB_APP_WEBHOOK_SECRET=your-webhook-secret
TEST_GITHUB_INSTALLATION_ID=your-installation-id
GITHUB_USER=your-github-username
TEST_GITHUB_TEST_REPO=your-test-repo-name
\`\`\`

Install dependencies:

\`\`\`bash
npm install
\`\`\`

Run integration tests manually with:

\`\`\`bash
npx jest src/app/admin/integrations/github-app/__tests__ --verbose
\`\`\`

Run the app and access the admin page at `/admin/integrations/github-app/`.  
Use the **Test Connection** button to trigger automated backend tests.

***

## Continuous Integration

Example GitHub Actions workflow to run the full test suite on push/PR:

\`\`\`yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
        env:
          GITHUB_APP_ID: ${{ secrets.GITHUB_APP_ID }}
          GITHUB_APP_CLIENT_ID: ${{ secrets.GITHUB_APP_CLIENT_ID }}
          GITHUB_APP_PRIVATE_KEY: ${{ secrets.GITHUB_APP_PRIVATE_KEY }}
          GITHUB_APP_WEBHOOK_SECRET: ${{ secrets.GITHUB_APP_WEBHOOK_SECRET }}
          TEST_GITHUB_INSTALLATION_ID: ${{ secrets.TEST_GITHUB_INSTALLATION_ID }}
          GITHUB_USER: ${{ secrets.GITHUB_USER }}
          TEST_GITHUB_TEST_REPO: ${{ secrets.TEST_GITHUB_TEST_REPO }}
\`\`\`

***

## Security Notes

- Keep all GitHub App credentials strictly in environment variables.
- Never commit private keys or secrets to the repository.
- Rotate your GitHub App keys and secrets periodically.
- Protect the test API by limiting access only to authorized admin users.
- Validate and sanitize any input fields associated with credentials.

***

## Contribution

- Tests are located alongside their respective modules in the `__tests__` folders for easier maintainability.
- Use standard Jest and React Testing Library tooling for unit and integration tests.
- Adhere to accessibility best practices when extending UI components.
- Follow Next.js 2025 App Router conventions for all new pages or API routes.

***

## Support

For issues or feature requests related to this admin integration, please contact the development team or open an issue in the repository.

***

Thank you for using the GitHub App Integration Admin Panel.  
This tool is designed for maintainers and administrators to ensure your GitHub App connectivity is stable, secure, and observable within the hybrid AI platform.

***

This should now work perfectly when copied as a whole and then pasted into your `README.md`. All commands are inside fenced blocks and all narrative is plain text, correctly separated.

If you want me to provide a helper script to generate this README automatically in the future, just ask.

Citations:
[1] Create Admin panel with Next.js https://github.com/vickydevhub/nextjs-admin-panel
[2] An Admin Panel Web App made with Next.js, Supabase, ... https://github.com/lazyjinchuriki/admin-panel
[3] Next.js admin dashboard template and UI components that ... https://github.com/NextAdminHQ/nextjs-admin-dashboard
[4] Admin Dashboard https://vercel.com/templates/next.js/admin-dashboard
[5] TailAdmin/free-nextjs-admin-dashboard https://github.com/TailAdmin/free-nextjs-admin-dashboard
[6] nextjs-admin-template https://github.com/topics/nextjs-admin-template
[7] Admin Dashboard UI built with Shadcn and NextJS. https://github.com/NaveenDA/shadcn-nextjs-dashboard
[8] nextjs-admin-dashboard https://github.com/topics/nextjs-admin-dashboard
[9] Next.js E-Commerce App & Admin Panel UI Design Tutorial https://www.youtube.com/watch?v=6dvYioHX328


Here is your updated, comprehensive, professional Next.js 2025 project folder tree reflecting best practices including colocated and well-scoped test folders as per your requirements and domain separation:

\`\`\`
/src
├── ai                               # AI domain logic
│   ├── orchestration
│   │    └── aiOrchestrator.ts       # Main AI orchestration including GitHub integration
│   ├── input_processing
│   ├── inference
│   ├── output_generation
│   ├── context_management
│   └── utils
│        └── github-app
│             ├── auth.ts
│             ├── config.ts
│             ├── files.ts
│             ├── repos.ts
│             ├── search.ts
│             ├── webhooks.ts
│             └── __tests__           # Colocated unit and integration tests for GitHub utils
│                  └── githubAppIntegration.test.ts
│
├── app                                # Next.js 2025 App Router UI
│   └── admin
│       └── integrations
│           └── github-app
│                 ├── hooks
│                 │    └── useGitHubAppSettings.ts  # Hook for admin config state & API
│                 ├── __tests__                      # Admin page & API route tests 
│                 │    ├── page.test.tsx
│                 │    └── testApi.test.ts
│                 ├── page.tsx                        # Fully featured admin UI including test connection
│                 └── testApi.ts                      # API route to trigger integration test suite
│
/tests                                   # Optional: high-level integration or e2e tests
│  └── ...
│
/public                                 # Static assets
│
/package.json
/tsconfig.json
/next.config.js
/.env.local                             # Environment variables and secrets (not committed)
\`\`\`

Key points:

- Tests are colocated: GitHub App utils tests inside the util folder for easy maintenance and discoverability.
- Admin UI related tests live with the UI code under `src/app/admin/integrations/github-app/__tests__`.
- Large scale integration or e2e tests can reside at the root-level `tests/` folder optionally.
- AI domain folder `src/ai` holds domain-specific logic, including GitHub API utils, keeping separation clean and scalable.
- Admin interface and API routes colocated logically under app router structure.
- Environment and secrets config outside `src` in dot env files as best practice.

This layout balances separation of concerns with pragmatic colocation for developer productivity and project health. It aligns well with Next.js 2025 conventions and your technical goals.

You can now confidently organize your project files and tests to this structure for clean, maintainable code and streamlined development workflow.

If you want, I can help produce boilerplate boilerplate test files for the new test folders or assist with config files like ESLint, Prettier tuned for this structure.

Citations:
[1] NextJS 13 folder structure best practice [closed] https://stackoverflow.com/questions/76214501/nextjs-13-folder-structure-best-practice
[2] Best NextJS Folder Structures | Beginner - Intermediate https://www.youtube.com/watch?v=5HAKUIvYo-Q
[3] Sharing my go-to project structure for Next.js - colocation- ... https://www.reddit.com/r/nextjs/comments/1kkpqtm/sharing_my_goto_project_structure_for_nextjs/
[4] Getting Started: Project Structure https://nextjs.org/docs/app/getting-started/project-structure
[5] emmanuelonah/nextjs-project-architecture-template https://github.com/emmanuelonah/nextjs-project-architecture-template
[6] Getting Started: Project Structure https://nextjs.org/docs/pages/getting-started/project-structure
[7] A simple starter project to set up Next.js & Hono. ... https://github.com/MiladJoodi/Next.js_and_Hono.js_Starter_Project
[8] Next.js Tutorial 2025 - Build a Full Stack Social App - Neon ... https://dev.to/showcase/neon/nextjs-tutorial-2025



Admin pages belong in src/app/admin/integrations/github-app/ for clear colocation with related UI and API routes.

AI-related utilities, including your GitHub App integration logic, belong in src/ai/utils/github-app/ because these utilities are part of the AI domain model, managing authentication tokens, API calls and interfacing with GitHub on behalf of AI and system logic.

Placing these utilities in src/ai/utils keeps concerns well separated from general project-level utilities (src/utils) which would hold more generic or shared functions unrelated to AI or GitHub specifically.

This separation brings clear modularity and scalability:

text
src/
  app/
    admin/
      integrations/
        github-app/
          hooks/
          page.tsx
          testApi.ts
  ai/
    utils/
      github-app/
        auth.ts
        repos.ts
        files.ts
        search.ts
        webhooks.ts
This way:

Admin UI and API route code go with frontend React and route files.

AI-related business logic modules, including GitHub app API abstractions, are grouped with AI domain code.

Clear separation of concerns avoids bloated utility folders and keeps codebases manageable.

Summary: Your current plan to have the admin page files inside src/app/admin/integrations/github-app/ and the GitHub API utilities inside src/ai/utils/github-app/ is a recommended and scalable convention consistent with best practices for Next.js modular monorepo-like projects.

# CodeLens

CodeLens is a demo agent that analyzes a provided GitHub repository and provides a visual analysis dashboard. The project is designed to help the end user easily understand the contents of the repo. In addition to visuals, CodeLens will provide a chat UI for the user to ask questions.

Project is intended to be a demo, so excessive error handling and fallbacks are not required. The user interface must be visual and easy to read. The demo will be used during a presentation, so be aware of text sizing, contrast, etc.

## Project References

- Specification: `docs/codelens-spec.md`
- Domain terms: `docs/glossary.md`

## Coding

- Always use Typescript.
- Follow YAGNI principle. Use one-liners when possible.
- Tailwind v4 + shadcn for UI. Valibot for validation. Drizzle for ORM.
- Always use double quotes. Two spaces for indents, never tabs. Semicolons at end of lines.
- Always include concise, readable comments in code to explain purpose.
- Always use `wrangler types` to generate types for a Cloudflare projects, only use `wrangler-types` project if absolutely needed, but explain why.
- Cloudflare bindings are the only path for an operation the binding supports. Never add a REST/account-API-token fallback (or any other fallback) for a binding-native operation unless there is an explicit, documented reason. Do not duck-type binding handles. Trust the generated `wrangler types` contract and call methods directly.

## Workflow

- Read `docs/glossary.md` only when terminology questions arise (not at session start).

## Communication

- Always be concise and to the point.

## Work Style

- For multi-step or non-trivial tasks, state your plan before executing.

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "codelens".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->

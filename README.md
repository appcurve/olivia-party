# OliviaParty Accessibility Project

Our project goal is to democratize the capability to design and build effective and affordable accessibility solutions for those with disabilities and special needs.

OliviaParty started as a DIY side-project for a very special young girl with requirements that go beyond the scope of off-the-shelf accessibility aids.

This repo houses the initiative to "productize" the solution for 1.0 release to the world under open source license:

- **OP-BOX**
  - **HW** - simplified universal version of the hardware design that can be customized and extended
  - **UI** - react web app that interfaces with the hardware (and generic USB gamepads + keyboards)
  - **UP** - a standalone linux-powered device that can run HW + UI in kiosk or mobile applications
- **OP-MANAGER** - admin/caregiver web app to enable non-technical caregivers to manage features
- **OP-WEBSITE** - public website to communicate the project and host a working deployment of the OP-BOX-UI

Our website + a preview release is coming soon.

Anything in this project is to be used at your — and your users' — own risk.

## Project history

The first hardware prototype was built using a commodity arcade joystick + buttons that interfaced with a React-powered UI that can be run by modern web browsers.

The UI leveraged the lesser-known [GamePad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API) and [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) and animated interactions with the react-spring library.

Stable features included a "Video Mode" for cycling between YouTube videos and a "Speech Mode" for cycling between different phrases.

Various experimental features were developed for fun + play including working foundations of a 3D world using WebGL.

## Technologies

Apps and libraries are organized in a monorepo format managed by the [Nx build system](https://nx.dev) with yarn serving as the node package manager.

- front-end: React powered by NextJS, leveraging react-query, react-hook-form, tailwindcss
- back-end: nestjs + prisma + postgres
- IaC (infrastructure): aws-cdk
- hardware: ubuntu, ansible, arduino, intel SBC's

## Development

Refer to `package.json` for the complete set of available `scripts`.

### Prerequisites

#### System requirements

This project was developed in a linux-based development environment ([Ubuntu](https://ubuntu.com/desktop/developers)).

- Windows users can run the project in a linux environment via [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install).
- MacOS is theoretically compatible however there may be issues with bash scripts. Running the project in an Ubuntu Docker environment is recommended.

#### Software dependencies

- git
- nodejs with yarn v3+
- docker with `docker compose`
- aws-cli

### Local development dependencies

#### Environment (env) files

To run the project, environment (`.env`) files must be created with reasonable and valid values. Refer to corresponding `.env.sample` files as in-line reference/documentation.

- `.env` (root of project folder)
- `apps/ui/.env` + `apps/ui/.env.production`
- `apps/api/.env`

Please take care to ensure that you keep any secrets such as passwords are secure and do not commit or push any `.env` files to version control.

#### Running the development server

Install project dependencies by running `yarn` in the root of the project folder.

The development database server (postgres) can be started with `yarn docker:postgres:up`.

> This project exposes postgres on non-standard port `5482` to help avoid potential local conflicts with the postgres default port `5432`. Refer to `docker-compose.yml` for the Docker configuration.

Run `docker compose down` to stop all Docker containers.

Once the database server is running:

- Generate the Prisma client with `yarn prisma:generate`.
- Push any changes to the Prisma schema to the database with `yarn prisma:db:push`.
- Optionally run the database seed script to populate the database with dummy/dev data: `yarn prisma:db:seed`.

Local development servers for project UI + API may be started with: `yarn start`.

You can stop a running dev server by sending it a SIGINT signal (<kbd>CONTROL</kbd> + <kbd>C</kbd>)

The back-end API runs on port `3333` and the front-end UI on port `4200`.

The UI may be accessed in your web browser at <http://localhost:4200/> when the dev server is running.

The API is available at <http://localhost:4200/api> due to proxy configuration in `apps/ui/proxy.conf.json`.

The development server should be stopped + restarted after changing package dependencies or making any significant changes to libraries or the project structure.

Run tests with `yarn test:all`

Run build with `yarn build:all`.

The UI ships as a [NextJS static HTML export](https://nextjs.org/docs/advanced-features/static-html-export). Create a fresh export with the command: `yarn export:ui:prod`.

Build output can be found in the project `dist/` folder.

Run `nx graph` to generate a diagram of the dependencies within the Nx workspace.

Refer to the helper scripts in `scripts/workflow/`. These may need to be modified to work with your local environment.

### Working with Prisma

Refer to the [Prisma docs](https://www.prisma.io/docs/) to understand its [developer workflow](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate).

This project defines the following helper script targets in `package.json`.

- `yarn prisma:generate`
- `yarn prisma:migrate:dev`
- `yarn prisma:migrate`
- `yarn prisma:migrate:reset`
- `yarn prisma:push`
- `yarn prisma:seed`

Running the above scripts with `yarn` ensures that the correct `schema.prisma` file and `.env` files are used.

Start the Prisma Studio GUI editor with `yarn prisma:studio`.

### Docker build

To build a Docker image of the API using `docker compose`:

```sh
docker compose build api
```

In troubleshooting or major-change scenarios, it can be helpful to rebuild the image without cache:

```sh
# troubleshooting -- (re)build api image without cache
docker compose build api --no-cache

# troubleshooting -- (re)build api image without cache + fresh pull of base image
docker compose build api --no-cache --pull
```

To run the image in a container, ensure the local api dev server is off and that the local dev postgres database is running, then run:

```sh
docker compose up api
```

### AWS CDK

The 'infra' app (`apps/infra`) is an Infrastructure-as-Code (IaC) solution implemented in AWS CDK for the deployment of the project to an AWS environment.

You must also ensure CDK has been [bootstrapped](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) in both your preferred AWS region (e.g. `ca-central-1`) and `us-east-1`. The `us-east-1` region is a requirement of certain resources including CloudFront and Edge Lambdas.

> If you have multiple AWS account profiles add the `--profile PROFILE_NAME` flag to `cdk` commands to specify a profile other than your default (this is the same as you would for the aws cli).

The aws-cdk project is integrated with the Nx project monorepo so it must be built prior to running any cdk commands:

```sh
yarn build:infra
```

You may run `cdk` commands directly, via `npx`, or via the scripts defined in `package.json`:

```sh
# be careful! you may incur costs or destroy your infrastructure!
# we are not responsible for your mistakes :)

yarn cdk:synth [STACK_NAME]
yarn cdk:deploy [STACK_NAME]
yarn cdk:destroy [STACK_NAME]
```

The CDK stacks related to the UI should invalidate the CloudFront cache. However it can be helpful in dev + troubleshooting scenarios to force a cache invalidation. It can be a good idea to rule out cache issues before investing time debugging issues with the production app or deployments.

```sh
# refer to aws cli docs for additional flags e.g. --paths "/example/*"
aws cloudfront create-invalidation --distribution-id [CLOUDFRONT_DISTRIBUTION_ID]
```

## Acknowledgements

Thank-you to the authors and community of NodeJS, TypeScript, React, NestJS, NextJS, tailwindcss, headlessui, react-spring, react-hook-form, and of course the pmndrs collective.

Shout outs to:

- Theodorus Clarence (@theodorusclarence on GitHub) for the foundations of reusable form input components that integrate with react-hook-form (distributed under MIT license). They have since been extensively modified however they served as a helpful starting point.

  - <https://github.com/theodorusclarence/ts-nextjs-tailwind-starter>
  - <https://github.com/theodorusclarence/expansion-pack>

- Algoan (<https://www.algoan.com/>) for the reference provided by some of their open-source NestJS components available at <https://github.com/algoan/nestjs-components> (distributed under ISC license).

- Matt Lehrer (@mattlehrer on GitHub) for the NestJS strong password validator from <https://github.com/mattlehrer/nest-starter-pg-auth> (distributed under MIT license).

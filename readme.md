[![Build Status](https://travis-ci.org/DEFRA/hapi-web-boilerplate.svg?branch=master)](https://travis-ci.org/DEFRA/hapi-web-boilerplate) [![Maintainability](https://api.codeclimate.com/v1/badges/5c3956c73c9b1496dadd/maintainability)](https://codeclimate.com/github/DEFRA/hapi-web-boilerplate/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/5c3956c73c9b1496dadd/test_coverage)](https://codeclimate.com/github/DEFRA/hapi-web-boilerplate/test_coverage) [![Greenkeeper badge](https://badges.greenkeeper.io/DEFRA/hapi-web-boilerplate.svg)](https://greenkeeper.io/)
# Land Management Plan web front end
This is the web front end for the Land Management Plan portion of the ELM service

# Environment variables

| name     | description      | required | default |            valid            | notes |
|----------|------------------|:--------:|---------|:---------------------------:|-------|
| NODE_ENV | Node environment |    no    |         | development,test,production |       |
| PORT     | Port number      |    no    | 3000    |                             |       |

# Pipeline variables
This project expects to be built using continuous integration in Azure Pipelines. The pipeline should be configured with the following variables:

| name                      | description                         |
|---------------------------|-------------------------------------|
| azureContainerRegistry    | URL of Azure container registry     |
| azureSubscriptionEndpoint | Name of Azure subscription endpoint |

# Prerequisites

## Docker with Kubernetes

This application builds to a Docker image and is intended to run alongside other services in a Kubernetes environment. A configuration is provided in the `kubernetes/` directory to run this application and its dependencies. Use `kubectl` commands to deploy and manage a Kubernetes stack on your local machine. This requires local builds of each application in the stack.

## Connected Services

This application depends on services maintained in other repositories to provide API functionality and data storage. Running this application on a development machine requires each connected service to have been built locally to container images with their default options.

| Service       | URL                                                          | Description |
|---------------|--------------------------------------------------------------|-------------|
| `elm-lmp-api` | https://github.com/Matthew-Collins-Defra/elm-api-boilerplate | API service |

# Running the application

This application builds to a container image which may be run in isolation (for manual testing) or as part of a stack using Kubernetes or Docker Compose.

To run the entire stack, follow build instructions for connected services (in their own repositories), then:

```
# Build application container image
bin/build

# Deploy to local Kubernetes (also starts an ingress controller - see below)
bin/start

# Stop and remove app containers
bin/stop

# Run automated tests
bin/test
```

## Ingress Controller

For traffic to reach services running in Kubernetes, an ingress controller is required. If you don't have other projects running specific ingress controllers already, you don't need to worry about this. The `bin/start` script will start an [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx) for you.

If you are running other projects in Kubernetes, you should inspect the start script to check for conflicts. This application may work fine with other types of ingress controller, they just haven't been tested.

## Tasks

Build tasks are maintained as shell scripts in the `bin` directory. These depend largely on Node programs, which are called via `npm-scripts` for simplicity and run in containers so the only direct dependency is Docker.

| Script      | Description                                                    |
|-------------|----------------------------------------------------------------|
| `bin/build` | Build container images                                         |
| `bin/start` | Deploy app and an Nginx Ingress Controller to local Kubernetes |
| `bin/test`  | Run automated tests against built container images             |
| `bin/stop`  | Stop and remove app containers from local Kubernetes           |

## Config

The configuration file for the server is found at `server/config.js`.
This is where to put any config and all config should be read from the environment.
The final config object should be validated using joi and the application should not start otherwise.

A table of environment variables should be maintained in this README.

## Plugins

hapi has a powerful plugin system and all server code should be loaded in a plugin.

Plugins live in the `server/plugins` directory.

## Logging

The [good](https://github.com/hapijs/good) and [good-console](https://github.com/hapijs/good-console) plugins are included and configured in `server/plugins/logging`

The logging plugin is only registered in when `NODE_ENV=development`.

Error logging for production should use errbit.

## Views

The [vison](https://github.com/hapijs/vision) plugin is used for template rendering support.

The template engine used in nunjucks inline with the GDS Design System with support for view caching, layouts, partials and helpers.

## Static files

The [Inert](https://github.com/hapijs/inert) plugin is used for static file and directory handling in hapi.js.
Put all static assets in `server/public/static`.

Any build output should write to `server/public/build`. This path is in the `.gitignore` and is therefore not checked into source control.

## Routes

Incoming requests are handled by the server via routes.
Each route describes an HTTP endpoint with a path, method, and other properties.

Routes are found in the `server/routes` directory and loaded using the `server/plugins/router.js` plugin.

Hapi supports registering routes individually or in a batch.
Each route file can therefore export a single route object or an array of route objects.

A single route looks like this:

```js
{
  method: 'GET',
  path: '/hello-world',
  options: {
    handler: (request, h) => {
      return 'hello world'
    }
  }
}
```

There are lots of [route options](http://hapijs.com/api#route-options), here's the documentation on [hapi routes](http://hapijs.com/tutorials/routing)

## Testing

[lab](https://github.com/hapijs/lab) and [code](https://github.com/hapijs/code) are used for unit testing.

See the `/test` folder for more information.

## Linting

[standard.js](http://standardjs.com/) is used to lint both the server-side and client-side javascript code.

It's defined as a build task and can be run using `npm run test:lint`.

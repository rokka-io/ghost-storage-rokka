# Ghost Storage Rokka


A  [rokka](https://rokka.io/) [Ghost](https://github.com/TryGhost/Ghost) storage adapter.


## Installation

### Install from source

- Go into Ghost root directory

```bash
yarn add rokka@2
cd core/server/adapters/storage
git checkout https://github.com/rokka-io/ghost-adapter-rokka.git rokka
```

### Install from Yarn (not yet working)

- Go into Ghost root directory
- Download the adapter:

```bash
yarn add ghost-storage-rokka
mv node_modules/ghost-storage-rokka core/server/adapters/storage
```

- Done, go configure

### Install on Docker

Here's an example of using this adapter with a containerized Ghost:

```Dockerfile
FROM ghost:3-alpine as rokka
WORKDIR $GHOST_INSTALL/current
RUN su-exec node yarn add ghost-storage-rokka@2

FROM ghost:3-alpine
COPY --chown=node:node --from=rokka $GHOST_INSTALL/current/node_modules $GHOST_INSTALL/current/node_modules
COPY --chown=node:node --from=rokka $GHOST_INSTALL/current/node_modules/ghost-storage-rokka $GHOST_INSTALL/current/core/server/adapters/storage/ghost-storage-rokka
RUN set -ex; \
    su-exec node ghost config storage.active ghost-storage-rokka; \
    su-exec node ghost config storage.ghost-storage-rokka.key ABCEHJFZ; \
    su-exec node ghost config storage.ghost-storage-rokka.organization yourorganization; \
```

Here, we use the Ghost CLI to set some pre-defined values.


## Configuration

Check out [configuration.json.dist](configuration.json.dist) for a complete example.

- Ensure to disable Ghost [Image Optimisation](https://ghost.org/docs/concepts/config/#image-optimisation)
- You ned to replace the `key` and `organization` with your values.

### Recommended configuration

- `defaultStack = somestack` you can define some default rokka stack for the important images

## Development

To enable debug logs, set the following environment variable:

	DEBUG=ghost:ghost:ghost-storage-rokka


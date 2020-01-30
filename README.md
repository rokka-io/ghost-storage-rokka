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

- `defaultStack = somestack` you can define some default rokka stack for the imported images

## Using those images in the .hbs templates

When you use a custom storage adapter, you currently can't use the responsive image feature of Ghost for resizing 
images with eg. `{{img_url feature_image size="s"}}`, but you can do the URLs manually, eg. for delivering
retina images to retina capable screens:

```html
<img class="post-card-image"
src="https://yourorg.rokka.io/dynamic/resize-width-300-height-200-mode-fill--crop-width-300-height-200/o-af-1/-{{encode (img_url feature_image)}}-.jpg"
srcset="https://yourorg.rokka.io/dynamic/resize-width-300-height-200-mode-fill--crop-width-300-height-200/-{{encode (img_url feature_image)}}-.jpg 1x,
        https://yourorg.rokka.io/dynamic/resize-width-300-height-200-mode-fill--crop-width-300-height-200/o-af-1-dpr-2/-{{encode (img_url feature_image)}}-.jpg 2x"
alt="{{title}}"
/>
```

or if you have a stack, where you define all those operations and options 
(see also [Best practices for stack configurations](https://rokka.io/documentation/guides/best-practices-for-stack-configurations.html) for more info)
you can shorten it a lot:

```html
<img class="post-card-image"
src="https://yourorg.rokka.io/yourstack/-{{encode (img_url feature_image)}}-.jpg"
srcset="https://yourorg.rokka.io/yourstack/-{{encode (img_url feature_image)}}-.jpg 1x,
        https://yourorg.rokka.io/yourstack/o-dpr-2/-{{encode (img_url feature_image)}}-.jpg 2x"
alt="{{title}}"
/>
```

rokka is smart enough to take the actual hash from that url in `feature_image` 
and do the same internally as just sending the hash. 

If you add pictures from unsplash or Instagram and want to deliver and import them to rokka, you may 
have to add the following to your rokka settings:

```
curl --location --request PUT 'https://api.rokka.io/organizations/yourorg/options' \
--header 'Api-Key: YOUR_API_KEY' \
--data-raw '{
    "remote_fullurl_allow": true,
    "remote_fullurl_whitelist": [
        "scontent\\.cdninstagram\\.com",
        "images\\.unsplash\\.com"
    ]
}' 
```

## Development

To enable debug logs, set the following environment variable:

	DEBUG=ghost:ghost:ghost-storage-rokka


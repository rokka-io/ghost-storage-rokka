### Install the helper on Ghost

- Copy the file `rokka_image.js` into `core/frontend/helpers`
- Modify the `core/frontend/services/theme-engine/handlebars/helpers.js` to register the `rokka_helper` by adding the following line

```js
registerThemeHelper("rokka_image", coreHelpers.rokka_image);
```

### Use the helper

In an `hbs` file :

Before Ghost 4.9.0

```hbs
{{#rokka_image feature_image altText=title}}{{/rokka_image}}
```

After Ghost 4.9.0

```hbs
{{#rokka_image feature_image altText=feature_image_alt}}{{/rokka_image}}
```

- `feature_image` is the URL of the image pass to a resize action on Rokka.
- `altText` is an additional parameter to set the `alt` attribute of the `img` HTML tag.

If `feature_image` is not provided or is not an image, nothing will be rendered. Some logs are added to the Ghost output.

If `altText` is not set, an empty `atl` HTML tag will be rendered.

### Default generated image

If no specific configuration is set, the helper will render an `img` tag with the default values of Ghost :

- `srcset` attribue with 4 different URLs for following sizes `300w, 600w, 1000w, 2000w`
- `sizes` attribute with the following value `(min-width: 1400px) 1400px, 92vw`

Images URLs will use the `organization` and `defaultStack` from the `ghost-storage-rokka` configuration, in addition with a `resize-width-xxx` operation.

### Configuring the helper

It is possible to override the default parameters through the Ghost configuration, in the `ghost-storage-rokka` section :

```json
{
  "storage": {
    "active": "ghost-storage-rokka",
    "ghost-storage-rokka": {
      "key": "abcdef",
      "organization": "liip",
      "defaultStack": "liip_stack",
      "imageConfiguration": {
        "srcsets": [300, 600, 1000, 2000],
        "unit": "w",
        "sizes": "(min-width: 1400px) 1400px, 92vw"
      }
    }
  }
}
```

For this exemple, the `img` HTML tag generated will be

```html
<img
  src="https://liip.rokka.io/liip_stack/-<encodedImageUrl>.png-.jpg"
  srcset="
    https://liip.rokka.io/liip_stack/resize-width-300/-<encodedImageUrl>.png-.jpg 300w,
    https://liip.rokka.io/liip_stack/resize-width-600/-<encodedImageUrl>.png-.jpg 600w,
    https://liip.rokka.io/liip_stack/resize-width-1000/-<encodedImageUrl>.png-.jpg 1000w,
    https://liip.rokka.io/liip_stack/resize-width-2000/-<encodedImageUrl>.png-.jpg 2000w
  "
  sizes="(min-width: 1400px) 1400px, 92vw"
  alt=""
/>
```

### Why do I see errors at startup with custom helpers

Ghost is shipped with `gscan` tool that will validate the template. For now, `gscan` does not recognized custom helper. You can ignore this error. 

Error example using the `rokka_image` custom helper:

```bash
foo-theme           | The currently active theme "foo-theme" has fatal errors.
foo-theme           | 
foo-theme           | Error ID:
foo-theme           |     c92e3b50-e540-11eb-b7e6-71bc3b5e7e91
foo-theme           | 
foo-theme           | Details:
foo-theme           |     checkedVersion: 4.x
foo-theme           |     name:           foo-theme
foo-theme           |     path:           /var/lib/ghost/content/themes/foo-theme
foo-theme           |     version:        1.0.0
foo-theme           |     errors: 
foo-theme           |       - 
foo-theme           |         fatal:    true
foo-theme           |         level:    error
foo-theme           |         rule:     Templates must contain valid Handlebars
foo-theme           |         details:  Oops! You seemed to have used invalid Handlebars syntax. This mostly happens, when you use a helper that is not supported.<br>See the full list of available helpers <a href="https://ghost.org/docs/api/handlebars-themes/helpers/" target=_blank>here</a>.
foo-theme           |         failures: 
foo-theme           |           - 
foo-theme           |             ref:     post.hbs
foo-theme           |             message: Missing helper: "rokka_image"
foo-theme           | ----------------------------------------
foo-theme           | 
foo-theme           | ThemeValidationError: The currently active theme "foo-theme" has fatal errors.
foo-theme           |     at Object.getThemeValidationError (/var/lib/ghost/core/server/services/themes/validate.js:69:12)
foo-theme           |     at Object.module.exports.loadAndActivate (/var/lib/ghost/core/server/services/themes/activate.js:27:36)
foo-theme           |     at async initFrontend (/var/lib/ghost/core/boot.js:120:5)
foo-theme           |     at async bootGhost (/var/lib/ghost/core/boot.js:327:9)
foo-theme           | 
```
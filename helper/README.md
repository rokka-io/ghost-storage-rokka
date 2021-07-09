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

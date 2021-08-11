# editor.dev UI

Provides a rich UI for editing structured data with live previews.

See the [docs][docs], [typescript docs][tsdocs], or [example][example] of the UI.

[docs]: https://editor.dev/docs/
[example]: https://editor.dev/example/
[tsdocs]: https://editor.dev/api/ui/

![Main build](https://github.com/blinkk/editor.dev/actions/workflows/push_main.yaml/badge.svg)

## Usage

To start using, visit [editor.dev][live] and choose between editing against a local project or a
GitHub hosted project.

## Developing

To start developing on the editor UI run the following:

```sh
yarn install
yarn run example
```

Then visit https://localhost:8888/ to iterate and improve the editor UI.

## editor.dev UI server

The editor UI server is used to deploy the editor UI to the bet and live environments.
It contains logic for connecting to different editor connectors (such as GitHub and local)
and loads in the specialized fields (such as for [Grow][grow] or [Amagaki][amagaki] sites) as needed.

To develop the hosted project locally:

```
# Need to build the static files for the site.
cd website/
yarn run build
cd ..

# Run the hosted node server.
yarn run hosted
```

Then visit https://localhost:8080/ to iterate and improve.

If you are developing on the editor app UI only, use the `yarn run example` command from above instead.

## Deployment

The editor is built for production using a Docker image and Google Cloud Run.

Every commit to `main` builds the docker image with a `:main` tag and updates the cloud run image for [`beta.editor.dev`][beta].
Every tag builds the docker image with a version tag (ex: `v1.0.5`) and the `:latest` tag then updates the cloud run image for [`editor.dev`][live].

To switch the production deployment run `make deploy-prod tag=<VERSION>` where `<VERSION>` is the
desired version to roll back to. For example: `make deploy-prod tag=v1.0.5`.

[beta]: https://beta.editor.dev/
[live]: https://editor.dev/

[grow]: https://grow.dev/
[amagaki]: https://amagaki.dev/

# Live Editor

Experimental.

Editor for providing a rich UI for editing structured data with live previews.

See the [typescript docs][tsdocs] or [example][example].

[![codecov](https://codecov.io/gh/blinkkcode/live-edit/branch/main/graph/badge.svg?token=Z327B3XPKO)](https://codecov.io/gh/blinkkcode/live-edit)

[example]: https://blinkkcode.github.io/live-edit/example/
[tsdocs]: https://blinkkcode.github.io/live-edit/

## Developing

To start developing on the live editor UI run the following:

```sh
yarn install
yarn run serve
```

Then visit https://localhost:8888/ to iterate and improve the editor.

## Live edit server

The live edit server is used to deploy the live editor UI using Cloud Run.
It contains logic for connecting to different live edit connectors (such as github and local)
and loads in the specialized fields (such as for Grow or Amagaki sites) as needed.

To develop locally run `yarn run hosted` and visit https://localhost:8080/ and iterate and improve.
If you are developing on the editor UI, use the `yarn run serve` command from above instead.

## Deployment

The live editor is built for production using a Docker image and Google Cloud Run.

Every commit to `main` builds the docker image with a `:main` tag and updates the cloud run image for [`beta.editor.dev`](https://beta.editor.dev).
Every tag builds the docker image with a version tag (ex: `v1.0.5`) and the `:latest` tag then updates the cloud run image for [`editor.dev`](https://editor.dev).

If there is an issue with the latest release for the prod you can roll back to an earlier version.

To switch the production deployment run `make deploy-prod tag=<VERSION>` where `<VERSION>` is the desired version to roll back to.
For example: `make deploy-prod tag=v1.0.5`.

### Service account

The builds use `gcloud` to build and deploy to a Cloud Run service.

The service account needs to be setup to be a member of the `-compute@` service account to [deploy from cloud build](https://cloud.google.com/build/docs/deploying-builds/deploy-cloud-run).:

```sh
gcloud iam service-accounts add-iam-policy-binding \
  --project=$PROJECT \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountUser" \
  $PROJECT_ID-compute@developer.gserviceaccount.com
```

The service account also needs to have a [set of permissions](https://github.com/google-github-actions/deploy-cloudrun#setup) to be able to build and deploy to cloud run.

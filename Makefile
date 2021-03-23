project := grow-prod
service := live-edit
region := us-central1
tag := latest

build:
	gcloud builds submit \
		--project=$(project)

build-prod:
	gcloud builds submit \
		--project=$(project) \
		--config=cloudbuild-prod.yaml

build-prod-tag:
	gcloud builds submit \
		--project=$(project) \
		--substitutions _GITHUB_REF=${GITHUB_REF} \
		--config=cloudbuild-prod-tag.yaml

build-and-deploy:
	$(MAKE) build
	$(MAKE) deploy

build-and-deploy-prod:
	$(MAKE) build-prod
	$(MAKE) deploy-prod

build-and-deploy-prod-tag:
	$(MAKE) build-prod-tag
	$(MAKE) deploy-prod

deploy:
	gcloud run deploy ${service} \
		--project=$(project) \
		--platform managed \
		--labels source=main \
		--region ${region} \
		--allow-unauthenticated \
		--image gcr.io/${project}/live-edit:main

deploy-prod:
	gcloud run deploy ${service}-prod \
		--project=$(project) \
		--platform managed \
		--labels source=latest \
		--region ${region} \
		--allow-unauthenticated \
		--image gcr.io/${project}/live-edit:${tag}

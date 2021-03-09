project := grow-prod
service := live-edit
region := us-central1

build:
	gcloud builds submit \
		--project=$(project) \
		--tag gcr.io/${project}/live-edit:main

build-prod:
	gcloud builds submit \
		--project=$(project) \
		--tag gcr.io/${project}/live-edit:$(subst refs/tags/,,$(GITHUB_REF)) \
		--tag gcr.io/${project}/live-edit:latest

deploy:
	$(MAKE) build
	gcloud run deploy ${service} \
		--project=$(project) \
		--platform managed \
		--labels source=main \
		--region ${region} \
		--allow-unauthenticated \
		--image gcr.io/${project}/live-edit:main

deploy-prod:
	$(MAKE) build-prod
	gcloud run deploy ${service}-prod \
		--project=$(project) \
		--platform managed \
		--labels source=latest \
		--region ${region} \
		--allow-unauthenticated \
		--image gcr.io/${project}/live-edit:latest

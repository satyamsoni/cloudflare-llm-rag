# cloudflare-llm-rag
LLM Chat API on Cloudflare RAG on R2 , with Terraform deployment

## How to setup ?

1. Clone the repo
2. Create Custom Token in Cloudflare Manage Account > Account API Tokens
3. Add Permission - Workers R2 Data Catalog:Edit, AI Gateway:Run, Workers Builds Configuration:Edit, Workers Pipelines:Edit, AI Gateway:Edit, Workers AI:Edit, Vectorize:Edit, API Gateway:Edit, D1:Edit, Cloudflare Pages:Edit, Workers R2 Storage:Edit, Workers KV Storage:Edit, Workers Scripts:Edit
4. Upon creation copy Token in terraform.tfvars, also add account id ( you can find account id from Cloudflare Dashboard url eg . https://dash.cloudflare.com/<Account_ID>/api-tokens)
5. Add your Dev site name ( configured in Cloudflare ) in terraform.tfvars under workers_dev_subdomain variable.
6. RUN "terraform init" - to initialize , then "terraform plan" - to see what is in plan to create , then "terraform apply" to setup and in response you will receive an API endpoint.

## How to generate RAG 
You can convert your contextual files ( PDF/ Doc / Texts ) into embaddings as RAG data in JSON for example using https://github.com/satyamsoni/mini-rag-pdf2json or your own script.
Upload output JSON file to R2 created by terraform script.

## How to execute ?
Use the API endpoint generated at #6 , with Post method and JSON payload { query: 'USER QUERY'}
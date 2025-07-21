FROM denoland/deno:latest

# AWS Lambda Runtime Interface Client for Deno
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /aws-lambda-rie
RUN chmod +x /aws-lambda-rie

WORKDIR /app

# Copy deno configuration and dependencies first
COPY deno.json ./
COPY src/notifier/main.ts ./

# Cache dependencies
RUN deno cache main.ts

# Set the CMD to your handler function
CMD [ "main.handler" ]

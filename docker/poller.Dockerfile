FROM denoland/deno:latest

# AWS Lambda Runtime Interface Client for Deno
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /aws-lambda-rie
RUN chmod +x /aws-lambda-rie

WORKDIR /app

# Copy the entrypoint and cache dependencies
COPY src/poller/main.ts ./
RUN deno cache main.ts

# Set the CMD to your handler function
CMD [ "main.handler" ]

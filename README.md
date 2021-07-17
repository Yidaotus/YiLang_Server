# Server for YiLang

## General

The repository includes a docker-compose file for easy deployment. The Database server is started and linked to the backend server automatically and made persistent with a docker volume. For real production environments the database server should probably be handled individually, but for small deployments and testing this method can be used.

Modify the volumens and ports according to your needs.

## Use

start with `sudo docker-compose up`

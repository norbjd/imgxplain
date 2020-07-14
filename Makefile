build:
	sudo docker build . -t 'imgxplain'
	-sudo docker rm imgxplain
	sudo docker create --name 'imgxplain' imgxplain
	sudo docker cp imgxplain:/app/public/dist/ public/
	sudo docker rm imgxplain

format:
	sudo docker run --rm -i -t -v $(PWD):/app -w /app/ node:14.5.0-alpine3.11 \
		/bin/sh -c 'npm run format'

run: build
	-sudo docker rm -f nginx
	sudo docker run --rm -it --name nginx -p 8080:80 -v $(PWD)/public:/usr/share/nginx/html/ nginx:1.17.8-alpine

run_continuous:
	while inotifywait -e close_write \
		$(PWD)/src/*.ts \
		$(PWD)/src/**/*.ts \
		$(PWD)/public/css/*.css \
		$(PWD)/public/index.html; \
	do \
		make run; \
	done

clean_build:
	sudo rm -rf public/dist/

clean: clean_build
	sudo rm -rf node_modules/

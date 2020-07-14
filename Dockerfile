FROM    node:14.5.0-alpine3.11
WORKDIR /app

# for canvas
RUN     apk add \
            python3 pkgconfig pixman-dev cairo-dev pangomm-dev make g++ jpeg-dev \
            ttf-liberation

# install dependencies
COPY    package.json .
COPY    package-lock.json .
RUN     npm install --verbose

# config
COPY    scripts/ scripts/
COPY    tsconfig.json .
COPY    .eslintrc.json .
COPY    jest.config.json .

# sources
COPY    public/ public/
COPY    src/ src/
COPY    test/ test/

RUN     npm run format-check \    
 &&     npm run lint \
 &&     npm test \
 &&     npm run compile

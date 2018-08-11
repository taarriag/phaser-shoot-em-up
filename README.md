## Setup
1. Set up as npm project.
```
 npm init
```
2. Install typescript and webpack globally
```
 npm install -g typescript webpack
```
3. Install development dependencies locally.
``` 
 npm install --save-dev ts-loader source-map-loader
```
4. Reference globally installed typescript.
```
 npm link typescript
```
## Compiling:
Execute webpack (alternatively enable watch mode to recompile on changes) 
```
 webpack -w
```

or compile directly with tsc 
```
 tsc -w
```

## Running the game on a local server:
Start a server in the dist folder using http-server from Node:
 cd dist/
 http-server

# NEWO subgraph

A Graph protocol subgraph for NEWO

## Development

To pull the code:
```
git clone https://github.com/brokenomics/newo-subgraph
cd newo-subgraph
```

To download necessary modules:
```
npm install
```

To build the graph after making changes to schema.graphql:
```
npm codegen
```

To build after making TypeScript changes:
```
npm build
```

To deploy to Subgraph Studio so you can sync and use the playground to query against the graph:
```
npm deploy
```

Subgraph Studio link: https://thegraph.com/studio/subgraph/new-order/

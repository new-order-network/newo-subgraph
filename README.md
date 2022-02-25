# NEWO subgraph

A Graph protocol subgraph for NEWO

```
git clone https://github.com/brokenomics/newo-subgraph
cd newo-subgraph
```

## Development

To download necessary modules:
```
npm install
```

To build the graph after making changes to schema.graphql
```
graph codegen
```

To build after making TypeScript changes
```
graph build
```

To deploy to Subgraph Studio so you can sync and use the playground to query against the graph
```
graph deploy --studio new-order
```

Subgraph Studio link: https://thegraph.com/studio/subgraph/new-order/
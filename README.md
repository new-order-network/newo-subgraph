# NEWO subgraph

A Graph protocol subgraph for NEWO

## Development

To pull the code:

```
git clone https://github.com/new-order-network/newo-subgraph
cd newo-subgraph
```

To download necessary modules:

```
npm install
```

To build the graph after making changes to schema.graphql:

```
npm run codegen
```

To build after making TypeScript changes:

```
npm run build
```

To deploy to Subgraph Studio so you can sync and use the playground to query against the graph:

```
npm run deploy
```

## Deployments

On Chain: https://thegraph.com/explorer/subgraph?id=CYAGuJheTmK2nYk5eradYoRvY6rpiKoZcPRmyPK4LcoJ
Hosted: https://thegraph.com/hosted-service/subgraph/new-order-network/new-order

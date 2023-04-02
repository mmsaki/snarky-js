# ZK app example

Install snarkyjs develped by 01-labs.

```zsh
npm i snarkyjs
```

[Documentation for SnarkyJS Functions / Classes / Types etc](https://docs.minaprotocol.com/zkapps/snarkyjs-reference#publickey).

It is recommended to use the [zkApp CLI](https://github.com/o1-labs/zkapp-cli) to build a zkApp in Mina.

Install zkApp CLI

```zsh
npm i -g zkapp-cli
```

Get help from CLI to create project:

```zsh
zk --help

```

## Deploy Mina Contract & Update state on LocalBlockchain

Run command:

```zsh
npm run zkapp

```

Stdout:

```zsh
🤖 Getting account...

✅ Feepayer:  B62qqwuym7csmbMaszA6K4LxhGUhZfit1VHonLMAFTVuA7qyhujwabb
✅ FeePayerKey:  EKFA9UUomYJRA9Kcjy3zTXu4c8ayBmmscQEGKuUT8SJRHDLERHSa


⏳ Generating zkapp address accounts...

✅ Zkapp Address:  B62qr9AKFJSBDpbVfaXYvDkydRR5uQsMFcFoBqi4n85e1bTmhZHSg5q
✅ ZkappKey:  EKFSVTma15hA1Lj8Sdz88wTjduiLjgVpK6ZRNyrak74waTEmqKUf


💡 Initializing zk dapp...

📜 Zkapp:  B62qr9AKFJSBDpbVfaXYvDkydRR5uQsMFcFoBqi4n85e1bTmhZHSg5q
✅ Inital state:  1


⏳ Compiling Contract...

🚀 Deploying contract...

Transaction status: true
🧾 Transaction hash: () => {
                    const message = 'Info: Txn Hash retrieving is not supported for LocalBlockchain.';
                    console.log(message);
                    return message;
                }
⏳ Updating Contract state...

Info: Txn Hash retrieving is not supported for LocalBlockchain.
🧾 Transaction hash:  Info: Txn Hash retrieving is not supported for LocalBlockchain.
Proof:  [
  0,
  [
    0,
    [ 0, [Array], [Array] ],
    [ 0, [Array], [Uint8Array] ],
    [ 0, [Array], [Array] ]
  ]
]
final state: 3
```

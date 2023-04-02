import {
	Field,
	State,
	PrivateKey,
	SmartContract,
	Mina,
	AccountUpdate,
	isReady,
	declareState,
	declareMethods,
	shutdown,
	PublicKey,
} from 'snarkyjs';
import { zkAppProver } from 'snarkyjs/dist/node/lib/account_update';

try {
	await isReady;
} catch (e) {
	// Deal with the fact the chain failed
	console.log('Error loading isReady');
}

interface SimpleZkApp {
	x: State<Field>;
}

class SimpleZkApp extends SmartContract {
	constructor(address: PublicKey, x: Field) {
		super(address, x);
		this.x = State();
	}

	events = { update: Field };

	init() {
		super.init();
		this.x.set(Field(0));
	}

	update(y: Field) {
		this.emitEvent('update', y);
		this.emitEvent('update', y);
		this.account.balance.assertEquals(this.account.balance.get());
		let x = this.x.get();
		this.x.assertEquals(x);
		this.x.set(x.add(y));
	}
}

async function main() {
	declareState(SimpleZkApp, { x: Field });
	declareMethods(SimpleZkApp, { update: [Field] });
	const { feePayer, feePayerKey } = generateAccount();
	const { zkappKey, zkappAddress } = generateZkAppKey();
	const { zkapp, initialState } = initializeZkApp();

	function generateAccount() {
		let Local = Mina.LocalBlockchain();
		Mina.setActiveInstance(Local);
		console.log('🤖 Getting account...\n');
		let feePayerKey = Local.testAccounts[0].privateKey;
		let feePayer = Local.testAccounts[0].publicKey;
		console.log(
			'✅ Feepayer: ',
			feePayer.toBase58(),
			'\n✅ FeePayerKey: ',
			feePayerKey.toBase58(),
			'\n\n'
		);

		return { feePayerKey, feePayer };
	}

	function generateZkAppKey() {
		console.log('⏳ Generating zkapp address accounts...\n');
		let zkappKey = PrivateKey.random();
		let zkappAddress = zkappKey.toPublicKey();
		console.log(
			'✅ Zkapp Address: ',
			zkappAddress.toBase58(),
			'\n✅ ZkappKey: ',
			zkappKey.toBase58(),
			'\n\n'
		);

		return { zkappKey, zkappAddress };
	}

	function initializeZkApp() {
		console.log('💡 Initializing zk dapp...\n');
		let initialState = Field(1);
		let zkapp = new SimpleZkApp(zkappAddress, initialState);
		console.log(
			'📜 Zkapp: ',
			zkapp.address.toBase58(),
			'\n✅ Inital state: ',
			initialState.toString(),
			'\n\n'
		);
		return { zkapp, initialState };
	}

	async function compileContract() {
		return await SimpleZkApp.compile();
	}

	console.log('⏳ Compiling Contract...\n');
	compileContract();

	async function deploy() {
		let tx = await Mina.transaction(feePayer, () => {
			AccountUpdate.fundNewAccount(feePayer);
			zkapp.deploy();
		});
		const res = await tx.sign([feePayerKey, zkappKey]).send();
		return res;
	}

	console.log('🚀 Deploying contract...\n');
	const res = await deploy();
	console.info(`Transaction status: ${res.isSuccess}`);
	console.log(`🧾 Transaction hash: ${res.hash}`);

	async function getInitialState() {
		console.log('initial state: ' + zkapp.x.get());
	}

	async function updateState() {
		const tx = await Mina.transaction(feePayer, () => zkapp.update(Field(3)));
		const prove = await tx.prove();
		const txReceipt = await tx.sign([feePayerKey]).send();
		const finalValue = zkapp.x.get();
		return { txReceipt, prove, finalValue };
	}

	console.log('⏳ Updating Contract state...\n');
	const { txReceipt, prove, finalValue } = await updateState();
	console.log('🧾 Transaction hash: ', txReceipt.hash());
	console.log('Proof: ', prove[0]);
	console.log('final state: ' + zkapp.x.get());

	shutdown();
}

main();

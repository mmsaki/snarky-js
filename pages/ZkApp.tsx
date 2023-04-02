import React from 'react';
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
} from 'snarkyjs';

try {
	await isReady;
} catch (e) {
	// Deal with the fact the chain failed
}

interface SimpleZkApp {
	x: any;
}

class SimpleZkApp extends SmartContract {
	constructor(address) {
		super(address);
		this.x = State();
	}

	events = { update: Field };

	init() {
		super.init();
		this.x.set(Field(0));
	}

	update(y) {
		this.emitEvent('update', y);
		this.emitEvent('update', y);
		this.account.balance.assertEquals(this.account.balance.get());
		let x = this.x.get();
		this.x.assertEquals(x);
		this.x.set(x.add(y));
	}
}

function declareContract() {
	declareState(SimpleZkApp, { x: Field });
	declareMethods(SimpleZkApp, { update: [Field] });
}

function generateAccount() {
	let Local = Mina.LocalBlockchain();
	Mina.setActiveInstance(Local);
	let feePayerKey = Local.testAccounts[0].privateKey;
	let feePayer = Local.testAccounts[0].publicKey;
	return { feePayerKey, feePayer };
}

function generateZkAppKey() {
	let zkappKey = PrivateKey.random();
	let zkappAddress = zkappKey.toPublicKey();
	return { zkappKey, zkappAddress };
}

function initializeZkApp() {
	let { zkappAddress } = generateZkAppKey();
	let initialState = Field(1);
	let zkapp = new SimpleZkApp(zkappAddress);
	return { zkapp, initialState };
}

async function compileContract() {
	console.log('compile');
	await SimpleZkApp.compile();
}

async function deploy() {
	let { feePayer, feePayerKey } = generateAccount();
	let { zkappKey } = generateZkAppKey();
	let { zkapp } = initializeZkApp();
	console.log('deploy');
	let tx = await Mina.transaction(feePayer, () => {
		AccountUpdate.fundNewAccount(feePayer);
		zkapp.deploy();
	});
	await tx.sign([feePayerKey, zkappKey]).send();
}

async function getInitialState() {
	let { zkapp } = initializeZkApp();
	console.log('initial state: ' + zkapp.x.get());
}

async function updateState() {
	let { feePayer, feePayerKey } = generateAccount();
	let { zkapp } = initializeZkApp();
	console.log('update');
	let tx = await Mina.transaction(feePayer, () => zkapp.update(Field(3)));
	await tx.prove();
	await tx.sign([feePayerKey]).send();
	console.log('final state: ' + zkapp.x.get());
}

const ZkApp = () => {
	declareContract();
	return (
		<>
			<h1>ZkApp Cotract</h1>
			<p>Generate Account</p>
			<button
				onClick={() => {
					const { feePayer } = generateAccount();
					console.log(feePayer);
				}}
			>
				Generate Account
			</button>
			<p></p>
		</>
	);
};

export default ZkApp;

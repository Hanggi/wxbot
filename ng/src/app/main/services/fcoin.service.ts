import {Injectable, Input} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
// import {ElectronService} from "./electron.service";
// import {AppComponent} from "./app.component";
import {ElectronService} from "../../electron.service";

// import * as ff from "./process/fcoin_process.js"


let crypto = window.require('crypto');
let path = window.require('path');


@Injectable({
	providedIn: 'root'
})
export class FcoinService {
	signature: any;
	apiKey: string;
	secretKey: string;
	proc: any;

	isRunning = false;

	showOrders = false;
	ordersData = [];

	// @Input() app: AppComponent

	symbols = [{"name":"btcusdt","base_currency":"btc","quote_currency":"usdt","price_decimal":2,"amount_decimal":4},
		{"name":"ethusdt","base_currency":"eth","quote_currency":"usdt","price_decimal":2,"amount_decimal":4},{"name":"bchusdt","base_currency":"bch","quote_currency":"usdt","price_decimal":2,"amount_decimal":4},
		{"name":"ltcusdt","base_currency":"ltc","quote_currency":"usdt","price_decimal":2,"amount_decimal":4},{"name":"ftusdt","base_currency":"ft","quote_currency":"usdt","price_decimal":6,"amount_decimal":2},
		{"name":"fteth","base_currency":"ft","quote_currency":"eth","price_decimal":8,"amount_decimal":2},{"name":"zipeth","base_currency":"zip","quote_currency":"eth","price_decimal":8,"amount_decimal":2},
		{"name":"etcusdt","base_currency":"etc","quote_currency":"usdt","price_decimal":2,"amount_decimal":4},{"name":"ftbtc","base_currency":"ft","quote_currency":"btc","price_decimal":8,"amount_decimal":2},
		{"name":"icxeth","base_currency":"icx","quote_currency":"eth","price_decimal":6,"amount_decimal":4},{"name":"omgeth","base_currency":"omg","quote_currency":"eth","price_decimal":6,"amount_decimal":4},
		{"name":"zileth","base_currency":"zil","quote_currency":"eth","price_decimal":8,"amount_decimal":2},{"name":"btmusdt","base_currency":"btm","quote_currency":"usdt","price_decimal":4,"amount_decimal":2},
		{"name":"aeeth","base_currency":"ae","quote_currency":"eth","price_decimal":6,"amount_decimal":2},{"name":"zrxeth","base_currency":"zrx","quote_currency":"eth","price_decimal":6,"amount_decimal":2},
		{"name":"bnbusdt","base_currency":"bnb","quote_currency":"usdt","price_decimal":4,"amount_decimal":2}];

	options = {
		symbol: this.symbols[0],
		mode: "1",
		cancelTime: -1,
	}

	setOptions(symbol, mode, ct) {
		this.options.symbol = symbol;
		this.options.mode = mode;
		this.options.cancelTime = ct;
		console.log(this.options)
	}

	constructor(private http: HttpClient, private elec: ElectronService) {
		// console.log(ff)
	}

	setApi(key, secret) {
		this.apiKey = key;
		this.secretKey = secret;
	}

	sign(method, url, obj, secret, timestamp) {
		let urlEncode = '';
		if (obj) {
			let tmp = {}
			Object.keys(obj).sort().forEach((key) => {
				tmp[key] = obj[key]
			})

			urlEncode = Object.keys(tmp).map((key) => {
				return encodeURIComponent(key) + '=' + encodeURIComponent(tmp[key])
			}).join('&')
		}
		// console.log(urlEncode)
		let concat = method + url + timestamp + urlEncode;
		// console.log(concat)

		let first = new Buffer(concat).toString('base64')
		// console.log(first)
		let hash = crypto.createHmac('sha1', secret).update(first).digest();
		// console.log(hash)
		let final = hash.toString('base64');
		// console.log(final)
		this.signature = final;
	}

	param (timestamp) {
		let headers = new HttpHeaders()
			.set("FC-ACCESS-KEY", this.apiKey)
			.set("FC-ACCESS-SIGNATURE", this.signature)
			.set("FC-ACCESS-TIMESTAMP", timestamp.toString());

		return headers;
	}

	fcoinStart() {
		console.log("Fcoin start");
		console.log(__dirname)

		let forkFile = path.resolve(__dirname, 'fcoin_process.js');
		// console.log(process.cwd())
		//
		// console.log(this.elec.remote);
		// console.log(this.elec.remote.process)
		// console.log(this.elec.fs)

		this.proc = this.elec.childProcess.fork(forkFile);
		// this.proc = this.elec.childProcess.fork('fcoin_process.js');
		console.log(this.proc)
		this.isRunning = true;
		this.showOrders = true;
		this.proc.send({
			code: 1,
			msg: "vvv",
			data: {
				apiKey: this.apiKey,
				secretKey: this.secretKey,
				options: this.options,

			}})
		this.proc.on('message', (m) => {
			if (m.code == 3) {
				console.log(m)
				this.ordersData = m.data.orders.data;
			}
		})
	}

	fcoinStop() {
		this.proc.send({
			code: -1,
			msg: "stop",
		})
		this.isRunning = false;
		this.showOrders = false;
	}

	orders(symbol, callback) {

		this.http.get("https://api.fcoin.com/v2/market/depth/L20/" + symbol).subscribe(d => {
			callback(d["data"]);
		})
	}

	balance(callback) {
		let timestamp = +new Date();
		this.sign("GET", 'https://api.fcoin.com/v2/accounts/balance', null, this.secretKey, timestamp)
		let headers = this.param(timestamp);

		this.http.get('https://api.fcoin.com/v2/accounts/balance', {
			headers: headers
		}).subscribe((d) => {
			// console.log(d)
			callback(d)
		})
	}
}

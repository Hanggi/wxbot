import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
// import {ElectronService} from "./electron.service";
import {ElectronService} from "../../electron.service";

let crypto = window.require('crypto');
let path = window.require('path');

@Injectable({
	providedIn: 'root'
})
export class OcxService {
	signature: any;
	apiKey: string;
	secretKey: string;
	proc: any;


	isRunning = false;

	showOrders = false;
	ordersData = [];

	symbols = [
		{"code":"ethbtc","name":"ETH/BTC","base_unit":"eth","quote_unit":"btc"},
		{"code":"bchbtc","name":"BCH/BTC","base_unit":"bch","quote_unit":"btc"},
		{"code":"ltcbtc","name":"LTC/BTC","base_unit":"ltc","quote_unit":"btc"},
		{"code":"eosbtc","name":"EOS/BTC","base_unit":"eos","quote_unit":"btc"},
		{"code":"btcusdt","name":"BTC/USDT","base_unit":"btc","quote_unit":"usdt"},
		{"code":"ethusdt","name":"ETH/USDT","base_unit":"eth","quote_unit":"usdt"},
		{"code":"eoseth","name":"EOS/ETH","base_unit":"eos","quote_unit":"eth"},
		{"code":"motbtc","name":"MOT/BTC","base_unit":"mot","quote_unit":"btc"},
		{"code":"moteth","name":"MOT/ETH","base_unit":"mot","quote_unit":"eth"},
		{"code":"etcbtc","name":"ETC/BTC","base_unit":"etc","quote_unit":"btc"},
		{"code":"etceth","name":"ETC/ETH","base_unit":"etc","quote_unit":"eth"},
		{"code":"engbtc","name":"ENG/BTC","base_unit":"eng","quote_unit":"btc"},
		{"code":"engeth","name":"ENG/ETH","base_unit":"eng","quote_unit":"eth"},
		{"code":"manabtc","name":"MANA/BTC","base_unit":"mana","quote_unit":"btc"},
		{"code":"manaeth","name":"MANA/ETH","base_unit":"mana","quote_unit":"eth"},
		{"code":"gxsbtc","name":"GXS/BTC","base_unit":"gxs","quote_unit":"btc"},
		{"code":"gxseth","name":"GXS/ETH","base_unit":"gxs","quote_unit":"eth"},
		{"code":"showeth","name":"SHOW/ETH","base_unit":"show","quote_unit":"eth"},
		{"code":"insureth","name":"INSUR/ETH","base_unit":"insur","quote_unit":"eth"},
		{"code":"bwteth","name":"BWT/ETH","base_unit":"bwt","quote_unit":"eth"},
		{"code":"kkgeth","name":"KKG/ETH","base_unit":"kkg","quote_unit":"eth"},
		{"code":"sfceth","name":"SFC/ETH","base_unit":"sfc","quote_unit":"eth"},
		{"code":"rceth","name":"RC/ETH","base_unit":"rc","quote_unit":"eth"},
		{"code":"lveth","name":"LV/ETH","base_unit":"lv","quote_unit":"eth"},
		{"code":"wicceth","name":"WICC/ETH","base_unit":"wicc","quote_unit":"eth"},
		{"code":"ocxeth","name":"OCX/ETH","base_unit":"ocx","quote_unit":"eth"},
		{"code":"ocxbtc","name":"OCX/BTC","base_unit":"ocx","quote_unit":"btc"},
		{"code":"ocxusdt","name":"OCX/USDT","base_unit":"ocx","quote_unit":"usdt"},
		{"code":"pgdeth","name":"PGD/ETH","base_unit":"pgd","quote_unit":"eth"},
		{"code":"bwtbtc","name":"BWT/BTC","base_unit":"bwt","quote_unit":"btc"},
		{"code":"lvbtc","name":"LV/BTC","base_unit":"lv","quote_unit":"btc"},
		{"code":"pgdbtc","name":"PGD/BTC","base_unit":"pgd","quote_unit":"btc"},
		{"code":"tmteth","name":"TMT/ETH","base_unit":"tmt","quote_unit":"eth"},
		{"code":"ocxxcny","name":"OCX/xCNY","base_unit":"ocx","quote_unit":"xcny"},
		{"code":"ethxcny","name":"ETH/xCNY","base_unit":"eth","quote_unit":"xcny"},
		{"code":"btcxcny","name":"BTC/xCNY","base_unit":"btc","quote_unit":"xcny"},
		{"code":"zibeth","name":"ZIB/ETH","base_unit":"zib","quote_unit":"eth"}];

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

	}

	ocxStart() {
		console.log("OCX start");

		let forkFile = path.resolve(__dirname, 'ocx_process.js');
		console.log(forkFile)
		// this.proc = this.elec.childProcess.fork('oxc_process.js');
		this.proc = this.elec.childProcess.fork(forkFile);
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

	ocxStop() {
		this.proc.send({
			code: -1,
			msg: "stop",
		})
		this.isRunning = false;
		this.showOrders = false;
	}

	setApi(key, secret) {
		this.apiKey = key;
		this.secretKey = secret;
	}

	sign(method, uri, obj, key, secret, timestamp) {
		let urlEncode = '';
		obj.tonce = timestamp;
		obj.access_key = key;
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
		let concat = method + '|' + uri + '|' + urlEncode;
		// console.log(concat)
		let first = new Buffer(concat);

		// let first = new Buffer(concat).toString('base64')
		// console.log(first)
		let hash = crypto.createHmac('sha256', secret).update(first).digest('hex');
		// console.log(hash)
		// let final = hash.toString('base64');
		// console.log(hash)
		this.signature = hash;
		return hash;
	}

	sort (obj, tonce, signature) {
		let tmp = {}
		obj.access_key = this.apiKey;
		obj.tonce = tonce;
		obj.signature = signature
		Object.keys(obj).sort().forEach((key) => {
			tmp[key] = obj[key]
		});

		let urlEncode = Object.keys(tmp).map((key) => {
			return encodeURIComponent(key) + '=' + encodeURIComponent(tmp[key])
		}).join('&')
		return urlEncode;
	}

	orders(symbol, callback) {
		// let timestamp = +new Date();
		// let obj = {
		symbol = symbol.replace('/', '').toLowerCase()
		// };
		// this.sign("GET", '/api/v2/depth', obj, this.apiKey, this.secretKey, timestamp)
		// // console.log(this.signature)
		// // let headers = this.param(timestamp);
		// let para = this.sort(obj, timestamp, this.signature);

		this.http.get('https://openapi.ocx.com/api/v2/depth?market_code=' + symbol).subscribe((d) => {
			// console.log(d)
			if (d['data'].length > 0) {
				d['status'] = 0;
			}
			callback(d['data'])
		})
	}

	balance(callback) {
		let timestamp = +new Date();
		this.sign("GET", '/api/v2/accounts', {}, this.apiKey, this.secretKey, timestamp)
		// console.log(this.signature)
		// let headers = this.param(timestamp);
		let para = this.sort({}, timestamp, this.signature);

		this.http.get('https://openapi.ocx.com/api/v2/accounts?' + para).subscribe((d) => {
			// console.log(d)
			if (d['data'].length > 0) {
				d['status'] = 0;
			}
			callback(d)
		})
	}
}

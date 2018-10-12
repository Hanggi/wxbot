import {Injectable} from '@angular/core';

const ccxt = window.require('ccxt');
const moment = window.require('moment');
let coinexApi = new ccxt.coinex()

let interv;

@Injectable({
	providedIn: 'root'
})
export class Coinex3Service {
	// api key
	apiKey: string;
	secretKey: string;

	// 正在运行
	isRunning = false;

	showOrders = false;
	ordersData = [];

	symbols = ["TRX/ETH", "SEER/BTC", "CET/BTC", "DOGE/BTC", "KAN/ETH", "LTC/BTC", "QTUM/BTC", "ETH/BCH", "EOS/USDT", "WINGS/BTC", "VET/ETH", "ETH/BTC", "LTC/BCH", "BBN/BTC", "XMV/BCH", "DCR/BCH", "BBN/ETH", "DCR/BTC", "MT/BCH", "XMR/BCH", "CET/USDT", "NEO/BTC", "CTXC/BCH", "ZIL/BCH", "BTC/BCH", "WINGS/ETH", "CTXC/BTC", "XRP/BCH", "ETC/BCH", "MT/ETH", "XRP/BTC", "ETC/BTC", "CET/BCH", "BTM/ETH", "OMG/ETH", "EOS/ETH", "DASH/USDT", "CTXC/ETH", "ZIL/ETH", "HSR/BCH", "DASH/BCH", "VET/BTC", "SEER/BCH", "HYDRO/BTC", "EOSDAC/BTC", "ZRX/ETH", "SC/BTC", "BBN/BCH", "MT/BTC", "XMR/BTC", "OMG/BTC", "BTM/BTC", "EOS/BTC", "VET/BCH", "BCH/USDT", "LOOM/BCH", "LTC/USDT", "LOOM/BTC", "OMG/BCH", "BTM/BCH", "EOS/BCH", "BTC/USDT", "NANO/BTC", "ZRX/BTC", "HYDRO/BCH", "LOOM/ETH", "ZIL/BTC", "ETH/USDT", "DASH/BTC", "WINGS/BCH", "XRP/USDT", "DOGE/BCH", "TRX/BCH", "RHOC/BCH", "CDY/BCH", "ZEC/BCH", "SC/USDT", "XMC/BCH", "HSR/BTC", "XMC/BTC", "KAN/BCH", "XMV/BTC", "QTUM/BCH", "XMR/USDT", "KAN/BTC", "SC/BCH", "NEO/BCH", "HYDRO/ETH", "TRX/BTC", "RHOC/BTC", "ZEC/BTC", "NANO/BCH", "ZRX/BCH", "BTV/BCH", "SEER/ETH", "ZEC/USDT", "CET/ETH", "EOSDAC/BCH"];

	options = {
		symbol: this.symbols[0],
		mode: "1",
		cancelTime: -1,
		wusunRatio: 0,
	}

	verbose = []

	setOptions(symbol, mode, ct) {
		this.options.symbol = symbol;
		this.options.mode = mode;
		this.options.cancelTime = ct;
		console.log(this.options)
	}

	setApi(key, secret) {
		this.apiKey = key;
		this.secretKey = secret;

		coinexApi.apiKey = key;
		coinexApi.secret = secret;
		console.log(coinexApi)
	}

	constructor() {
	}

	async balance(callback) {
		console.log(coinexApi.fetchBalance)
		// console.log(coinexApi.fetch_balance)
		console.log(321)

		let res = await coinexApi.fetchBalance()
		let data = []
		for(let item in res.total) {
			data.push({
				name: item,
				total: res.total[item]
			})
		}
		console.log(res)
		console.log(data)

		callback({ret: 0, data: data, msg: "vsd"})
		console.log(this.options.symbol)
	}

	start() {
		this.isRunning = true;
		this.showOrders = true;
		console.log("CoinEX start");

		if (this.options.mode == '1') {
			this.options.wusunRatio = 0;
		}

		// let start = +new Date();

		interv = setInterval(() => {
			this.brushList();

		}, 2000)

	}

	stop() {
		clearInterval(interv)
		this.isRunning = false;
		this.showOrders = false;
	}


	async brushList() {

		let guadan = await coinexApi.fetchOpenOrders(this.options.symbol);
		console.log(guadan)

		for (let i = 0; i < guadan.length - 4; i++) {
			console.log(guadan[i].timestamp)
			console.log(+new Date())
			console.log(+new Date() - guadan[i].timestamp)
			if ((+new Date() - guadan[i].timestamp) > this.options.cancelTime * 1000) {
				let cancel = await coinexApi.cancelOrder(guadan[i].id, this.options.symbol);
				console.log(cancel);
			}
		}

		let leftObj, rightObj;
		let left = this.options.symbol.split('/')[0], right = this.options.symbol.split('/')[1];
		console.log('开始对冲！')
		console.log(this.options.symbol)
		let ticker = await coinexApi.fetchTicker(this.options.symbol);
		console.log(ticker)

		let middle = ((+ticker.bid) + (+ticker.ask)) / 2;
		let last = ticker.last;

		console.log("当前中间价：" + middle)
		console.log("最新成交价" + last)

		let balance = await coinexApi.fetchBalance();
		console.log(balance);

		leftObj = {
			name: left,
			balance: +balance.free[left]
		}
		rightObj = {
			name: right,
			balance: +balance.free[right]
		}

		console.log(leftObj)
		console.log(rightObj)

		let sum = leftObj.balance + rightObj.balance / last;

		// let amount;
		console.log(this.options)

		if (+leftObj.balance > rightObj.balance / last) {
			let cha = (+leftObj.balance) - (+rightObj.balance / last);
			console.log(cha)
			if (cha / sum > 0.2) {
				console.log('平衡单')
				let amount = sum / 2 - rightObj.balance / last;
				let order = await coinexApi.createLimitSellOrder(this.options.symbol, amount, middle)
				console.log(order);
			}

			let shuliang = (rightObj.balance / last) * 0.99;
			if (shuliang > 0) {
				let sell = await coinexApi.createLimitSellOrder( this.options.symbol, shuliang, middle * (1 + this.options.wusunRatio * 0.001 / 2))
				let buy = await coinexApi.createLimitBuyOrder( this.options.symbol, shuliang, middle * (1 - this.options.wusunRatio * 0.001 / 2))
				console.log(sell)
				console.log(buy)
				this.verbose.push(this.options.symbol + ": " + (middle * (1 + this.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求卖出")
				this.verbose.push(this.options.symbol + ": " + (middle * (1 - this.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求买入")
			}

		} else {
			let cha = (+rightObj.balance / last) - (+leftObj.balance);
			console.log(cha)
			// 平衡单
			if (cha / sum > 0.2) {
				console.log('平衡单')
				let amount = sum / 2 - leftObj.balance;
				let order = await coinexApi.createLimitBuyOrder(this.options.symbol, amount, middle)
				console.log(order);
			}
			// 对冲单
			let shuliang = (leftObj.balance) * 0.99;
			if (shuliang > 0) {
				let sell = await coinexApi.createLimitSellOrder( this.options.symbol, shuliang, middle * (1 + this.options.wusunRatio * 0.001 / 2))
				let buy = await coinexApi.createLimitBuyOrder( this.options.symbol, shuliang, middle * (1 - this.options.wusunRatio * 0.001 / 2))
				console.log(sell)
				console.log(buy)
				this.verbose.push(this.options.symbol + ": " + (middle * (1 + this.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求卖出")
				this.verbose.push(this.options.symbol + ": " + (middle * (1 - this.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求买入")
			}
		}




	}
}

import {Injectable} from '@angular/core';

const ccxt = window.require('ccxt');
const moment = window.require('moment');
let coinexApi = new ccxt.coinex();

let interv;
// let interv_sum;
let wp_interv;

let pinghengCount = 1;

@Injectable({
	providedIn: 'root'
})
export class CoinexService {
	// api key
	apiKey: string;
	secretKey: string;

	balance: any = [];

	// 正在运行
	isRunning = false;

	showOrders = false;
	ordersData = [];

	totalAmount = 0;
	targetAmount = null;

	symbols = ["TRX/ETH", "SEER/BTC", "CET/BTC", "DOGE/BTC", "KAN/ETH", "LTC/BTC", "QTUM/BTC", "ETH/BCH", "EOS/USDT", "WINGS/BTC", "VET/ETH", "ETH/BTC", "LTC/BCH", "BBN/BTC", "XMV/BCH", "DCR/BCH", "BBN/ETH", "DCR/BTC", "MT/BCH", "XMR/BCH", "CET/USDT", "NEO/BTC", "CTXC/BCH", "ZIL/BCH", "BTC/BCH", "WINGS/ETH", "CTXC/BTC", "XRP/BCH", "ETC/BCH", "MT/ETH", "XRP/BTC", "ETC/BTC", "CET/BCH", "BTM/ETH", "OMG/ETH", "EOS/ETH", "DASH/USDT", "CTXC/ETH", "ZIL/ETH", "HSR/BCH", "DASH/BCH", "VET/BTC", "SEER/BCH", "HYDRO/BTC", "EOSDAC/BTC", "ZRX/ETH", "SC/BTC", "BBN/BCH", "MT/BTC", "XMR/BTC", "OMG/BTC", "BTM/BTC", "EOS/BTC", "VET/BCH", "BCH/USDT", "LOOM/BCH", "LTC/USDT", "LOOM/BTC", "OMG/BCH", "BTM/BCH", "EOS/BCH", "BTC/USDT", "NANO/BTC", "ZRX/BTC", "HYDRO/BCH", "LOOM/ETH", "ZIL/BTC", "ETH/USDT", "DASH/BTC", "WINGS/BCH", "XRP/USDT", "DOGE/BCH", "TRX/BCH", "RHOC/BCH", "CDY/BCH", "ZEC/BCH", "SC/USDT", "XMC/BCH", "HSR/BTC", "XMC/BTC", "KAN/BCH", "XMV/BTC", "QTUM/BCH", "XMR/USDT", "KAN/BTC", "SC/BCH", "NEO/BCH", "HYDRO/ETH", "TRX/BTC", "RHOC/BTC", "ZEC/BTC", "NANO/BCH", "ZRX/BCH", "BTV/BCH", "SEER/ETH", "ZEC/USDT", "CET/ETH", "EOSDAC/BCH"].sort();

	options = {
		symbol: this.symbols[35],
		mode: "1",
		cancelTime: -1,
		wusunRatio: 0,
	};

	verbose = [];

	autoTarget = false;
	difficulty;

	async goSide(side) {
		let guadan = await coinexApi.fetchOpenOrders(this.options.symbol);
		console.log(guadan);

		if (this.options.cancelTime != -1) {
			for (let i = 0; i < guadan.length - 4; i++) {
				console.log(guadan[i].timestamp);
				console.log(+new Date());
				console.log(+new Date() - guadan[i].timestamp);
				console.log("取消挂单：" + guadan[i].id);
				let cancel = await coinexApi.cancelOrder(guadan[i].id, this.options.symbol);
				console.log(cancel);
			}
		}

		let leftObj, rightObj;
		let left = this.options.symbol.split('/')[0], right = this.options.symbol.split('/')[1];
		console.log('开始对冲！')
		console.log(this.options.symbol);
		let ticker = await coinexApi.fetchTicker(this.options.symbol);
		console.log(ticker)

		let middle = ((+ticker.bid) + (+ticker.ask)) / 2;
		let last = ticker.last;

		let balance = await coinexApi.fetchBalance();
		console.log(balance);
		let tmp_balance = [];
		for(let item in balance.total) {
			tmp_balance.push({
				name: item,
				total: balance.total[item],
				free: balance.free[item]
			})
		}
		console.log(tmp_balance);
		this.balance = tmp_balance;

		leftObj = {
			name: left,
			balance: +balance.free[left]
		};
		rightObj = {
			name: right,
			balance: +balance.free[right]
		};

		console.log(leftObj);
		console.log(rightObj);
		console.log(last);

		if (side == 'right') {
			let sell = await coinexApi.createLimitSellOrder( this.options.symbol, leftObj.balance * 0.99, middle);
		} else {
			let buy = await coinexApi.createLimitBuyOrder( this.options.symbol, rightObj.balance / last * 0.99, middle);
		}

		let bb = await coinexApi.fetchBalance();
		console.log(bb);
		let tmp_bb = [];
		for(let item in bb.total) {
			tmp_bb.push({
				name: item,
				total: bb.total[item],
				free: bb.free[item]
			})
		}
		console.log(tmp_bb);
		this.balance = tmp_bb;
	}

	wpIsRunning = false;
	wpNextWP = null;
	wpNow = null;
	wpReminder = '';
	wpStart() {
		if (this.targetAmount <= 0) {
			alert("请先设置目标交易量。");
			return;
		}
		this.wpNow = +new Date();
		let h1 = 1000 * 60 * 60;
		let reminder = this.wpNow % h1;
		this.wpNextWP = this.wpNow - reminder + h1 + 1000*60*5;
		console.log(this.wpNow);
		console.log(moment(this.wpNow).format());
		this.wpIsRunning = true;

		wp_interv = setInterval(() => {
			let duration = moment.duration(this.wpNextWP - (+new Date()));
			this.wpReminder = duration.minutes() + ":" + duration.seconds();
			console.log(this.wpReminder);

			if (this.wpNextWP - (+new Date()) < 0) {


				this.stop();
				this.start();

				this.wpNow = +new Date();
				let reminder = this.wpNow % h1;
				this.wpNextWP = this.wpNow - reminder + h1 + 1000*60*5;
			}
		}, 1000);
	}

	wpStop() {
		clearInterval(wp_interv);
		this.wpIsRunning = false;
		this.stop();
	}

	setOptions(symbol, mode, ct) {
		this.options.symbol = symbol;
		this.options.mode = mode;
		this.options.cancelTime = ct;
		console.log(this.options)
	}

	tmpCoinexApi;
	setApi(key, secret) {
		this.apiKey = key;
		this.secretKey = secret;

		coinexApi.apiKey = key;
		coinexApi.secret = secret;
		this.tmpCoinexApi = coinexApi;
		console.log(coinexApi)
	}

	constructor() {

	}

	async getBalance(callback) {
		console.log(coinexApi.fetchBalance);
		// console.log(coinexApi.fetch_balance)
		console.log(321);
		let res;
		try {
			res = await coinexApi.fetchBalance();
		} catch(err) {
			console.log(err)
			alert(err)
		}
		let data = [];
		for(let item in res.total) {
			data.push({
				name: item,
				total: res.total[item],
				free: res.free[item]
			})
		}
		console.log(res);
		console.log(data);

		callback({ret: 0, data: data, msg: "vsd"});
		console.log(this.options.symbol);
	}

	start() {
		this.isRunning = true;
		this.showOrders = true;
		console.log("CoinEX start");

		if (this.options.mode == '1') {
			this.options.wusunRatio = 0;
		}
		let start = +new Date();
		pinghengCount = 1;
		let finalTimestamp = null;
		let amount = 0;
		let lastId = null;
		this.totalAmount = 0;

		// let start = +new Date();

		interv = setInterval(() => {
			if (this.targetAmount > 0) {
				if (this.totalAmount > this.targetAmount) {
					clearInterval(interv);
					// clearInterval(interv_sum);
					this.isRunning = false;
					this.showOrders = false;
					return;
				}
			}

			let current = +new Date();
			let runningTime = current - start;
			let currentCount = runningTime / (5 * 1000);
			if (currentCount > pinghengCount) {
				this.brushList(true);
				pinghengCount++;
			} else {
				this.brushList(false);
			}

		}, 4000)

	}

	stop() {
		clearInterval(interv);
		// clearInterval(interv_sum);
		this.isRunning = false;
		this.showOrders = false;
	}


	async brushList(ifPingheng) {
		let self = this;
		let guadan = await coinexApi.fetchOpenOrders(this.options.symbol);
		console.log(guadan);

		if (this.options.cancelTime != -1) {
			// for (let i = 0; i < guadan.length - 4; i++) {
			if (guadan.length > 0) {
				console.log(guadan[0].timestamp);
				console.log(+new Date());
				console.log(+new Date() - guadan[0].timestamp);
				if ((+new Date() - guadan[0].timestamp) > this.options.cancelTime * 1000) {
					console.log("取消挂单：" + guadan[0].id);
					let cancel = await coinexApi.cancelOrder(guadan[0].id, this.options.symbol);
					this.totalAmount -= (+cancel.amount);
					if (this.totalAmount < 0) {
						this.totalAmount = 0;
					}
					console.log(cancel);
				}
			}

			// }
		}


		setTimeout(async function () {

			let leftObj, rightObj;
			let left = self.options.symbol.split('/')[0], right = self.options.symbol.split('/')[1];
			console.log('开始对冲！');
			let balance = await coinexApi.fetchBalance();
			console.log(balance);
			let tmp_balance = [];
			for(let item in balance.total) {
				tmp_balance.push({
					name: item,
					total: balance.total[item],
					free: balance.free[item]
				})
			}
			console.log(tmp_balance);
			self.balance = tmp_balance;

			console.log(self.options.symbol);
			let ticker = await coinexApi.fetchTicker(self.options.symbol);
			console.log(ticker);

			let middle = ((+ticker.bid) + (+ticker.ask)) / 2;
			let last = ticker.last;

			console.log("当前中间价：" + middle);
			console.log("最新成交价" + last);


			leftObj = {
				name: left,
				balance: +balance.free[left]
			};
			rightObj = {
				name: right,
				balance: +balance.free[right]
			};

			console.log(leftObj);
			console.log(rightObj);

			let sum = (+leftObj.balance) + (+rightObj.balance) / last;

			// let amount;
			console.log(self.options);

			setTimeout(async function () {

				if (+leftObj.balance > +rightObj.balance / last) {
					let cha = (+leftObj.balance) - (+rightObj.balance / last);
					console.log(cha);
					if (cha / sum > 0.3 && ifPingheng) {
						console.log('平衡单1');
						let amountN = sum / 2 - rightObj.balance / last;
						let amount = (+amountN).toFixed(8);
						let order = await coinexApi.createLimitSellOrder(self.options.symbol, amount, middle);
						self.totalAmount += +amountN.toFixed(4);
						self.verbose.unshift(self.options.symbol + ": " + (middle).toFixed(6) + " - " + amountN.toFixed(4) + " | 平衡卖出");
						console.log(order);
					}

					let shuliangN = (+rightObj.balance / last) * 0.99;
					let shuliang = +(+shuliangN).toFixed(8);
					if (shuliang > 0) {
						console.log('对冲单1');
						let sell = await coinexApi.createLimitSellOrder( self.options.symbol, shuliang, middle * (1 + self.options.wusunRatio * 0.001 / 2))
						let buy = await coinexApi.createLimitBuyOrder( self.options.symbol, shuliang, middle * (1 - self.options.wusunRatio * 0.001 / 2))
						console.log(sell);
						console.log(buy);
						self.verbose.unshift(self.options.symbol + ": " + (middle * (1 + self.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求卖出");
						self.verbose.unshift(self.options.symbol + ": " + (middle * (1 - self.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求买入");
						self.totalAmount += +shuliang.toFixed(4);
						self.totalAmount += +shuliang.toFixed(4);
					}

				} else {
					let cha = (+rightObj.balance / last) - (+leftObj.balance);
					console.log(cha);
					// 平衡单
					if (cha / sum > 0.3 && ifPingheng) {
						console.log('平衡单2');
						let amountN= sum / 2 - leftObj.balance;
						let amount = (+amountN).toFixed(8);
						console.log(amount);
						let order = await coinexApi.createLimitBuyOrder(self.options.symbol, amount, middle);
						self.verbose.unshift(self.options.symbol + ": " + (middle).toFixed(6) + " - " + amountN.toFixed(4) + " | 平衡买入");
						console.log(order);
						self.totalAmount += +amountN.toFixed(4);
					}
					// 对冲单
					let shuliangN = (+leftObj.balance) * 0.99;
					let shuliang = +(+shuliangN).toFixed(8);
					if (shuliang > 0) {
						console.log('对冲单2');
						let sell = await coinexApi.createLimitSellOrder( self.options.symbol, shuliang, middle * (1 + self.options.wusunRatio * 0.001 / 2));
						let buy = await coinexApi.createLimitBuyOrder( self.options.symbol, shuliang, middle * (1 - self.options.wusunRatio * 0.001 / 2));
						console.log(sell);
						console.log(buy);
						self.verbose.unshift(self.options.symbol + ": " + (middle * (1 + self.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求卖出");

						self.verbose.unshift(self.options.symbol + ": " + (middle * (1 - self.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求买入");
						self.totalAmount += +shuliang.toFixed(4);
						self.totalAmount += +shuliang.toFixed(4);
					}
				}
			}, 2000);

		}, 600);


	}
}

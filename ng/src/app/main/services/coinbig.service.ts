import {Injectable} from '@angular/core';
import set = Reflect.set;

// const crypto = window.require('crypto');
const CryptoJS = window.require('crypto-js');
const request = window.require('request');
const rp = window.require('request-promise');


let interv;
let interv_sum;

let t1, t2, t3, t4, t5, t6, t7;

@Injectable({
	providedIn: 'root'
})
export class CoinbigService {
	// 密钥
	apiKey: string;
	secretKey: string;

	apiKey2: string;
	secretKey2: string;
	// 余额
	balance: any = [];
	balance2: any = [];
	// 正在运行
	isRunning = false;
	isRunning2 = false;
	//
	// showOrders = false;
	// ordersData = [];
	symbols = ["ETH_USDT","HT_USDT","BTC_USDT"].sort();

	options = {
		symbol: this.symbols[0],
		mode: "1",
		cancelTime: -1,
		wusunRatio: 0,
	};

	verbose = [];

	from;
	to;
	targetCount;
	currentCount = 0;

	constructor() {

	}

	setOptions(symbol, mode, ct) {
		this.options.symbol = symbol;
		this.options.mode = mode;
		this.options.cancelTime = ct;
		console.log(this.options)
	}

	setApi(key, secret) {
		this.apiKey = key;
		this.secretKey = secret;
	}

	start() {
		this.isRunning = true;
		// this.showOrders = true;
		console.log("CoinBig start");
		this.currentCount = 0;

		if (this.options.mode == '1') {
			this.options.wusunRatio = 0;
		}
		let start = +new Date();
		this.currentCount = 0;

		interv = setInterval(() => {
			if (this.currentCount >= this.targetCount) {
				this.stop();
				return;
			}

			this.brushList()
		}, 9000);
	}

	stop() {
		clearInterval(interv);
		clearTimeout(t1);
		clearTimeout(t2);
		clearTimeout(t3);
		clearTimeout(t4);
		clearTimeout(t5);
		clearTimeout(t6);

		// clearInterval(interv_sum);
		this.isRunning = false;
		// this.showOrders = false;
	}

	mStart() {
		let self = this;
		this.isRunning2 = true;
		console.log("CoinBig start double");

		this.currentCount = 0;

		self.doubleList();
		interv = setInterval(async function () {
			if (self.currentCount >= self.targetCount) {
				self.mStop();
				return;
			}
			self.doubleList();
		}, 7000)
	}

	mStop() {
		clearInterval(interv);
		clearTimeout(t1);
		clearTimeout(t2);
		clearTimeout(t3);
		clearTimeout(t4);
		clearTimeout(t5);
		clearTimeout(t6);
		// clearInterval(interv_sum);
		this.isRunning2 = false;
	}

	async doubleList() {
		let self = this;

		let left = this.options.symbol.split('_')[0], right = this.options.symbol.split('_')[1];
		let balance = await self.fetchBalance(self.apiKey, self.secretKey);
		let data = [];
		for(let item in balance.data.info.free) {
			data.push({
				name: item,
				total: balance.data.info.free[item] + balance.data.info.freezed[item]
			})
		}
		self.balance = data;

		let balance2 = await self.fetchBalance(self.apiKey2, self.secretKey2);
		let data2 = [];
		for(let item in balance2.data.info.free) {
			data.push({
				name: item,
				total: balance2.data.info.free[item] + balance2.data.info.freezed[item]
			})
		}
		self.balance2 = data2;
		console.log(balance);
		console.log(balance2);


		let ticker = await this.fetchTicker(this.options.symbol);
		let last = ticker.data.ticker.last;
		let middle = ((+ticker.data.ticker.buy) + (+ticker.data.ticker.sell)) / 2;
		console.log(last)
		middle = +middle.toFixed(2);
		console.log(middle)

		let llrr, lrrl;

		if (balance.data.info.free[left] > balance2.data.info.free[right] / last) {
			llrr = balance2.data.info.free[right] / last;
		} else {
			llrr = balance.data.info.free[left];
		}

		if (balance.data.info.free[right] / last > balance2.data.info.free[left]) {
			lrrl = balance2.data.info.free[left];
		} else {
			lrrl = balance.data.info.free[right] / last;
		}
		console.log(llrr);
		console.log(lrrl);
		llrr = +llrr.toFixed(4);
		lrrl = +lrrl.toFixed(4);

		if (middle > self.from && middle < self.to) {
			if (llrr > lrrl) {
				if (llrr * middle > 10) {
					if (llrr * middle >= 9999) {
						llrr = (9990 / middle).toFixed(4);
					}
					let sell = await self.doTradeWithKey( self.options.symbol, middle, llrr, 'sell', self.apiKey, self.secretKey);
					let buy = await self.doTradeWithKey( self.options.symbol, middle, llrr, 'buy', self.apiKey2, self.secretKey2);
					console.log(sell)
					console.log(buy)
					self.verbose.unshift(self.options.symbol + ": " + middle + " - " + llrr + " | 账号1请求卖出");
					self.verbose.unshift(self.options.symbol + ": " + middle + " - " + llrr + " | 账号2请求买入");
					self.currentCount++;
				}
				// self.currentCount++;
			} else {
				if (lrrl * middle > 10) {
					if (lrrl * middle >= 9999) {
						lrrl = (9990 / middle).toFixed(4);
					}
					let buy = await self.doTradeWithKey( self.options.symbol, middle, lrrl, 'buy', self.apiKey, self.secretKey);
					let sell = await self.doTradeWithKey( self.options.symbol, middle, lrrl, 'sell', self.apiKey2, self.secretKey2);
					console.log(sell)
					console.log(buy)
					self.verbose.unshift(self.options.symbol + ": " + middle + " - " + lrrl + " | 账号2请求卖出");
					self.verbose.unshift(self.options.symbol + ": " + middle + " - " + lrrl + " | 账号1请求买入");
					self.currentCount++;
				}
				// self.currentCount++;
			}
		} else {
			self.verbose.unshift("当前中间价：" + middle + ", 不在选定区间内。")
		}
	}

	async brushList() {
		console.log(this.from)
		console.log(this.to)
		let self = this;
		let leftObj, rightObj;
		let left = this.options.symbol.split('_')[0], right = this.options.symbol.split('_')[1];

		let ticker = await this.fetchTicker(this.options.symbol);
		let last = ticker.data.ticker.last;
		let middle = ((+ticker.data.ticker.buy) + (+ticker.data.ticker.sell)) / 2;

		t1 = setTimeout( async function () {
			let balance = await self.fetchBalance(self.apiKey, self.secretKey);
			let data = [];
			for(let item in balance.data.info.free) {
				data.push({
					name: item,
					total: balance.data.info.free[item] + balance.data.info.freezed[item]
				})
			}
			self.balance = data;
			console.log(balance)

			leftObj = {
				name: left,
				balance: +balance.data.info.free[left]
			};
			rightObj = {
				name: right,
				balance: +balance.data.info.free[right]
			};

			let sum = leftObj.balance + rightObj.balance / last;
			middle = +middle.toFixed(2);
			console.log(middle)
			console.log(last);

			console.log(self.from);
			console.log(self.to);

			if (middle > self.from && middle < self.to) {
				if (+leftObj.balance > +rightObj.balance / last) {
					let cha = (+leftObj.balance) - (+rightObj.balance / last);
					console.log(cha);
					if (cha / sum >  0.3) {
						console.log('平衡单1');
						let amountN = sum / 2 - rightObj.balance / last;
						let amount = (+amountN).toFixed(4);
						if (amountN * middle > 10) {
							if (amountN * middle >= 9999) {
								amount = (9990 / middle).toFixed(4)
							}
							let order = await self.doTrade(self.options.symbol, middle, amount, 'sell');
							console.log(order);
							self.currentCount++;
						}
					}

					t2 = setTimeout(async function () {
						let shuliangN = (+rightObj.balance / last) * 0.99;
						let shuliang = +(+shuliangN).toFixed(4);
						if (shuliang > 0) {
							console.log('对冲单1');
							let sell;
							if (shuliang * middle > 10) {
								if (shuliangN * middle >= 9999) {
									shuliang = +(9990 / middle).toFixed(4)
								}
								sell = await self.doTrade( self.options.symbol, middle, shuliang, 'sell');
								self.currentCount++;
								self.verbose.unshift(self.options.symbol + ": " + middle + " - " + shuliang.toFixed(4) + " | 请求卖出");
							}
							t3 = setTimeout(async function () {
								if (shuliang * middle > 10) {
									if (shuliangN * middle >= 9999) {
										shuliang = +(9990 / middle).toFixed(4)
									}
									let buy = await self.doTrade( self.options.symbol, middle, shuliang, 'buy');
									self.currentCount++;
									console.log(buy);
									self.verbose.unshift(self.options.symbol + ": " + middle + " - " + shuliang.toFixed(4) + " | 请求买入");
								}
							}, 3000);
							console.log(sell);
						}
					}, 3000);
				} else {
					let cha = (+rightObj.balance / last) - (+leftObj.balance);
					console.log(cha);
					// 平衡单
					if (cha / sum > 0.3) {
						console.log('平衡单2');
						let amountN= sum / 2 - leftObj.balance;
						let amount = (+amountN).toFixed(4);
						console.log(amount);
						if (amountN * middle > 10) {
							if (amountN * middle >= 9999) {
								amount = (9990 / middle).toFixed(4)
							}
							let order = await self.doTrade(self.options.symbol, middle, amount, 'buy');
							console.log(order);
							self.currentCount++;
						}
					}

					t4 = setTimeout(async function () {
						// 对冲单
						let shuliangN = (+leftObj.balance) * 0.99;
						let shuliang = +(+shuliangN).toFixed(4);
						if (shuliang > 0) {
							console.log('对冲单2');
							if (shuliang * middle > 10) {
								if (shuliangN * middle >= 9999) {
									shuliang = +(9990 / middle).toFixed(4)
								}
								let sell = await self.doTrade( self.options.symbol, middle, shuliang, 'sell');
								self.currentCount++;
								self.verbose.unshift(self.options.symbol + ": " + middle + " - " + shuliang.toFixed(4) + " | 请求卖出");
								console.log(sell);
							}
							t5 = setTimeout( async function () {
								if (shuliang * middle > 10) {
									if (shuliangN * middle >= 9999) {
										shuliang = +(9990 / middle).toFixed(4)
									}
									let buy = await self.doTrade( self.options.symbol, middle, shuliang, 'buy');
									self.currentCount++;
									console.log(buy);
									self.verbose.unshift(self.options.symbol + ": " + middle + " - " + shuliang.toFixed(4) + " | 请求买入");
								}
							}, 3000);

						}
					}, 3000);
				}
			} else {
				self.verbose.unshift("当前中间价：" + middle + ", 不在选定区间内。")
			}


			console.log(ticker)
		}, 1000);

	}

	async doTrade (symbol, price, amount, type) {
		let timestamp = +new Date();
		let url = 'https://www.coinbig.com/api/publics/v1/trade';

		let sign = this.sign({
			apikey: this.apiKey,
			type: type,
			price: price,
			amount: amount,
			symbol: symbol,
			time: timestamp
		}, this.secretKey);
		console.log(sign);
		return rp({
			uri: url,
			method: 'POST',
			json: true,
			form: {
				apikey: this.apiKey,
				type: type,
				price: price,
				amount: amount,
				symbol: symbol,
				sign: sign,
				time: timestamp
			},
			// headers: headers(signature, timestamp)
		});
	}
	async doTradeWithKey (symbol, price, amount, type, key, secret) {
		let timestamp = +new Date();
		let url = 'https://www.coinbig.com/api/publics/v1/trade';

		let sign = this.sign({
			apikey: key,
			type: type,
			price: price,
			amount: amount,
			symbol: symbol,
			time: timestamp
		}, secret);
		console.log(sign);
		return rp({
			uri: url,
			method: 'POST',
			json: true,
			form: {
				apikey: key,
				type: type,
				price: price,
				amount: amount,
				symbol: symbol,
				sign: sign,
				time: timestamp
			},
		});
	}

	async getBalance(callback) {
		// console.log(coinexApi.fetchBalance);
		// console.log(coinexApi.fetch_balance)
		let self = this;
		console.log("Coinbig get balance");
		let res;
		try {
			res = await self.fetchBalance(this.apiKey, this.secretKey);
			console.log(res);
		} catch(err) {
			console.log(err);
			alert(err)
		}
		let data = [];
		for(let item in res.data.info.free) {
			data.push({
				name: item,
				total: res.data.info.free[item] + res.data.info.freezed[item]
			})
		}
		console.log(data);

		callback({ret: 0, data: data, msg: "vsd"});
		console.log(this.options.symbol);

		t6 = setTimeout(async function (){
			if (self.apiKey2 != '' && self.secretKey2 != '') {
				let res2
				try {
					res2 = await self.fetchBalance(self.apiKey2, self.secretKey2);
				} catch (err) {
					console.log(err)
				}
				console.log(res2)
				let data2 = [];
				for(let item in res2.data.info.free) {
					data2.push({
						name: item,
						total: res2.data.info.free[item] + res2.data.info.freezed[item]
					})
				}
				self.balance2 = data2;
			}
		},1000);
	}

	sign(obj, secret) {
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
		// console.log(urlEncode);
		let concat = urlEncode + "&secret_key=" + secret;
		// console.log(concat);
		let sign = CryptoJS.MD5(concat).toString().toUpperCase();

		// console.log(sign);

		return sign;
	}

	fetchTicker(symbol) {
		let url = 'https://www.coinbig.com/api/publics/v1/ticker?symbol=' + symbol;

		return rp({
			uri: url,
			json: true,
		})
	}

	fetchBalance(key, secret) {
		console.log("coinbig fetch balance" + key)
		let timestamp = +new Date();
		let url = 'https://www.coinbig.com/api/publics/v1/userinfo';
		let sign = this.sign({
			apikey: key,
			time: timestamp
		}, secret);
		console.log(sign);
		return rp({
			uri: url,
			method: 'POST',
			json: true,
			form: {
				apikey: key,
				sign: sign,
				time: timestamp
			},
		});
	}


	async fetchOpenOrders() {
		let url = 'https://www.coinbig.com/api/publics/v1/orders_info';
		let sign = this.sign({
			apikey: this.apiKey,
			symbol: this.options.symbol.split('_')[0],
			size: 50,
			type: 1
		}, this.secretKey)
	}


}

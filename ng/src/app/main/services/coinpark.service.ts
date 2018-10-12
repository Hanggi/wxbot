import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ElectronService} from "../../electron.service";
// import {ElectronService} from "./electron.service";

let CryptoJS = window.require("crypto-js");
let request = window.require("request");
let path = window.require('path');

let API_KEY;
let SECRET_KEY;


let interv;

@Injectable({
	providedIn: 'root'
})
export class CoinparkService {
	signature: any;
	apiKey: string;
	secretKey: string;
	// proc: any;
	webUrl: string;

	balance = [];

	// 正在运行
	isRunning = false;

	showOrders = false;
	ordersData = [];

	symbols = [{"id":199,"pair":"BIX_BTC"},{"id":200,"pair":"BIX_ETH"},{"id":201,"pair":"BIX_USDT"},{"id":202,"pair":"ETH_BTC"},{"id":203,"pair":"BTC_USDT"},{"id":204,"pair":"ETH_USDT"},{"id":205,"pair":"ETC_BTC"},{"id":206,"pair":"ETC_ETH"},{"id":207,"pair":"ETC_USDT"},{"id":208,"pair":"BCH_BTC"},{"id":209,"pair":"BCH_ETH"},{"id":210,"pair":"BCH_USDT"}].sort();

	options = {
		symbol: this.symbols[5],
		mode: "1",
		cancelTime: -1,
		wusunRatio: 0,
	};

	verbose = [];

	setOptions(symbol, mode, ct) {
		this.options.symbol = symbol;
		this.options.mode = mode;
		this.options.cancelTime = ct;
		console.log(this.options)
	}

	constructor(private http: HttpClient, private elec: ElectronService) {}

	start() {
		this.isRunning = true;
		this.showOrders = true;
		console.log("OCX start");

		if (this.options.mode == '1') {
			this.options.wusunRatio = 0;
		}

		let start = +new Date();
		// setTimeout(() => {
		// 	pingheng = setInterval(makeBalance, 10000);
		// }, 3000)
		//
		// duichong = setInterval(brushList, 5000);
		//
		// setTimeout(() => {
		// 	quxiao = setInterval(cleanAllOrders, 10000)
		// }, 8000)
		let ss = true;
		interv = setInterval(() => {
			// let current = +new Date();
			// let tt = (current - start)%12000;
			// console.log(tt)
			// if (tt < 1000 || (tt > 6000 && tt < 7000)) {
			this.brushList();
			// }
			// if (tt > 3000 && tt < 4000) {
			// 	// makeBalance();
			// }
			// if (tt > 9000 && tt < 10000) {
			// 	if (ss) {
			// 		// cleanAllOrders('submitted');
			// 		ss = false;
			// 	} else {
			// 		// cleanAllOrders('partial_filled');
			// 		ss = true;
			// 	}
			// }
		}, 5000)

		// 查看未取消订单
		// cleanAllOrders('submitted');

		// updateObj()
		// console.log("????")
		// makeBalance()
	}

	stop() {
		clearInterval(interv)
		this.isRunning = false;
		this.showOrders = false;
	}

	setApi(key, secret) {
		API_KEY = key;
		SECRET_KEY = secret;
	}


	getBalance(callback) {
		getUserAssets((d) => {
			// console.log(d)
			// this.balance = d['result'][0]['result']['assets_list'];
			console.log(d['result'][0]['result']['assets_list']);
			callback({
				ret: 0,
				data: d['result'][0]['result']['assets_list'],
				msg: 0
			})
		})

		console.log(this.options.symbol)
	}

	brushList() {
		let self = this;
		// updateObj();
		// await sleep(500);]
		let leftObj, rightObj;
		let left, right;
		console.log('开始对冲！')
		getTicker(self.options.symbol.pair, (d) => {
			console.log(d)
			let middle = ((+d['result'][0]['result'].buy) + (+d['result'][0]['result'].sell)) / 2;
			let last = d['result'][0]['result'].last;
			console.log("当前中间价：" + middle)
			console.log("最新成交价" + last)

			self.getBalance((d) => {
				console.log(d)
				d = d.data;
				self.balance = d;
				leftObj = d.find((e) => {
					return e.coin_symbol == self.options.symbol.pair.split('_')[0];
				});
				rightObj = d.find((e) => {
					return e.coin_symbol == self.options.symbol.pair.split('_')[1];
				});
				if (!leftObj) {
					leftObj = {balance: 0};
				}
				if (!rightObj) {
					rightObj = {balance: 0};
				}
				console.log(leftObj);
				console.log(rightObj);


				let sum = (+leftObj.balance) + (+rightObj.balance / last);
				console.log(sum);

				let amount;
				setTimeout(function () {
					if (+leftObj.balance > +rightObj.balance / last) {
						let cha = (+leftObj.balance) - (+rightObj.balance / last);
						if (cha / sum > 0.2) {
							let amount = sum / 2 - rightObj.balance / last;

							let trade_order = {
								account_type: 0,
								order_type: 2,
								order_side: 2,
								pair: self.options.symbol.pair,
								price: middle,
								amount: amount,
							};
							console.log("平衡")
							console.log(trade_order)
							doTrade(trade_order, (d) => {
								console.log(d)
							});
						}

						let shuliang = (rightObj.balance / last) * 0.99;
						let trade_order2 = {
							account_type: 0,
							order_type: 2,
							order_side: 2,
							pair: self.options.symbol.pair,
							price: middle * (1 + self.options.wusunRatio * 0.001 / 2),
							amount: shuliang,
						};
						if (shuliang > 0)
							doTrade(trade_order2, (d) => {
								console.log(d)
								self.verbose.unshift(self.options.symbol.pair + ": " + (middle * (1 + self.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求卖出")
							});
						let trade_order3 = {
							account_type: 0,
							order_type: 2,
							order_side: 1,
							pair: self.options.symbol.pair,
							price: middle * (1 - self.options.wusunRatio * 0.001 / 2),
							amount: shuliang,
						};
						if (shuliang > 0)
							doTrade(trade_order3, (d) => {
								console.log(d)
								self.verbose.unshift(self.options.symbol.pair + ": " + (middle * (1 - self.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求买入")
							});
					} else {
						let cha = (+rightObj.balance / last) - (+leftObj.balance);
						if (cha / sum > 0.2) {
							let amount = sum / 2 - leftObj.balance;

							let trade_order = {
								account_type: 0,
								order_type: 2,
								order_side: 1,
								pair: self.options.symbol.pair,
								price: middle,
								amount: amount,
							};
							console.log("平衡右边大")
							console.log(trade_order)
							doTrade(trade_order, (d) => {
								console.log(d)
							});
						}


						let shuliang = (leftObj.balance) * 0.99;
						let trade_order2 = {
							account_type: 0,
							order_type: 2,
							order_side: 2,
							pair: self.options.symbol.pair,
							price: middle * (1 + self.options.wusunRatio * 0.001 / 2),
							amount: shuliang,
						};
						doTrade(trade_order2, (d) => {
							console.log(d)
							self.verbose.unshift(self.options.symbol.pair + ": " + (middle * (1 + self.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求卖出")
						});
						let trade_order3 = {
							account_type: 0,
							order_type: 2,
							order_side: 1,
							pair: self.options.symbol.pair,
							price: middle * (1 - self.options.wusunRatio * 0.001 / 2),
							amount: shuliang,
						};
						doTrade(trade_order3, (d) => {
							console.log(d)
							self.verbose.unshift(self.options.symbol.pair + ": " + (middle * (1 - self.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求买入")
						});
					}

					setTimeout(function () {
						getUserOrderPending(self.options.symbol.pair, 0, 1, 10, (d) => {
							console.log(d)
							console.log(d.result[0].result.items)
							let data = d.result[0].result.items;
							console.log(self.options.cancelTime)
							// for (let i = 0; i < data.length - 1; i++) {
							if (data.length > 0) {
								let index = data.length - 1;
								while (data[index].status == 6) {
									index--;
									if (index < 0) {
										index = 0;
									}
								}
								if (+new Date() - data[index].createdAt > self.options.cancelTime * 1000 && self.options.cancelTime != -1) {
									console.log("取消挂单")
									doCancelTrade(data[index].id, function (d) {
										console.log(d)
									})
								}
							}

							// }

						})
					}, 1500)
				}, 1500);



			})
		});
		// let price = (dd.data.bids[0] + dd.data.asks[0]) / 2;
		// price = price.toFixed(userData.options.symbol.price_decimal)
		// let amount;
		// if (+baseObj.value > +quoteObj.value) {
		// 	let value = quoteObj.value * 0.99;
		// 	amount = value;
		//
		// } else {
		// 	let value = baseObj.value * 0.99;
		// 	amount = value;
		// }
		//
		// //
		// // console.log(price)
		// // console.log(amount)
		// let [left, right] = await Promise.all([
		// 	makeOrder(baseC + quoteC, price, amount, 'sell'),
		// 	makeOrder(baseC + quoteC, price, amount, 'buy')
		// ]);
	}
}

let doPost = function (url, params, callBack) {
	request.post({url: url, form: params}, function (error, response, body) {
		if (!error && response && response.statusCode===200) {
			let result = JSON.parse(body);
			callBack(result);
		} else {
			console.log('err: ', error);
			callBack(error);
		}
	});
};

let doGet = function (url, callBack) {
	request.get({url: url}, function (error, response, body) {
		if (!error && response && response.statusCode===200) {
			let result = JSON.parse(body);
			callBack(result);
		} else {
			console.log('err: ', error);
			callBack(error);
		}
	});
};

let getSign = function (data) {
	var secret = SECRET_KEY;
	var sign = CryptoJS.HmacMD5(JSON.stringify(data), secret).toString();
	return sign;
};

let doApiRequestWithApikey = function (url, cmds, callBack) {
	let form = {
		cmds: JSON.stringify(cmds),
		apikey: API_KEY,
		sign: getSign(cmds)
	};

	doPost(url, form, function (result) {
		callBack(result);
	});
};

let doApiRequest = function (url, cmds, callBack) {
	let form = {
		cmds: JSON.stringify(cmds)
	};

	doPost(url, form, function (result) {
		callBack(result);
	});
};

let getDepth = function (pair, size, callback) {
	let _func_name_ = 'getDepth';

	//GET
	let get_url = 'https://api.coinpark.cc/v1/mdata?cmd=depth&pair=' + pair + '&size=' + size;
	doGet(get_url, function (res) {
		console.log('%s: GET return：', _func_name_, JSON.stringify(res));
	});


	//POST
	let cmds = [
		{
			cmd: "api/depth",
			body: {
				pair: pair,
				size: size
			}
		}
	];
	let url = 'https://api.coinpark.cc/v1/mdata';
	doApiRequest(url, cmds, function (res) {
		console.log('%s: POST return：', _func_name_, JSON.stringify(res));
		callback(res);
	});
};


let getDeals = function (pair, size) {
	let _func_name_ = 'getDeals';

	let cmds = [
		{
			cmd: "api/deals",
			body: {
				pair: pair,
				size: size
			}
		}
	];
	let url = 'https://api.coinpark.cc/v1/mdata';
	doApiRequest(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
	});
};


let getKline = function (pair, period, size) {
	let _func_name_ = 'getKline';

	let cmds = [
		{
			cmd: "api/kline",
			body: {
				pair: pair,
				period: period,
				size: size
			}
		}
	];
	let url = 'https://api.coinpark.cc/v1/mdata';
	doApiRequest(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
	});
};

let getTicker = function (pair, callback) {
	let _func_name_ = 'getTicker';

	let cmds = [
		{
			cmd: "api/ticker",
			body: {
				pair: pair
			}
		}
	];

	let url = 'https://api.coinpark.cc/v1/mdata';
	doApiRequest(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
		callback(res)
	});
};

let getMarket = function (pair) {
	let _func_name_ = 'getMarket';

	let cmds = [
		{
			cmd: "api/market",
			body: {
				pair: pair
			}
		}
	];

	let url = 'https://api.coinpark.cc/v1/mdata';
	doApiRequest(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
	});
};

let getMarketAll = function () {
	let _func_name_ = 'getMarketAll';

	let cmds = [
		{
			cmd: "api/marketAll",
			body: {}
		}
	];

	let url = 'https://api.coinpark.cc/v1/mdata';
	doApiRequest(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
	});
};


let getUserOrderPending = function (pair, account_type, page, size, callback) {
	let _func_name_ = 'getUserOrderPending';

	let cmds = [
		{
			cmd: "orderpending/orderPendingList",
			body: {
				pair: pair,
				account_type: account_type,
				page: page,
				size: size
			}
		}
	];

	let url = 'https://api.coinpark.cc/v1/orderpending';
	doApiRequestWithApikey(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
		callback(res)
	});
};

let getUserOrderHistory = function (pair, account_type, page, size) {
	let _func_name_ = 'getUserOrderHistory';

	let cmds = [
		{
			cmd: "orderpending/orderHistoryList",
			body: {
				pair: pair,
				account_type: account_type,
				page: page,
				size: size
			}
		}
	];
	let url = 'https://api.coinpark.cc/v1/orderpending';
	doApiRequestWithApikey(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
	});
};

let doTrade = function (trade_order, callback) {
	let _func_name_ = 'doTrade';

	let cmds = [
		{
			cmd: "orderpending/trade",
			body: {
				pair: trade_order.pair,
				account_type: trade_order.account_type,
				order_type: trade_order.order_type,
				order_side: trade_order.order_side,
				pay_bix: trade_order.pay_bix,
				price: +trade_order.price.toFixed(8),
				amount: trade_order.amount,
				// money: trade_order.money,
			}
		}
	];
	let url = 'https://api.coinpark.cc/v1/orderpending';
	doApiRequestWithApikey(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
		callback(res);
	});
};

let doCancelTrade = function (orders_id, callback) {
	let _func_name_ = 'doCancelTrade';

	let cmds = [
		{
			cmd: "orderpending/cancelTrade",
			body: {
				orders_id: orders_id
			}
		}
	];
	let url = 'https://api.coinpark.cc/v1/orderpending';
	doApiRequestWithApikey(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
		callback(res)
	});
};

let getUserAssets = function (callback) {
	let _func_name_ = 'getUserAssets';

	let cmds = [
		{
			cmd: "transfer/assets",
			body: {
				select: 1
			}
		}
	];
	let url = 'https://api.coinpark.cc/v1/transfer';
	doApiRequestWithApikey(url, cmds, function (res) {
		console.log('%s: return：', _func_name_, JSON.stringify(res));
		callback(res)
	});
};

let doTest = function () {
	//depth
	// getDepth('LTC_BTC', 10);
	// //deals
	// getDeals('LTC_BTC', 10);
	// //ticker
	// getTicker('LTC_BTC');
	// //market
	// getMarket('LTC_BTC');
	// //all markets
	// getMarketAll();
	// //kline
	// getKline('LTC_BTC', '1min', 10);
	//
	//
	// // user order pending
	// getUserOrderPending('EOS_BTC', 0, 1, 10);
	// // user order history
	// getUserOrderHistory('BIX_BTC', 0, 1, 10);
	// user assets
	// getUserAssets();

	//place an order
	let trade_order = {
		account_type: 0,
		order_type: 2,
		order_side: 1,
		pair: 'BIX_BTC',
		pay_bix: 0,
		price: 0.00001688,
		amount: 1,
		money: 0.00001688
	};
	// doTrade(trade_order);

	//cancel an order
	// doCancelTrade(7790955);//orders_id
};


//
// function cleanAllOrders(state) {
// 	let orders = await myOrders(state);
// 	process.send({
// 		code: 3,
// 		msg: "orders",
// 		data: {
// 			orders
// 		}
// 	})
// 	orders = orders.data;
// 	console.log(orders)
// 	console.log(userData.options.cancelTime)
// 	if (orders.length > 0 && userData.options.cancelTime != -1) {
// 		orders.forEach(d => {
// 			let ts = +new Date();
// 			let delta = ts - d.created_at;
// 			if (+delta > +userData.options.cancelTime * 1000) {
// 				cancelOrder(d.id).then(res => {
// 					console.log(res)
// 				});
// 			}
// 		})
// 	}
// }
// function updateObj() {
// 	// 查看余额
// 	balance = await getBalance();
// 	balance = (balance).data;
// 	process.send({
// 		code: 2,
// 		msg: "balance",
// 		data: balance
// 	})
// 	// balance
// 	baseObj = balance.find(ele => {
// 		return ele.currency == baseC;
// 	});
// 	quoteObj = balance.find(ele => {
// 		return ele.currency == quoteC;
// 	});
// 	// 查看两个交易对价值
// 	rate = await ticker(baseC + quoteC);
// 	rate = (rate).data.ticker[0];
// 	baseObj.value = baseObj.available;
// 	console.log(baseObj)
//
// 	// quoteUsdtRate = await tickerUsdt(quoteC);
// 	// quoteUsdtRate = quoteUsdtRate.data.ticker[0];
// 	quoteObj.value = +quoteObj.available / rate;
// 	// } else {
// 	// 	quoteObj.value = +quoteObj.available;
// 	// }
// 	console.log(quoteObj)
// }
//
//
// async function makeBalance() {
// 	console.log("平衡！")
// 	let sum = (+baseObj.value) + (+quoteObj.value);
// 	// console.log(sum)
// 	let left;
// 	let cha;
// 	if (+baseObj.value > +quoteObj.value) {
// 		cha = baseObj.value - quoteObj.value;
// 		// console.log("left")
// 		left = true;
// 	} else {
// 		cha = quoteObj.value - baseObj.value;
// 		left = false;
// 	}
// 	if (cha > sum * 0.2) {
// 		let amount = (cha/2) * 0.99;
// 		// console.log(amount)
// 		let dd = await depth(baseC + quoteC);
// 		await sleep(500)
// 		if (left) {
// 			// console.log("!!!!")
// 			let res = await makeOrder(baseC + quoteC, (dd.data.bids[0] + dd.data.asks[0]) / 2, amount, 'sell');
// 			console.log(res)
// 		} else {
// 			let res = await makeOrder(baseC + quoteC, (dd.data.bids[0] + dd.data.asks[0]) / 2, amount, 'buy');
// 			console.log(res);
// 		}
// 		setTimeout(() => {
// 			updateObj();
// 		}, 1000);
// 		// updateObj();
// 	}
// }

// function
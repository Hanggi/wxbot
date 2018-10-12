import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
// import {ElectronService} from "./electron.service";
import {ElectronService} from "../../electron.service";

const moment = window.require('moment');
const ccxt = window.require('ccxt');
let bitz = new ccxt.bitz();

let API_KEY;
let SECRET_KEY;

let interv;

@Injectable({
	providedIn: 'root'
})
export class BitzService {
	signature: any;
	apiKey: string;
	secretKey: string;
	tradePwd: string;
	// proc: any;

	balance = [];

	isRunning = false;

	showOrders = false;
	ordersData = [];

	symbols = ["LTC/BTC","VTC/DKKT","ETH/BTC","ZEC/BTC","FCT/BTC","LSK/BTC","BTC/USDT","ETH/USDT","BTX/BTC","BCH/BTC","QTUM/BTC","DASH/BTC","GAME/BTC","ARK/BTC","SSS/BTC","LEO/BTC","VIU/BTC","DGB/BTC","PART/BTC","BTG/BTC","DOGE/ETH","ZSC/ETH","GXS/ETH","BCD/BTC","TRX/BTC","TRX/ETH","BTX/ETH","NULS/ETH","ARN/BTC","HWC/BTC","OXY/BTC","MCO/BTC","MCO/ETH","UNIT/BTC","PYLNT/BTC","XRB/BTC","BTC/DKKT","ETH/DKKT","ETP/BTC","REBL/BTC","REBL/ETH","GXS/DKKT","DDN/ETH","AIDOC/BTC","AIDOC/ETH","DDN/BTC","PUT/BTC","PUT/ETH","POK/BTC","POK/ETH","ATM/BTC","ATM/ETH","ZGC/BTC","ZGC/ETH","SPHTX/BTC","NKC/BTC","NKC/ETH","OC/BTC","OC/ETH","OCN/BTC","OCN/ETH","BNTY/BTC","BNTY/ETH","INK/BTC","INK/ETH","EKT/BTC","SGCC/ETH","EGCC/BTC","EGCC/ETH","WOC/ETH","Pixiecoin/BTC","Pixiecoin/ETH","BTV/BTC","BTV/ETH","QUBE/BTC","QUBE/ETH","ECOM/ETH","PIX/BTC","SGCC/BTC","CRE/BTC","CRE/ETH","BCV/ETH","GBC/ETH","PC/ETH","PC/BTC","UC/ETH","UC/BTC","VCT/ETH","UCT/ETH","UCT/BTC","INC/ETH","INC/BTC","HPB/ETH","HPB/BTC","SEXC/ETH","TKY/ETH","TKY/BTC","ABAO/BTC","ABAO/ETH","PNT/ETH","PNT/BTC","CVT/ETH","CVT/BTC","TTT/ETH","TTT/BTC","NXCT/ETH","EST/BTC","XCT/ETH","PRA/ETH","PRA/BTC","TEAM/ETH","TEAM/BTC","CAM/ETH","CAM/BTC","WWB/ETH","WWB/BTC","BTO/ETH","BTO/BTC","APIS/ETH","APIS/BTC","SWTC/ETH","MOAC/ETH","777/ETH","777/BTC","BCV/BTC","QNTU/ETH","QNTU/BTC","USDT/DKKT","RNTB/ETH","FBEE/ETH","FBEE/BTC","RBF/BTC","PPS/ETH","PPS/BTC","CPX/ETH","CPX/BTC","PCH/ETH","PCH/BTC","FTI/ETH","FTI/BTC","BBC/ETH","BBC/BTC","GUS/ETH","GUS/BTC","RRC/ETH","RRC/BTC","BSTK/ETH","BSTK/BTC","NPXS/ETH","NPXS/BTC","IOV/ETH","IOV/BTC","EDS/ETH","EDS/BTC","XPM/BTC","DOGE/BTC","ETC/BTC","MZC/BTC","GXS/BTC","HSR/BTC","BLK/BTC","NULS/BTC","VOISE/BTC","PAY/BTC","EOS/BTC","OMG/BTC","YBCT/BTC","OTN/BTC","PPC/BTC","XAS/BTC"].sort();

	options = {
		symbol: this.symbols[57],
		mode: "1",
		cancelTime: -1,
		wusunRatio: 0,
	}

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
		console.log("Bitz start");

		let start = +new Date();


		if (this.options.mode == '1') {
			this.options.wusunRatio = 0;
		}
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
			console.log("!!!!!!bitz")
		}, 2500)

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
		this.apiKey = API_KEY;
		SECRET_KEY = secret;
		this.secretKey = SECRET_KEY;

		bitz.apiKey = key;
		bitz.secret = secret;
		console.log(this.tradePwd)
		bitz.password = this.tradePwd;

		// delete bitz;
	}


	async getBalance(callback) {
		console.log("balance ")
		let res;
		try {
			res = await bitz.fetchBalance();
		} catch (err) {
			console.log(err)
			alert(err);
		}
		console.log(res)
		let data = [];
		for(let item in res.total) {
			data.push({
				name: item,
				total: res.total[item]
			})
		}
		console.log(data)
		callback({
			ret: 0,
			data: data,
			msg: "bitz"
		})
	}

	async brushList() {
		let guadan = await bitz.fetchOpenOrders(this.options.symbol);
		console.log(guadan);

		if (this.options.cancelTime != -1) {
			for (let i = 0; i < guadan.length - 1; i++) {
				console.log(moment(guadan[i].info.datetime, "YYYY-MM-DD H:mm:ss").unix()*1000);
				console.log(+new Date());
				console.log(+new Date() - guadan[i].timestamp);
				if ((+new Date() - moment(guadan[i].info.datetime, "YYYY-MM-DD H:mm:ss").unix()*1000) > this.options.cancelTime * 1000) {
					console.log("取消挂单：" + guadan[i].id);
					let cancel = await bitz.cancelOrder(guadan[i].id, this.options.symbol);
					console.log(cancel);
				}
			}
		}

		let leftObj, rightObj;
		let left = this.options.symbol.split('/')[0], right = this.options.symbol.split('/')[1];
		console.log('开始对冲！')
		console.log(this.options.symbol);
		let ticker = await bitz.fetchTicker(this.options.symbol);
		console.log(ticker)

		let middle = ((+ticker.bid) + (+ticker.ask)) / 2;
		let last = ticker.last;

		console.log("当前中间价：" + middle);
		console.log("最新成交价" + last);

		let balance = await bitz.fetchBalance();
		console.log(balance);
		let tmp_balance = [];
		for(let item in balance.total) {
			tmp_balance.push({
				name: item,
				total: balance.total[item]
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


		let sum = leftObj.balance + rightObj.balance / last;

		// let amount;
		console.log(this.options);

		if (+leftObj.balance > rightObj.balance / last) {
			let cha = (+leftObj.balance) - (+rightObj.balance / last);
			console.log(cha);
			if (cha / sum > 0.2) {
				console.log('平衡单1');
				let amountN = sum / 2 - rightObj.balance / last;
				let amount = (+amountN).toFixed(8);
				let order = await bitz.createLimitSellOrder(this.options.symbol, amount, middle)
				console.log(order);
			}

			let shuliangN = (+rightObj.balance / last) * 0.99;
			let shuliang = +(+shuliangN).toFixed(8);
			if (shuliang > 0) {
				console.log('对冲单1');
				let sell = await bitz.createLimitSellOrder( this.options.symbol, shuliang, middle * (1 + this.options.wusunRatio * 0.001 / 2))
				let buy = await bitz.createLimitBuyOrder( this.options.symbol, shuliang, middle * (1 - this.options.wusunRatio * 0.001 / 2))
				console.log(sell);
				console.log(buy);
				this.verbose.unshift(this.options.symbol + ": " + (middle * (1 + this.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求卖出");
				this.verbose.unshift(this.options.symbol + ": " + (middle * (1 - this.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求买入");
			}

		} else {
			let cha = (+rightObj.balance / last) - (+leftObj.balance);
			console.log(cha);
			// 平衡单
			if (cha / sum > 0.2) {
				console.log('平衡单2');
				let amountN= sum / 2 - leftObj.balance;
				let amount = (+amountN).toFixed(8);
				console.log(amount);
				let order = await bitz.createLimitBuyOrder(this.options.symbol, amount, middle);
				console.log(order);
			}
			// 对冲单
			let shuliangN = (+leftObj.balance) * 0.99;
			let shuliang = +(+shuliangN).toFixed(8);
			if (shuliang > 0) {
				console.log('对冲单2');
				let sell = await bitz.createLimitSellOrder( this.options.symbol, shuliang, middle * (1 + this.options.wusunRatio * 0.001 / 2));
				let buy = await bitz.createLimitBuyOrder( this.options.symbol, shuliang, middle * (1 - this.options.wusunRatio * 0.001 / 2));
				console.log(sell);
				console.log(buy);
				this.verbose.unshift(this.options.symbol + ": " + (middle * (1 + this.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求卖出");
				this.verbose.unshift(this.options.symbol + ": " + (middle * (1 - this.options.wusunRatio * 0.001 / 2)).toFixed(6) + " - " + shuliang.toFixed(4) + " | 请求买入");
			}
		}
	// 	// updateObj();
	// 	// await sleep(500);]
	// 	let leftObj, rightObj;
	// 	let left, right;
	// 	console.log('开始对冲！')
	// 	getTicker(this.options.symbol.pair, (d) => {
	// 		console.log(d)
	// 		let middle = ((+d['result'][0]['result'].buy) + (+d['result'][0]['result'].sell)) / 2;
	// 		let last = d['result'][0]['result'].last;
	// 		console.log(middle)
	// 		console.log(last)
	//
	// 		this.balance((d) => {
	// 			console.log(d)
	// 			leftObj = d.find((e) => {
	// 				return e.coin_symbol == this.options.symbol.pair.split('_')[0];
	// 			})
	// 			rightObj = d.find((e) => {
	// 				return e.coin_symbol == this.options.symbol.pair.split('_')[1];
	// 			});
	// 			if (!leftObj) {
	// 				leftObj = {balance: 0};
	// 			}
	// 			if (!rightObj) {
	// 				rightObj = {balance: 0};
	// 			}
	// 			console.log(leftObj)
	// 			console.log(rightObj)
	//
	//
	// 			let sum = (+leftObj.balance) + (+rightObj.balance / last);
	// 			console.log(sum)
	//
	// 			let amount;
	// 			if (+leftObj.balance > +rightObj.balance / last) {
	// 				let cha = (+leftObj.balance) - (+rightObj.balance);
	// 				if (cha / sum > 0.2) {
	// 					let amount = sum / 2 - rightObj.balance / last;
	//
	// 					let trade_order = {
	// 						account_type: 0,
	// 						order_type: 2,
	// 						order_side: 2,
	// 						pair: this.options.symbol.pair,
	// 						price: middle,
	// 						amount: amount,
	// 					};
	// 					console.log("平衡")
	// 					console.log(trade_order)
	// 					doTrade(trade_order, (d) => {
	// 						console.log(d)
	// 					});
	// 				}
	//
	// 				let shuliang = (rightObj.balance / last) * 0.99;
	// 				let trade_order2 = {
	// 					account_type: 0,
	// 					order_type: 2,
	// 					order_side: 2,
	// 					pair: this.options.symbol.pair,
	// 					price: middle,
	// 					amount: shuliang,
	// 				};
	// 				if (shuliang > 0)
	// 				doTrade(trade_order2, (d) => {
	// 					console.log(d)
	// 					this.verbose.push(this.options.symbol.pair + ": " + middle.toFixed(6) + " - " + shuliang.toFixed(4) + " | 卖出")
	// 				});
	// 				let trade_order3 = {
	// 					account_type: 0,
	// 					order_type: 2,
	// 					order_side: 1,
	// 					pair: this.options.symbol.pair,
	// 					price: middle,
	// 					amount: shuliang,
	// 				};
	// 				if (shuliang > 0)
	// 				doTrade(trade_order3, (d) => {
	// 					console.log(d)
	// 					this.verbose.push(this.options.symbol.pair + ": " + middle.toFixed(6) + " - " + shuliang.toFixed(4) + " | 买入")
	// 				});
	// 			} else {
	// 				let cha = (+rightObj.balance) - (+leftObj.balance);
	// 				if (cha / sum > 0.2) {
	// 					let amount = sum / 2 - leftObj.balance / last;
	//
	// 					let trade_order = {
	// 						account_type: 0,
	// 						order_type: 2,
	// 						order_side: 1,
	// 						pair: this.options.symbol.pair,
	// 						price: middle,
	// 						amount: amount,
	// 					};
	// 					console.log("平衡右边大")
	// 					console.log(trade_order)
	// 					doTrade(trade_order, (d) => {
	// 						console.log(d)
	// 					});
	// 				}
	//
	//
	// 				let shuliang = (leftObj.balance / last) * 0.99;
	// 				let trade_order2 = {
	// 					account_type: 0,
	// 					order_type: 2,
	// 					order_side: 2,
	// 					pair: this.options.symbol.pair,
	// 					price: middle,
	// 					amount: shuliang,
	// 				};
	// 				doTrade(trade_order2, (d) => {
	// 					console.log(d)
	// 					this.verbose.push(this.options.symbol.pair + ": " + middle.toFixed(6) + " - " + shuliang.toFixed(4) + " | 卖出")
	// 				});
	// 				let trade_order3 = {
	// 					account_type: 0,
	// 					order_type: 2,
	// 					order_side: 1,
	// 					pair: this.options.symbol.pair,
	// 					price: middle,
	// 					amount: shuliang,
	// 				};
	// 				doTrade(trade_order3, (d) => {
	// 					console.log(d)
	// 					this.verbose.push(this.options.symbol.pair + ": " + middle.toFixed(6) + " - " + shuliang.toFixed(4) + " | 买入")
	// 				});
	// 			}
	// 		})
	// 	});
	// 	// let price = (dd.data.bids[0] + dd.data.asks[0]) / 2;
	// 	// price = price.toFixed(userData.options.symbol.price_decimal)
	// 	// let amount;
	// 	// if (+baseObj.value > +quoteObj.value) {
	// 	// 	let value = quoteObj.value * 0.99;
	// 	// 	amount = value;
	// 	//
	// 	// } else {
	// 	// 	let value = baseObj.value * 0.99;
	// 	// 	amount = value;
	// 	// }
	// 	//
	// 	// //
	// 	// // console.log(price)
	// 	// // console.log(amount)
	// 	// let [left, right] = await Promise.all([
	// 	// 	makeOrder(baseC + quoteC, price, amount, 'sell'),
	// 	// 	makeOrder(baseC + quoteC, price, amount, 'buy')
	// 	// ]);
	}
}

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
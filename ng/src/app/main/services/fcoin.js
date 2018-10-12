const request = require('request');
const rp = require('request-promise');
const crypto = require('crypto');

console.log("fcoin start");

let userData = null;
let balance = null;

let baseC, baseObj, quoteC, quoteObj;
let baseUsdtRate;
let quoteUsdtRate;
let rate;
let pingheng, duichong, quxiao, interv;

process.on('message', m => {
	console.log(m);

	if (m.code == 1) {
		// 初始化
		userData = m.data;
		baseC = userData.options.symbol.base_currency;
		quoteC = userData.options.symbol.quote_currency;
		start();
	}
	if (m.code == -1) {
		// clearInterval(pingheng);
		// clearInterval(duichong);
		// clearInterval(quxiao);
		clearInterval(interv)

	}
	// console.log(userData)
});
process.on('close', m => {
	console.log(123)
	console.log(m)
})

async function cleanAllOrders(state) {
	let orders = await myOrders(state);
	process.send({
		code: 3,
		msg: "orders",
		data: {
			orders
		}
	})
	orders = orders.data;
	console.log(orders)
	if (orders.length > 0) {
		orders.forEach(d => {
			let ts = +new Date();
			let delta = ts - d.created_at;
			if (+delta > +userData.options.cancelTime * 1000) {
				cancelOrder(d.id).then(res => {
					console.log(res)
				});
			}
		})
	}
}

async function start() {

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
		let current = +new Date();
		let tt = (current - start)%12000;
		console.log(tt)
		if (tt < 1000 || (tt > 6000 && tt < 7000)) {
			brushList();
		}
		if (tt > 3000 && tt < 4000) {
			makeBalance();
		}
		if (tt > 9000 && tt < 10000) {
			if (ss) {
				cleanAllOrders('submitted');
				ss = false;
			} else {
				cleanAllOrders('partial_filled');
				ss = true;
			}
		}
	}, 1000)

	// 查看未取消订单
	await cleanAllOrders('submitted');

	await updateObj()
	// console.log("????")
	makeBalance()
}

// 更新对象
async function updateObj() {
	// 查看余额
	balance = await getBalance();
	balance = (balance).data;
	process.send({
		code: 2,
		msg: "balance",
		data: balance
	})
	// balance
	baseObj = balance.find(ele => {
		return ele.currency == baseC;
	});
	quoteObj = balance.find(ele => {
		return ele.currency == quoteC;
	});
	// 查看两个交易对价值
	rate = await ticker(baseC + quoteC);
	rate = (rate).data.ticker[0];
	baseObj.value = baseObj.available;
	console.log(baseObj)

		// quoteUsdtRate = await tickerUsdt(quoteC);
		// quoteUsdtRate = quoteUsdtRate.data.ticker[0];
		quoteObj.value = +quoteObj.available / rate;
	// } else {
	// 	quoteObj.value = +quoteObj.available;
	// }
	console.log(quoteObj)
}

// 平衡函数
async function makeBalance() {
	console.log("平衡！")
	let sum = (+baseObj.value) + (+quoteObj.value);
	// console.log(sum)
	let left;
	let cha;
	if (+baseObj.value > +quoteObj.value) {
		cha = baseObj.value - quoteObj.value;
		// console.log("left")
		left = true;
	} else {
		cha = quoteObj.value - baseObj.value;
		left = false;
	}
	if (cha > sum * 0.2) {
		let amount = (cha/2) * 0.99;
		// console.log(amount)
		let dd = await depth(baseC + quoteC);
		await sleep(500)
		if (left) {
			// console.log("!!!!")
			let res = await makeOrder(baseC + quoteC, dd.data.bids[0], amount, 'sell');
			console.log(res)
		} else {
			let res = await makeOrder(baseC + quoteC, dd.data.asks[0], amount, 'buy');
			console.log(res);
		}
		setTimeout(() => {
			updateObj();
		}, 1000);
		// updateObj();
	}
}

async function brushList() {
	updateObj();
	await sleep(500);
	console.log('开始对冲！')
	let dd = await depth(baseC + quoteC);
	await sleep(500);
	process.send({
		code: 4,
		msg: "depth",
		data: dd
	})
	let price = (dd.data.bids[0] + dd.data.asks[0]) / 2;
	price = price.toFixed(userData.options.symbol.price_decimal)
	let amount;
	if (+baseObj.value > +quoteObj.value) {
		let value = quoteObj.value * 0.99;
		amount = value;

	} else {
		let value = baseObj.value * 0.99;
		amount = value;
	}

	//
	// console.log(price)
	// console.log(amount)
	let [left, right] = await Promise.all([
		makeOrder(baseC + quoteC, price, amount, 'sell'),
		makeOrder(baseC + quoteC, price, amount, 'buy')
	]);

	if (userData.options.cancelTime == -1) {

	} else {
		// setTimeout(async function() {
		// 	// cleanAllOrders();
		// 	console.log("@@@@")
		// 	console.log(left)
		// 	// let [a, b] = await Promise.all([
		// 	// 	sepOrder(JSON.parse(left).data),
		// 	// 	sepOrder(JSON.parse(right).data)
		// 	// ]);
		// 	// console.log(a)
		// 	// console.log(b)
		// 	// if (a.state != 'filled') {
		// 	// 	cancelOrder(a.id);
		// 	// }
		// 	// if (b.state != 'filled') {
		// 	// 	cancelOrder(b.id);
		// 	// }
		// 	cleanAllOrders();
		// }, userData.options.cancelTime * 1000);
	}
	// setTimeout(() => {
	// }, 1000);
}

function sepOrder(id) {
	let timestamp = +new Date();
	let url = "https://api.fcoin.com/v2/orders/" + id;
	let signature = sign("GET", url, null, userData.secretKey, timestamp)
	console.log("■请求：" + id + " 订单")
	return rp({
		uri: url,
		json: true,
		headers: headers(signature, timestamp)
	})
}

// 获得深度 bids 从大到小， asks 从小到大
function depth(coinName) {
	let timestamp = +new Date();
	let url = "https://api.fcoin.com/v2/market/depth/L20/" + coinName;
	// let signature = sign("GET", url, null, userData.secretKey, timestamp)
	console.log("■请求深度")
	return rp({
		uri: url,
		json: true,
		// headers: headers(signature, timestamp)
	})
}

// 创建订单
function makeOrder(symbol, price, amount, side, type = 'limit') {
	let timestamp = +new Date();
	let url = "https://api.fcoin.com/v2/orders";

	let obj = {
		"amount": amount.toFixed(userData.options.symbol.amount_decimal),
		"price": price.toString(),
		"side": side,
		"symbol": symbol,
		"type": type
	}
	// console.log(obj)
	if (side == 'sell') {
		console.log("■卖出" + amount.toFixed(2) + "个" + symbol);
	} else {
		console.log("■买入" + amount.toFixed(2) + "个" + symbol);
	}
	let signature = sign("POST", url, obj, userData.secretKey, timestamp)
	return rp({
		uri: url,
		method: 'POST',
		// json: true,
		body: JSON.stringify(obj),
		headers: headers(signature, timestamp)
	})
}

function cancelOrder(id) {
	let timestamp = +new Date();
	let url = "https://api.fcoin.com/v2/orders/" + id + "/submit-cancel";
	console.log("■取消订单：" + id)
	let signature = sign("POST", url, null, userData.secretKey, timestamp)
	return rp({
		uri: url,
		method: 'POST',
		headers: headers(signature, timestamp)
	})
}

function tickerUsdt(coinName) {
	let timestamp = +new Date();
	let url = "https://api.fcoin.com/v2/market/ticker/" + coinName + "usdt";
	// let signature = sign("GET", url, null, userData.secretKey, timestamp)
	console.log("■获取" + coinName + "价格。")
	return rp({
		uri: url,
		json: true,
		// headers: headers(signature, timestamp)
	})
}

function ticker(coinName) {
	// let timestamp = +new Date();
	let url = "https://api.fcoin.com/v2/market/ticker/" + coinName;
	// let signature = sign("GET", url, null, userData.secretKey, timestamp)
	console.log("■获取" + coinName + "价格。")
	return rp({
		uri: url,
		json: true,
		// headers: headers(signature, timestamp)
	})
}


function sign(method, url, obj, secret, timestamp) {
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
	// this.signature = final;
	return final;
}

function headers(sign, ts) {
	let obj = {
		"FC-ACCESS-KEY": userData.apiKey,
		"FC-ACCESS-SIGNATURE": sign,
		"FC-ACCESS-TIMESTAMP": ts.toString(),
		"content-type": "application/json"
	};
	// console.log(obj)
	return obj;
}

function myOrders(state) {
	let timestamp = +new Date();
	let url = "https://api.fcoin.com/v2/orders?limit=100&states="+ state +"&symbol=" + userData.options.symbol.name
	let signature = sign("GET", url, null, userData.secretKey, timestamp)
	console.log("■获取所有订单")
	return rp({
		uri: url,
		json: true,
		headers: headers(signature, timestamp)
	})
}

function getBalance() {
	let timestamp = +new Date();
	let signature = sign("GET", "https://api.fcoin.com/v2/accounts/balance", null, userData.secretKey, timestamp)
	console.log("■获取Balance")
	return rp({
		uri: "https://api.fcoin.com/v2/accounts/balance",
		json: true,
		headers: headers(signature, timestamp)
	})
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
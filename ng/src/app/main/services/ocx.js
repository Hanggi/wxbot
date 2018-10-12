const request = require('request');
const rp = require('request-promise');
const crypto = require('crypto');
const moment = require('moment')

console.log("ocx start");

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
		baseC = userData.options.symbol.base_unit;
		quoteC = userData.options.symbol.quote_unit;
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

async function cleanAllOrders() {
	let orders = await myOrders();
	console.log(orders)
	process.send({
		code: 3,
		msg: "orders",
		data: {
			orders
		}
	})
	orders = orders.data;
	if (orders.length > 0) {
		orders.forEach(d => {
			let ts = +new Date();
			let delta = ts - moment(d.created_at).unix() * 1000;
			console.log(moment(d.created_at).unix() * 1000)
			console.log(delta)
			if (delta > userData.options.cancelTime * 1000) {
				cancelOrder(d.id).then(res => {
					console.log(res)
				});
			}
			// cancelOrder(d.id).then(res => {
			// 	console.log(res)
			// });
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
				cleanAllOrders();
				ss = false;
			} else {
				cleanAllOrders();
				ss = true;
			}
		}
	}, 1000)

	// 查看未取消订单
	await cleanAllOrders();

	await updateObj()
	// console.log("????")
	makeBalance()
}

// 更新对象
async function updateObj() {
	// 查看余额
	balance = await getBalance();
	// console.log(balance)
	balance = (balance).data;
	process.send({
		code: 2,
		msg: "balance",
		data: balance
	})
	// balance
	baseObj = balance.find(ele => {
		return ele.currency_code == baseC;
	});
	quoteObj = balance.find(ele => {
		return ele.currency_code == quoteC;
	});
	// 查看两个交易对价值
	rate = await ticker(baseC + quoteC);
	console.log(rate)
	rate = (rate).data.last;
	baseObj.value = ((+baseObj.balance) - (+baseObj.locked));
	console.log(baseObj)
		// quoteUsdtRate = await ticker(baseC + quoteC);
	// quoteUsdtRate = quoteUsdtRate.data.last
	quoteObj.value = ((+quoteObj.balance) - (+quoteObj.locked)) / rate;
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
		console.log(amount)
		let dd = await depth(baseC + quoteC);
		if (left) {
			// console.log(dd)
			let res = await makeOrder(baseC + quoteC, dd.data.bids[0][0], amount, 'sell');
			console.log(res)
		} else {
			let res = await makeOrder(baseC + quoteC, dd.data.asks[dd.data.asks.length - 1][0], amount, 'buy');
			console.log(res);
		}
		setTimeout(() => {
			updateObj();
		}, 1000);
	}
}

async function brushList() {
	console.log('开始对冲！')
	updateObj();
	let dd = await depth(baseC + quoteC);
	process.send({
		code: 4,
		msg: "depth",
		data: dd
	})
	let price = ((+dd.data.bids[0][0]) + (+dd.data.asks[dd.data.asks.length - 1][0])) / 2;
	// console.log(dd.data.bids[0][0])
	//
	// console.log(dd.data.asks[dd.data.asks.length - 1][0])
	// price = price.toFixed(8)
	let amount;
	if (+baseObj.value > +quoteObj.value) {
		let value = quoteObj.value * 0.99;
		amount = value;

	} else {
		let value = baseObj.value * 0.99;
		amount = value;
	}

	//
	console.log(price)
	console.log("/??")
	console.log(amount)
	let [left, right] = await Promise.all([
		makeOrder(baseC + quoteC, price, amount, 'sell'),
		makeOrder(baseC + quoteC, price, amount, 'buy')
	]);

	if (userData.options.cancelTime == -1) {

	} else {
		// setTimeout(async function() {
		// 	// cleanAllOrders();
		// 	console.log("@@@@")
		// 	// console.log(left)
		// 	// let [a, b] = await Promise.all([
		// 	// 	sepOrder(left.data),
		// 	// 	sepOrder(right.data)
		// 	// ]);
			console.log(left)
			console.log(right)
		// 	// if (a.state != 'filled') {
		// 	// 	cancelOrder(a.id);
		// 	// }
		// 	// if (b.state != 'filled') {
		// 	// 	cancelOrder(b.id);
		// 	// }
		// 	cleanAllOrders();
		// }, userData.options.cancelTime * 1000);
	}

}

function sepOrder(id) {
	let timestamp = +new Date();
	let url = "https://api.fcoin.com/v2/orders/" + id + 'usdt';
	let signature = sign("GET", url, null, userData.secretKey, timestamp)
	console.log("■请求：" + id + " 订单")
	return rp({
		uri: url,
		json: true,
		headers: headers(signature, timestamp)
	})
}

// 获得深度 bids 从大到小， asks 从大到小
function depth(coinName) {
	let timestamp = +new Date();
	let url = "https://openapi.ocx.com/api/v2/depth?market_code=" + coinName;
	// let signature = sign("GET", url, null, userData.secretKey, timestamp)
	console.log("■请求深度")
	return rp({
		uri: url,
		json: true,
		// headers: headers(signature, timestamp)
	})
}

// 创建订单
function makeOrder(symbol, price, amount, side) {
	let timestamp = +new Date();
	let obj = {
		volume: +amount.toFixed(4),
		price: +price,
		side: side,
		market_code: symbol
	}
	console.log(obj)
	let signature = sign("POST", '/api/v2/orders', obj, userData.apiKey, userData.secretKey, timestamp);
	let para = sort(obj, timestamp, signature);
	let url = 'https://openapi.ocx.com/api/v2/orders?' + para;
	// console.log(url)
	if (side == 'sell') {
		console.log("■卖出" + amount.toFixed(4) + "个" + symbol);
	} else {
		console.log("■买入" + amount.toFixed(4) + "个" + symbol);
	}

	return rp({
		method: 'POST',
		uri: url,
		json: true,
	})

}

function cancelOrder(id) {
	let timestamp = +new Date();
	let obj = {
		id: id
	}
	let signature = sign("POST", '/api/v2/orders/' + id + '/cancel', obj, userData.apiKey, userData.secretKey, timestamp);
	let para = sort(obj, timestamp, signature);
	let url = 'https://openapi.ocx.com/api/v2/orders/' + id + '/cancel?' + para;
	console.log("■取消：" + id + "订单")

	return rp({
		method: 'POST',
		uri: url,
		json: true,
	})
}

function tickerUsdt(coinName) {
	console.log(coinName)
	// let timestamp = +new Date();
	// let signature = sign("GET", '/api/v2/tickers/' + coinName, {}, userData.apiKey, userData.secretKey, timestamp);
	// let para = sort({}, timestamp, signature);
	let url = 'https://openapi.ocx.com/api/v2/tickers/' + coinName ;
	console.log(url)
	console.log("■获取" + coinName + "价格。")

	return rp({
		uri: url,
		json: true,
	})
}
function ticker(coinName) {
	let url = 'https://openapi.ocx.com/api/v2/tickers/' + coinName ;
	console.log(url)
	console.log("■获取" + coinName + "价格。")

	return rp({
		uri: url,
		json: true,
	})
}

function sign(method, uri, obj, key, secret, timestamp) {
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

function sort(obj, tonce, signature) {
	let tmp = {}
	obj.access_key = userData.apiKey;
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

function myOrders() {
	let timestamp = +new Date();
	let signature = sign("GET", '/api/v2/orders', {}, userData.apiKey, userData.secretKey, timestamp);
	let para = sort({}, timestamp, signature);
	let url = 'https://openapi.ocx.com/api/v2/orders?' + para;
	console.log("■获取所有订单")

	return rp({
		uri: url,
		json: true,
	})
}

function getBalance() {
	let timestamp = +new Date();
	let signature = sign("GET", '/api/v2/accounts', {}, userData.apiKey, userData.secretKey, timestamp);
	let para = sort({}, timestamp, signature);
	let url = 'https://openapi.ocx.com/api/v2/accounts?' + para;
	console.log("■获取Balance")

	return rp({
		uri: url,
		json: true,
	})
}
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
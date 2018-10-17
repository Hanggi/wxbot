import {Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
// import {FcoinService} from "../fcoin.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from "@angular/material";
// import App = Electron.App;
// import {FormControl, Validators} from "@angular/forms";
// import {ExchangesService} from "../exchanges.service";
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";


import {ElectronService} from "../electron.service";
import {HttpClient} from "@angular/common/http";

// import electron form "electron";
// import {ipcRenderer} from 'electron';
// import * as fs from 'fs';
const sma = window.require('technicalindicators').sma;
const alignMA = 72;
// const Store = window.require('electron-store');
// const store = new Store();

const path = window.require('path');


// let baseUrl = '://localhost:3210';
let baseUrl = 's://davinqicoin.com';

@Component({
	selector: 'app-root',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit{
	title = 'app';


	@ViewChild('webviewModel') webviewDiv: ElementRef;
	webview;
	content;
	isRunning = false;
	webUrl = '';

	constructor (public electronService: ElectronService, public dialog: MatDialog, public G: ElectronService, private route: Router, private activatedRoute: ActivatedRoute, private http: HttpClient, public snackBar: MatSnackBar,

	) {
		let self = this;
		self.webUrl = 'https://wx.qq.com/'

	}

	tt = null;
	ma7_30_symbol = null;
	// ma30_symbol = null;

	public async start() {
		const self = this;

        self.loop("开始检测活动！\n");
		self.tt = setInterval(function () {
            self.loop('');
        }, 1000 * 30);

	}
	public async stop() {
	    const self = this;
	    clearInterval(self.tt);
    }

    price_arr = [];
	last_update;
	private async loop(title) {
	    let self = this;
        let res = await self.test();
        console.log(self.G.moment.locale('zh-cn'));
        // console.log(self.G.moment().format('llll'))
        if (!self.ma7_30_symbol) {
            if (res.ma7.current > res.ma30.current) {
                self.ma7_30_symbol = 1;
            } else {
                self.ma7_30_symbol = -1
            }
        }

        let suggestion = '';
        let signal = '';
        if (self.ma7_30_symbol > 0 && (res.ma7.current < res.ma30.current)) {
            suggestion = '看空卖出（卖出开空）';
            signal = '下穿';
            self.ma7_30_symbol = -1;
            send(null)
        }
        if (self.ma7_30_symbol < 0 && (res.ma7.current > res.ma30.current)) {
            suggestion = '看多买进（买入开多）';
            signal = '上穿';
            self.ma7_30_symbol = 1;
            send(null)
        }

        if (title) {
            send(title);
        }

        function send(title) {
            let output =
`\`
交易对：火币 BTC/USDT 30min
现价: ${res.closes.current}
出现信号：${signal}
建议方向：${suggestion}
类型：现货/期货
时间：${self.G.moment().format('llll')}
免责声明：仅提供信号提醒，买卖操作，盈亏自负
来源：Davinqj量化   
\``;

            if (title) {
                output =
`\`@所有人
开始运行！
交易对：火币 BTC/USDT 30min
现价: ${res.closes.current}
开启时间：${self.G.moment().format('llll')}
\``;
            }

            let code = `
			input = document.querySelector('#editArea')
			input.innerText = ${output}
			
			var event = document.createEvent('Event');
			event.initEvent('input', true, true);
			event.simulated = true;
			
			input.dispatchEvent(event);
			document.querySelector('.btn.btn_send').click()
				`;
            // code = ``;
            console.log(code);
            self.content.executeJavaScript(code, false, result => {
                console.log('webContents exec callback: ' + result);
                if (result == -1) {
                    // self.tips("超出价格规定范围，暂不挂单")
                }
            }).then(result => {
                console.log('webContents exec then: ' + result);
            }, d => {
                console.log(d);
            });

        }

        self.last_update = self.G.moment().format('llll')
        self.price_arr = [];
        for (let item in res) {
            console.log(item);
            self.price_arr.push({
                name: item,
                current: res[item].current,
                arr: res[item].arr
            })
        }
        // console.log(price_arr);
        self.price_arr = self.price_arr.sort((a, b) => {
            return a.current > b.current ? -1 : 1;
        });
        console.log(self.price_arr);
        //
        // let str = '';
        // for (let item of price_arr) {
        //     str += `当前${item.name}：${item.current}\n`
        // }
        // console.log(str);

        // 当前ma5:  ${res.ma5.current}
        //     当前ma7:  ${res.ma7.current}
        //         当前ma10: ${res.ma10.current}
        //             当前ma30: ${res.ma30.current}
        //                 当前价格:  ${res.closes.current}


//         let output2 =
//             `\`${title}火币检测：BTC/USDT 30min （按当前价格排序）
//
// ${str}
// 时间：${self.G.moment().format('llll')}
// 策略来源: Davinqi量化策略
// 		\``;


    }

	// huobipro = ccxt.huobipro();

	async test() {
		const self = this;
		let ohlcv = await self.G.huobipro.fetchOHLCV('BTC/USDT', '30m', null, 2000);
		// self.G.huobipro.fetchOHLCV()

		let closes = [];
		for (let i = 0; i < ohlcv.length; i++) {
			closes.push(ohlcv[i][4])
		}
		console.log(closes);
		let ma30 = sma({values: closes, period: 30}).slice(alignMA - 30);
		let ma10 = sma({values: closes, period: 10}).slice(alignMA - 10);
		let ma7 = sma({values: closes, period: 7}).slice(alignMA - 7);
		let ma5 = sma({values: closes, period: 5}).slice(alignMA - 5);
			closes = closes.slice(alignMA - 1);
		console.log(ma7[-1])
		console.log(ma30.length);
		console.log(ma7.length);
		console.log(closes.length);
		console.log(ohlcv);

		return {
			ma5: {
			    arr: ma5,
                current: ma5[ma5.length - 1].toFixed(4)
            },
			ma7: {
			    arr: ma7,
                current: ma7[ma7.length - 1].toFixed(4)
            },
			ma10: {
			    arr: ma10,
                current: ma10[ma10.length - 1].toFixed(4),
            },
			ma30: {
			    arr: ma30,
                current: ma30[ma30.length - 1].toFixed(4)
            },
			closes: {
			    arr: closes,
                current: closes[closes.length - 1].toFixed(4)
            },
		};
	}

	ngOnInit () {
		let self = this;
		self.test();
		console.log(window)

	}
	ngAfterViewInit() {
		let self = this;
		this.webview = this.webviewDiv.nativeElement;

		this.webview.addEventListener('dom-ready', (d) => {
			// console.log("get content");
			this.content = this.webview.getWebContents();



		});

	}



}

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

	public async start() {
		const self = this;
		let res = await self.test();
		console.log(self.G.moment.locale('zh-cn'));
		// console.log(self.G.moment().format('llll'))

		let output =
			`\`火币检测：BTC/USDT 30min
当前ma5:  ${res.ma5_value}
当前ma7:  ${res.ma7_value}
当前ma10: ${res.ma10_value}
当前ma30: ${res.ma30_value}
当前价格:  ${res.closes_value}
			
时间：${self.G.moment().format('llll')}
策略来源: Davinqi量化策略
		\``;

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
		console.log(code)
		this.content.executeJavaScript(code, false, result => {
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
			ma5: ma5,
			ma5_value: ma5[ma5.length - 1].toFixed(4),
			ma7: ma7,
			ma7_value: ma7[ma7.length - 1].toFixed(4),
			ma10: ma10,
			ma10_value: ma10[ma10.length - 1].toFixed(4),
			ma30: ma30,
			ma30_value: ma30[ma30.length - 1].toFixed(4),
			closes: closes,
			closes_value: closes[closes.length - 1].toFixed(4),
		}
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

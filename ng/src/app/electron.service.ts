import {Injectable} from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {ipcRenderer, webFrame, remote} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import {HttpClient} from "@angular/common/http";


const ccxt = window.require('ccxt');
const getmac = window.require('getmac');


@Injectable()
export class ElectronService {

	// electron and system
	ipcRenderer: typeof ipcRenderer;
	webFrame: typeof webFrame;
	remote: typeof remote;
	childProcess: typeof childProcess;
	fs: typeof fs;

	// ccxt
	huobipro = new ccxt.huobipro();

	moment = window.require('moment');

	showLogin = true;
	trial = false;

	user:any;

	updateAvailable;
	downloadPercentage;

	constructor(private http: HttpClient) {
		// Conditional imports
		if (this.isElectron()) {
			this.ipcRenderer = window.require('electron').ipcRenderer;
			this.webFrame = window.require('electron').webFrame;
			this.remote = window.require('electron').remote;

			this.childProcess = window.require('child_process');
			this.fs = window.require('fs');
		}
	}

	isElectron = () => {
		return window && window.process && window.process.type;
	}

	tt: any;
	checkingTrial() {
		this.tt = setInterval(() => {
			console.log("check trial???")
			getmac.getMac((err, mac) => {
				this.http.post("https://davinqicoin.com/v1/davinqi_trial", {
					mac: mac,
				}).subscribe(d => {
					// console.log(d)
					if (d['ret'] == 0) {

					}

					if (d['ret'] == 1) {
						alert("您的已试用结束，请联系客服获得使用权限。")
						this.remote.getCurrentWindow().close()
					}
				}, err => {
					console.log(err);
				})
			})
		}, 1000 * 60)
	}

}

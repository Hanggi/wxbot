import {Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
// import {FcoinService} from "../fcoin.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from "@angular/material";
import App = Electron.App;
import {FormControl, Validators} from "@angular/forms";
// import {ExchangesService} from "../exchanges.service";
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";


import {ElectronService} from "../electron.service";
import {HttpClient} from "@angular/common/http";

// import electron form "electron";
// import {ipcRenderer} from 'electron';
// import * as fs from 'fs';
const Store = window.require('electron-store');
const store = new Store();

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

	ngOnInit () {

	}
	ngAfterViewInit() {
		let self = this;
		this.webview = this.webviewDiv.nativeElement;

		this.webview.addEventListener('dom-ready', (d) => {
			// console.log("get content");
			this.content = this.webview.getWebContents();
			
			let code = `
				vv = '';
				`;
			// code = ``;
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

		});

	}



}

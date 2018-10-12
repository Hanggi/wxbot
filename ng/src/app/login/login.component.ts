import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ElectronService} from "../electron.service";
import {MatSnackBar} from "@angular/material";
import {NavigationExtras, Router} from "@angular/router";

const {shell} = window.require('electron');

const Store = window.require('electron-store');
const store = new Store();
const os = window.require('os');
const getmac = window.require('getmac');


// let baseUrl = '://localhost:3210';
let baseUrl = 's://davinqicoin.com';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	email:string = store.get('email');
	pass:string;

	isShow = true;

	system;
	hard;
	mac;

	constructor(private http: HttpClient, public G: ElectronService, public snackBar: MatSnackBar, private route: Router) {
		getmac.getMac((err, mac) => {
			if (err) console.log(err);
			this.mac = mac;
		})
		let arch = os.arch();
		let cpus = os.cpus();
		let release = os.release();
		let cpu = cpus[0].model + " " + cpus[0].speed;
		let mem = os.totalmem() / 1000000000;
		let type = os.type() + " - " + os.platform();

		this.system = type + " | " + release + ' | ' + arch;
		this.hard = cpu + " | " + mem
	}

	ngOnInit() {
		// console.log("login")
		// this.G.ipcRenderer.send("checkForUpdate");
		// this.G.ipcRenderer.on("message", (event, text) => {
		// 	console.log(event);
		// 	console.log(text);
		// });
		// //注意：“downloadProgress”事件可能存在无法触发的问题，只需要限制一下下载网速就好了
		// this.G.ipcRenderer.on("downloadProgress", (event, progressObj) => {
		// 		console.log(progressObj);
		// 	// this.downloadPercent = progressObj.percent || 0;
		// });
		// this.G.ipcRenderer.on("isUpdateNow", () => {
		// 		this.G.ipcRenderer.send("isUpdateNow");
		// });
	}

	tips(msg, action?) {
		this.snackBar.open(msg, action, {
			duration: 2000,
		});
	}

	login(data) {
		// console.log(data)
		// console.log(data.value)
		console.log(this.mac)
		console.log(this.system)
		console.log(this.hard)

		if (!this.email) {
			this.tips("请输入邮箱。")
		}
		if (!this.pass && this.email) {
			this.tips("请输入密码。")
		}
		if (this.email && this.pass) {
			this.http.post("http" + baseUrl + "/v1/davinqi_robot_login", {
				email: this.email,
				password: this.pass,
				system: this.system,
				hard: this.hard,
				mac: this.mac
			}).subscribe(d => {
				console.log(d)
				// console.log(JSON.parse(d))
				if (d['data'].allow || d['data'].coinpark || d['data'].coinex || d['data'].bitz || d['data'].coinbig) {
					// this.G.showLogin = false;
					this.tips("登陆成功！");
					let navigationExtras: NavigationExtras = {
						queryParams: {
							"coinex": d['data'].coinex,
							"coinpark": d['data'].coinpark,
							"bitz": d['data'].bitz,
							"coinbig": d['data'].coinbig,
						}
					};
					this.route.navigate(['main'], navigationExtras)
					store.set('email', this.email);
					this.G.user = d['data'];
				}
				if (d['ret'] == 0 && d['data'].allow == false && d['data'].coinpark == false &&  d['data'].coinex == false && d['data'].bitz == false && d['data'].coinbig == false) {
					// alert("您尚未获获得使用权限，请联系客服支付。")
					this.tips("您尚未获获得当前版本的使用权限，请联系客服。")
				}
				if (d['ret'] > 0) {
					// console.log("???")
					this.tips(d['msg'])
				}
				if (d['ret'] == 0) {
				}

			}, err => {
				console.log(err)

			})
		}
	}

	checkTrial() {
		let self = this;
		// console.log(os.networkInterfaces())
		// getmac.getMac((err, mac) => {
			// let arch = os.arch();
			// let cpus = os.cpus();
			// let cpu = cpus[0].model + " " + cpus[0].speed;
			// let mem = os.totalmem();
			// let type = os.type() + " - " + os.platform();
			//
			// let system = type + "_" + arch;
			// let hard = cpu + "_" + mem
			// alert("您的已试用结束，请联系客服获得使用权限。")
			// this.G.remote.getCurrentWindow().close()

			this.http.post("https://davinqicoin.com/v1/davinqi_trial", {
				system: this.system,
				hard: this.hard,
				mac: this.mac
			}).subscribe(d => {
				// console.log(d)
				if (d['ret'] == 0) {
					// this.G.showLogin = false;

					let navigationExtras: NavigationExtras = {
						queryParams: {
							"coinex": 'true',
							"coinpark": 'true',
							"coinbig": 'true',
						}
					};
					this.route.navigate(['main'], navigationExtras);
					this.G.trial = true;
					this.G.user = {
						code: 'T000'
					};
					self.tips("您有1小时试用时间。");
					this.G.checkingTrial();
				}

				if (d['ret'] == 1) {
					console.log(d)
					self.tips("您的已试用结束，请联系客服获得使用权限");
					return;
				}
			}, err => {
				console.log(err);
			})
		// })
	}

	registerLink() {
		shell.openExternal('https://davinqicoin.com/davinqi_robot?ic=v1.0.4')
	}

	doBinding() {
		if (!this.email) {
			this.tips("请输入绑定邮箱。")
		}
		if (!this.pass && this.email) {
			this.tips("请输入密码后进行绑定。")
		}

		if (this.email && this.pass) {
			this.http.post("http" + baseUrl + "/v1/davinqi_binding_machine", {
				email: this.email,
				password: this.pass,
				system: this.system,
				hard: this.hard,
				mac: this.mac
			}).subscribe(d => {
				console.log(d)

				this.tips(d['msg'])

			})
		}

	}

}

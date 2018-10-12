import {Injectable} from '@angular/core';


let interv;

@Injectable({
	providedIn: 'root'
})
export class ToponeService {
	// api key
	apiKey: string;
	secretKey: string;

	// 正在运行
	isRunning = false;

	showOrders = false;
	ordersData = [];

	constructor() {
	}
}

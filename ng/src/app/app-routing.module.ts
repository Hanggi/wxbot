import { NgModule } 			from '@angular/core';
import { RouterModule, Routes} 	from '@angular/router';

import {AppComponent} 		from './app.component';
import {LoginComponent} from "./login/login.component";
import {MainComponent} from "./main/main.component";
// import {WebrobotComponent} from "./webrobot/webrobot.component";



const routes: Routes = [
	{path: '', redirectTo: 'main', pathMatch: 'full'},

	{path: 'login', component: LoginComponent},
	{path: 'main', component: MainComponent},
	// {path: 'webrobot', component: WebrobotComponent}
	// {path: 'notice', loadChildren: './notice/notice.module#NoticeModule'},
	// {path: 'balance', loadChildren: './balance/balance.module#BalanceModule'},
	// {path: 'coinone', loadChildren: './exchange/detail.module#DetailModule'},
	// {path: 'bithumb', loadChildren: './exchange/detail.module#DetailModule'},
	// {path: 'signup', loadChildren: './signup/signup.module#SignupModule'},
	// {path: 'exchange_balance', loadChildren: './my-exchange-wallet/my-exchange-wallet.module#MyExchangeWalletModule'},
	//
	// {path: 'davinqi_robot', loadChildren: './shuadan/shuadan.module#ShuadanModule'},
	// {path: 'davinqi_user_admin', loadChildren: './shuadan-admin/shuadan-admin.module#ShuadanAdminModule'}
	// {path: 'vis', loadChildren: './d3-demo/d3.module#D3Module'},
	// {path: 'gre', loadChildren: './gre/gre.module#GreModule'},
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [ RouterModule ]
})
export class AppRoutingModule  { name = 'ADM'; }
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {ElectronService} from "./electron.service";
import {HttpClientModule} from "@angular/common/http";
import {MaterialModule} from "./material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {AppRoutingModule} from "./app-routing.module";
import {LoginComponent} from "./login/login.component";
import {MainComponent} from "./main/main.component";


import {WebviewDirective} from "./webview/webview.directive";

@NgModule({
  declarations: [
    AppComponent, LoginComponent, MainComponent, WebviewDirective
  ],
  imports: [
    BrowserModule, HttpClientModule, MaterialModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, RouterModule, AppRoutingModule
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }

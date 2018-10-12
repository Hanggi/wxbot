import { NgModule }      from '@angular/core';
// import 'hammerjs/hammer';

// import { AppComponent }  from './app.component';
// import {NoopAnimationsModule} from '@angular/platform-browser/animations';
// import { MaterialModule } from '@angular/material';

import {
	MatAutocompleteModule,
	MatBadgeModule,
	MatCheckboxModule,
	MatDatepickerModule,
	MatInputModule,
	MatRadioModule,
	MatSelectModule,
	MatSliderModule,
	MatSlideToggleModule
} from '@angular/material';
import {MatMenuModule, MatSidenavModule, MatToolbarModule} from '@angular/material';
import {MatListModule, MatGridListModule, MatCardModule, MatStepperModule, MatTabsModule, MatExpansionModule} from '@angular/material';
import {MatButtonModule, MatButtonToggleModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule} from '@angular/material';

import {MatDialogModule, MatTooltipModule, MatSnackBarModule, MatTableModule, MatSortModule, MatPaginatorModule} from '@angular/material';

@NgModule({
	  imports: [ MatAutocompleteModule, MatCheckboxModule, MatDatepickerModule, MatInputModule, MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
				MatMenuModule, MatSidenavModule, MatToolbarModule,
				MatListModule, MatGridListModule, MatCardModule, MatStepperModule, MatTabsModule, MatExpansionModule,
				MatButtonModule, MatButtonToggleModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatBadgeModule,
				MatDialogModule, MatTooltipModule, MatSnackBarModule, MatTableModule, MatSortModule, MatPaginatorModule
				],
	  exports: [ MatAutocompleteModule, MatCheckboxModule, MatDatepickerModule, MatInputModule, MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
				MatMenuModule, MatSidenavModule, MatToolbarModule,
				MatListModule, MatGridListModule, MatCardModule, MatStepperModule, MatTabsModule, MatExpansionModule,
				MatButtonModule, MatButtonToggleModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatBadgeModule,
				MatDialogModule, MatTooltipModule, MatSnackBarModule, MatTableModule, MatSortModule, MatPaginatorModule
                ],
})
export class MaterialModule {

}


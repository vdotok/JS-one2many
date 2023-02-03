import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CdkTableModule } from '@angular/cdk/table';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { PlatformModule } from '@angular/cdk/platform';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
const globalRippleConfig: RippleGlobalOptions = { disabled: true };
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions,
  MatRippleModule,
  MatNativeDateModule,
} from '@angular/material/core';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';

@NgModule({
    imports: [
        MatFormFieldModule,
        MatRippleModule,
        MatDialogModule,
        MatSortModule,
        MatPaginatorModule,
        CdkTableModule,
        DragDropModule,
        PortalModule,
        CommonModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        MatRadioModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTabsModule,
        MatButtonModule,
        MatTableModule,
        MatSlideToggleModule,
        OverlayModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatMenuModule,
        MatProgressSpinnerModule
    ],
    declarations: [],
    providers: [
        { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig }
    ],
    exports: [
        MatFormFieldModule,
        PlatformModule,
        MatRippleModule,
        MatSortModule,
        MatPaginatorModule,
        CdkTableModule,
        DragDropModule,
        OverlayModule,
        PortalModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        MatRadioModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTabsModule,
        MatTableModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatTooltipModule,
        MatProgressBarModule,
        LayoutModule,
        MatProgressSpinnerModule
    ]
})
export class AppMaterialModule { }

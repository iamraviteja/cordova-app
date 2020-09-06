import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'pdf-viewer',
    loadChildren: () => import('./pdf-viewer/pdf-viewer.module').then( m => m.PdfViewerPageModule)
  },
  {
    path: 'ion-nav-page',
    loadChildren: () => import('./ion-nav-page/ion-nav-page.module').then( m => m.IonNavPagePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

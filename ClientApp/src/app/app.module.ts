import { GameChatComponent } from './_components/game-chat/game-chat.component';
import { GameSpectatorsComponent } from './_components/game-spectators/game-spectators.component';
import { GameTabsComponent } from './_components/game-tabs/game-tabs.component';
import { WaitingRoomComponent } from './_components/waiting-room/waiting-room.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AvailableGamesComponent } from './_components/available-games/available-games.component';
import { AllChatComponent } from './_components/all-chat/all-chat.component';
import { HubService } from './_services/hub.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './_components/home/home.component';
import { OnlinePlayersComponent } from './_components/online-players/online-players.component';
import { WaitingRoomGuard } from './_guards/waiting-room.guard';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AvailableGamesComponent,
    OnlinePlayersComponent,
    AllChatComponent,
    WaitingRoomComponent,
    GameTabsComponent,
    GameSpectatorsComponent,
    GameChatComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    NgbModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'waitingRoom', component: WaitingRoomComponent, canActivate: [WaitingRoomGuard] },
      // { path: 'game', component: GameComponent, canActivate: [GameGuard], canDeactivate: [GameDeactivateGuard] },
      { path: '**', redirectTo: '/' }
    ])
  ],
  providers: [HubService, WaitingRoomGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}

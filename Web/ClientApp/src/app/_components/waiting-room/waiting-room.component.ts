import { GameSetup } from './../../_models/gameSetup';
import { SidebarSettings } from 'src/app/_models/sidebarSettings';
import { UtilityService } from './../../_services/utility.service';
import { CardValue, GameType } from './../../_models/enums';
import { PickBannedCardsComponent } from './../_modals/pick-banned-cards/pick-banned-cards.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Game } from 'src/app/_models/game';
import { User } from 'src/app/_models/user';
import { HubService } from 'src/app/_services/hub.service';
import { Router } from '@angular/router';
import { Player } from 'src/app/_models/player';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { KeyValue } from '@angular/common';
import { takeWhile } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { GameSetupComponent } from '../_modals/game-setup/game-setup.component';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  sidebarSettings: SidebarSettings;
  ngOnDestroy(): void {
    this._isAlive = false;
  }
  private _isAlive: boolean = true;
  activeGame: Game;
  currentUser: User;

  constructor(
    private _hubService: HubService,
    private _modalService: NgbModal,
    private _utilityService: UtilityService,
    private _toastrService: ToastrService,
    private _router: Router
  ) {}

  ngOnInit() {
    this.sidebarSettings = this._utilityService.sidebarSettings;
    this._hubService.activeGame.pipe(takeWhile(() => this._isAlive)).subscribe(game => {
      this.activeGame = game;
    });

    this._hubService.currentUser.pipe(takeWhile(() => this._isAlive)).subscribe(user => {
      this.currentUser = user;
    });
  }
  getBannedCardName(bannedCard: CardValue) {
    return this._utilityService.getBannedCardName(bannedCard);
  }

  leaveWaitingRoom() {
    this._router.navigateByUrl('/');
  }

  joinGame() {
    if (this.activeGame.players.length >= this.activeGame.gameSetup.maxNumberOfPlayers) {
      this._toastrService.info(`Maximum number of players reached (${this.activeGame.gameSetup.maxNumberOfPlayers}).`);
      return;
    }
    this._hubService.joinGame(this.activeGame.id, '');
  }

  userIsSpectator() {
    const exists = this.activeGame.spectators.find(spectator => {
      return spectator.user.name === this.currentUser.name;
    });
    return exists != null;
  }

  getStyleJoinGameButton() {
    var obj: any = {};
    if (this.activeGame.players.length >= this.activeGame.gameSetup.maxNumberOfPlayers) {
      obj.opacity = '0.5';
    } else {
      obj.opacity = '1';
    }
    if (!this.userIsSpectator()) {
      obj.opacity = '0.5';
    }
    return obj;
  }

  openBanCardsDialog() {
    var banCardsModal = this._modalService.open(PickBannedCardsComponent);
    banCardsModal.componentInstance.bannedCards = Object.assign([], this.activeGame.gameSetup.bannedCards);
    banCardsModal.result.then((bannedCards: CardValue[]) => {
      this.activeGame.gameSetup.bannedCards = bannedCards;
      this.updateGameSetup();
    });
  }

  getGameTypePlaceholder() {
    return this.activeGame.gameSetup.gameType == GameType.normal ? 'Normal' : 'Special Wild Cards';
  }

  openGameSetupDialog() {
    this._modalService.open(GameSetupComponent);
  }
  startGame() {
    if (this.activeGame.players.length < 2) {
      this._toastrService.info('Minimum 2 players to start the game.');
      return;
    }
    this._hubService.startGame();
  }
  kickPlayerFromGame(player: Player) {
    const cfrm = confirm('Really kick this player? ' + player.user.name);
    if (cfrm) {
      this._hubService.kickPlayerFromGame(player.user);
    }
  }
  updateGameSetup() {
    this._hubService.updateGameSetup(this.activeGame.id, this.activeGame.gameSetup);
  }
}

import { MyHand } from './../../_models/myHand';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Game } from 'src/app/_models/game';
import { Card } from 'src/app/_models/card';
import { HubService } from 'src/app/_services/hub.service';
import { Router } from '@angular/router';
import { CardColor, Direction } from 'src/app/_models/enums';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('cardsPlayedPopover')
  private cardsPlayedPopover: NgbPopover;

  isGameChatSidebarOpen = false;
  currentUser: User;
  game: Game;
  numberUnreadMessages = 0;
  myHand: MyHand;

  constructor(private _hubService: HubService, private _router: Router) {}

  ngOnInit() {
    this._hubService.activeGame.subscribe(game => {
      if (this.game != null && !this.game.gameEnded && game != null && game.gameEnded) {
        const message = `Game ended! Winner ${game.players.find(x => x.numberOfCards === 0).user.name}`;
        alert(message);
      }
      this.game = game;
    });

    this._hubService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this._hubService.myHand.subscribe(myHand => {
      this.myHand = myHand;
    });

    this._hubService.gameChatMessages.subscribe(messages => {
      if (!this.isGameChatSidebarOpen) {
        this.numberUnreadMessages++;
      }
    });
  }

  playCard(card: Card) {
    let colorPicked = 0;
    if (card.color === CardColor.wild) {
      do {
        colorPicked = parseInt(prompt('Type color (1=blue,2=green,3=red,4=yellow)'), 0);
      } while ([1, 2, 3, 4].indexOf(colorPicked) === -1);
    }
    this._hubService.playCard(card, colorPicked);
  }

  exitGame() {
    this._hubService.exitGame();
  }

  drawCard() {
    this._hubService.drawCard();
  }

  toggleGameChatSidebar() {
    this.isGameChatSidebarOpen = !this.isGameChatSidebarOpen;
    this.numberUnreadMessages = 0;
  }
  getColorStringFromLastCard() {
    switch (this.game.lastCardPlayed.color) {
      case CardColor.blue:
        return 'Blue';
      case CardColor.green:
        return 'Green';
      case CardColor.red:
        return 'Red';
      case CardColor.yellow:
        return 'Yellow';
    }
  }

  getDirectionStringFromGame() {
    return this.game.direction === Direction.right ? 'Right --->' : '<---Left';
  }
}
